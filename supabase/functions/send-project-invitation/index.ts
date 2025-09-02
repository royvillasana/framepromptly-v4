import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    // Create client for user operations (with auth)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Create admin client for invitation creation (without RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { projectId, projectName, invitedEmail, role, inviterName, inviterEmail }: InvitationRequest = await req.json()

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
      console.error('Error creating invitation:', invitationError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create invitation',
          details: invitationError.message 
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

    // Create email content
    const inviterDisplayName = inviterName || inviterEmail || user.email || 'Someone'
    const roleText = role === 'editor' ? 'edit and collaborate on' : 'view'
    
    const emailSubject = `You've been invited to collaborate on "${projectName}" - FramePromptly`
    
    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Invitation - FramePromptly</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #ffffff;
            padding: 30px 20px;
            border: 1px solid #e1e5e9;
            border-top: none;
          }
          .project-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .project-name {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 8px 0;
          }
          .role-badge {
            display: inline-block;
            background: #e2e8f0;
            color: #4a5568;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .invitation-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none !important;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .invitation-button:hover {
            transform: translateY(-1px);
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e1e5e9;
            border-top: none;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          .divider {
            height: 1px;
            background: #e1e5e9;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 FramePromptly</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">UX Workflow Collaboration Platform</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2d3748; margin-top: 0;">You've been invited to collaborate!</h2>
          
          <p>Hi there,</p>
          
          <p><strong>${inviterDisplayName}</strong> has invited you to ${roleText} their project on FramePromptly.</p>
          
          <div class="project-info">
            <div class="project-name">${projectName}</div>
            <div style="margin-top: 10px;">
              <span class="role-badge">Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</span>
            </div>
          </div>
          
          <p>Click the button below to accept the invitation and start collaborating:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" class="invitation-button">
              🚀 Accept Invitation
            </a>
          </div>
          
          <div class="divider"></div>
          
          <p style="font-size: 14px; color: #6c757d;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${invitationLink}" style="color: #667eea; word-break: break-all;">${invitationLink}</a>
          </p>
          
          <p style="font-size: 14px; color: #6c757d;">
            <strong>What you can do as ${role}:</strong><br>
            ${role === 'editor' 
              ? '• View and edit project workflows<br>• Add and modify UX frameworks<br>• Collaborate on project documentation<br>• Manage project knowledge base' 
              : '• View project workflows<br>• Browse UX frameworks<br>• Read project documentation<br>• Access project knowledge base'
            }
          </p>
        </div>
        
        <div class="footer">
          <p>
            This invitation was sent by FramePromptly on behalf of ${inviterDisplayName}.<br>
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
          <p>
            <a href="${baseUrl}">Visit FramePromptly</a> | 
            <a href="${baseUrl}/help">Help Center</a>
          </p>
        </div>
      </body>
    </html>
    `

    const emailText = `
Hi there,

${inviterDisplayName} has invited you to ${roleText} their project "${projectName}" on FramePromptly.

Accept the invitation by visiting this link:
${invitationLink}

What you can do as ${role}:
${role === 'editor' 
  ? '- View and edit project workflows\n- Add and modify UX frameworks\n- Collaborate on project documentation\n- Manage project knowledge base' 
  : '- View project workflows\n- Browse UX frameworks\n- Read project documentation\n- Access project knowledge base'
}

If you didn't expect this invitation, you can safely ignore this email.

--
FramePromptly Team
${baseUrl}
    `

    // Here you would integrate with your email service (like Resend, SendGrid, etc.)
    // For now, we'll use a placeholder that logs the email content
    console.log('Email to send:', {
      to: invitedEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    })

    // Simulate sending email - replace with actual email service integration
    const emailSent = await simulateEmailSend(invitedEmail, emailSubject, emailHtml, emailText)

    if (emailSent) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation email sent successfully',
          invitationLink 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      throw new Error('Failed to send email')
    }

  } catch (error) {
    console.error('Error sending invitation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send invitation email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Placeholder function - replace with actual email service integration
async function simulateEmailSend(to: string, subject: string, html: string, text: string): Promise<boolean> {
  try {
    // Here you would integrate with your preferred email service:
    
    // Option 1: Resend (recommended)
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    // const result = await resend.emails.send({
    //   from: 'FramePromptly <invitations@framepromptly.com>',
    //   to: [to],
    //   subject: subject,
    //   html: html,
    //   text: text
    // })
    // return !!result.data?.id
    
    // Option 2: SendGrid
    // Option 3: AWS SES
    // Option 4: Supabase Auth (for user invitations)
    
    // For now, just log and return true
    console.log(`Would send email to: ${to}`)
    console.log(`Subject: ${subject}`)
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  } catch (error) {
    console.error('Error in email simulation:', error)
    return false
  }
}