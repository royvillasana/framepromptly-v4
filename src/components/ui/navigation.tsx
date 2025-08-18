import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, Menu, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
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
            <Link to="/workflow">Workflows</Link>
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