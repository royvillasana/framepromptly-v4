import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('🟢 Step 1: Function started (NO AUTH TEST)');
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    console.log('🟢 Step 2: Environment check', {
      hasResendKey: !!resendApiKey,
      resendKeyLength: resendApiKey?.length || 0
    });
    
    console.log('🟢 Step 3: Parsing request body');
    const requestBody = await req.json();
    const { projectId, projectName, invitedEmail, role } = requestBody;
    
    console.log('🟢 Step 4: Request data', { projectId, projectName, invitedEmail, role });

    if (!projectId || !projectName || !invitedEmail || !role) {
      throw new Error('Missing required fields');
    }

    console.log('🟢 Step 5: Skipping database operations for auth test');
    const mockInvitationToken = 'mock-token-12345';
    console.log('🟢 Step 6: Mock invitation token created', { token: mockInvitationToken });

    console.log('🟢 Step 7: Preparing email');
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    const invitationLink = `${baseUrl}/invitation?token=${mockInvitationToken}`
    const subject = `You've been invited to collaborate on "${projectName}" - FramePromptly`
    const text = `Hi! You've been invited to ${role === 'editor' ? 'edit and collaborate on' : 'view'} the project "${projectName}" on FramePromptly. Visit: ${invitationLink}`

    console.log('🟢 Step 8: Testing email sending with Resend');
    if (resendApiKey) {
      const emailPayload = {
        from: 'FramePromptly <onboarding@resend.dev>',
        to: [invitedEmail],
        subject: subject,
        text: text
      };

      console.log('🟢 Step 9: Making Resend API call');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      console.log('🟢 Step 10: Resend response', { 
        status: response.status, 
        ok: response.ok 
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Step 10 FAILED:', errorText);
        throw new Error(`Email sending failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🟢 Step 11: Email sent successfully', { id: result.id });
    } else {
      console.log('🟡 Step 9: No Resend key, skipping email');
    }

    console.log('🟢 Step 12: Success!');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email test completed successfully (NO DATABASE)',
        invitationLink: invitationLink,
        testMode: true,
        authBypass: true,
        databaseSkipped: true
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
        testMode: true,
        authBypass: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})