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
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Adding missing conversation_history column to prompts table...');

    // Execute raw SQL to add the column if it doesn't exist
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          BEGIN
            ALTER TABLE prompts ADD COLUMN conversation_history JSONB DEFAULT '[]'::jsonb;
            RAISE NOTICE 'Column conversation_history added successfully';
          EXCEPTION 
            WHEN duplicate_column THEN 
              RAISE NOTICE 'Column conversation_history already exists';
          END;
        END $$;
      `
    });

    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative approach using direct PostgreSQL connection
      const { data: testData, error: testError } = await supabase
        .from('prompts')
        .select('conversation_history')
        .limit(1);

      if (testError && testError.message.includes('column "conversation_history" does not exist')) {
        console.log('Column definitely does not exist. Need manual database access.');
        return new Response(JSON.stringify({
          success: false,
          message: 'Column does not exist and requires direct database access to add',
          needsManualFix: true,
          sql: 'ALTER TABLE prompts ADD COLUMN conversation_history JSONB DEFAULT \'[]\'::jsonb;'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log('Column exists, schema cache issue');
        return new Response(JSON.stringify({
          success: true,
          message: 'Column exists but schema cache needs refresh',
          cacheIssue: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Column operation completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Column check/add completed successfully',
      data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in add-missing-column function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});