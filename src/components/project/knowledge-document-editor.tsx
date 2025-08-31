import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useKnowledgeStore, KnowledgeEntry } from '@/stores/knowledge-store';
import { useToast } from '@/hooks/use-toast';
import { enhanceTextWithAI, getSuggestedEnhancements, TextEnhancementRequest } from '@/lib/ai-text-enhancer';
import { motion } from 'framer-motion';
import { 
  Save, Sparkles, FileText, Image, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, Plus, Upload, Trash2,
  Wand2, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

interface KnowledgeDocumentEditorProps {
  projectId: string;
  entries: KnowledgeEntry[];
  selectedDocumentId?: string;
  onDocumentSaved?: () => void;
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'document' | 'image';
  originalEntryId?: string;
  isModified: boolean;
  isEnhancing: boolean;
}

export const KnowledgeDocumentEditor: React.FC<KnowledgeDocumentEditorProps> = ({
  projectId,
  entries,
  selectedDocumentId,
  onDocumentSaved
}) => {
  const { toast } = useToast();
  const { addTextEntry, updateEntry, deleteEntry, uploadFile } = useKnowledgeStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Convert knowledge entries to document sections
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([]);

  useEffect(() => {
    const sections: DocumentSection[] = entries.map(entry => ({
      id: entry.id,
      title: entry.title,
      content: cleanContent(entry.content),
      type: entry.type,
      originalEntryId: entry.id,
      isModified: false,
      isEnhancing: false
    }));

    // Add empty section if no entries exist
    if (sections.length === 0) {
      sections.push({
        id: 'new-section-1',
        title: 'Project Knowledge Base',
        content: 'Start writing your project knowledge here...',
        type: 'text',
        isModified: false,
        isEnhancing: false
      });
    }

    setDocumentSections(sections);
  }, [entries]);

  // Clean content for display
  const cleanContent = (content: string): string => {
    if (!content) return '';
    return content
      .replace(/[%&<>{}\\[\]@#$^*+=|~`]/g, ' ')
      .replace(/[^\w\s.,!?()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s*[\d\s]*obj\s*/gi, '')
      .replace(/endstream|endobj|stream/gi, '')
      .trim();
  };

  // Format content for display with proper HTML structure
  const formatContentForDisplay = (content: string): string => {
    if (!content) return '<p>Start writing...</p>';
    
    // Clean the content first
    const cleaned = cleanContent(content);
    
    // Convert line breaks to paragraphs
    const paragraphs = cleaned.split(/\n\s*\n/).filter(p => p.trim());
    
    if (paragraphs.length === 0) {
      return '<p>Start writing...</p>';
    }
    
    return paragraphs.map(paragraph => {
      const trimmed = paragraph.trim();
      
      // Check if it's a bullet point
      if (trimmed.match(/^[•·*-]\s/)) {
        return `<p style="margin-left: 20px; text-indent: -20px;">${trimmed}</p>`;
      }
      
      // Check if it's a heading (starts with ** or has all caps and is short)
      if (trimmed.match(/^\*\*(.*)\*\*$/) || (trimmed.length < 50 && trimmed === trimmed.toUpperCase() && trimmed.includes(' '))) {
        const headingText = trimmed.replace(/^\*\*(.*)\*\*$/, '$1');
        return `<h3 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px 0; color: #1f2937;">${headingText}</h3>`;
      }
      
      // Regular paragraph
      return `<p style="margin-bottom: 12px; text-indent: 24px;">${trimmed}</p>`;
    }).join('');
  };

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      const range = selection.getRangeAt(0);
      setSelectionRange(range);
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  };

  // Handle content changes
  const handleContentChange = (sectionId: string, field: 'title' | 'content', value: string) => {
    setDocumentSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, [field]: value, isModified: true }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  // Add new section
  const addNewSection = () => {
    const newSection: DocumentSection = {
      id: `new-section-${Date.now()}`,
      title: 'New Section',
      content: 'Enter your content here...',
      type: 'text',
      isModified: true,
      isEnhancing: false
    };
    setDocumentSections(prev => [...prev, newSection]);
    setHasUnsavedChanges(true);
  };

  // Delete section
  const deleteSection = async (sectionId: string) => {
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return;

    try {
      // If it's an existing entry, delete from database
      if (section.originalEntryId) {
        await deleteEntry(section.originalEntryId);
      }
      
      // Remove from local state
      setDocumentSections(prev => prev.filter(s => s.id !== sectionId));
      setHasUnsavedChanges(true);
      
      toast({
        title: "Section Deleted",
        description: "Section has been removed from the knowledge base"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    }
  };

  // Enhance selected text with AI
  const enhanceSelectedText = async (enhancementType: TextEnhancementRequest['enhancementType'] = 'clarity') => {
    if (!selectedText || !selectionRange) {
      toast({
        title: "No Text Selected",
        description: "Please select some text to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    
    try {
      const result = await enhanceTextWithAI({
        selectedText,
        enhancementType,
        projectContext: {
          industry: 'general', // Could be passed from project settings
          targetAudience: 'UX professionals',
          projectGoals: ['Improve user experience', 'Create comprehensive documentation']
        }
      });
      
      // Replace selected text with enhanced version
      if (selectionRange) {
        selectionRange.deleteContents();
        selectionRange.insertNode(document.createTextNode(result.enhancedText));
        
        // Find which section this belongs to and mark as modified
        const sectionElement = selectionRange.commonAncestorContainer.parentElement?.closest('[data-section-id]');
        if (sectionElement) {
          const sectionId = sectionElement.getAttribute('data-section-id');
          if (sectionId) {
            const newContent = sectionElement.textContent || '';
            handleContentChange(sectionId, 'content', newContent);
          }
        }
      }
      
      toast({
        title: "Text Enhanced",
        description: `Applied ${enhancementType} enhancement with ${Math.round(result.confidence * 100)}% confidence`
      });
      
      setSelectedText('');
      setSelectionRange(null);
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance the selected text",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Save all changes
  const saveAllChanges = async () => {
    setIsSaving(true);
    
    try {
      const modifiedSections = documentSections.filter(section => section.isModified);
      
      for (const section of modifiedSections) {
        if (section.originalEntryId) {
          // Update existing entry
          await updateEntry(section.originalEntryId, {
            title: section.title,
            content: section.content
          });
        } else {
          // Create new entry
          await addTextEntry(projectId, section.title, section.content);
        }
      }
      
      // Reset modified flags
      setDocumentSections(prev => prev.map(section => ({
        ...section,
        isModified: false
      })));
      
      setHasUnsavedChanges(false);
      
      toast({
        title: "Changes Saved",
        description: `Successfully saved ${modifiedSections.length} sections`
      });

      // Call the callback if provided
      if (onDocumentSaved) {
        setTimeout(onDocumentSaved, 500); // Small delay to show the success message
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes to the knowledge base",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(projectId, file, file.name);
      toast({
        title: "File Uploaded",
        description: "File has been processed and added to the knowledge base"
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload and process the file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Knowledge Base Document</h3>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {selectedText && (
            <Button
              onClick={enhanceSelectedText}
              disabled={isEnhancing}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isEnhancing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
          )}
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
          />
          <Button variant="outline" className="cursor-pointer" asChild>
            <label htmlFor="file-upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </label>
          </Button>
          
          <Button onClick={addNewSection} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
          
          <Button
            onClick={saveAllChanges}
            disabled={isSaving || !hasUnsavedChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Document Editor */}
      <div className="bg-gray-50 p-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Document Paper */}
          <Card className="bg-white shadow-lg mb-8">
            <CardContent className="p-16 py-12" ref={editorRef} style={{ 
              maxWidth: '8.5in', 
              margin: '0 auto',
              minHeight: '800px',
              background: 'white'
            }}>
              {documentSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-8 group"
                  data-section-id={section.id}
                >
                  {/* Section Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between group">
                      <input
                        value={section.title}
                        onChange={(e) => handleContentChange(section.id, 'title', e.target.value)}
                        className="font-bold text-xl border-none p-0 bg-transparent focus:outline-none focus:bg-transparent w-full mr-4"
                        placeholder="Section title..."
                        style={{ 
                          fontFamily: '"Times New Roman", serif',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          lineHeight: '1.3',
                          color: '#1f2937',
                          marginBottom: '8px'
                        }}
                      />
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {section.isModified && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            Modified
                          </Badge>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSection(section.id)}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Section Content */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      const content = e.currentTarget.textContent || '';
                      handleContentChange(section.id, 'content', content);
                    }}
                    onMouseUp={handleTextSelection}
                    onKeyUp={handleTextSelection}
                    onBlur={(e) => {
                      // Reformat content when user finishes editing
                      const content = e.currentTarget.textContent || '';
                      e.currentTarget.innerHTML = formatContentForDisplay(content);
                    }}
                    className="min-h-[120px] p-0 focus:outline-none bg-transparent text-gray-900 leading-relaxed"
                    style={{ 
                      fontFamily: '"Times New Roman", serif', 
                      fontSize: '16px', 
                      lineHeight: '1.8',
                      textAlign: 'justify',
                      marginBottom: '24px'
                    }}
                    dangerouslySetInnerHTML={{ __html: formatContentForDisplay(section.content) }}
                  />

                  {index < documentSections.length - 1 && (
                    <div className="mt-12 mb-8">
                      <hr className="border-gray-300" style={{ borderWidth: '0.5px' }} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Empty State */}
              {documentSections.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Start Your Knowledge Base</h3>
                  <p className="mb-4">Add sections to build your project knowledge base</p>
                  <Button onClick={addNewSection}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Section
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Selection Info */}
      {selectedText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Text Selected</h4>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  "{selectedText.substring(0, 80)}{selectedText.length > 80 ? '...' : ''}"
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Enhancement Options:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => enhanceSelectedText('clarity')}
                  disabled={isEnhancing}
                  className="text-xs h-8"
                >
                  💡 Clarity
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => enhanceSelectedText('detail')}
                  disabled={isEnhancing}
                  className="text-xs h-8"
                >
                  📝 Detail
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => enhanceSelectedText('professional')}
                  disabled={isEnhancing}
                  className="text-xs h-8"
                >
                  👔 Professional
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => enhanceSelectedText('structure')}
                  disabled={isEnhancing}
                  className="text-xs h-8"
                >
                  📋 Structure
                </Button>
              </div>
              
              <Button
                size="sm"
                onClick={() => enhanceSelectedText('comprehensive')}
                disabled={isEnhancing}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-xs h-8"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3 mr-2" />
                )}
                {isEnhancing ? 'Enhancing...' : '🎯 Comprehensive'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};