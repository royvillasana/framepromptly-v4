import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export type ProjectRole = 'owner' | 'editor' | 'viewer';

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
  added_by: string;
}

export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canInvite: boolean;
  canDelete: boolean;
  role?: ProjectRole;
  isLoading: boolean;
  isOwner: boolean;
  isEditor: boolean;
  isViewer: boolean;
}

export function useProjectPermissions(projectId?: string): ProjectPermissions {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<ProjectPermissions>({
    canView: false,
    canEdit: false,
    canManage: false,
    canInvite: false,
    canDelete: false,
    isLoading: true,
    isOwner: false,
    isEditor: false,
    isViewer: false,
  });

  useEffect(() => {
    if (!user || !projectId) {
      setPermissions({
        canView: false,
        canEdit: false,
        canManage: false,
        canInvite: false,
        canDelete: false,
        isLoading: false,
        isOwner: false,
        isEditor: false,
        isViewer: false,
      });
      return;
    }

    loadPermissions();
  }, [user, projectId]);

  const loadPermissions = async () => {
    if (!user || !projectId) return;

    try {
      setPermissions(prev => ({ ...prev, isLoading: true }));

      // Check if user is a member of the project using RPC function
      const { data: members, error } = await supabase
        .rpc('get_project_members_with_users', { project_uuid: projectId });

      // Find the current user in the members list
      const member = members?.find((m: any) => m.user_id === user.id);

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        throw error;
      }

      const role: ProjectRole = member?.role || 'viewer';
      const hasAccess = !!member;

      // Define permissions based on role
      const newPermissions: ProjectPermissions = {
        role: hasAccess ? role : undefined,
        canView: hasAccess,
        canEdit: hasAccess && (role === 'owner' || role === 'editor'),
        canManage: hasAccess && role === 'owner',
        canInvite: hasAccess && role === 'owner',
        canDelete: hasAccess && role === 'owner',
        isLoading: false,
        isOwner: hasAccess && role === 'owner',
        isEditor: hasAccess && (role === 'owner' || role === 'editor'),
        isViewer: hasAccess && role === 'viewer',
      };

      setPermissions(newPermissions);
    } catch (error) {
      console.error('Error loading project permissions:', error);
      setPermissions({
        canView: false,
        canEdit: false,
        canManage: false,
        canInvite: false,
        canDelete: false,
        isLoading: false,
        isOwner: false,
        isEditor: false,
        isViewer: false,
      });
    }
  };

  return permissions;
}

// Higher-order component for permission-based rendering
export function withProjectPermissions<T extends { projectId?: string }>(
  Component: React.ComponentType<T>,
  requiredPermission: keyof Omit<ProjectPermissions, 'isLoading' | 'role'>
) {
  return function PermissionWrapper(props: T) {
    const permissions = useProjectPermissions(props.projectId);

    if (permissions.isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Checking permissions...</span>
        </div>
      );
    }

    if (!permissions[requiredPermission]) {
      return (
        <div className="text-center p-6 text-muted-foreground">
          <p>You don't have permission to access this feature.</p>
          <p className="text-sm mt-2">
            Required: {requiredPermission} • Your role: {permissions.role || 'No access'}
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Utility functions
export const getPermissionLabel = (role: ProjectRole): string => {
  switch (role) {
    case 'owner':
      return 'Project Owner';
    case 'editor':
      return 'Editor';
    case 'viewer':
      return 'Viewer';
    default:
      return 'Unknown';
  }
};

export const getPermissionDescription = (role: ProjectRole): string => {
  switch (role) {
    case 'owner':
      return 'Full access to all project features including management and deletion';
    case 'editor':
      return 'Can view and edit project content, workflows, and documentation';
    case 'viewer':
      return 'Read-only access to project content and documentation';
    default:
      return 'No access';
  }
};