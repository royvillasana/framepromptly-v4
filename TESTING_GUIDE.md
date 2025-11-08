# Invitation System Testing Guide

## Prerequisites

Before testing, make sure you've completed these setup steps:

1. ✅ **Apply RLS Policies** - Run `FIX_RECURSION.sql` in Supabase SQL Editor
2. ✅ **Set Environment Variables** in Supabase:
   - `INVITATION_SITE_URL=https://royvillasana.github.io/framepromptly-v4`
   - `VERIFIED_EMAIL_DOMAIN=your-verified-domain.com`
   - `RESEND_API_KEY=your-resend-api-key`
3. ✅ **Deploy Edge Functions**:
   - `supabase functions deploy accept-project-invitation`
   - `supabase functions deploy send-project-invitation-simple`
4. ✅ **Build and Deploy Frontend**:
   - `npm run build`
   - `npx gh-pages -d dist`

## Testing Methods

### Method 1: Using the Test HTML File (Recommended for API Testing)

1. **Open the test file** in your browser:
   ```
   file:///Users/royvillasana/Desktop/Roy%20Villasana/FramePromptly/4.0/framepromptly-v4/test-invitation-with-auth.html
   ```

2. **Step 1: Sign In as Project Owner**
   - Enter owner email and password
   - Click "Sign In"
   - Click "Refresh Projects" to load your projects

3. **Step 2: Send Invitation**
   - Select a project from dropdown
   - Enter invited user's email
   - Select role (Viewer or Editor)
   - Click "Send Invitation"
   - Copy the invitation link from the response

4. **Step 3: Test as Invited User**
   - Option A: Click "Sign Out" then sign in with invited user's email
   - Option B: Open invitation link in incognito window
   - Click "Check Pending Invitations" to see the invitation
   - Copy the invitation token
   - Paste in "Invitation Token" field
   - Click "Test Accept Invitation"

5. **Step 4: Verify**
   - Click "Refresh Projects"
   - Verify the shared project appears in the list

### Method 2: Full End-to-End Flow (Production-like)

#### As Project Owner:

1. **Sign In** to the app at `https://royvillasana.github.io/framepromptly-v4`

2. **Go to Projects page**

3. **Share a project:**
   - Click the menu (⋮) on a project
   - Click "Share"
   - Enter invited user's email
   - Select role
   - Click "Send Invitation"

4. **Check your email service** (Resend dashboard) to verify email was sent

#### As Invited User:

1. **Check email** for invitation

2. **Click invitation link** from email

3. **If not signed in:**
   - See invitation preview page
   - See project name, role, and who invited you
   - Click "Create Account" or "Sign In"
   - Complete authentication
   - Automatically redirected to Projects page

4. **On Projects page:**
   - See "Pending Invitations" section at the top
   - See the project invitation with details
   - Click "Accept" to accept the invitation
   - OR Click "Decline" to decline

5. **After accepting:**
   - Toast notification confirms acceptance
   - Project appears in your projects list
   - Can now open and work on the project

### Method 3: Direct Database Testing

Use Supabase SQL Editor to verify data:

```sql
-- Check pending invitations
SELECT
    pi.id,
    pi.invited_email,
    pi.role,
    pi.status,
    pi.invitation_token,
    p.name as project_name,
    u.email as invited_by_email
FROM project_invitations pi
JOIN projects p ON pi.project_id = p.id
JOIN auth.users u ON pi.invited_by = u.id
WHERE pi.status = 'pending'
ORDER BY pi.created_at DESC;

-- Check project members after acceptance
SELECT
    pm.id,
    pm.role,
    u.email as member_email,
    p.name as project_name
FROM project_members pm
JOIN auth.users u ON pm.user_id = u.id
JOIN projects p ON pm.project_id = p.id
ORDER BY pm.created_at DESC;

-- Verify RLS policies are working
SELECT
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'project_members', 'project_invitations')
ORDER BY tablename, policyname;
```

## Expected Results

### ✅ Successful Invitation Send
- Email sent via Resend
- Invitation record created in `project_invitations` table
- Invitation link format: `https://royvillasana.github.io/framepromptly-v4/invitation?token=<UUID>`

### ✅ Successful Invitation Acceptance
- User added to `project_members` table with correct role
- Invitation status updated to 'accepted'
- Project appears in invited user's projects list
- User can open and interact with project based on their role

### ✅ Role Permissions

**Viewer:**
- Can read projects, prompts, knowledge base
- Cannot create, edit, or delete content
- Cannot share the project

**Editor:**
- Can read projects, prompts, knowledge base
- Can create, edit, delete prompts and knowledge base items
- Cannot delete the project
- Cannot change project settings
- Cannot share the project

**Owner:**
- Full control over the project
- Can share, delete, and modify all settings

## Common Issues & Solutions

### Issue: 500 Error when fetching projects
**Cause:** RLS policies not applied or circular dependency
**Solution:** Run `FIX_RECURSION.sql` in Supabase SQL Editor

### Issue: 404 Error on invitation link
**Cause:** Edge Function not deployed or `INVITATION_SITE_URL` not set
**Solution:**
- Deploy function: `supabase functions deploy accept-project-invitation`
- Set env var in Supabase dashboard

### Issue: Invitation email not sent
**Cause:** Missing or invalid `RESEND_API_KEY` or `VERIFIED_EMAIL_DOMAIN`
**Solution:** Verify environment variables in Supabase Functions settings

### Issue: "User not authenticated" error
**Cause:** User not signed in or session expired
**Solution:** Sign out and sign in again

### Issue: Shared project not appearing in list
**Cause:** Frontend not rebuilt with updated code
**Solution:** Run `npm run build && npx gh-pages -d dist`

### Issue: "Infinite recursion detected" error
**Cause:** Circular dependency in RLS policies
**Solution:** Use `SECURITY DEFINER` function in RLS policy (already in `FIX_RECURSION.sql`)

## Testing Checklist

- [ ] RLS policies applied
- [ ] Environment variables set
- [ ] Edge functions deployed
- [ ] Frontend built and deployed
- [ ] Can send invitation as project owner
- [ ] Invitation email received
- [ ] Invitation link works
- [ ] Non-logged-in user sees preview page
- [ ] Auth buttons redirect correctly
- [ ] After login, user sees Projects page
- [ ] Pending invitations appear at top of Projects page
- [ ] Can accept invitation
- [ ] Shared project appears in projects list
- [ ] Can decline invitation
- [ ] Declined invitation disappears from list
- [ ] Role permissions work correctly
- [ ] Multiple invitations display correctly
- [ ] Expired invitations show error message
- [ ] Already-accepted invitations show error message

## Debug Tools

### Check Supabase Logs
```bash
supabase functions logs accept-project-invitation --tail
```

### Check Browser Console
Look for:
- Network errors (404, 500, etc.)
- JavaScript errors
- Supabase client errors
- Authentication status

### Check Database State
Use the SQL queries in "Method 3" above to verify:
- Invitations are created
- Members are added after acceptance
- Policies are correctly configured
