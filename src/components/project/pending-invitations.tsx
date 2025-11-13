import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, UserPlus, Check, X, Loader2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Invitation {
  id: string;
  project_id: string;
  invited_email: string;
  invited_by: string;
  role: 'viewer' | 'editor';
  invitation_token: string;
  created_at: string;
  expires_at: string;
  projects: {
    name: string;
  } | null;
}

export function PendingInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      console.log('📧 Fetching invitations for user:', user?.email);

      if (!user?.email) {
        console.log('❌ No user email found');
        setInvitations([]);
        return;
      }

      // Fetch pending invitations for the current user's email
      const { data, error } = await supabase
        .from('project_invitations')
        .select(`
          id,
          project_id,
          invited_email,
          invited_by,
          role,
          invitation_token,
          created_at,
          expires_at,
          projects:project_id (
            name
          )
        `)
        .eq('invited_email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching invitations:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Fetched invitations:', data);
      console.log('Number of invitations:', data?.length || 0);

      // Debug: Log the first invitation to see its structure
      if (data && data.length > 0) {
        console.log('📋 First invitation structure:', JSON.stringify(data[0], null, 2));
      }

      setInvitations(data || []);
    } catch (error) {
      console.error('❌ Error fetching pending invitations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending invitations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    setProcessingIds(prev => new Set([...prev, invitation.id]));

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the Edge Function to accept the invitation
      const { data, error } = await supabase.functions.invoke('accept-project-invitation', {
        body: { token: invitation.invitation_token }
      });

      if (error) throw error;

      toast({
        title: "Invitation Accepted",
        description: `You now have access to "${invitation.projects?.name || 'the project'}"`,
      });

      // Refresh invitations list
      await fetchInvitations();

      // Trigger a refresh of the projects list by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept invitation",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    console.log('🚫 Declining invitation:', invitation.id);
    setProcessingIds(prev => new Set([...prev, invitation.id]));

    try {
      console.log('📝 Updating invitation status to declined...');
      const { data, error } = await supabase
        .from('project_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id)
        .select();

      if (error) {
        console.error('❌ Error updating invitation:', error);
        throw error;
      }

      console.log('✅ Invitation updated:', data);

      toast({
        title: "Invitation Declined",
        description: `You declined the invitation to "${invitation.projects?.name || 'the project'}"`,
      });

      // Refresh invitations list
      console.log('🔄 Refreshing invitations list...');
      await fetchInvitations();
      console.log('✅ Invitations refreshed');
    } catch (error) {
      console.error('❌ Error declining invitation:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  const handleDismissInvitation = async (invitation: Invitation) => {
    console.log('🗑️ Dismissing expired invitation:', invitation.id);
    setProcessingIds(prev => new Set([...prev, invitation.id]));

    try {
      console.log('📝 Updating invitation status to declined (dismissed)...');
      const { data, error } = await supabase
        .from('project_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id)
        .select();

      if (error) {
        console.error('❌ Error dismissing invitation:', error);
        throw error;
      }

      console.log('✅ Invitation dismissed:', data);

      toast({
        title: "Invitation Dismissed",
        description: `Removed expired invitation from "${invitation.projects?.name || 'the project'}"`,
      });

      // Refresh invitations list
      console.log('🔄 Refreshing invitations list...');
      await fetchInvitations();
      console.log('✅ Invitations refreshed');
    } catch (error) {
      console.error('❌ Error dismissing invitation:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss invitation",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show section if no invitations
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Pending Invitations</h3>
        <Badge variant="secondary">{invitations.length}</Badge>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation, index) => {
          const isProcessing = processingIds.has(invitation.id);
          const isExpired = new Date(invitation.expires_at) < new Date();

          return (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-4 ${isExpired ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between gap-4">
                  {/* Left side - Invitation info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {invitation.projects?.name || 'Unknown Project'}
                        </h4>
                        <Badge variant={invitation.role === 'editor' ? 'default' : 'secondary'}>
                          {invitation.role}
                        </Badge>
                        {isExpired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </div>
                        {!isExpired && (
                          <span className="text-xs">
                            Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex items-center gap-2">
                    {!isExpired ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvitation(invitation)}
                          disabled={isProcessing}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismissInvitation(invitation)}
                        disabled={isProcessing}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Dismiss
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
