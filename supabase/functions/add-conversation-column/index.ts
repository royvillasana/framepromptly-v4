import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    console.log('Adding conversation_history column if not exists...');

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test if conversation_history column exists by trying to select it
    const { data: testData, error: testError } = await supabase
      .from('prompts')
      .select('conversation_history')
      .limit(1);

    let columnExists = !testError;
    
    if (testError) {
      console.log('Column does not exist:', testError.message);
      columnExists = false;
    } else {
      console.log('Column exists and accessible');
      columnExists = true;
    }

    console.log('Column added successfully, refreshing schema...');

    // Force schema refresh
    const refreshResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'schema=public'
      },
      body: JSON.stringify({})
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'conversation_history column checked and schema refreshed',
      columnExists,
      refreshStatus: refreshResponse.status,
      testError: testError?.message || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error ensuring column:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});