import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Mail, Users, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSharingStore } from '@/stores/sharing-store';

interface ProjectShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  isOwner?: boolean;
}

export function ProjectShareModal({ isOpen, onClose, projectId, projectName, isOwner = true }: ProjectShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  
  const { 
    shares, 
    members,
    isLoading, 
    shareProject, 
    updateShareRole, 
    removeShare, 
    fetchProjectShares,
    fetchProjectMembers 
  } = useSharingStore();

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectShares(projectId);
      fetchProjectMembers(projectId);
    }
  }, [isOpen, projectId, fetchProjectShares, fetchProjectMembers]);

  const handleShareProject = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if already shared
    if (shares.some(share => share.shared_with_email.toLowerCase() === email.toLowerCase())) {
      toast.error('Project is already shared with this email');
      return;
    }
    
    try {
      await shareProject(projectId, email.trim(), role, projectName);
      setEmail('');
      setRole('viewer');
      
      toast.success(`Project shared with ${email} as ${role}. Invitation email sent!`);
    } catch (error) {
      toast.error('Failed to share project');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeShare(shareId);
      toast.success('Access removed successfully');
    } catch (error) {
      toast.error('Failed to remove access');
    }
  };

  const handleUpdateRole = async (shareId: string, newRole: 'viewer' | 'editor') => {
    try {
      await updateShareRole(shareId, newRole);
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Share Project
          </DialogTitle>
          <DialogDescription>
            Share "{projectName}" with others to collaborate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Form */}
          {isOwner && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Share with someone</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Access level</Label>
                    <Select value={role} onValueChange={(value: 'viewer' | 'editor') => setRole(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <Edit className="w-3 h-3" />
                            Editor
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleShareProject} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sharing...' : 'Share Project'}
                </Button>
              </div>
            </Card>
          )}

          {/* Current Shares */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">People with access</h3>
              <Badge variant="secondary">{members.length + shares.length} total</Badge>
            </div>
            
            <div className="space-y-2">
              {/* Owner */}
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">You (Owner)</p>
                      <p className="text-xs text-muted-foreground">Full access to project</p>
                    </div>
                  </div>
                  <Badge variant="default">Admin</Badge>
                </div>
              </Card>

              {/* Project Members (Accepted) */}
              {members.filter(member => member.role !== 'owner').map((member) => (
                <Card key={`member-${member.id}`} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        {member.role === 'editor' ? (
                          <Edit className="w-4 h-4 text-green-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {member.user?.full_name || member.user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()} • Active
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'editor' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pending Invitations */}
              {shares.map((share) => (
                <Card key={`invitation-${share.id}`} className="p-3 border-dashed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        {share.role === 'editor' ? (
                          <Edit className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{share.shared_with_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited {new Date(share.shared_at).toLocaleDateString()} • {share.status}
                          {share.expires_at && (
                            <> • Expires {new Date(share.expires_at).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isOwner && share.status === 'pending' && (
                        <Select
                          value={share.role}
                          onValueChange={(newRole: 'viewer' | 'editor') => handleUpdateRole(share.id, newRole)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      {(!isOwner || share.status !== 'pending') && (
                        <Badge variant={share.role === 'editor' ? 'default' : 'secondary'}>
                          {share.role}
                        </Badge>
                      )}
                      
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveShare(share.id)}
                          className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Access Level Info */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Access Levels</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3" />
                <span><strong>Viewer:</strong> Can view project content, workflows, and prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit className="w-3 h-3" />
                <span><strong>Editor:</strong> Can edit workflows, create prompts, and modify project content</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span><strong>Admin:</strong> Full access including sharing, deleting, and managing members</span>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}