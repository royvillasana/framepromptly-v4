import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, Menu, User, LogOut, BarChart, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useProjectStore } from "@/stores/project-store";
import logoHeader from "@/assets/logo_header.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const { user, signOut, loading } = useAuth();
  const { setCurrentProject } = useProjectStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully"
      });
      navigate('/');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("flex items-center justify-between w-full p-6 bg-background/80 backdrop-blur-lg border-b border-border relative", className)}
      style={{ zIndex: 20 }}
    >
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img 
            src={logoHeader}
            alt="FramePromptly Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FramePromptly
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            // Navigation for logged-in users
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/workflow">Workflows</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/frameworks" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Frameworks
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/library">Library</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setCurrentProject(null);
                  navigate('/workflow');
                }}
              >
                Projects
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/metrics" className="flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Metrics
                </Link>
              </Button>
            </>
          ) : (
            // Navigation for non-logged-in users
            <>
              <Button variant="ghost" size="sm">
                Features
              </Button>
              <Button variant="ghost" size="sm">
                Pricing
              </Button>
              <Button variant="ghost" size="sm">
                About
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {loading ? (
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {user.email?.split('@')[0] || 'User'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </motion.nav>
  );
}