import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, Menu, User } from "lucide-react";
import { motion } from "framer-motion";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("flex items-center justify-between p-6 bg-background/80 backdrop-blur-lg border-b border-border", className)}
    >
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FramePromptly
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" size="sm" asChild>
            <a href="/workflow">Workflows</a>
          </Button>
          <Button variant="ghost" size="sm">
            Frameworks
          </Button>
          <Button variant="ghost" size="sm">
            Library
          </Button>
          <Button variant="ghost" size="sm">
            Projects
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
        <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover">
          Get Started
        </Button>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </motion.nav>
  );
}