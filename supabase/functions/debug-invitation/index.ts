import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting invitation debug...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabaseClient = createClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const supabaseAdmin = createClient(
      supabaseUrl!,
      supabaseServiceKey!
    )

    // Parse request body
    const { projectId } = await req.json();

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    console.log('🔍 User check:', { user: user?.id, error: userError?.message });

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User authentication failed', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if project exists
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, user_id')
      .eq('id', projectId)
      .single();

    console.log('📊 Project check:', { 
      project: project ? { id: project.id, name: project.name, owner: project.user_id } : null, 
      error: projectError?.message,
      currentUser: user.id,
      isOwner: project?.user_id === user.id
    });

    // Check if invitation tables exist
    const { data: invitationsTest, error: invitationsError } = await supabaseAdmin
      .from('project_invitations')
      .select('count')
      .limit(1);

    console.log('📋 Invitations table check:', { 
      error: invitationsError ? invitationsError.message : 'OK' 
    });

    // Try to create a test invitation
    const { data: testInvitation, error: invitationInsertError } = await supabaseAdmin
      .from('project_invitations')
      .insert({
        project_id: projectId,
        invited_email: 'test@example.com',
        role: 'viewer',
        invited_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    console.log('✉️ Test invitation creation:', { 
      success: !!testInvitation,
      error: invitationInsertError ? {
        message: invitationInsertError.message,
        code: invitationInsertError.code,
        details: invitationInsertError.details
      } : null
    });

    // If successful, clean up the test invitation
    if (testInvitation) {
      await supabaseAdmin
        .from('project_invitations')
        .delete()
        .eq('id', testInvitation.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        debug: {
          user: { id: user.id, email: user.email },
          project: project ? { 
            id: project.id, 
            name: project.name, 
            owner: project.user_id,
            currentUserIsOwner: project.user_id === user.id 
          } : null,
          projectError: projectError?.message,
          invitationsTableOk: !invitationsError,
          testInvitationResult: {
            success: !!testInvitation,
            error: invitationInsertError?.message
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Debug error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})