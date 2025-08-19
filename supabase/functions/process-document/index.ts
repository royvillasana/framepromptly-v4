import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { fileUrl, fileName, projectId, title } = await req.json();

    console.log('Processing document:', { fileUrl, fileName, projectId, title });

    // Download the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileExtension = fileName.toLowerCase().split('.').pop();
    
    let extractedText = '';

    if (fileExtension === 'txt' || fileExtension === 'md') {
      // For text and markdown files, just convert to text
      extractedText = new TextDecoder().decode(fileBuffer);
    } else if (fileExtension === 'pdf') {
      // For PDF files, we'll use a simple text extraction approach
      // In a production environment, you'd want to use a proper PDF parser
      const pdfText = new TextDecoder().decode(fileBuffer);
      // This is a very basic extraction - for production use a proper PDF library
      extractedText = pdfText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').substring(0, 10000);
    } else if (fileExtension === 'docx') {
      // For DOCX files, basic text extraction
      // In production, you'd use a proper DOCX parser
      extractedText = `Document content from ${fileName} - Please use a proper document parser for full extraction`;
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    // Clean up the extracted text
    extractedText = extractedText.trim().substring(0, 50000); // Limit to 50k characters

    if (!extractedText) {
      throw new Error('No text could be extracted from the document');
    }

    // Save to knowledge base
    const { data: knowledgeEntry, error: insertError } = await supabase
      .from('knowledge_base')
      .insert({
        project_id: projectId,
        title: title || fileName,
        content: extractedText,
        type: 'document',
        file_name: fileName,
        file_url: fileUrl,
        metadata: {
          file_size: fileBuffer.byteLength,
          file_type: fileExtension,
          extracted_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving to knowledge base:', insertError);
      throw insertError;
    }

    console.log('Document processed successfully:', knowledgeEntry.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        knowledgeEntry,
        extractedLength: extractedText.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process document' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});