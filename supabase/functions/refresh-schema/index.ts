import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log('Refreshing PostgREST schema cache...');

    // Call the PostgREST schema refresh endpoint
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

    console.log('Schema refresh response status:', refreshResponse.status);

    // Alternative: Use NOTIFY to signal schema reload
    const notifyResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/pgrst_watch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    console.log('Schema reload notification sent:', notifyResponse.status);

    return new Response(JSON.stringify({
      success: true,
      message: 'Schema cache refresh requested',
      refreshStatus: refreshResponse.status,
      notifyStatus: notifyResponse.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error refreshing schema:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});