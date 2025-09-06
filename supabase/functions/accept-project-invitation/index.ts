import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

interface InvitationAcceptRequest {
  invitationToken: string;
  userEmail?: string; // For validation
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role key for admin operations
    )

    // Parse request body
    const { invitationToken, userEmail }: InvitationAcceptRequest = await req.json()

    if (!invitationToken) {
      return new Response(
        JSON.stringify({ error: 'Missing invitation token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('project_invitations')
      .select(`
        *,
        projects (
          id,
          name,
          user_id
        )
      `)
      .eq('invitation_token', invitationToken)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired invitation token',
          details: invitationError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabaseClient
        .from('project_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return new Response(
        JSON.stringify({ 
          error: 'Invitation has expired',
          expired: true
        }),
        { 
          status: 410, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is registered
    const { data: existingUser, error: userError } = await supabaseClient
      .from('auth.users')
      .select('id, email')
      .eq('email', invitation.invited_email)
      .single()

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error checking user:', userError)
      return new Response(
        JSON.stringify({ error: 'Error checking user registration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let userId = existingUser?.id

    // If user doesn't exist, they need to register first
    if (!existingUser) {
      return new Response(
        JSON.stringify({ 
          requiresRegistration: true,
          invitedEmail: invitation.invited_email,
          projectName: invitation.projects?.name || 'Unknown Project',
          role: invitation.role,
          invitationToken: invitationToken,
          message: 'You need to register an account to accept this invitation'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email matches if provided
    if (userEmail && userEmail !== invitation.invited_email) {
      return new Response(
        JSON.stringify({ 
          error: 'Email mismatch. This invitation was sent to a different email address.',
          invitedEmail: invitation.invited_email
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is already a member of this project
    const { data: existingMember, error: memberError } = await supabaseClient
      .from('project_members')
      .select('*')
      .eq('project_id', invitation.project_id)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      // Mark invitation as accepted anyway
      await supabaseClient
        .from('project_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: userId
        })
        .eq('id', invitation.id)

      return new Response(
        JSON.stringify({
          success: true,
          alreadyMember: true,
          message: 'You are already a member of this project',
          projectId: invitation.project_id,
          role: existingMember.role
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Add user as project member
    const { data: newMember, error: memberInsertError } = await supabaseClient
      .from('project_members')
      .insert({
        project_id: invitation.project_id,
        user_id: userId,
        role: invitation.role,
        added_by: invitation.invited_by
      })
      .select()
      .single()

    if (memberInsertError) {
      console.error('Error adding project member:', memberInsertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to add you to the project',
          details: memberInsertError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabaseClient
      .from('project_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: userId
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      // Don't fail the request, membership was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully joined project',
        projectId: invitation.project_id,
        projectName: invitation.projects?.name || 'Project',
        role: invitation.role,
        member: newMember
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to accept invitation',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})