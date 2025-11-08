# Project Invitation Flow

## Complete User Journey

### For Project Owners (Sending Invitations)

1. Navigate to Projects page
2. Click on project's menu → "Share"
3. Enter invited user's email and select role (Viewer or Editor)
4. Click "Send Invitation"
5. System sends email with invitation link

### For Invited Users (Receiving Invitations)

#### Scenario 1: User Not Logged In

1. **Receive email** with invitation link: `https://royvillasana.github.io/framepromptly-v4/invitation?token=...`
2. **Click link** → Taken to Invitation page
3. **See invitation preview** showing:
   - Project name
   - Role being offered
   - Who sent the invitation
   - Message: "To view and accept this invitation, you need to sign in or create an account..."
4. **Click "Create Account" or "Sign In"** → Redirected to Auth page
5. **Complete authentication** → Automatically redirected to Projects page
6. **See pending invitation** at top of Projects page with:
   - Project details
   - Who invited them
   - Accept/Decline buttons
7. **Click "Accept"** → Invitation accepted, project appears in their list
8. **OR Click "Decline"** → Invitation declined

#### Scenario 2: User Already Logged In

1. **Receive email** with invitation link
2. **Click link** → Automatically redirected to Projects page
3. **Toast notification** appears: "Check your invitations - View your pending project invitation in the Projects page"
4. **See pending invitation** at top of Projects page
5. **Click "Accept" or "Decline"**

## Technical Flow

### Invitation Link Processing

```
User clicks invitation link
    ↓
/invitation?token=xxx page loads
    ↓
Check if user is authenticated
    ↓
┌─────────────────┴─────────────────┐
│                                   │
NOT LOGGED IN                  LOGGED IN
    ↓                               ↓
Fetch invitation details      Navigate to /projects
Show preview with             Show toast notification
Sign In/Create Account        Display pending invitations
buttons                       component
    ↓
User clicks button
    ↓
Navigate to /auth?invitation=xxx&email=yyy
    ↓
User completes auth
    ↓
Redirect to /projects
    ↓
See pending invitations
```

### Projects Page - Pending Invitations Component

The `PendingInvitations` component:
1. Fetches invitations where `invited_email = user.email` AND `status = 'pending'`
2. Displays each invitation with project details
3. Provides Accept/Decline buttons
4. On Accept:
   - Calls `accept-project-invitation` Edge Function
   - Function adds user to `project_members` table
   - Updates invitation status to 'accepted'
   - Refreshes projects list
5. On Decline:
   - Updates invitation status to 'declined'
   - Removes from pending invitations list

## Database Tables

### project_invitations
- Stores pending invitations
- Fields: `invitation_token`, `invited_email`, `role`, `status`, `project_id`, `invited_by`
- Status can be: 'pending', 'accepted', 'declined', 'expired'

### project_members
- Stores actual project memberships
- Fields: `project_id`, `user_id`, `role`
- Created when invitation is accepted
- Used by RLS policies to determine project access

## RLS Policies

### Projects Table
Users can view projects where:
- They are the owner (`user_id = auth.uid()`)
- OR they are a member (exists in `project_members` with their `user_id`)

### Project Members Table
Users can view memberships where:
- They are the member (`user_id = auth.uid()`)

### Project Invitations Table
Users can view invitations where:
- They sent the invitation (`invited_by = auth.uid()`)
- OR the invitation is for their email (`invited_email = auth.email()`)
- OR they own the project

## Key Features

✅ Clean separation between invitation preview and acceptance
✅ Forces authentication before showing full invitation details
✅ Single location (Projects page) for managing all invitations
✅ Clear visual indication of pending invitations
✅ Toast notifications for better UX
✅ Handles both new users and existing users
✅ Proper role-based access control
✅ Invitation expiration handling
