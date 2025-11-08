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
      // If user is logged in, redirect to projects page
      // They can accept/decline from there
      if (user) {
        toast({
          title: "Check your invitations",
          description: "View your pending project invitation in the Projects page"
        });
        navigate('/projects');
      } else {
        // If not logged in, redirect directly to auth page with invitation token
        // Skip the invitation preview page entirely
        navigate(`/auth?invitation=${token}`);
      }
    }
  }, [token, authLoading, user, navigate, toast]);

  const checkInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Just fetch invitation details without accepting
      const { data: invitation, error: inviteError } = await supabase
        .from('project_invitations')
        .select(`
          id,
          invited_email,
          role,
          status,
          expires_at,
          projects:project_id (
            id,
            name
          )
        `)
        .eq('invitation_token', token)
        .single();

      if (inviteError) {
        throw new Error('Invalid or expired invitation');
      }

      if (!invitation) {
        setError('Invitation not found');
        return;
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        setError('This invitation has expired. Please ask the project owner to send a new invitation.');
        return;
      }

      // Check if already accepted or declined
      if (invitation.status !== 'pending') {
        if (invitation.status === 'accepted') {
          setError('This invitation has already been accepted.');
        } else {
          setError('This invitation is no longer valid.');
        }
        return;
      }

      // Set invitation data for display
      // If user is logged in, they don't need to register
      setInvitationData({
        requiresRegistration: !user,
        invitedEmail: invitation.invited_email,
        projectName: invitation.projects?.name || 'Unknown Project',
        role: invitation.role,
        invitationToken: token,
        projectId: invitation.projects?.id
      });

    } catch (error) {
      console.error('Error checking invitation:', error);
      setError(error.message || 'Failed to check invitation');
    } finally {
      setLoading(false);
    }
  };

  // These handlers are no longer used since logged-in users are redirected to /projects
  // Keeping them for the success screen's "Open Project" button
  const handleAcceptInvitation = async () => {
    // This should not be called anymore
    navigate('/projects');
  };

  const handleDeclineInvitation = async () => {
    // This should not be called anymore
    navigate('/projects');
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
                    To view and accept this invitation, you need to sign in or create an account. After signing in, you'll see the invitation in your Projects page where you can accept or decline it.
                  </p>

                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link to={`/auth?invitation=${token}&email=${encodeURIComponent(invitationData.invitedEmail)}`}>
                        Create Account
                      </Link>
                    </Button>

                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/auth?mode=signin&invitation=${token}&email=${encodeURIComponent(invitationData.invitedEmail)}`}>
                        Sign In
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

  // This should not be reached - logged in users are redirected to /projects
  // But just in case, show a loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Redirecting to Projects...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}