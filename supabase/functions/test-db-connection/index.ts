import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Testing database connection...');
    
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Test 1: Check if we can connect to the database
    console.log('🔍 Test 1: Basic database connection...');
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
      
    console.log('📊 Connection test result:', { data: connectionTest, error: connectionError });

    // Test 2: Check if projects table exists
    console.log('🔍 Test 2: Check projects table...');
    const { data: projectsCheck, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('count')
      .limit(1);
      
    console.log('📊 Projects table result:', { error: projectsError ? projectsError.message : 'OK' });

    // Test 3: Check if invitation tables exist
    console.log('🔍 Test 3: Check invitation tables...');
    
    const { data: invitationsCheck, error: invitationsError } = await supabaseAdmin
      .from('project_invitations')
      .select('count')
      .limit(1);
      
    console.log('📊 Invitations table result:', { error: invitationsError ? invitationsError.message : 'OK' });

    const { data: membersCheck, error: membersError } = await supabaseAdmin
      .from('project_members')
      .select('count')
      .limit(1);
      
    console.log('📊 Members table result:', { error: membersError ? membersError.message : 'OK' });

    // Test 4: Try to get list of all tables
    console.log('🔍 Test 4: List all tables in public schema...');
    const { data: allTables, error: allTablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
      
    console.log('📊 All tables result:', { 
      data: allTables?.map(t => t.table_name), 
      error: allTablesError ? allTablesError.message : null 
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database connection test completed',
        results: {
          connection: connectionError ? `ERROR: ${connectionError.message}` : 'OK',
          projects_table: projectsError ? `ERROR: ${projectsError.message}` : 'EXISTS',
          invitations_table: invitationsError ? `ERROR: ${invitationsError.message}` : 'EXISTS',
          members_table: membersError ? `ERROR: ${membersError.message}` : 'EXISTS',
          all_tables: allTables?.map(t => t.table_name) || [],
        },
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Test error:', error);
    
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
})