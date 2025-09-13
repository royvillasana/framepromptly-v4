import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Context for managing prompt input state
interface PromptInputContextValue {
  value: string;
  setValue: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxHeight?: number;
}

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null);

function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput");
  }
  return context;
}

// Main container component
interface PromptInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxHeight?: number;
  children: React.ReactNode;
  className?: string;
}

export function PromptInput({
  value,
  onValueChange,
  onSubmit,
  disabled = false,
  loading = false,
  placeholder = "Type your message...",
  maxHeight = 200,
  children,
  className,
}: PromptInputProps) {
  const contextValue = React.useMemo(
    () => ({
      value,
      setValue: onValueChange,
      onSubmit,
      disabled,
      loading,
      placeholder,
      maxHeight,
    }),
    [value, onValueChange, onSubmit, disabled, loading, placeholder, maxHeight]
  );

  return (
    <PromptInputContext.Provider value={contextValue}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </PromptInputContext.Provider>
  );
}

// Auto-resizing textarea component
interface PromptInputTextareaProps {
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function PromptInputTextarea({ className, onKeyDown }: PromptInputTextareaProps) {
  const { value, setValue, onSubmit, disabled, loading, placeholder, maxHeight } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize functionality
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    
    // Set height with max constraint
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, maxHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !loading) {
        onSubmit(value);
      }
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled || loading}
      className={cn(
        "min-h-[44px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
        "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
        "bg-transparent pr-12", // Space for submit button
        className
      )}
      style={{
        height: "auto",
        overflow: value.length > 100 ? "auto" : "hidden",
      }}
    />
  );
}

// Toolbar container
interface PromptInputToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function PromptInputToolbar({ children, className }: PromptInputToolbarProps) {
  return (
    <div className={cn("flex items-center justify-between px-3 py-2", className)}>
      {children}
    </div>
  );
}

// Tools section (left side of toolbar)
interface PromptInputToolsProps {
  children?: React.ReactNode;
  className?: string;
}

export function PromptInputTools({ children, className }: PromptInputToolsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

// Submit button component
interface PromptInputSubmitProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export function PromptInputSubmit({ 
  className, 
  size = "sm",
  variant = "default"
}: PromptInputSubmitProps) {
  const { value, onSubmit, disabled, loading } = usePromptInput();
  
  const canSubmit = value.trim().length > 0 && !disabled && !loading;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(value);
    }
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={!canSubmit}
      size={size}
      variant={variant}
      className={cn(
        "h-8 w-8 p-0 transition-all duration-200",
        canSubmit 
          ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="send"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Send className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

// Model selector component (for future multi-provider support)
interface PromptInputModelSelectProps {
  models?: Array<{ id: string; name: string; description?: string }>;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export function PromptInputModelSelect({
  models = [{ id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" }],
  selectedModel = "gpt-4o-mini",
  onModelChange,
  className,
}: PromptInputModelSelectProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sparkles className="h-3 w-3 text-primary" />
      <span className="text-xs text-muted-foreground font-medium">
        {models.find(m => m.id === selectedModel)?.name || "AI Model"}
      </span>
    </div>
  );
}

// Keyboard shortcut helper
interface PromptInputShortcutsProps {
  className?: string;
}

export function PromptInputShortcuts({ className }: PromptInputShortcutsProps) {
  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        ⏎
      </kbd>
      <span className="ml-1">to send</span>
      <span className="mx-2">•</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        ⇧⏎
      </kbd>
      <span className="ml-1">for new line</span>
    </div>
  );
}

// Container for the complete prompt input
interface PromptInputContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PromptInputContainer({ children, className }: PromptInputContainerProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border border-input bg-background/60",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      "transition-all duration-200",
      className
    )}>
      {children}
    </div>
  );
}