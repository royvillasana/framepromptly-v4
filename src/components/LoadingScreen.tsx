import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-8 max-w-md w-full px-8">
        {/* Logo */}
        <div className="w-32 h-32 relative">
          <img
            src="./logo_web.png"
            alt="FramePromptly Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            FramePromptly
          </h1>
          <p className="text-sm text-muted-foreground">
            UX Framework Workflow Builder
          </p>
        </div>

        {/* Version */}
        <div className="text-xs text-muted-foreground">
          Version 1.0.0
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Loading your workspace...
          </p>
        </div>
      </div>
    </div>
  );
};
