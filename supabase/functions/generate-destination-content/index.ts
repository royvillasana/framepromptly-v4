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
    const { 
      prompt,
      destination,
      context,
      variables
    } = await req.json();

    console.log('Generating destination-specific content for:', { destination, context });

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Load template and best practices
    const templateContext = await getTemplateForContext(context?.framework, context?.stage, destination, context?.tool);
    const bestPractices = getBestPracticesForDestination(destination);
    
    // Create enhanced destination-specific system prompts
    let systemPrompt = '';
    let expectedStructure = '';

    switch (destination) {
      case 'Miro':
        systemPrompt = `You are a Miro board content generator following professional UX practices. Generate structured JSON output ONLY.

TEMPLATE CONTEXT:
Template: ${templateContext.template}
Guidance: ${templateContext.guidance}

CRITICAL RULES:
- Output ONLY valid JSON, no explanatory text
- Create professional sticky notes, text blocks, and clusters for strategic visual collaboration
- Sticky notes must be ≤12 words each, one clear actionable idea per note
- Maximum 50 total items with logical grouping and visual hierarchy
- Include diverse color themes for intuitive categorization and voting
- Apply best practices: ${JSON.stringify(bestPractices.content || [])}
- Follow quality standards: ${JSON.stringify(templateContext.qualityStandards)}

REQUIRED JSON STRUCTURE:
{
  "boardSummary": "Brief description of board purpose",
  "items": [
    {
      "id": "unique-id",
      "type": "sticky|text|shape", 
      "text": "content (≤12 words for sticky)",
      "theme": "color theme",
      "cluster": "grouping name",
      "position": {"row": 0, "column": 0}
    }
  ],
  "clusters": [
    {
      "name": "cluster name",
      "description": "cluster purpose", 
      "itemIds": ["id1", "id2"]
    }
  ],
  "layout": {
    "columns": 4,
    "spacing": 20,
    "readingInstructions": "how to read the board"
  }
}`;
        break;

      case 'FigJam':
        systemPrompt = `You are a FigJam workshop content generator creating comprehensive, spatially-organized workshop experiences. Generate structured JSON output ONLY.

TEMPLATE CONTEXT:
Template: ${templateContext.template}
Guidance: ${templateContext.guidance}

CRITICAL RULES:
- Output ONLY valid JSON, no explanatory text
- Create comprehensive workshop layout with positioned elements and sections
- Generate 15-25 meaningful sticky notes with ≤10 words each
- Include workshop sections (intro, activities, synthesis, next steps)
- Add facilitation elements (timers, instructions, voting dots)
- Use FigJam coordinate system: X=0-2000, Y=0-3000 for good spacing
- Apply best practices: ${JSON.stringify(bestPractices.content || [])}
- Follow quality standards: ${JSON.stringify(templateContext.qualityStandards)}

REQUIRED JSON STRUCTURE:
{
  "workshopTitle": "Engaging session name",
  "items": [
    {
      "id": "unique-id",
      "type": "sticky|text|shape",
      "text": "content (≤10 words for sticky)",
      "x": 100,
      "y": 200,
      "width": 160,
      "height": 160,
      "clusterId": "section-name",
      "category": "category-type",
      "style": {
        "backgroundColor": "#FFE066",
        "fontSize": 14
      }
    }
  ],
  "sections": [
    {
      "id": "workshop-intro",
      "name": "Workshop Introduction", 
      "x": 100,
      "y": 100,
      "width": 1800,
      "height": 300,
      "backgroundColor": "#F0F8FF",
      "elements": ["title", "agenda", "timer"]
    },
    {
      "id": "main-activity",
      "name": "Main Workshop Activity",
      "x": 100, 
      "y": 450,
      "width": 1800,
      "height": 800,
      "backgroundColor": "#FFF8E1",
      "elements": ["instructions", "work-areas", "examples"]
    },
    {
      "id": "synthesis",
      "name": "Synthesis & Insights",
      "x": 100,
      "y": 1300,
      "width": 1800, 
      "height": 400,
      "backgroundColor": "#F3E5F5",
      "elements": ["clustering", "insights", "voting"]
    }
  ],
  "facilitationScript": [
    {
      "step": 1,
      "instruction": "Welcome participants and explain workshop goals",
      "duration": "5 minutes",
      "sectionId": "workshop-intro",
      "materials": ["timer", "participant-list"]
    }
  ],
  "clusters": [
    {
      "id": "ideas-cluster",
      "name": "Generated Ideas",
      "x": 300,
      "y": 600,
      "width": 600,
      "height": 400,
      "itemIds": ["idea1", "idea2", "idea3"],
      "criteria": "Creative solution concepts"
    }
  ],
  "layoutHints": {
    "arrangement": "sectioned",
    "spacing": 40,
    "columns": 4,
    "totalWidth": 2000,
    "totalHeight": 2000
  }
}`;
        break;

      case 'Figma':
        systemPrompt = `You are a Figma design system generator creating production-ready components. Generate structured JSON output ONLY.

TEMPLATE CONTEXT:
Template: ${templateContext.template}
Guidance: ${templateContext.guidance}

CRITICAL RULES:
- Output ONLY valid JSON, no explanatory text
- Create comprehensive UI component specifications ready for development handoff
- Include precise pixel measurements, spacing, and sizing for all elements
- Provide realistic, contextual microcopy that reflects actual use cases
- Focus on scalable design system components with variants and states
- Apply best practices: ${JSON.stringify(bestPractices.content || [])}
- Follow quality standards: ${JSON.stringify(templateContext.qualityStandards)}
- Ensure WCAG AA accessibility compliance

REQUIRED JSON STRUCTURE:
{
  "designSystem": "Design approach description",
  "uiBlocks": [
    {
      "id": "unique-id",
      "title": "Component name",
      "type": "Hero|Card|Form Row|Navigation|Footer|Content Block",
      "description": "Component purpose",
      "copy": {
        "heading": "headline text",
        "subheading": "subheadline", 
        "body": "body copy",
        "cta": "button text"
      },
      "sizing": {
        "preferredWidth": 300,
        "preferredHeight": 200,
        "padding": 16,
        "spacing": 8
      },
      "priority": 1
    }
  ],
  "layout": {
    "columns": 3,
    "spacing": 40,
    "ordering": ["priority order"]
  },
  "contentStyle": {
    "tone": "voice description",
    "readingLevel": "accessibility level", 
    "accessibility": {
      "contrastRequirements": "contrast specs",
      "labelClarity": ["label guidelines"],
      "altTextGuidelines": "alt text rules"
    }
  }
}`;
        break;

      default:
        throw new Error(`Unsupported destination: ${destination}`);
    }

    // Create the full prompt
    const fullPrompt = `${prompt}

Generate content for: ${context?.framework} framework, ${context?.stage} stage, ${context?.tool} tool

Context Variables:
${Object.entries(variables || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}

${systemPrompt}`;

    // Generate AI response using OpenAI
    const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
    let aiResponse: any = null;
    let usedModel = '';

    for (const model of models) {
      try {
        console.log('Attempting OpenAI call with model:', model);
        
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: fullPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          }),
        });

        if (!openAIResponse.ok) {
          console.log(`Model ${model} failed, trying next`);
          continue;
        }

        const aiData = await openAIResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        
        if (!content || content.trim().length === 0) {
          console.log(`Empty response from ${model}, trying next`);
          continue;
        }
        
        // Parse the JSON response
        try {
          aiResponse = JSON.parse(content.trim());
          usedModel = model;
          console.log(`Successfully generated structured content with model: ${model}`);
          break;
        } catch (parseError) {
          console.log(`Failed to parse JSON from ${model}:`, parseError);
          continue;
        }
      } catch (modelErr) {
        console.error(`Error with model ${model}:`, modelErr);
        continue;
      }
    }

    if (!aiResponse) {
      throw new Error('Failed to generate valid structured content with any model');
    }

    // Validate the response structure based on destination
    let isValid = false;
    switch (destination) {
      case 'Miro':
        isValid = aiResponse.boardSummary && Array.isArray(aiResponse.items) && 
                  Array.isArray(aiResponse.clusters) && aiResponse.layout;
        break;
      case 'FigJam':
        isValid = aiResponse.workshopTitle && Array.isArray(aiResponse.items) &&
                  Array.isArray(aiResponse.facilitationScript) && Array.isArray(aiResponse.sections) &&
                  aiResponse.layoutHints && aiResponse.items.length >= 10;
        break;
      case 'Figma':
        isValid = aiResponse.designSystem && Array.isArray(aiResponse.uiBlocks) &&
                  aiResponse.layout && aiResponse.contentStyle;
        break;
    }

    if (!isValid) {
      throw new Error(`Generated content does not match expected ${destination} structure`);
    }

    console.log('✅ Valid structured content generated for', destination);
    console.log('Content summary:', {
      destination,
      itemCount: aiResponse.items?.length || aiResponse.uiBlocks?.length || 0,
      model: usedModel
    });

    return new Response(JSON.stringify({
      success: true,
      destination,
      content: aiResponse,
      metadata: {
        model: usedModel,
        generatedAt: new Date().toISOString(),
        itemCount: aiResponse.items?.length || aiResponse.uiBlocks?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-destination-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Template and best practices functions
async function getTemplateForContext(framework: string, stage: string, destination: string, tool: string) {
  // UX Tool-specific templates with detailed structures
  const uxToolTemplates = {
    'User Interviews': {
      template: 'user-interviews-session',
      structure: 'interview-workshop',
      sections: ['setup', 'questions', 'notes', 'synthesis'],
      itemCount: [12, 16],
      guidance: `Create comprehensive interview workshop structure:
      
      SECTION 1 - Interview Setup (Y: 100-400): Research objectives (2 items), participant info, timer
      SECTION 2 - Question Guide (Y: 450-850): Background questions (2), behavior questions (2-3), pain point questions (2-3) 
      SECTION 3 - Notes Collection (Y: 900-1500): Direct quotes (2-3), observations (2-3), behaviors (2-3), pain points (2-3)
      SECTION 4 - Synthesis (Y: 1550-1900): Key themes (2-3), insights (2-3), opportunities (2-3)`
    },
    'Empathy Maps': {
      template: 'empathy-map-quadrants',
      structure: 'four-quadrants-centered',
      sections: ['intro', 'quadrants', 'synthesis'],
      itemCount: [14, 18],
      guidance: `Create professional empathy map with centered user:
      
      CENTER: User persona circle (X: 850, Y: 700, size: 200x200)
      THINKS & FEELS (top-left): Internal emotions and thoughts (3-4 items, Y: 520-820)
      SEES (top-right): Environment and influences (3-4 items, Y: 520-820) 
      SAYS & DOES (bottom-left): Observable behavior and quotes (3-4 items, Y: 1020-1220)
      PAINS & GAINS (bottom-right): Frustrations and desires (2-3 each, Y: 1020-1220)
      SYNTHESIS: Key insights and opportunities (Y: 1380-1500)`
    },
    'Brainstorming': {
      template: 'ideation-workshop-structured',
      structure: 'progressive-ideation',
      sections: ['rules', 'crazy8s', 'expansion', 'voting'], 
      itemCount: [20, 25],
      guidance: `Create comprehensive brainstorming workshop:
      
      SECTION 1 - Setup & Rules (Y: 100-400): Challenge statement, 4 brainstorming rules, timer
      SECTION 2 - Crazy 8s (Y: 450-850): 8 sketch boxes for rapid ideation (4x2 grid)
      SECTION 3 - Idea Expansion (Y: 900-1400): All ideas (8-10), build-on ideas (2-3), wild ideas (2-3)
      SECTION 4 - Clustering & Voting (Y: 1450-1850): Themed clusters (3-4), top voted ideas (3-5) with dots`
    },
    'Journey Mapping': {
      template: 'customer-journey-timeline',
      structure: 'horizontal-timeline-stages',
      sections: ['stages', 'touchpoints', 'emotions', 'opportunities'],
      itemCount: [16, 22],
      guidance: `Create detailed customer journey with timeline stages:
      
      STAGES: 5-6 journey stages across horizontal timeline (Awareness, Consideration, Purchase, Use, Support)
      TOUCHPOINTS: 2-3 touchpoints per stage with specific interactions
      EMOTIONS: Emotional journey line with highs/lows mapped to stages
      OPPORTUNITIES: Pain points and improvement opportunities identified per stage`
    },
    'Affinity Mapping': {
      template: 'affinity-clustering-synthesis',
      structure: 'organic-clustering',
      sections: ['data', 'grouping', 'themes', 'insights'],
      itemCount: [18, 25],
      guidance: `Create professional affinity mapping session:
      
      RAW DATA: 12-15 individual data points/observations spread across workspace
      CLUSTERING: Group related items into 4-5 themed clusters with clear boundaries
      THEME HEADERS: Label each cluster with descriptive theme names
      SYNTHESIS: Extract 3-4 key insights and 2-3 actionable opportunities`
    },
    'SWOT Analysis': {
      template: 'swot-matrix-strategic',
      structure: 'four-quadrants-matrix', 
      sections: ['strengths', 'weaknesses', 'opportunities', 'threats'],
      itemCount: [12, 16],
      guidance: `Create structured SWOT analysis matrix:
      
      STRENGTHS (top-left): Internal positive factors (3-4 items)
      WEAKNESSES (top-right): Internal limiting factors (3-4 items)  
      OPPORTUNITIES (bottom-left): External positive factors (3-4 items)
      THREATS (bottom-right): External risk factors (3-4 items)
      Each quadrant clearly labeled with distinct colors and organized layout`
    }
  };

  // Get tool-specific template or fallback to framework/stage mapping
  if (tool && uxToolTemplates[tool]) {
    const toolTemplate = uxToolTemplates[tool];
    return {
      template: toolTemplate.template,
      guidance: toolTemplate.guidance,
      structure: toolTemplate.structure,
      sections: toolTemplate.sections,
      itemCount: toolTemplate.itemCount,
      qualityStandards: getQualityStandards(destination)
    };
  }

  // Fallback to framework/stage mapping for general cases
  const frameworkMapping = {
    'Design Thinking': {
      'Empathize': 'empathy-map-quadrants',
      'Define': 'problem-framing',
      'Ideate': 'ideation-workshop-structured', 
      'Prototype': 'prototype-workshop',
      'Test': 'testing-workshop'
    }
  };

  const fallbackTemplate = frameworkMapping[framework]?.[stage] || 'ideation-workshop-structured';
  
  return {
    template: fallbackTemplate,
    guidance: getTemplateGuidance(fallbackTemplate, destination),
    qualityStandards: getQualityStandards(destination)
  };
}

function getBestPracticesForDestination(destination: string) {
  const practices = {
    'Miro': {
      content: ['≤12 words per sticky', 'One idea per note', 'Use color themes for grouping'],
      layout: ['Grid or cluster arrangement', 'Clear visual hierarchy', 'Logical reading flow'],
      collaboration: ['Voting dots for prioritization', 'Comments for discussion', 'Clear section labels']
    },
    'FigJam': {
      content: ['≤10 words per sticky', 'Workshop-ready format', 'Facilitation guidance included'],
      layout: ['Section-based organization', 'Timer integration', 'Interactive elements'],
      collaboration: ['Real-time voting', 'Audio chat integration', 'Cursor chat ready']
    },
    'Figma': {
      content: ['Component specifications', 'Pixel-perfect measurements', 'Accessibility considerations'],
      layout: ['Design system structure', 'Responsive behaviors', 'Component variants'],
      collaboration: ['Developer handoff ready', 'Style guide included', 'Usage documentation']
    }
  };
  
  return practices[destination] || {};
}

function getTemplateGuidance(template: string, destination: string) {
  const guidance = {
    'empathize-workshop': `Focus on user insights, empathy mapping, and persona development. Include direct user quotes and behavioral observations.
    
    FigJam Structure: Create 3 main sections (User Research, Empathy Map, Key Insights). Distribute 15-20 sticky notes across these sections with specific positioning:
    - User Research section (Y: 450-800): 8-10 stickies with user quotes and observations
    - Empathy Map section (Y: 850-1200): 6-8 stickies organized in quadrants (thinks/feels, sees, says/does, pains/gains)  
    - Key Insights section (Y: 1250-1500): 4-6 synthesis stickies with actionable insights`,
    
    'ideation-workshop': `Emphasize quantity over quality, build on ideas, defer judgment. Include brainstorming rules and facilitation timing.
    
    FigJam Structure: Create 4 main sections (Rules, Divergent Thinking, Idea Clustering, Prioritization). Position 18-25 sticky notes:
    - Rules section (Y: 450-550): 5 brainstorming rule stickies
    - Divergent Thinking (Y: 600-1000): 12-15 diverse idea stickies spread across width
    - Clustering section (Y: 1050-1350): Group similar ideas into 3-4 clusters
    - Prioritization (Y: 1400-1600): 5-8 top-voted ideas with voting dots`,
    
    'design-system-components': 'Create reusable, accessible components with proper specifications. Include variants, states, and usage guidelines.',
    'prototype-workshop': 'Focus on rapid, testable prototypes. Include assumptions to validate and testing approaches.',
    'testing-workshop': 'Structure for feedback collection and synthesis. Include success metrics and iteration planning.'
  };
  
  return guidance[template] || `Professional ${destination} content following UX best practices with structured layout and meaningful content distribution`;
}

function getQualityStandards(destination: string) {
  return {
    accessibility: 'WCAG AA compliant',
    readability: 'Clear, scannable content',
    professional: 'Enterprise-ready appearance',
    actionable: 'Specific, implementable insights',
    collaborative: 'Team-friendly structure'
  };
}