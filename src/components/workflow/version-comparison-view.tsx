import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GitCompare, ArrowRight } from 'lucide-react';
import { PromptVersion } from '@/stores/prompt-store';
import { formatDistanceToNow } from 'date-fns';

interface VersionComparisonViewProps {
  versionA: PromptVersion;
  versionB: PromptVersion;
}

export function VersionComparisonView({ versionA, versionB }: VersionComparisonViewProps) {
  const [olderVersion, newerVersion] =
    versionA.versionNumber < versionB.versionNumber
      ? [versionA, versionB]
      : [versionB, versionA];

  const contentLengthDiff = newerVersion.content.length - olderVersion.content.length;
  const conversationDiff = newerVersion.conversation.length - olderVersion.conversation.length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4" />
          <h3 className="font-medium text-sm">Version Comparison</h3>
        </div>
      </div>

      {/* Comparison Header */}
      <div className="p-3 bg-muted/30 border-b">
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="text-center">
            <Badge variant="outline" className="mb-1">
              v{olderVersion.versionNumber}
            </Badge>
            <p className="text-xs font-medium truncate">{olderVersion.versionTitle}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(olderVersion.createdAt), { addSuffix: true })}
            </p>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="text-center">
            <Badge variant="default" className="mb-1">
              v{newerVersion.versionNumber}
            </Badge>
            <p className="text-xs font-medium truncate">{newerVersion.versionTitle}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(newerVersion.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Stats Comparison */}
          <Card className="p-3">
            <h4 className="text-sm font-medium mb-2">Changes</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Content Length:</span>
                <div className="flex items-center gap-2">
                  <span>{olderVersion.content.length}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">{newerVersion.content.length}</span>
                  <Badge
                    variant={contentLengthDiff > 0 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {contentLengthDiff > 0 ? '+' : ''}
                    {contentLengthDiff}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Conversation:</span>
                <div className="flex items-center gap-2">
                  <span>{olderVersion.conversation.length}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">{newerVersion.conversation.length}</span>
                  {conversationDiff !== 0 && (
                    <Badge
                      variant={conversationDiff > 0 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {conversationDiff > 0 ? '+' : ''}
                      {conversationDiff} messages
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Change Summary */}
          {newerVersion.changeSummary && (
            <Card className="p-3">
              <h4 className="text-sm font-medium mb-2">Change Summary</h4>
              <p className="text-xs text-muted-foreground italic">
                {newerVersion.changeSummary}
              </p>
            </Card>
          )}

          {/* Side-by-Side Content Preview */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  v{olderVersion.versionNumber}
                </Badge>
                <span className="text-xs font-medium">Previous</span>
              </div>
              <ScrollArea className="h-64">
                <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                  {olderVersion.content}
                </pre>
              </ScrollArea>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-xs">
                  v{newerVersion.versionNumber}
                </Badge>
                <span className="text-xs font-medium">Current</span>
              </div>
              <ScrollArea className="h-64">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {newerVersion.content}
                </pre>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
