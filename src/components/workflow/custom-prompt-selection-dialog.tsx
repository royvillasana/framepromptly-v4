import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, FileText, Sparkles, Clock, Play } from 'lucide-react';
import { useStructuredPromptStore } from '@/stores/structured-prompt-store';
import type { StructuredPrompt } from '@/types/structured-prompt';
import { toast } from 'sonner';

interface CustomPromptSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptSelected: (prompt: StructuredPrompt) => void;
}

export function CustomPromptSelectionDialog({
  isOpen,
  onClose,
  onPromptSelected,
}: CustomPromptSelectionDialogProps) {
  const { prompts, loading, fetchLibraryPrompts } = useStructuredPromptStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrompts, setFilteredPrompts] = useState<StructuredPrompt[]>([]);

  // Fetch prompts when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchLibraryPrompts({
        sortBy: 'updated_at_desc',
      });
    }
  }, [isOpen, fetchLibraryPrompts]);

  // Filter prompts based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPrompts(prompts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = prompts.filter(
        prompt =>
          prompt.title.toLowerCase().includes(query) ||
          prompt.description?.toLowerCase().includes(query) ||
          prompt.tool_name?.toLowerCase().includes(query) ||
          prompt.framework_name?.toLowerCase().includes(query)
      );
      setFilteredPrompts(filtered);
    }
  }, [searchQuery, prompts]);

  const handleSelectPrompt = (prompt: StructuredPrompt) => {
    onPromptSelected(prompt);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Select Custom Prompt
          </DialogTitle>
          <DialogDescription>
            Choose a custom prompt from your library to add to the canvas
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts by title, description, tool, or framework..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Prompts Grid */}
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-sm text-muted-foreground">Loading prompts...</div>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                {searchQuery ? 'No prompts found matching your search' : 'No custom prompts available'}
              </p>
              <p className="text-xs text-muted-foreground">
                {!searchQuery && 'Create prompts in the Prompt Library to use them here'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectPrompt(prompt)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h4 className="font-medium text-sm mb-1 truncate">
                        {prompt.title}
                      </h4>

                      {/* Description */}
                      {prompt.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {prompt.description}
                        </p>
                      )}

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {prompt.tool_name && (
                          <Badge variant="secondary" className="text-xs">
                            {prompt.tool_name}
                          </Badge>
                        )}
                        {prompt.framework_name && (
                          <Badge variant="outline" className="text-xs">
                            {prompt.framework_name}
                          </Badge>
                        )}
                        {prompt.stage_name && (
                          <Badge variant="outline" className="text-xs">
                            {prompt.stage_name}
                          </Badge>
                        )}
                        {prompt.run_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Play className="w-3 h-3 mr-1" />
                            {prompt.run_count} runs
                          </Badge>
                        )}
                      </div>

                      {/* Last Updated */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Updated {formatDate(prompt.updated_at)}</span>
                      </div>
                    </div>

                    {/* Select Button */}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPrompt(prompt);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} available
          </p>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
