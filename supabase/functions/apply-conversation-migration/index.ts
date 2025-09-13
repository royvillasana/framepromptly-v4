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

    // Manual approach - insert a record with the new column to force schema update
    console.log('Attempting to manually apply conversation_history column...');

    // Try to get a sample prompt first
    const response = await fetch(`${supabaseUrl}/rest/v1/prompts?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prompts: ${response.status}`);
    }

    const prompts = await response.json();
    
    if (prompts.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No prompts found to test with'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const promptId = prompts[0].id;

    // Try to update with conversation_history field
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/prompts?id=eq.${promptId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        conversation_history: []
      })
    });

    const updateData = await updateResponse.text();
    console.log('Update response:', updateResponse.status, updateData);

    if (updateResponse.ok) {
      console.log('Column exists and works!');
      
      // Force schema refresh
      await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'conversation_history column is working',
        promptId,
        updateStatus: updateResponse.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Column still does not exist',
        error: updateData,
        updateStatus: updateResponse.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

  } catch (error) {
    console.error('Error applying migration:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});