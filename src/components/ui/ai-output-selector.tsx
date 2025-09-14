import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Info, Sparkles, Palette, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AI_OUTPUT_OPTIONS,
  getGroupedAIOutputOptions,
  getAIOutputOption,
  type AIOutputOption
} from '@/lib/ai-output-configurations';

interface AIOutputSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: 'default' | 'compact';
  showDescription?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'ai-assistant':
      return <Bot className="w-3 h-3" />;
    case 'design-tool':
      return <Palette className="w-3 h-3" />;
    default:
      return <Sparkles className="w-3 h-3" />;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'ai-assistant':
      return 'AI Assistants';
    case 'design-tool':
      return 'Design Tools';
    default:
      return 'Other';
  }
};

export function AIOutputSelector({
  value,
  onChange,
  className,
  variant = 'default',
  showDescription = true
}: AIOutputSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = getAIOutputOption(value);
  const groupedOptions = getGroupedAIOutputOptions();

  if (variant === 'compact') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("w-full", className)}>
          <div className="flex items-center gap-2">
            {selectedOption && selectedOption.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <SelectValue placeholder="No AI optimization" />
          </div>
        </SelectTrigger>
        <SelectContent className="w-80">
          {Object.entries(groupedOptions).map(([category, options]) => (
            <div key={category}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2 border-b border-border mb-1">
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
              </div>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id} className="py-2">
                  <div className="flex items-center gap-2">
                    {option.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-sm">{option.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          AI Output Optimization
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Info className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">AI Output Optimization</h4>
              <p className="text-muted-foreground">
                Select an AI platform or design tool to optimize the generated prompt
                with platform-specific instructions and formatting. This is optional
                and can enhance prompt effectiveness for your target AI system.
              </p>
              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <Bot className="w-3 h-3 text-blue-500" />
                  <span className="font-medium">AI Assistants:</span>
                  <span className="text-muted-foreground">Optimized for reasoning and web search</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Palette className="w-3 h-3 text-orange-500" />
                  <span className="font-medium">Design Tools:</span>
                  <span className="text-muted-foreground">Optimized for visual collaboration</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            {selectedOption && selectedOption.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <SelectValue placeholder="None (default)" />
          </div>
        </SelectTrigger>
        <SelectContent className="w-[400px] max-h-80">
          {Object.entries(groupedOptions).map(([category, options]) => (
            <div key={category}>
              <div className="px-2 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2 border-b border-border mb-1">
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
              </div>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id} className="py-3">
                  <div className="flex items-start gap-3 w-full">
                    {option.color && (
                      <div
                        className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {option.name}
                        {option.id !== 'none' && (
                          <Badge variant="secondary" className="text-xs">
                            Enhanced
                          </Badge>
                        )}
                      </div>
                      {showDescription && (
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      {selectedOption && selectedOption.id !== 'none' && showDescription && (
        <div className="p-3 bg-muted/50 rounded-md border">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedOption.color }}
            />
            <span className="text-sm font-medium">{selectedOption.name}</span>
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(selectedOption.category)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedOption.description}
          </p>
        </div>
      )}
    </div>
  );
}

// Simplified version for inline use
export function AIOutputBadge({ 
  value, 
  className 
}: { 
  value: string; 
  className?: string; 
}) {
  const option = getAIOutputOption(value);
  
  if (!option || option.id === 'none') {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn("text-xs flex items-center gap-1", className)}
    >
      {option.color && (
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: option.color }}
        />
      )}
      {option.name}
    </Badge>
  );
}