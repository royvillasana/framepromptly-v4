/**
 * @fileoverview Destination-Specific Prompt Tailors
 * Implements the tailoring logic for each supported destination
 */

import {
  DestinationType,
  DestinationContext,
  DestinationTailor,
  TailoredOutput,
  AIProviderOutput,
  MiroOutput,
  FigJamOutput,
  FigmaOutput,
  ValidationError
} from './destination-driven-tailoring';

/**
 * AI Provider Tailor
 * Goal: Get structured, model-only response for display or system consumption
 */
export class AIProviderTailor extends DestinationTailor {
  destination: DestinationType = 'AI Provider';

  tailorPrompt(context: DestinationContext): string {
    const basePrompt = this.buildBasePrompt(context);
    
    const tailoredPrompt = `${basePrompt}

TASK: Produce a structured analytical response optimized for ${context.aiProvider || 'AI Provider'} consumption.

OUTPUT REQUIREMENTS:
1. SUMMARY: Concise restatement of user intent and key context (2-3 sentences)

2. STRUCTURED RESULT:
   - Organized sections with clear titles and priorities (high/medium/low)
   - Artifact list with specific deliverables and their priorities
   - Actionable insights ready for immediate use
   - Bullet points or numbered lists for easy consumption

3. NEXT STEPS: 
   - Clear, actionable checklist (3-7 items)
   - Prioritized by impact and feasibility
   - Include timeframes where relevant

4. VALIDATION METADATA:
   - Key assumptions made during analysis
   - Potential risks or limitations
   - Evidence needed to confirm/refute key points
   - Up to 5 clarifying questions if request was ambiguous

FORMAT: Structure your response as a comprehensive analysis that can be:
- Displayed directly in the application UI
- Passed to other systems for further processing  
- Used as input for decision-making

CONSTRAINTS:
- Be concise but thorough
- Focus on actionability over theory
- Include priority rankings for all recommendations
- Flag any inferences with [INFERRED] tags`;

    return this.addQualityGuards(tailoredPrompt);
  }

  validateOutput(output: TailoredOutput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (output.type !== 'ai-provider') {
      errors.push('Output type must be "ai-provider"');
    }

    const aiOutput = output as AIProviderOutput;
    
    if (!aiOutput.content?.summary) {
      errors.push('Missing required summary section');
    }
    
    if (!aiOutput.content?.structuredResult?.sections?.length) {
      errors.push('Missing structured result sections');
    }
    
    if (!aiOutput.content?.structuredResult?.nextSteps?.length) {
      errors.push('Missing next steps checklist');
    }
    
    if (!aiOutput.content?.structuredResult?.validation) {
      errors.push('Missing validation metadata (assumptions, risks, evidence)');
    }

    return { valid: errors.length === 0, errors };
  }

  getOutputTemplate(): AIProviderOutput {
    return {
      type: 'ai-provider',
      destination: 'AI Provider',
      content: {
        summary: '',
        structuredResult: {
          sections: [],
          artifacts: [],
          nextSteps: [],
          validation: {
            assumptions: [],
            risks: [],
            evidenceRequired: []
          }
        },
        metadata: {}
      }
    };
  }
}

/**
 * Miro Tailor
 * Goal: Produce board-ready sticky notes, text, and shapes with grid placement
 */
export class MiroTailor extends DestinationTailor {
  destination: DestinationType = 'Miro';

  tailorPrompt(context: DestinationContext): string {
    const basePrompt = this.buildBasePrompt(context);
    
    const tailoredPrompt = `${basePrompt}

TASK: Create Miro board-ready content with sticky notes, text blocks, and shapes optimized for visual collaboration.

OUTPUT REQUIREMENTS:
1. BOARD SUMMARY: 2-3 sentence description of how to read and use the board

2. BOARD ITEMS:
   - STICKY NOTES: Key insights, tasks, or ideas (≤12 words each, one idea per sticky)
   - TEXT BLOCKS: Headers, instructions, or longer explanations  
   - SHAPES: Cluster labels, dividers, or grouping elements
   - Each item needs: type, concise text, theme tag, cluster assignment

3. CLUSTERS:
   - Logical groupings with clear names and descriptions
   - Suggested themes: Research, Persona, Pain-Point, Solution, Action, etc.
   - Map items to clusters for easy affinity mapping

4. LAYOUT HINTS:
   - Grid placement order (row-major: left-to-right, top-to-bottom)
   - Number of columns for optimal viewing
   - Spacing recommendations
   - Reading instructions for stakeholders

CONSTRAINTS:
- Sticky note text: Maximum 12 words, one clear idea each
- Maximum 100 items total (create "Deferred Items" list if needed)
- Include diverse themes for color coding
- Prioritize scanability and visual flow
- Consider remote collaboration needs

FORMAT: Output as structured list ready for board creation with positioning data.`;

    return this.addQualityGuards(tailoredPrompt);
  }

  validateOutput(output: TailoredOutput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (output.type !== 'miro') {
      errors.push('Output type must be "miro"');
    }

    const miroOutput = output as MiroOutput;
    
    if (!miroOutput.content?.boardSummary) {
      errors.push('Missing board summary');
    }
    
    if (!miroOutput.content?.items?.length) {
      errors.push('Missing board items');
    }
    
    // Validate sticky note word limits
    miroOutput.content?.items?.forEach((item, index) => {
      if (item.type === 'sticky' && item.text.split(' ').length > 12) {
        errors.push(`Sticky note ${index} exceeds 12-word limit: "${item.text}"`);
      }
    });
    
    if (miroOutput.content?.items?.length > 100) {
      errors.push('Too many items (max 100). Create deferred items list.');
    }
    
    if (!miroOutput.content?.layout?.columns) {
      errors.push('Missing layout column specification');
    }

    return { valid: errors.length === 0, errors };
  }

  getOutputTemplate(): MiroOutput {
    return {
      type: 'miro',
      destination: 'Miro',
      content: {
        boardSummary: '',
        items: [],
        clusters: [],
        layout: {
          columns: 4,
          spacing: 20,
          readingInstructions: ''
        }
      }
    };
  }
}

/**
 * FigJam Tailor  
 * Goal: Workshop-oriented brainstorming with facilitation support
 */
export class FigJamTailor extends DestinationTailor {
  destination: DestinationType = 'FigJam';

  tailorPrompt(context: DestinationContext): string {
    const basePrompt = this.buildBasePrompt(context);
    
    const tailoredPrompt = `${basePrompt}

TASK: Create FigJam workshop content optimized for collaborative brainstorming and facilitated sessions.

OUTPUT REQUIREMENTS:
1. WORKSHOP TITLE: Engaging, action-oriented session name

2. BRAINSTORMING ITEMS:
   - STICKY NOTES: Divergent ideas, "How might we..." statements (≤10 words each)
   - VARIED PERSPECTIVES: Multiple angles on the same challenge
   - AFFINITY MAPPING READY: Items with impact/effort ratings where applicable

3. FACILITATION SCRIPT:
   - Step-by-step instructions for 15-30 minute exercise
   - Timing for each activity
   - Materials needed
   - Warm-up activities or ice-breakers
   - Clear participant instructions

4. CLUSTERING FRAMEWORK:
   - Suggested affinity groupings with criteria
   - Impact vs. Effort mapping where relevant
   - Category labels for easy sorting
   - Instructions for participants on clustering

5. ASSUMPTIONS & CONTEXT:
   - Domain assumptions clearly marked
   - Required context for participants
   - Backup activities if primary approach fails

CONSTRAINTS:  
- Sticky text: Maximum 10 words, focus on generative thinking
- Emphasize divergent thinking over convergent analysis
- Include facilitation cues and timing
- Design for remote and in-person collaboration
- Provide clear participation guidelines

FORMAT: Ready-to-facilitate workshop with all materials and scripts included.`;

    return this.addQualityGuards(tailoredPrompt);
  }

  validateOutput(output: TailoredOutput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (output.type !== 'figjam') {
      errors.push('Output type must be "figjam"');
    }

    const figJamOutput = output as FigJamOutput;
    
    if (!figJamOutput.content?.workshopTitle) {
      errors.push('Missing workshop title');
    }
    
    if (!figJamOutput.content?.items?.length) {
      errors.push('Missing workshop items');
    }
    
    // Validate sticky note word limits (stricter for FigJam)
    figJamOutput.content?.items?.forEach((item, index) => {
      if (item.type === 'sticky' && item.text.split(' ').length > 10) {
        errors.push(`Sticky note ${index} exceeds 10-word limit: "${item.text}"`);
      }
    });
    
    if (!figJamOutput.content?.facilitationScript?.length) {
      errors.push('Missing facilitation script');
    }
    
    if (!figJamOutput.content?.clusters?.length) {
      errors.push('Missing clustering framework');
    }

    return { valid: errors.length === 0, errors };
  }

  getOutputTemplate(): FigJamOutput {
    return {
      type: 'figjam',
      destination: 'FigJam',
      content: {
        workshopTitle: '',
        items: [],
        facilitationScript: [],
        clusters: [],
        assumptions: []
      }
    };
  }
}

/**
 * Figma Tailor
 * Goal: UI-focused design blocks with sizing and copy specifications
 */
export class FigmaTailor extends DestinationTailor {
  destination: DestinationType = 'Figma';

  tailorPrompt(context: DestinationContext): string {
    const basePrompt = this.buildBasePrompt(context);
    
    const tailoredPrompt = `${basePrompt}

TASK: Create Figma-ready UI design specifications with components, copy, and layout guidance.

OUTPUT REQUIREMENTS:
1. DESIGN SYSTEM CONTEXT: Brief description of design approach and style direction

2. UI BLOCKS/COMPONENTS:
   - COMPONENT TYPES: Hero, Card, Form Row, Navigation, Footer, Content Block, etc.
   - PURPOSE & DESCRIPTION: Clear functional description for each component
   - MICROCOPY: Button text, labels, helper text, placeholder content
   - SIZING SPECIFICATIONS: Preferred width/height, padding, spacing in pixels
   - PRIORITY RANKING: Implementation order and importance

3. LAYOUT RECOMMENDATIONS:
   - Column structure and responsive behavior
   - Spacing systems and grid alignment  
   - Component ordering and hierarchy
   - Auto-layout suggestions

4. CONTENT STYLE GUIDE:
   - Tone of voice and writing style
   - Reading level and accessibility requirements
   - Contrast requirements and label clarity
   - Alt text guidelines for images/icons

5. COPY BLOCKS:
   - Headlines, subheadings, body text
   - Call-to-action text options
   - Form labels and validation messages
   - Navigation and menu text

CONSTRAINTS:
- Focus on frames and text nodes (not sticky notes)
- Include specific pixel measurements for sizing
- Provide realistic copy that fits UI constraints
- Consider mobile and desktop responsive needs
- Include accessibility guidelines
- Handle research-only requests with appropriate UI reduction

FORMAT: Design-ready specifications that can be directly implemented in Figma components.`;

    return this.addQualityGuards(tailoredPrompt);
  }

  validateOutput(output: TailoredOutput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (output.type !== 'figma') {
      errors.push('Output type must be "figma"');
    }

    const figmaOutput = output as FigmaOutput;
    
    if (!figmaOutput.content?.designSystem) {
      errors.push('Missing design system context');
    }
    
    if (!figmaOutput.content?.uiBlocks?.length) {
      errors.push('Missing UI blocks/components');
    }
    
    // Validate UI block specifications
    figmaOutput.content?.uiBlocks?.forEach((block, index) => {
      if (!block.sizing?.preferredWidth || !block.sizing?.preferredHeight) {
        errors.push(`UI block ${index} missing sizing specifications`);
      }
      
      if (!block.copy || Object.keys(block.copy).length === 0) {
        errors.push(`UI block ${index} missing copy specifications`);
      }
    });
    
    if (!figmaOutput.content?.layout) {
      errors.push('Missing layout recommendations');
    }
    
    if (!figmaOutput.content?.contentStyle?.accessibility) {
      errors.push('Missing accessibility guidelines');
    }

    return { valid: errors.length === 0, errors };
  }

  getOutputTemplate(): FigmaOutput {
    return {
      type: 'figma',
      destination: 'Figma',
      content: {
        designSystem: '',
        uiBlocks: [],
        layout: {
          columns: 12,
          spacing: 24,
          ordering: []
        },
        contentStyle: {
          tone: '',
          readingLevel: '',
          accessibility: {
            contrastRequirements: '',
            labelClarity: [],
            altTextGuidelines: ''
          }
        }
      }
    };
  }
}

// Factory function to get the appropriate tailor for a destination
export function getDestinationTailor(destination: DestinationType): DestinationTailor {
  switch (destination) {
    case 'AI Provider':
      return new AIProviderTailor();
    case 'Miro':
      return new MiroTailor();
    case 'FigJam':
      return new FigJamTailor();
    case 'Figma':
      return new FigmaTailor();
    default:
      throw new Error(`Unsupported destination: ${destination}`);
  }
}

// Validation helper function
export function validateDestinationOutput(
  output: TailoredOutput,
  destination: DestinationType
): { valid: boolean; errors: string[] } {
  const tailor = getDestinationTailor(destination);
  return tailor.validateOutput(output);
}