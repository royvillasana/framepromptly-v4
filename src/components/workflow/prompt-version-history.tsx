import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  History,
  Clock,
  CheckCircle,
  Trash2,
  Eye,
  Save,
  GitBranch,
  AlertCircle
} from 'lucide-react';
import { usePromptStore, PromptVersion } from '@/stores/prompt-store';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptVersionHistoryProps {
  promptId: string;
  onVersionSelect?: (version: PromptVersion) => void; // For viewing a version
  onVersionSwitch?: (version: PromptVersion) => void; // For making a version active
  onSaveNewVersion?: () => void;
  selectedVersionId?: string | null; // Currently selected version for viewing
}

export function PromptVersionHistory({
  promptId,
  onVersionSelect,
  onVersionSwitch,
  onSaveNewVersion,
  selectedVersionId: externalSelectedVersionId
}: PromptVersionHistoryProps) {
  const {
    loadPromptVersions,
    getVersionHistory,
    switchToVersion,
    deleteVersion,
    isLoadingVersions
  } = usePromptStore();

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<PromptVersion | null>(null);

  useEffect(() => {
    loadPromptVersions(promptId);
  }, [promptId, loadPromptVersions]);

  const versions = getVersionHistory(promptId);
  const activeVersion = versions.find(v => v.isActive);

  const handleSwitchVersion = async (versionId: string) => {
    try {
      await switchToVersion(promptId, versionId);
      const version = versions.find(v => v.id === versionId);
      if (version) {
        onVersionSwitch?.(version);
        toast.success(`Switched to ${version.versionTitle}`);
      }
    } catch (error) {
      toast.error('Failed to switch version');
      console.error(error);
    }
  };

  const handleDeleteVersion = async () => {
    if (!versionToDelete) return;

    try {
      await deleteVersion(versionToDelete.id);
      toast.success(`Deleted ${versionToDelete.versionTitle}`);
      setDeleteDialogOpen(false);
      setVersionToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete version');
      console.error(error);
    }
  };

  const handlePreviewVersion = (versionId: string) => {
    setSelectedVersionId(selectedVersionId === versionId ? null : versionId);
  };

  if (isLoadingVersions) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading version history...</span>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <History className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No version history available</p>
        <p className="text-xs text-muted-foreground mt-1">
          Versions will appear here as you save changes
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          <h3 className="font-medium text-sm">Version History ({versions.length})</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onSaveNewVersion}
          className="h-7 px-2 text-xs"
        >
          <Save className="w-3 h-3 mr-1" />
          Save New Version
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {versions.map((version, index) => {
              const isViewingThisVersion = externalSelectedVersionId === version.id;
              const isActive = version.isActive;
              const isSelected = selectedVersionId === version.id;

              return (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-3 transition-all ${
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/30'
                    } ${isViewingThisVersion ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}
                  >
                    <div className="space-y-2">
                      {/* Version Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                              v{version.versionNumber}
                            </Badge>
                            {isActive && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            {isViewingThisVersion && (
                              <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300">
                                <Eye className="w-3 h-3 mr-1" />
                                Viewing
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm mt-1 truncate">
                            {version.versionTitle}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onVersionSelect?.(version)}
                            className="h-7 px-2 text-xs"
                            title="View this version"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {!isActive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setVersionToDelete(version);
                                setDeleteDialogOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              title="Delete version"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Change Summary */}
                      {version.changeSummary && (
                        <p className="text-xs text-muted-foreground italic">
                          {version.changeSummary}
                        </p>
                      )}

                      {/* Version Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          <span>{version.conversation.length} messages</span>
                        </div>
                        <Separator orientation="vertical" className="h-3" />
                        <div>
                          {version.content.length} chars
                        </div>
                      </div>

                      {/* Preview Section */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Separator className="my-2" />
                            <div className="space-y-2">
                              <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                  {version.content.substring(0, 500)}
                                  {version.content.length > 500 && '...'}
                                </pre>
                              </ScrollArea>
                              {!isActive && (
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleSwitchVersion(version.id)}
                                >
                                  Switch to this version
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{versionToDelete?.versionTitle}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              You will lose all conversation history and content associated with this version.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVersion}>
              Delete Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
