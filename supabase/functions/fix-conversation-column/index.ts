import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Checking and fixing conversation_history column...');

    // Try to add the column if it doesn't exist
    const { data, error } = await supabase.rpc('fix_conversation_column', {});

    if (error) {
      console.error('Error fixing column:', error);
      
      // If RPC doesn't exist, try direct SQL
      const { error: sqlError } = await supabase
        .from('prompts')
        .select('conversation_history')
        .limit(1);

      if (sqlError && sqlError.message.includes('column "conversation_history" does not exist')) {
        console.log('Column does not exist, needs manual fix');
        return new Response(JSON.stringify({
          success: false,
          message: 'Column does not exist and needs to be added manually',
          error: sqlError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Column check completed',
      data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fix-conversation-column function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});