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
    // Use service role for internal access - no authentication required from client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const importId = url.pathname.split('/').pop()?.replace('.json', '');
    const expires = url.searchParams.get('expires');

    console.log('Import payload request:', {
      importId,
      expires,
      url: req.url,
      method: req.method
    });

    if (!importId) {
      console.error('Missing import ID');
      throw new Error('Import ID is required');
    }

    // Check if URL is expired
    if (expires && parseInt(expires) < Date.now()) {
      return new Response(
        JSON.stringify({
          error: 'Import URL has expired',
          code: 'EXPIRED_URL'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 410, // Gone
        }
      );
    }

    // For testing: If this is a test ID, return mock data
    if (importId.startsWith('test-') || importId.startsWith('demo-')) {
      console.log('Returning test data for demo ID:', importId);
      
      const mockPayload = {
        id: importId,
        destination: 'figjam',
        targetId: 'demo-file-456',
        sourcePrompt: 'Test prompt for delivery system',
        items: [
          {
            id: 'test-item-1',
            type: 'sticky',
            text: 'Test insight 1 from FramePromptly',
            x: 100,
            y: 100,
            width: 180,
            height: 120,
            style: { backgroundColor: '#FFE066', fontSize: 14 }
          },
          {
            id: 'test-item-2', 
            type: 'sticky',
            text: 'Test insight 2 from FramePromptly',
            x: 300,
            y: 100,
            width: 180,
            height: 120,
            style: { backgroundColor: '#FF6B66', fontSize: 14 }
          },
          {
            id: 'test-item-3',
            type: 'sticky',
            text: 'Key insight from user research',
            x: 500,
            y: 100,
            width: 180,
            height: 120,
            style: { backgroundColor: '#66D9FF', fontSize: 14 }
          },
          {
            id: 'test-item-4',
            type: 'sticky',
            text: 'Action item: Test with users',
            x: 100,
            y: 250,
            width: 180,
            height: 120,
            style: { backgroundColor: '#66FF66', fontSize: 14 }
          }
        ],
        layoutHints: {
          columns: 3,
          spacing: 20,
          maxItems: 50,
          arrangement: 'grid'
        },
        summary: 'Test delivery with 4 items for FigJam workshop',
        itemCount: 4,
        createdAt: new Date().toISOString()
      };

      const response = {
        success: true,
        data: {
          id: importId,
          destination: 'figjam',
          payload: mockPayload,
          metadata: {
            accessCount: 1,
            maxAccess: 5,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
          }
        },
        instructions: generateImportInstructions('figjam', mockPayload)
      };

      console.log('Returning test response with', mockPayload.items.length, 'items');

      return new Response(
        JSON.stringify(response),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          status: 200,
        }
      );
    }

    // Try to get ephemeral import record from database
    const { data: importRecord, error: importError } = await supabaseClient
      .from('ephemeral_imports')
      .select('*')
      .eq('id', importId)
      .single();

    console.log('Database query result:', {
      importId,
      hasRecord: !!importRecord,
      error: importError?.message,
      recordDestination: importRecord?.destination
    });

    if (importError || !importRecord) {
      console.error('Import not found:', {
        importId,
        error: importError
      });
      return new Response(
        JSON.stringify({
          error: 'Import not found or expired',
          code: 'IMPORT_NOT_FOUND',
          details: importError?.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Check if import is expired
    const expiresAt = new Date(importRecord.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({
          error: 'Import has expired',
          code: 'EXPIRED_IMPORT'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 410,
        }
      );
    }

    // Check usage limits (allow up to 5 accesses)
    if (importRecord.access_count >= 5) {
      return new Response(
        JSON.stringify({
          error: 'Import usage limit exceeded',
          code: 'USAGE_LIMIT_EXCEEDED'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    // Increment access count
    await supabaseClient
      .from('ephemeral_imports')
      .update({ 
        access_count: importRecord.access_count + 1,
        accessed_at: new Date().toISOString()
      })
      .eq('id', importId);

    // Return the payload with additional metadata for plugin
    const response = {
      success: true,
      data: {
        id: importRecord.id,
        destination: importRecord.destination,
        payload: importRecord.payload,
        metadata: {
          accessCount: importRecord.access_count + 1,
          maxAccess: 5,
          expiresAt: importRecord.expires_at,
          createdAt: importRecord.created_at
        }
      },
      instructions: generateImportInstructions(importRecord.destination, importRecord.payload)
    };

    console.log('Returning successful response:', {
      importId: importRecord.id,
      destination: importRecord.destination,
      payloadItemCount: importRecord.payload?.items?.length || 0,
      accessCount: importRecord.access_count + 1
    });

    return new Response(
      JSON.stringify(response),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Import payload error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'IMPORT_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Generate instructions for the plugin on how to import the payload
 */
function generateImportInstructions(destination: string, payload: any): any {
  const baseInstructions = {
    itemCount: payload.itemCount || 0,
    summary: payload.summary || 'Imported content from FramePromptly',
    layoutHints: payload.layoutHints || {},
  };

  switch (destination) {
    case 'figjam':
      return {
        ...baseInstructions,
        type: 'figjam',
        instructions: [
          'This payload contains workshop-ready content for FigJam',
          'Items include sticky notes, facilitation text, and clustering guidance',
          'Position items according to layout hints for optimal workshop flow',
          'Use clustering information to group related items'
        ],
        clustersAvailable: payload.clusters?.length || 0,
        facilitationScript: payload.facilitationScript || null
      };

    case 'figma':
      return {
        ...baseInstructions,
        type: 'figma',
        instructions: [
          'This payload contains UI components and design system elements',
          'Items include frames, text components, and styling information',
          'Apply responsive layout according to the provided specifications',
          'Use component metadata for proper information hierarchy'
        ],
        componentsCount: payload.items?.filter((item: any) => item.type === 'frame').length || 0,
        designSystem: payload.designSystem || 'Default',
        hasStyleGuide: !!payload.contentStyle
      };

    default:
      return {
        ...baseInstructions,
        type: 'generic',
        instructions: [
          'Import the provided items using the layout hints',
          'Position items according to x,y coordinates',
          'Apply styling information where available'
        ]
      };
  }
}