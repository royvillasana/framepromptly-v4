-- Test if invitation tables exist
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'project_invitations'
);

SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'project_members'
);

-- If they exist, check if they have data
SELECT COUNT(*) as invitation_count FROM project_invitations;
SELECT COUNT(*) as member_count FROM project_members;