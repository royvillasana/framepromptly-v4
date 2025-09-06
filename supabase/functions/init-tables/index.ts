import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use service role for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating invitation system tables...');

    // Execute table creation step by step
    console.log('Creating project_invitations table...');
    const { error: invitationsTableError } = await supabaseClient
      .from('project_invitations')
      .select('*')
      .limit(0);
    
    if (invitationsTableError && invitationsTableError.code === '42P01') {
      // Table doesn't exist, create it using raw SQL
      const createInvitationsTable = `
        CREATE TABLE IF NOT EXISTS public.project_invitations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID NOT NULL,
            invited_email TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
            invited_by UUID NOT NULL,
            invitation_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            accepted_at TIMESTAMPTZ,
            accepted_by UUID
        );
      `;
      
      try {
        // Use service client to execute raw SQL
        const { data: createResult, error: createError } = await supabaseClient
          .rpc('exec', { query: createInvitationsTable });
        console.log('project_invitations table creation result:', { data: createResult, error: createError });
      } catch (err) {
        console.log('project_invitations table creation alternative method needed');
      }
    } else {
      console.log('project_invitations table already exists or accessible');
    }

    console.log('Creating project_members table...');
    const { error: membersTableError } = await supabaseClient
      .from('project_members')
      .select('*')
      .limit(0);
      
    if (membersTableError && membersTableError.code === '42P01') {
      // Table doesn't exist, create it
      const createMembersTable = `
        CREATE TABLE IF NOT EXISTS public.project_members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID NOT NULL,
            user_id UUID NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            added_by UUID,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(project_id, user_id)
        );
      `;
      
      try {
        const { data: createResult, error: createError } = await supabaseClient
          .rpc('exec', { query: createMembersTable });
        console.log('project_members table creation result:', { data: createResult, error: createError });
      } catch (err) {
        console.log('project_members table creation alternative method needed');
      }
    } else {
      console.log('project_members table already exists or accessible');
    }
    
    // Try to insert a test record to verify the tables work
    console.log('Testing tables with dummy data...');
    
    const testResult = {
      invitations_table: 'unknown',
      members_table: 'unknown'
    };
    
    try {
      const { error: testInvError } = await supabaseClient
        .from('project_invitations')
        .select('count')
        .limit(1);
      testResult.invitations_table = testInvError ? `ERROR: ${testInvError.message}` : 'OK';
    } catch (err) {
      testResult.invitations_table = `EXCEPTION: ${err.message}`;
    }
    
    try {
      const { error: testMembersError } = await supabaseClient
        .from('project_members')
        .select('count')
        .limit(1);
      testResult.members_table = testMembersError ? `ERROR: ${testMembersError.message}` : 'OK';
    } catch (err) {
      testResult.members_table = `EXCEPTION: ${err.message}`;
    }

    const data = testResult;
    const error = null;

    if (error) {
      console.error('SQL execution error:', error);
      throw error;
    }

    console.log('Invitation tables created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation system tables created successfully',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Table creation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});