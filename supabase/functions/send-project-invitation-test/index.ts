import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🟢 Step 1: Function started (TEST MODE - NO AUTH)');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    console.log('🟢 Step 2: Environment check', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey,
      resendKeyLength: resendApiKey?.length || 0
    });
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    console.log('🟢 Step 3: Creating Supabase admin client (bypassing user auth for testing)');
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    console.log('🟢 Step 4: Parsing request body');
    const requestBody = await req.json();
    const { projectId, projectName, invitedEmail, role } = requestBody;
    
    console.log('🟢 Step 5: Request data', { projectId, projectName, invitedEmail, role });

    if (!projectId || !projectName || !invitedEmail || !role) {
      throw new Error('Missing required fields');
    }

    console.log('🟢 Step 6: Using mock user ID for testing (bypassing auth)');
    // Use a mock user ID for testing - in production this would come from auth
    const mockUserId = '8caf5c00-55bd-4cb3-9c43-329a13c16919'; // Test user ID
    console.log('🟢 Step 7: Mock user authenticated', { userId: mockUserId });

    console.log('🟢 Step 8: Creating invitation record');
    const { data: invitationData, error: invitationError } = await supabaseAdmin
      .from('project_invitations')
      .insert({
        project_id: projectId,
        invited_email: invitedEmail,
        role: role,
        invited_by: mockUserId,
        status: 'pending'
      })
      .select('invitation_token')
      .single()

    if (invitationError) {
      console.error('❌ Step 8 FAILED:', invitationError);
      throw new Error('Database error: ' + invitationError.message);
    }
    console.log('🟢 Step 9: Invitation record created', { token: invitationData.invitation_token });

    console.log('🟢 Step 10: Preparing email');
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    const invitationLink = `${baseUrl}/invitation?token=${invitationData.invitation_token}`
    const subject = `You've been invited to collaborate on "${projectName}" - FramePromptly`
    const text = `Hi! You've been invited to ${role === 'editor' ? 'edit and collaborate on' : 'view'} the project "${projectName}" on FramePromptly. Visit: ${invitationLink}`

    console.log('🟢 Step 11: Sending email via Resend');
    if (resendApiKey) {
      const emailPayload = {
        from: 'FramePromptly <onboarding@resend.dev>',
        to: [invitedEmail],
        subject: subject,
        text: text
      };

      console.log('🟢 Step 12: Making Resend API call');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      console.log('🟢 Step 13: Resend response', { 
        status: response.status, 
        ok: response.ok 
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Step 13 FAILED:', errorText);
        throw new Error(`Email sending failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🟢 Step 14: Email sent successfully', { id: result.id });
    } else {
      console.log('🟡 Step 12: No Resend key, skipping email');
    }

    console.log('🟢 Step 15: Success!');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully (TEST MODE)',
        invitationLink: invitationLink,
        testMode: true,
        mockUserId: mockUserId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Function failed at some step:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        name: error.name,
        timestamp: new Date().toISOString(),
        testMode: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})