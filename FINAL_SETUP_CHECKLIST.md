# Final Setup Checklist for Project Sharing

## ✅ Completed
1. Fixed `accept-project-invitation` Edge Function (changed from `auth.users` query to `auth.admin.listUsers()`)
2. Updated `project-store.ts` to fetch both owned and shared projects
3. Created SQL migration for RLS policies (`APPLY_MANUALLY.sql`)
4. Fixed test invitation file to use real project UUIDs
5. Renamed duplicate migration timestamp

## 🔧 TODO - Complete These Steps

### Step 1: Apply SQL Policies in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/drfaomantrtmtydbelxe/sql/new
2. Copy entire contents of `APPLY_MANUALLY.sql`
3. Paste and click "Run"

**What this does:** Updates RLS policies so users can see projects they're members of

### Step 2: Set Environment Variables in Supabase
Go to: https://supabase.com/dashboard/project/drfaomantrtmtydbelxe/settings/functions

Add these secrets:
- **INVITATION_SITE_URL**: `https://royvillasana.github.io/framepromptly-v4`
- **VERIFIED_EMAIL_DOMAIN**: your verified domain (e.g., `mail.yourdomain.com`)
- **RESEND_API_KEY**: your Resend API key (should already be set)

**What this does:** Generates correct invitation links with the GitHub Pages path

**Note:** The function will fallback to `SITE_URL` if `INVITATION_SITE_URL` is not set.

### Step 3: Deploy the Edge Function
```bash
cd /Users/royvillasana/Desktop/Roy\ Villasana/FramePromptly/4.0/framepromptly-v4
supabase functions deploy accept-project-invitation
```

**What this does:** Fixes the 404 error when users click invitation links

### Step 4: Rebuild and Deploy Frontend
```bash
npm run build
npx gh-pages -d dist
```

**What this does:** Deploys the updated code that fetches shared projects

## 🎯 Expected Result

After completing all steps:

1. ✅ **Send Invitation**
   - User shares a project from the UI
   - Invitation email sent with correct link: `https://royvillasana.github.io/framepromptly-v4/invitation?token=...`

2. ✅ **Accept Invitation**
   - Invited user clicks link from email
   - If not signed in → Shows invitation preview with "Sign In" or "Create Account" buttons
   - After clicking Sign In/Create Account → Redirected to auth page
   - After authentication → Automatically redirected to Projects page
   - On Projects page → Pending invitations appear at the top with Accept/Decline buttons
   - User clicks "Accept" → Added to `project_members` table with correct role
   - Shared project now appears in their project list

3. ✅ **View Shared Project**
   - Shared projects appear in user's project list (mixed with owned projects)
   - User can open shared project
   - Permissions enforced based on role:
     - **Viewer**: Can read projects, prompts, knowledge base
     - **Editor**: Can create/edit/delete in projects, prompts, knowledge base
     - **Owner**: Full control including sharing and deletion

## 🐛 Current Issues

1. **Invitation link returns 404**
   - **Cause**: `INVITATION_SITE_URL` environment variable not set in Supabase
   - **Fix**: Set `INVITATION_SITE_URL=https://royvillasana.github.io/framepromptly-v4` in Edge Function secrets

2. **"User not authenticated" error**
   - **Cause**: `fetchProjects` being called before user is authenticated
   - **Status**: This will be fixed once invitation flow is working properly

3. **"Could not find the project" error**
   - **Cause**: Frontend not rebuilt with updated `fetchProjects()` code
   - **Fix**: Run `npm run build && npx gh-pages -d dist`

## 📋 Quick Test After Setup

1. Sign in as the project owner
2. Share a project with another email (use viewer or editor role)
3. Check the email for invitation link
4. Open invitation link in incognito/different browser
5. Sign in with invited email
6. Verify:
   - Invitation accepted successfully
   - Shared project appears in project list
   - Can open project based on role permissions

## 🆘 If Something Goes Wrong

### Check Supabase Logs
```bash
supabase functions logs accept-project-invitation --tail
```

### Check Browser Console
- Look for network errors (404, 500, etc.)
- Check error messages in console

### Verify RLS Policies
Run this in Supabase SQL Editor to check policies:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('projects', 'project_members', 'project_invitations');
```

### Verify Environment Variables
Go to: https://supabase.com/dashboard/project/drfaomantrtmtydbelxe/settings/functions
Check that INVITATION_SITE_URL, VERIFIED_EMAIL_DOMAIN, and RESEND_API_KEY are set
