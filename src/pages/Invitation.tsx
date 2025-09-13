import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigation } from '@/components/ui/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  Edit, 
  Crown,
  ArrowRight,
  UserPlus,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useProjectStore } from '@/stores/project-store';

interface InvitationData {
  requiresRegistration: boolean;
  invitedEmail: string;
  projectName: string;
  role: 'viewer' | 'editor';
  invitationToken: string;
  message?: string;
  expired?: boolean;
  projectId?: string;
}

export default function Invitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { setCurrentProject, fetchProjects } = useProjectStore();
  
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    if (!authLoading) {
      checkInvitation();
    }
  }, [token, authLoading]);

  const checkInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: inviteError } = await supabase.functions.invoke('accept-project-invitation', {
        body: {
          invitationToken: token,
          userEmail: user?.email
        }
      });

      if (inviteError) {
        throw new Error(inviteError.message || 'Failed to check invitation');
      }

      if (data.error) {
        if (data.expired) {
          setError('This invitation has expired. Please ask the project owner to send a new invitation.');
        } else {
          setError(data.error);
        }
        return;
      }

      if (data.success) {
        // Invitation was accepted successfully
        setSuccess(true);
        setInvitationData({
          requiresRegistration: false,
          invitedEmail: user?.email || '',
          projectName: data.projectName,
          role: data.role,
          invitationToken: token,
          projectId: data.projectId
        });

        toast({
          title: "Welcome to the project!",
          description: `You now have ${data.role} access to "${data.projectName}"`
        });

        // Refresh projects list to include new project
        await fetchProjects();
      } else if (data.requiresRegistration) {
        // User needs to register
        setInvitationData(data);
      } else if (data.alreadyMember) {
        // User is already a member
        setSuccess(true);
        setInvitationData({
          requiresRegistration: false,
          invitedEmail: user?.email || '',
          projectName: 'Project', // Will be updated
          role: data.role,
          invitationToken: token,
          projectId: data.projectId
        });

        toast({
          title: "Already a member",
          description: "You already have access to this project"
        });
      }

    } catch (error) {
      console.error('Error checking invitation:', error);
      setError(error.message || 'Failed to check invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to accept this invitation",
        variant: "destructive"
      });
      navigate(`/auth?invitation=${token}`);
      return;
    }

    try {
      setAccepting(true);
      await checkInvitation(); // This will handle the acceptance
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleOpenProject = async () => {
    if (invitationData?.projectId) {
      // Find the project in the store
      const projects = await fetchProjects();
      const project = projects?.find(p => p.id === invitationData.projectId);
      
      if (project) {
        setCurrentProject(project);
        navigate('/workflow');
      } else {
        toast({
          title: "Error",
          description: "Could not find the project. Please try refreshing the page.",
          variant: "destructive"
        });
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'editor':
        return <Edit className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      case 'owner':
        return <Crown className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'editor':
        return 'Edit workflows, create prompts, and collaborate on project content';
      case 'viewer':
        return 'View project content, workflows, and documentation';
      default:
        return 'Access project resources';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Checking invitation...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="container mx-auto py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Invitation Error</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">{error}</p>
                <Button asChild>
                  <Link to="/projects">Go to Projects</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="container mx-auto py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-600">Welcome to the project!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">{invitationData?.projectName}</h3>
                  <div className="flex items-center justify-center gap-2">
                    {getRoleIcon(invitationData?.role || 'viewer')}
                    <Badge variant={invitationData?.role === 'editor' ? 'default' : 'secondary'}>
                      {invitationData?.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getRoleDescription(invitationData?.role || 'viewer')}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleOpenProject} className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Open Project
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/projects">View All Projects</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (invitationData?.requiresRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="container mx-auto py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Join FramePromptly</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    You've been invited to collaborate on <strong>"{invitationData.projectName}"</strong> as a <strong>{invitationData.role}</strong>.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Invited: {invitationData.invitedEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getRoleIcon(invitationData.role)}
                    <span>Role: {invitationData.role}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To accept this invitation, you need to create an account or sign in with the invited email address.
                  </p>
                  
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link to={`/auth?invitation=${token}&email=${encodeURIComponent(invitationData.invitedEmail)}`}>
                        Create Account & Accept
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/auth?mode=signin&invitation=${token}&email=${encodeURIComponent(invitationData.invitedEmail)}`}>
                        Sign In & Accept
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged in user, show invitation details
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <div className="container mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Project Invitation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You have a pending invitation to join <strong>"{invitationData?.projectName}"</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button 
                  onClick={handleAcceptInvitation} 
                  disabled={accepting}
                  className="w-full"
                >
                  {accepting ? 'Accepting...' : 'Accept Invitation'}
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/projects">Maybe Later</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}