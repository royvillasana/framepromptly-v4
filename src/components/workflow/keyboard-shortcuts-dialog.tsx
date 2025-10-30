import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Canvas Movement',
    shortcuts: [
      { keys: 'Ctrl + Left Mouse + Drag', description: 'Move canvas view' },
      { keys: 'Ctrl + Middle Mouse + Drag', description: 'Move canvas view' },
      { keys: 'Space + Drag', description: 'Move canvas view' },
      { keys: 'Middle Mouse + Drag', description: 'Move canvas view' },
      { keys: 'Two Fingers (Touch)', description: 'Move canvas view' },
    ],
  },
  {
    title: 'Canvas Zoom',
    shortcuts: [
      { keys: '+ or =', description: 'Zoom in' },
      { keys: '- or _', description: 'Zoom out' },
      { keys: '0', description: 'Reset zoom level' },
      { keys: '1', description: 'Zoom to fit workflow' },
      { keys: 'Ctrl + Mouse Wheel', description: 'Zoom in/out' },
    ],
  },
  {
    title: 'Node Interaction',
    shortcuts: [
      { keys: 'Double Click on Node', description: 'Open node details' },
      { keys: 'Ctrl + A', description: 'Select all nodes' },
      { keys: 'Click + Drag', description: 'Move node' },
    ],
  },
  {
    title: 'Node Selection & Navigation',
    shortcuts: [
      { keys: 'Arrow Up', description: 'Select sibling node above' },
      { keys: 'Arrow Down', description: 'Select sibling node below' },
      { keys: 'Arrow Left', description: 'Select node to the left' },
      { keys: 'Arrow Right', description: 'Select node to the right' },
      { keys: 'Shift + Arrow Left', description: 'Select all nodes to the left' },
      { keys: 'Shift + Arrow Right', description: 'Select all nodes to the right' },
    ],
  },
  {
    title: 'Node Actions (with selection)',
    shortcuts: [
      { keys: 'Ctrl + C', description: 'Copy selected nodes' },
      { keys: 'Ctrl + V', description: 'Paste nodes' },
      { keys: 'Ctrl + X', description: 'Cut selected nodes' },
      { keys: 'Delete or Backspace', description: 'Delete selected nodes' },
      { keys: 'Enter', description: 'Open selected node' },
      { keys: 'F2', description: 'Rename selected node' },
      { keys: 'Shift + S', description: 'Add sticky note' },
    ],
  },
  {
    title: 'Multi-Selection',
    shortcuts: [
      { keys: 'Ctrl/Cmd + Click', description: 'Add/remove node from selection' },
      { keys: 'Shift + Click', description: 'Select multiple nodes' },
      { keys: 'Drag Selection Box', description: 'Select multiple nodes (marquee mode)' },
    ],
  },
];

interface KeyboardShortcutsDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps = {}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Keyboard Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Master these shortcuts to work efficiently with the canvas
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {shortcutGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 whitespace-nowrap">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
