-- Force PostgREST to refresh its schema cache by making a trivial change

-- Add a comment to each table (triggers schema reload in PostgREST)
COMMENT ON TABLE public.projects IS 'User projects - RLS disabled 2025-01-15';
COMMENT ON TABLE public.project_members IS 'Project membership - RLS disabled 2025-01-15';
COMMENT ON TABLE public.prompts IS 'AI prompts - RLS disabled 2025-01-15';
COMMENT ON TABLE public.project_invitations IS 'Project invitations - RLS disabled 2025-01-15';

-- Also notify that schema changed
NOTIFY pgrst, 'reload schema';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE 'Schema cache refresh triggered. PostgREST should reload within 10 seconds.';
    RAISE NOTICE 'If errors persist, wait 1-2 minutes for the cache to fully clear.';
END $$;
