import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

interface InvitationRequest {
  projectId: string;
  projectName: string;
  invitedEmail: string;
  role: 'viewer' | 'editor';
  inviterName?: string;
  inviterEmail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting invitation process (no email)...');
    
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

    // Create admin client for invitation creation (without RLS)
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Parse request body
    const requestBody = await req.json();
    console.log('📥 Request body received:', requestBody);
    
    const { projectId, projectName, invitedEmail, role }: InvitationRequest = requestBody;

    // Validate required fields
    if (!projectId || !projectName || !invitedEmail || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: projectId, projectName, invitedEmail, role' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the current user (inviter)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create invitation record in database with token
    console.log('💾 Creating invitation record...');
    const { data: invitationData, error: invitationError } = await supabaseAdmin
      .from('project_invitations')
      .insert({
        project_id: projectId,
        invited_email: invitedEmail,
        role: role,
        invited_by: user.id,
        status: 'pending'
      })
      .select('invitation_token')
      .single()

    console.log('📝 Invitation insert result:', { data: invitationData, error: invitationError });

    if (invitationError) {
      console.error('❌ Error creating invitation:', invitationError)
      console.error('❌ Error details:', JSON.stringify(invitationError, null, 2));
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create invitation',
          details: invitationError.message,
          code: invitationError.code,
          hint: invitationError.hint,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the project invitation link with token
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    const invitationToken = invitationData.invitation_token
    const invitationLink = `${baseUrl}/invitation?token=${invitationToken}`

    console.log('✅ Invitation created successfully (email skipped for testing)');
    console.log('🔗 Invitation link:', invitationLink);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation created successfully (email sending skipped for testing)',
        invitationLink: invitationLink,
        invitationToken: invitationToken,
        note: 'Email sending was skipped to test database operations only'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in invitation process:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create invitation',
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