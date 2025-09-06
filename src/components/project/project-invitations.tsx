import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Mail, 
  Send, 
  Crown, 
  Edit, 
  Eye, 
  Trash2, 
  Clock, 
  CheckCircle, 
  X,
  UserPlus,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectMember {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  users?: {
    id: string;
    email: string;
  };
}

interface ProjectInvitation {
  id: string;
  invited_email: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  invitation_token: string;
}

interface ProjectInvitationsProps {
  projectId: string;
  projectName: string;
}

export function ProjectInvitations({ projectId, projectName }: ProjectInvitationsProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');

  useEffect(() => {
    loadTeamData();
  }, [projectId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      // Load project members using RPC function that joins with auth.users
      const { data: membersData, error: membersError } = await supabase
        .rpc('get_project_members_with_users', { project_uuid: projectId });

      // Transform the data to match the expected structure
      let membersWithUsers = membersData;
      if (membersData && !membersError) {
        membersWithUsers = membersData.map(member => ({
          id: member.id,
          project_id: member.project_id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          added_by: member.added_by,
          created_at: member.created_at,
          updated_at: member.updated_at,
          users: { 
            id: member.user_id, 
            email: member.user_email || 'Unknown User'
          }
        }));
      }

      if (membersError) throw membersError;

      // Load project invitations using RPC function
      const { data: invitationsData, error: invitationsError } = await supabase
        .rpc('get_project_invitations', { project_uuid: projectId });

      if (invitationsError) throw invitationsError;

      setMembers(membersWithUsers || []);
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: "Error loading team data",
        description: "Could not load project members and invitations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Check if user is already a member
    const isAlreadyMember = members.some(member => 
      member.users?.email?.toLowerCase() === inviteEmail.toLowerCase()
    );
    if (isAlreadyMember) {
      toast({
        title: "Already a member",
        description: "This user is already a member of this project",
        variant: "destructive"
      });
      return;
    }

    // Check if invitation already exists
    const existingInvitation = invitations.find(inv => 
      inv.invited_email.toLowerCase() === inviteEmail.toLowerCase() && 
      inv.status === 'pending'
    );
    if (existingInvitation) {
      toast({
        title: "Invitation already sent",
        description: "A pending invitation already exists for this email",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const requestBody = {
        projectId,
        projectName,
        invitedEmail: inviteEmail.trim(),
        role: inviteRole
      };
      
      console.log('Sending invitation request:', requestBody);
      
      // Remove debug for cleaner testing
      // console.log('🔍 Running debug check...');
      // const debugResult = await supabase.functions.invoke('debug-invitation', {
      //   body: { projectId }
      // });
      // console.log('🔍 Debug result:', debugResult);
      // console.log('🔍 Debug data:', JSON.stringify(debugResult.data, null, 2));
      
      const response = await supabase.functions.invoke('send-project-invitation-simple', {
        body: requestBody
      });

      console.log('🔍 Full response:', response);
      
      if (response.error) {
        console.log('🔍 Response error:', response.error);
        
        // Try to get the actual error details from the response body
        if (response.response) {
          try {
            const responseText = await response.response.text();
            console.log('🔍 Response body:', responseText);
            
            try {
              const errorData = JSON.parse(responseText);
              console.log('🔍 Parsed error data:', errorData);
            } catch (parseError) {
              console.log('🔍 Could not parse response as JSON');
            }
          } catch (textError) {
            console.log('🔍 Could not read response text');
          }
        }
        
        throw response.error;
      }
      
      const { data, error } = response;
      if (error) throw error;

      if (data.success) {
        toast({
          title: "Invitation sent!",
          description: `Invitation sent to ${inviteEmail}`,
        });
        
        // Reset form
        setInviteEmail('');
        setInviteRole('viewer');
        
        // Reload data
        await loadTeamData();
      } else {
        throw new Error(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Try to get more details from the function response
      if (error.context?.res) {
        try {
          const errorText = await error.context.res.text();
          console.error('Function error response:', errorText);
        } catch (e) {
          console.error('Could not read error response');
        }
      }
      
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const baseUrl = window.location.origin;
    const invitationLink = `${baseUrl}/invitation?token=${token}`;
    navigator.clipboard.writeText(invitationLink);
    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard"
    });
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('delete_project_invitation', { invitation_id: invitationId });

      if (error) throw error;
      
      if (!data) {
        throw new Error('Permission denied or invitation not found');
      }

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled"
      });

      await loadTeamData();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Failed to cancel invitation",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string, memberEmail: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: `${memberEmail} has been removed from the project`
      });

      await loadTeamData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Failed to remove member",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'editor':
        return <Edit className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'declined':
        return <X className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <X className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3">Loading team data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Invite someone to collaborate on this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'viewer' | 'editor') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Viewer</div>
                        <div className="text-xs text-muted-foreground">Can view project content</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Editor</div>
                        <div className="text-xs text-muted-foreground">Can edit and collaborate</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={sendInvitation} disabled={sending} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Project Members ({members.length})
          </CardTitle>
          <CardDescription>
            People with access to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getRoleIcon(member.role)}
                    </div>
                    <div>
                      <p className="font-medium">{member.users?.email || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id, member.users?.email || 'user')}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pending Invitations ({invitations.filter(inv => inv.status === 'pending').length})
            </CardTitle>
            <CardDescription>
              Invitations waiting for response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {invitations.map((invitation) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        {getStatusIcon(invitation.status)}
                      </div>
                      <div>
                        <p className="font-medium">{invitation.invited_email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()} • 
                          Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={invitation.status === 'pending' ? 'secondary' : 'outline'}>
                        {invitation.status}
                      </Badge>
                      <Badge className={getRoleBadgeColor(invitation.role)}>
                        {invitation.role}
                      </Badge>
                      {invitation.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyInvitationLink(invitation.invitation_token)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteInvitation(invitation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            What each role can do in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Owner</p>
                <p className="text-sm text-muted-foreground">
                  Full access: manage project settings, invite/remove members, delete project
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Edit className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Editor</p>
                <p className="text-sm text-muted-foreground">
                  Can edit workflows, create prompts, manage knowledge base, and collaborate on content
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium">Viewer</p>
                <p className="text-sm text-muted-foreground">
                  Read-only access: view workflows, browse frameworks, and access documentation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}