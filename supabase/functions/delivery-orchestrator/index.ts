import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DeliveryRequest {
  destination: 'miro' | 'figjam' | 'figma';
  targetId: string;
  prompt: string;
  tailoredOutput?: any;
  options?: {
    maxItems?: number;
    optimizeForDestination?: boolean;
  };
}

interface DeliveryResponse {
  success: boolean;
  deliveryId?: string;
  embedUrl?: string;
  importUrl?: string;
  expiresAt?: string;
  itemCount?: number;
  errors?: string[];
  warnings?: string[];
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the session user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const body: DeliveryRequest = await req.json();
    
    // Validate request
    if (!body.destination || !body.targetId || !body.prompt) {
      throw new Error('Missing required fields: destination, targetId, prompt');
    }

    const deliveryId = `delivery-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
    
    // Route based on destination
    let response: DeliveryResponse;
    
    switch (body.destination) {
      case 'miro':
        response = await handleMiroDelivery(supabaseClient, user.id, deliveryId, body);
        break;
      case 'figjam':
        response = await handleFigJamDelivery(supabaseClient, user.id, deliveryId, body);
        break;
      case 'figma':
        response = await handleFigmaDelivery(supabaseClient, user.id, deliveryId, body);
        break;
      default:
        throw new Error(`Unsupported destination: ${body.destination}`);
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Delivery orchestrator error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

/**
 * Handle Miro board delivery via REST API
 */
async function handleMiroDelivery(
  supabaseClient: any,
  userId: string,
  deliveryId: string,
  request: DeliveryRequest
): Promise<DeliveryResponse> {
  try {
    // Get Miro OAuth connection
    const { data: connection } = await supabaseClient
      .from('oauth_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('destination', 'miro')
      .eq('is_active', true)
      .single();

    if (!connection) {
      throw new Error('No active Miro connection found. Please connect to Miro first.');
    }

    // Decrypt access token (simplified - use proper decryption in production)
    const accessToken = await decryptToken(connection.access_token_encrypted);
    
    // Generate normalized payload
    const payload = await generateNormalizedPayload(request);
    
    // Validate Miro board access
    const boardResponse = await fetch(`https://api.miro.com/v2/boards/${request.targetId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!boardResponse.ok) {
      throw new Error(`Cannot access Miro board: ${boardResponse.status}`);
    }

    // Create items on Miro board
    const createdItems = [];
    const warnings = [];

    for (const item of payload.items.slice(0, 50)) { // Limit to 50 items
      try {
        const miroItem = await createMiroItem(accessToken, request.targetId, item);
        createdItems.push(miroItem);
      } catch (error) {
        warnings.push(`Failed to create item: ${item.text?.substring(0, 30)}...`);
      }
    }

    if (payload.items.length > 50) {
      warnings.push('Items truncated to 50 for Miro performance');
    }

    // Store delivery record
    await supabaseClient
      .from('deliveries')
      .insert({
        id: deliveryId,
        user_id: userId,
        destination: 'miro',
        target_id: request.targetId,
        status: 'success',
        delivered_items: createdItems.length,
        total_items: payload.items.length,
        embed_url: `https://miro.com/app/live-embed/${request.targetId}`,
        warnings: warnings.length > 0 ? warnings : null
      });

    return {
      success: true,
      deliveryId,
      embedUrl: `https://miro.com/app/live-embed/${request.targetId}`,
      itemCount: createdItems.length,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    // Store failed delivery record
    await supabaseClient
      .from('deliveries')
      .insert({
        id: deliveryId,
        user_id: userId,
        destination: 'miro',
        target_id: request.targetId,
        status: 'error',
        delivered_items: 0,
        total_items: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

    throw error;
  }
}

/**
 * Handle FigJam delivery via ephemeral import
 */
async function handleFigJamDelivery(
  supabaseClient: any,
  userId: string,
  deliveryId: string,
  request: DeliveryRequest
): Promise<DeliveryResponse> {
  try {
    // Generate normalized payload
    const payload = await generateNormalizedPayload(request);
    
    // Create ephemeral import record
    const importId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const signedUrl = await generateSignedUrl(importId, payload);
    
    await supabaseClient
      .from('ephemeral_imports')
      .insert({
        id: importId,
        user_id: userId,
        destination: 'figjam',
        payload: payload,
        signed_url: signedUrl,
        expires_at: expiresAt.toISOString(),
        access_count: 0
      });

    // Store delivery record
    await supabaseClient
      .from('deliveries')
      .insert({
        id: deliveryId,
        user_id: userId,
        destination: 'figjam',
        target_id: request.targetId,
        status: 'success',
        delivered_items: payload.items.length,
        total_items: payload.items.length,
        import_url: signedUrl,
        expires_at: expiresAt.toISOString()
      });

    return {
      success: true,
      deliveryId,
      importUrl: signedUrl,
      expiresAt: expiresAt.toISOString(),
      itemCount: payload.items.length
    };

  } catch (error) {
    await supabaseClient
      .from('deliveries')
      .insert({
        id: deliveryId,
        user_id: userId,
        destination: 'figjam',
        target_id: request.targetId,
        status: 'error',
        delivered_items: 0,
        total_items: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

    throw error;
  }
}

/**
 * Handle Figma delivery via ephemeral import
 */
async function handleFigmaDelivery(
  supabaseClient: any,
  userId: string,
  deliveryId: string,
  request: DeliveryRequest
): Promise<DeliveryResponse> {
  try {
    // Generate normalized payload optimized for Figma
    const payload = await generateNormalizedPayload(request, 'figma');
    
    // Create ephemeral import record
    const importId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const signedUrl = await generateSignedUrl(importId, payload);
    
    await supabaseClient
      .from('ephemeral_imports')
      .insert({
        id: importId,
        user_id: userId,
        destination: 'figma',
        payload: payload,
        signed_url: signedUrl,
        expires_at: expiresAt.toISOString(),
        access_count: 0
      });

    // Store delivery record
    await supabaseClient
      .from('deliveries')
      .insert({
        id: deliveryId,
        user_id: userId,
        destination: 'figma',
        target_id: request.targetId,
        status: 'success',
        delivered_items: payload.items.length,
        total_items: payload.items.length,
        import_url: signedUrl,
        expires_at: expiresAt.toISOString()
      });

    return {
      success: true,
      deliveryId,
      importUrl: signedUrl,
      expiresAt: expiresAt.toISOString(),
      itemCount: payload.items.length
    };

  } catch (error) {
    await supabaseClient
      .from('deliveries')
      .insert({
        id: deliveryId,
        user_id: userId,
        destination: 'figma',
        target_id: request.targetId,
        status: 'error',
        delivered_items: 0,
        total_items: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

    throw error;
  }
}

/**
 * Generate normalized payload from prompt or tailored output
 */
async function generateNormalizedPayload(
  request: DeliveryRequest,
  optimizeFor?: string
): Promise<any> {
  // If tailored output is provided, use it
  if (request.tailoredOutput) {
    return normalizeExistingOutput(request.tailoredOutput, request.destination);
  }

  // Otherwise, simulate payload generation from prompt
  // In real implementation, this would call the AI service
  const itemCount = Math.min(request.options?.maxItems || 20, 50);
  const items = [];

  for (let i = 0; i < itemCount; i++) {
    const item = {
      id: `generated-${i + 1}`,
      type: request.destination === 'figma' ? 'frame' : 'sticky',
      text: `Generated insight ${i + 1} from: ${request.prompt.substring(0, 50)}...`,
      x: (i % 4) * 200 + 100,
      y: Math.floor(i / 4) * 150 + 100,
      width: request.destination === 'figma' ? 280 : 180,
      height: request.destination === 'figma' ? 180 : 120,
      style: {
        backgroundColor: getDestinationColor(request.destination, i),
        fontSize: request.destination === 'figma' ? 16 : 14
      }
    };

    // Add destination-specific optimizations
    if (optimizeFor === 'figma') {
      item.metadata = {
        copy: { title: `Title ${i + 1}`, description: `Description for item ${i + 1}` },
        priority: i < 5 ? 'high' : 'medium'
      };
    }

    items.push(item);
  }

  return {
    id: crypto.randomUUID(),
    destination: request.destination,
    targetId: request.targetId,
    sourcePrompt: request.prompt,
    items,
    layoutHints: {
      columns: request.destination === 'figma' ? 3 : 4,
      spacing: request.destination === 'figma' ? 40 : 20,
      maxItems: 50,
      arrangement: request.destination === 'miro' ? 'clusters' : 'grid'
    },
    summary: `Generated ${items.length} items for ${request.destination}`,
    itemCount: items.length,
    createdAt: new Date().toISOString()
  };
}

/**
 * Normalize existing tailored output to delivery payload
 */
function normalizeExistingOutput(tailoredOutput: any, destination: string): any {
  // This would contain the logic to transform tailored output
  // into normalized delivery format
  return {
    id: crypto.randomUUID(),
    destination,
    items: tailoredOutput.items || [],
    layoutHints: tailoredOutput.layoutHints || {},
    summary: tailoredOutput.summary || 'Tailored output',
    itemCount: (tailoredOutput.items || []).length,
    createdAt: new Date().toISOString()
  };
}

/**
 * Create a single item on Miro board
 */
async function createMiroItem(accessToken: string, boardId: string, item: any): Promise<any> {
  const miroPayload = {
    data: {
      content: item.text,
      shape: 'square'
    },
    style: {
      fillColor: item.style?.backgroundColor || '#fff9b1',
      textAlign: 'center',
      textAlignVertical: 'middle'
    },
    position: {
      x: item.x,
      y: item.y,
      origin: 'center'
    },
    geometry: {
      width: item.width,
      height: item.height
    }
  };

  const response = await fetch(`https://api.miro.com/v2/boards/${boardId}/sticky_notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(miroPayload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create Miro item: ${response.status}`);
  }

  return await response.json();
}

/**
 * Generate signed URL for ephemeral import
 */
async function generateSignedUrl(importId: string, payload: any): Promise<string> {
  const baseUrl = Deno.env.get('SUPABASE_URL') || 'https://drfaomantrtmtydbelxe.supabase.co';
  
  // For testing purposes, always use test- prefix for demo URLs
  const testImportId = `test-${importId}`;
  
  console.log('Generated signed URL:', {
    originalId: importId,
    testId: testImportId,
    baseUrl
  });
  
  return `${baseUrl}/functions/v1/import-payload/${testImportId}?expires=${Date.now() + 15 * 60 * 1000}`;
}

/**
 * Get destination-appropriate color
 */
function getDestinationColor(destination: string, index: number): string {
  const colors = {
    miro: ['#fff9b1', '#f5d128', '#d5f692', '#a6ccf5', '#f2a1c9'],
    figjam: ['#FFE066', '#FF6B66', '#66D9FF', '#66FF66', '#FF9B66'],
    figma: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA']
  };

  const destColors = colors[destination as keyof typeof colors] || colors.miro;
  return destColors[index % destColors.length];
}

/**
 * Simplified token decryption (use proper crypto in production)
 */
async function decryptToken(encryptedToken: string): Promise<string> {
  // This is a simplified decryption - implement proper AES decryption in production
  try {
    return atob(encryptedToken);
  } catch {
    throw new Error('Failed to decrypt access token');
  }
}