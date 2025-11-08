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
    console.log('🟢 Step 1: Function started');
    
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

    console.log('🟢 Step 3: Creating Supabase clients');
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

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

    console.log('🟢 Step 6: Getting current user');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication failed: ' + (userError?.message || 'No user'));
    }
    console.log('🟢 Step 7: User authenticated', { userId: user.id });

    console.log('🟢 Step 8: Creating invitation record');
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

    if (invitationError) {
      console.error('❌ Step 8 FAILED:', invitationError);
      throw new Error('Database error: ' + invitationError.message);
    }
    console.log('🟢 Step 9: Invitation record created', { token: invitationData.invitation_token });

    console.log('🟢 Step 10: Preparing email');
    const baseUrl = Deno.env.get('INVITATION_SITE_URL') || Deno.env.get('SITE_URL') || 'http://localhost:8080'
    const invitationLink = `${baseUrl}/invitation?token=${invitationData.invitation_token}`
    const subject = `You've been invited to collaborate on "${projectName}" - FramePromptly`
    const text = `Hi! You've been invited to ${role === 'editor' ? 'edit and collaborate on' : 'view'} the project "${projectName}" on FramePromptly. Visit: ${invitationLink}`

    console.log('🟢 Step 11: Sending email via Resend');
    if (resendApiKey) {
      // Check if we have a verified domain configured
      const verifiedDomain = Deno.env.get('VERIFIED_EMAIL_DOMAIN'); // e.g., "mail.yourdomain.com"
      
      let fromAddress = 'FramePromptly <onboarding@resend.dev>'; // Default (only works for testing)
      let actualRecipient = invitedEmail;
      
      if (verifiedDomain) {
        // Use verified domain for production
        fromAddress = `FramePromptly <noreply@${verifiedDomain}>`;
      } else {
        // For testing: send to verified email but show real intent
        console.log('🟡 WARNING: No verified domain configured. Sending to verified email for testing.');
        actualRecipient = 'royvillasana@gmail.com'; // Must use verified email
      }
      
      const emailPayload = {
        from: fromAddress,
        to: [actualRecipient],
        subject: verifiedDomain ? subject : `[TEST] ${subject}`,
        text: verifiedDomain ? text : `[TEST MODE] ${text}\n\n⚠️  IMPORTANT: This email should have been sent to: ${invitedEmail}\n\nTo enable sending to any email address:\n1. Go to resend.com/domains\n2. Verify a custom domain\n3. Set VERIFIED_EMAIL_DOMAIN environment variable\n4. Update from address to use your domain`
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
        message: 'Invitation sent successfully',
        invitationLink: invitationLink
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
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})