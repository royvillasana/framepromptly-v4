import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting invitation acceptance process...');

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Create client for user operations (with auth)
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Create admin client for database operations (without RLS)
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Parse request body
    const { token } = await req.json();
    console.log('📥 Received token:', token ? '✓' : '✗');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing invitation token' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('❌ User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('👤 User authenticated:', user.email);

    // Fetch the invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('project_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (inviteError || !invitation) {
      console.error('❌ Invitation not found:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Invalid invitation token' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📧 Invitation found:', {
      id: invitation.id,
      email: invitation.invited_email,
      status: invitation.status,
      role: invitation.role
    });

    // Validate invitation
    if (invitation.status !== 'pending') {
      return new Response(
        JSON.stringify({
          error: `Invitation already ${invitation.status}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invitation has expired' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify email matches (case-insensitive)
    if (invitation.invited_email.toLowerCase() !== user.email?.toLowerCase()) {
      console.error('❌ Email mismatch:', {
        invited: invitation.invited_email,
        user: user.email
      });
      return new Response(
        JSON.stringify({
          error: 'This invitation was sent to a different email address'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('project_members')
      .select('id, role')
      .eq('project_id', invitation.project_id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      console.log('⚠️ User is already a member with role:', existingMember.role);

      // Update invitation status to accepted anyway
      await supabaseAdmin
        .from('project_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
        .eq('id', invitation.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'You are already a member of this project',
          projectId: invitation.project_id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('➕ Adding user to project_members...');

    // Add user to project_members
    const { data: newMember, error: memberError } = await supabaseAdmin
      .from('project_members')
      .insert({
        project_id: invitation.project_id,
        user_id: user.id,
        role: invitation.role,
        added_by: invitation.invited_by,
      })
      .select()
      .single();

    if (memberError) {
      console.error('❌ Error adding member:', memberError);
      throw new Error(`Failed to add member: ${memberError.message}`);
    }

    console.log('✅ Member added:', newMember);

    // Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from('project_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: user.id
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('❌ Error updating invitation:', updateError);
      // Don't throw - member was added successfully
    }

    console.log('✅ Invitation accepted successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation accepted successfully',
        projectId: invitation.project_id,
        role: invitation.role
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error accepting invitation:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to accept invitation',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
