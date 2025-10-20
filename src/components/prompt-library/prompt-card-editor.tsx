/**
 * @fileoverview PromptCardEditor - Full editor with all section cards
 * Main editing interface showing all 6 section cards and preview panel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Save,
  Trash2,
  Copy,
  MoreVertical,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PromptSectionCard } from './prompt-section-card';
import { PromptPreviewPanel } from './prompt-preview-panel';
import { StructuredPrompt, SectionType } from '@/types/structured-prompt';
import { useStructuredPromptStore } from '@/stores/structured-prompt-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PromptCardEditorProps {
  promptId: string;
  onClose?: () => void;
}

export function PromptCardEditor({ promptId, onClose }: PromptCardEditorProps) {
  const navigate = useNavigate();
  const {
    currentPrompt,
    fetchPromptById,
    updatePrompt,
    updateSection,
    deletePrompt,
    duplicatePrompt,
    setCurrentPrompt,
  } = useStructuredPromptStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState({
    title: '',
    description: '',
    framework_name: '',
    stage_name: '',
    tool_name: '',
  });

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set(['role', 'context', 'task', 'constraints', 'format'])
  );

  // Load prompt
  useEffect(() => {
    loadPrompt();
  }, [promptId]);

  // Update metadata form when prompt loads
  useEffect(() => {
    if (currentPrompt) {
      setMetadataForm({
        title: currentPrompt.title,
        description: currentPrompt.description || '',
        framework_name: currentPrompt.framework_name || '',
        stage_name: currentPrompt.stage_name || '',
        tool_name: currentPrompt.tool_name || '',
      });
    }
  }, [currentPrompt]);

  const loadPrompt = async () => {
    try {
      setIsLoading(true);
      const prompt = await fetchPromptById(promptId);
      if (prompt) {
        setCurrentPrompt(prompt);
      } else {
        toast.error('Prompt not found');
        handleClose();
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
      toast.error('Failed to load prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPrompt(null);
    if (onClose) {
      onClose();
    } else {
      navigate('/library');
    }
  };

  const handleToggleSection = (sectionType: SectionType) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionType)) {
        next.delete(sectionType);
      } else {
        next.add(sectionType);
      }
      return next;
    });
  };

  const handleUpdateSection = async (sectionType: SectionType, content: string) => {
    try {
      await updateSection(promptId, sectionType, content);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleSaveMetadata = async () => {
    try {
      setIsSaving(true);
      await updatePrompt(promptId, metadataForm);
      setEditingMetadata(false);
      toast.success('Metadata updated');
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast.error('Failed to save metadata');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePrompt(promptId);
      toast.success('Prompt deleted');
      handleClose();
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newId = await duplicatePrompt(promptId);
      toast.success('Prompt duplicated');
      navigate(`/library/${newId}`);
    } catch (error) {
      console.error('Error duplicating prompt:', error);
    }
  };

  const handleToggleTemplate = async () => {
    if (!currentPrompt) return;
    try {
      await updatePrompt(promptId, {
        is_template: !currentPrompt.is_template,
      });
      toast.success(
        currentPrompt.is_template
          ? 'Removed from templates'
          : 'Added to templates'
      );
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (!currentPrompt) {
    return null;
  }

  const sections = [
    { type: 'role' as const, data: currentPrompt.role_section },
    { type: 'context' as const, data: currentPrompt.context_section },
    { type: 'task' as const, data: currentPrompt.task_section },
    { type: 'constraints' as const, data: currentPrompt.constraints_section },
    { type: 'format' as const, data: currentPrompt.format_section },
    ...(currentPrompt.examples_section
      ? [{ type: 'examples' as const, data: currentPrompt.examples_section }]
      : []),
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex flex-col gap-1">
              {editingMetadata ? (
                <Input
                  value={metadataForm.title}
                  onChange={(e) =>
                    setMetadataForm({ ...metadataForm, title: e.target.value })
                  }
                  className="font-semibold text-lg h-8 max-w-md"
                  autoFocus
                />
              ) : (
                <h1 className="font-semibold text-lg">{currentPrompt.title}</h1>
              )}

              <div className="flex items-center gap-2">
                {currentPrompt.tool_name && (
                  <Badge variant="secondary" className="text-xs">
                    {currentPrompt.tool_name}
                  </Badge>
                )}
                {currentPrompt.is_template && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                    Template
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Version {currentPrompt.version}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editingMetadata ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMetadata(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveMetadata}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMetadata(true)}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Edit Info
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleTemplate}>
                      <FileText className="w-4 h-4 mr-2" />
                      {currentPrompt.is_template
                        ? 'Remove from Templates'
                        : 'Save as Template'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Metadata editing form */}
        {editingMetadata && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={metadataForm.description}
                  onChange={(e) =>
                    setMetadataForm({
                      ...metadataForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this prompt..."
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Framework</Label>
                    <Input
                      value={metadataForm.framework_name}
                      onChange={(e) =>
                        setMetadataForm({
                          ...metadataForm,
                          framework_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Design Thinking"
                    />
                  </div>
                  <div>
                    <Label>Stage</Label>
                    <Input
                      value={metadataForm.stage_name}
                      onChange={(e) =>
                        setMetadataForm({
                          ...metadataForm,
                          stage_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Empathize"
                    />
                  </div>
                </div>
                <div>
                  <Label>Tool</Label>
                  <Input
                    value={metadataForm.tool_name}
                    onChange={(e) =>
                      setMetadataForm({
                        ...metadataForm,
                        tool_name: e.target.value,
                      })
                    }
                    placeholder="e.g., User Personas"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-2 gap-6 p-6">
          {/* Left: Section cards */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Prompt Sections
            </h2>

            {sections.map(({ type, data }) => (
              <PromptSectionCard
                key={type}
                section={{
                  ...data,
                  isExpanded: expandedSections.has(type),
                }}
                onUpdate={(content) => handleUpdateSection(type, content)}
                onToggleExpand={() => handleToggleSection(type)}
              />
            ))}
          </div>

          {/* Right: Preview panel */}
          <div className="overflow-y-auto pl-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Compiled Preview
            </h2>

            <PromptPreviewPanel
              prompt={currentPrompt}
              showMetadata={true}
            />
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentPrompt.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
