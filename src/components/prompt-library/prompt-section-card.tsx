/**
 * @fileoverview PromptSectionCard - Individual editable section card
 * Displays a collapsible, editable card for each prompt section (role, context, task, etc.)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  User,
  Target,
  Settings,
  FileText,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromptSection } from '@/types/structured-prompt';
import { countWords } from '@/lib/structured-prompt-helpers';
import { toast } from 'sonner';

interface PromptSectionCardProps {
  section: PromptSection;
  onUpdate?: (content: string) => void;
  onToggleExpand?: () => void;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  className?: string;
}

// Icon mapping
const ICON_MAP = {
  Brain,
  User,
  Target,
  Settings,
  FileText,
  Lightbulb,
};

// Color mapping
const COLOR_MAP = {
  purple: {
    card: 'border-purple-300 bg-purple-50 hover:border-purple-400',
    header: 'bg-purple-100 border-purple-200',
    icon: 'text-purple-600',
    badge: 'bg-purple-200 text-purple-800',
    button: 'text-purple-600 hover:bg-purple-100',
  },
  blue: {
    card: 'border-blue-300 bg-blue-50 hover:border-blue-400',
    header: 'bg-blue-100 border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-200 text-blue-800',
    button: 'text-blue-600 hover:bg-blue-100',
  },
  green: {
    card: 'border-green-300 bg-green-50 hover:border-green-400',
    header: 'bg-green-100 border-green-200',
    icon: 'text-green-600',
    badge: 'bg-green-200 text-green-800',
    button: 'text-green-600 hover:bg-green-100',
  },
  orange: {
    card: 'border-orange-300 bg-orange-50 hover:border-orange-400',
    header: 'bg-orange-100 border-orange-200',
    icon: 'text-orange-600',
    badge: 'bg-orange-200 text-orange-800',
    button: 'text-orange-600 hover:bg-orange-100',
  },
  red: {
    card: 'border-red-300 bg-red-50 hover:border-red-400',
    header: 'bg-red-100 border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-200 text-red-800',
    button: 'text-red-600 hover:bg-red-100',
  },
  yellow: {
    card: 'border-yellow-300 bg-yellow-50 hover:border-yellow-400',
    header: 'bg-yellow-100 border-yellow-200',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-200 text-yellow-800',
    button: 'text-yellow-600 hover:bg-yellow-100',
  },
};

export function PromptSectionCard({
  section,
  onUpdate,
  onToggleExpand,
  isEditing: externalIsEditing,
  onEditStart,
  onEditEnd,
  className,
}: PromptSectionCardProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(section.content);
  const [hasChanges, setHasChanges] = useState(false);

  // Use external editing state if provided, otherwise use internal state
  const isEditing = externalIsEditing ?? internalIsEditing;

  // Update edited content when section content changes
  useEffect(() => {
    setEditedContent(section.content);
    setHasChanges(false);
  }, [section.content]);

  const Icon = ICON_MAP[section.icon] || Brain;
  const colors = COLOR_MAP[section.color] || COLOR_MAP.purple;
  const wordCount = countWords(section.content);

  const handleEditStart = () => {
    if (externalIsEditing === undefined) {
      setInternalIsEditing(true);
    }
    onEditStart?.();
  };

  const handleEditCancel = () => {
    setEditedContent(section.content);
    setHasChanges(false);
    if (externalIsEditing === undefined) {
      setInternalIsEditing(false);
    }
    onEditEnd?.();
  };

  const handleEditSave = () => {
    if (hasChanges && onUpdate) {
      onUpdate(editedContent);
      toast.success(`${section.title} updated`);
    }
    if (externalIsEditing === undefined) {
      setInternalIsEditing(false);
    }
    onEditEnd?.();
  };

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== section.content);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(section.content);
    toast.success('Section content copied to clipboard');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      <Card className={cn('border-2 transition-all duration-200', colors.card)}>
        {/* Header */}
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b-2 cursor-pointer',
            colors.header
          )}
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg bg-white', colors.icon)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn('text-xs', colors.badge)}>
                  {section.type}
                </Badge>
                <span className="text-xs text-muted-foreground">{wordCount} words</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {section.isEditable && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditStart();
                }}
                className={colors.button}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}

            {!isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className={colors.button}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}

            {onToggleExpand && (
              <Button size="sm" variant="ghost" className={colors.button}>
                {section.isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <AnimatePresence>
          {section.isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder={`Enter ${section.title.toLowerCase()} content...`}
                      className="min-h-[200px] font-mono text-sm"
                      autoFocus
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{countWords(editedContent)} words</span>
                        <span>•</span>
                        <span>{editedContent.length} characters</span>
                        {hasChanges && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">Unsaved changes</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleEditSave}
                          disabled={!hasChanges}
                          className={cn(
                            'bg-green-600 hover:bg-green-700 text-white',
                            !hasChanges && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-white p-3 rounded border">
                      {section.content}
                    </pre>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
