import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema for AI workflow generation response
interface WorkflowGeneration {
  framework: {
    name: string;
    description: string;
  };
  stages: Array<{
    name: string;
    description: string;
    duration: string;
    participants: string;
    deliverables: string;
  }>;
  tools: Array<{
    name: string;
    description: string;
    category: string;
    effort: string;
    expertise: string;
    resources: string;
    output: string;
    stageName: string;
  }>;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, availableFrameworks, type = 'generate' } = await req.json();

    console.log('AI Workflow Generator request:', { 
      type,
      prompt: prompt?.substring(0, 100) + '...',
      frameworksCount: availableFrameworks?.length || 0
    });

    // Initialize Supabase client for auth (if needed)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build framework context
    const frameworkNames = availableFrameworks?.map((f: any) => f.name).join(', ') || '';
    const frameworkDetails = availableFrameworks?.map((f: any) => 
      `${f.name}: ${f.description} (${f.stages?.length || 0} stages)`
    ).join('\n') || '';

    const systemPrompt = `You are an expert UX workflow designer. Based on the user's request, generate a complete UX workflow using one of the available frameworks.

Available UX Frameworks:
${frameworkDetails}

For each framework, you have access to these sample stages and tools:
- Design Thinking: Empathize, Define, Ideate, Prototype, Test stages with tools like User Interviews, Persona Creation, Journey Mapping, Wireframing, A/B Testing
- Double Diamond: Discover, Define, Develop, Deliver stages with Research, Synthesis, Ideation, Prototyping tools
- Google Design Sprint: Map, Sketch, Decide, Prototype, Test stages with Lightning Demos, Solution Sketching, Decision Making, Rapid Prototyping, User Testing
- Human-Centered Design: Inspiration, Ideation, Implementation stages with Field Research, Co-creation, Pilot Testing tools
- Jobs-to-Be-Done: Job Mapping, Outcome Identification, Solution Development stages with Job Interviews, Outcome Mapping, Solution Design tools
- Lean UX: Think, Make, Check stages with Assumption Mapping, MVP Creation, Hypothesis Testing tools
- Agile UX: Discovery, Alpha, Beta, Live stages with Sprint Planning, User Story Mapping, Retrospectives tools
- HEART Framework: Happiness, Engagement, Adoption, Retention, Task success stages with Metrics Definition, Analytics, Surveys tools
- Hooked Model: Trigger, Action, Variable Reward, Investment stages with Behavioral Analysis, Habit Design, Gamification tools

Instructions:
1. Analyze the user's request to identify the most suitable framework
2. Select 2-4 relevant stages from that framework
3. For each stage, include 1-3 relevant tools
4. Provide realistic effort estimates, expertise levels, and resource requirements
5. Ensure the workflow is coherent and follows UX best practices
6. Include a brief reasoning for your choices

Respond in this exact JSON format:
{
  "framework": {
    "name": "Framework Name",
    "description": "Framework description"
  },
  "stages": [
    {
      "name": "Stage Name",
      "description": "Stage description",
      "duration": "Duration estimate",
      "participants": "Required participants",
      "deliverables": "Expected deliverables"
    }
  ],
  "tools": [
    {
      "name": "Tool Name",
      "description": "Tool description",
      "category": "Tool category",
      "effort": "Low/Medium/High",
      "expertise": "Beginner/Intermediate/Advanced",
      "resources": "Required resources",
      "output": "Expected output",
      "stageName": "Associated stage name"
    }
  ],
  "reasoning": "Brief explanation of choices"
}`;

    const userPrompt = type === 'generate' 
      ? `Generate a UX workflow for: ${prompt}`
      : `Refine the workflow: ${prompt}`;

    console.log('Sending request to OpenAI...');

    // Generate AI response using OpenAI
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiData = await openAIResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response content from OpenAI');
    }

    console.log('OpenAI response received, parsing...');

    // Parse the JSON response
    let workflowGeneration: WorkflowGeneration;
    try {
      // Clean up the response content to ensure it's valid JSON
      const cleanContent = responseContent.trim();
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      const jsonContent = cleanContent.slice(jsonStart, jsonEnd);
      
      workflowGeneration = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw response:', responseContent);
      throw new Error('Failed to parse AI response');
    }

    console.log('Workflow generation successful');

    return new Response(JSON.stringify({
      success: true,
      data: workflowGeneration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-workflow-generator function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});