-- Check ALL invitations for royvillasanaurbina@gmail.com to see their status
SELECT
  id,
  invited_email,
  status,
  role,
  created_at,
  projects.name as project_name
FROM project_invitations
LEFT JOIN projects ON project_invitations.project_id = projects.id
WHERE invited_email = 'royvillasanaurbina@gmail.com'
ORDER BY created_at DESC;

-- Count by status
SELECT
  status,
  COUNT(*) as count
FROM project_invitations
WHERE invited_email = 'royvillasanaurbina@gmail.com'
GROUP BY status;
