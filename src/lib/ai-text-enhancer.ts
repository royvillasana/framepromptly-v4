/**
 * AI Text Enhancement Service
 * Enhances selected text with AI-powered improvements for knowledge base content
 */

export interface TextEnhancementRequest {
  selectedText: string;
  context?: string;
  enhancementType: 'clarity' | 'detail' | 'professional' | 'comprehensive' | 'structure';
  projectContext?: {
    industry?: string;
    projectGoals?: string[];
    targetAudience?: string;
  };
}

export interface TextEnhancementResult {
  originalText: string;
  enhancedText: string;
  improvements: string[];
  confidence: number;
  enhancementType: string;
}

/**
 * Enhance selected text using AI
 */
export const enhanceTextWithAI = async (request: TextEnhancementRequest): Promise<TextEnhancementResult> => {
  const { selectedText, context, enhancementType, projectContext } = request;
  
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Generate enhancement based on type
    const enhancement = generateEnhancement(selectedText, enhancementType, projectContext);
    
    return {
      originalText: selectedText,
      enhancedText: enhancement.text,
      improvements: enhancement.improvements,
      confidence: enhancement.confidence,
      enhancementType
    };
  } catch (error) {
    console.error('Error enhancing text:', error);
    throw new Error('Failed to enhance text with AI');
  }
};

/**
 * Generate different types of enhancements
 */
const generateEnhancement = (
  text: string, 
  type: TextEnhancementRequest['enhancementType'],
  projectContext?: TextEnhancementRequest['projectContext']
) => {
  const baseImprovements = [];
  let enhancedText = text;
  let confidence = 0.85;

  switch (type) {
    case 'clarity':
      enhancedText = enhanceForClarity(text);
      baseImprovements.push('Improved sentence structure', 'Clarified technical terms', 'Simplified complex phrases');
      confidence = 0.90;
      break;
      
    case 'detail':
      enhancedText = enhanceForDetail(text, projectContext);
      baseImprovements.push('Added specific examples', 'Expanded on key points', 'Included relevant context');
      confidence = 0.87;
      break;
      
    case 'professional':
      enhancedText = enhanceForProfessionalism(text);
      baseImprovements.push('Refined tone and language', 'Improved formal structure', 'Enhanced credibility');
      confidence = 0.92;
      break;
      
    case 'comprehensive':
      enhancedText = enhanceComprehensively(text, projectContext);
      baseImprovements.push('Added comprehensive details', 'Included best practices', 'Expanded methodology');
      confidence = 0.85;
      break;
      
    case 'structure':
      enhancedText = enhanceStructure(text);
      baseImprovements.push('Improved organization', 'Added clear headings', 'Better logical flow');
      confidence = 0.88;
      break;
      
    default:
      enhancedText = enhanceForClarity(text);
      baseImprovements.push('General improvements applied');
  }

  return {
    text: enhancedText,
    improvements: baseImprovements,
    confidence
  };
};

/**
 * Enhance text for clarity
 */
const enhanceForClarity = (text: string): string => {
  // Basic clarity improvements
  let enhanced = text;
  
  // Add clarifying phrases
  if (enhanced.includes('user')) {
    enhanced = enhanced.replace(/\buser\b/g, 'end user');
  }
  
  if (enhanced.includes('research')) {
    enhanced = enhanced.replace(/\bresearch\b/g, 'user research');
  }
  
  // Add specific examples and context
  enhanced += ' This approach ensures clear communication and understanding among all stakeholders involved in the project.';
  
  return enhanced;
};

/**
 * Enhance text with additional details
 */
const enhanceForDetail = (text: string, projectContext?: TextEnhancementRequest['projectContext']): string => {
  let enhanced = text;
  
  // Add industry-specific context if available
  if (projectContext?.industry) {
    enhanced += ` In the context of ${projectContext.industry} projects, this is particularly important because it directly impacts user satisfaction and business outcomes.`;
  }
  
  // Add methodology details
  enhanced += ' Key considerations include: stakeholder alignment, user feedback integration, iterative testing approaches, and measurable success criteria.';
  
  // Add best practices
  enhanced += ' Best practices suggest documenting all decisions and rationale for future reference and team knowledge sharing.';
  
  return enhanced;
};

/**
 * Enhance text for professionalism
 */
const enhanceForProfessionalism = (text: string): string => {
  let enhanced = text;
  
  // Replace casual phrases with professional ones
  enhanced = enhanced.replace(/\bstuff\b/g, 'elements');
  enhanced = enhanced.replace(/\bthing\b/g, 'component');
  enhanced = enhanced.replace(/\bguys\b/g, 'team members');
  enhanced = enhanced.replace(/\bokay\b/g, 'acceptable');
  
  // Add professional framing
  enhanced = `From a strategic perspective, ${enhanced.toLowerCase()}`;
  enhanced += ' This aligns with industry standards and organizational best practices.';
  
  return enhanced;
};

/**
 * Enhance text comprehensively
 */
const enhanceComprehensively = (text: string, projectContext?: TextEnhancementRequest['projectContext']): string => {
  let enhanced = text;
  
  // Add comprehensive framework
  enhanced += ' This encompasses multiple dimensions including: strategic planning, tactical execution, risk management, and success measurement.';
  
  // Add target audience considerations
  if (projectContext?.targetAudience) {
    enhanced += ` Specifically designed for ${projectContext.targetAudience}, this approach considers their unique needs, preferences, and behavioral patterns.`;
  }
  
  // Add implementation details
  enhanced += ' Implementation involves systematic phases: discovery and analysis, design and prototyping, testing and validation, and deployment with continuous monitoring.';
  
  // Add success criteria
  enhanced += ' Success is measured through quantitative metrics (usage, conversion, satisfaction scores) and qualitative feedback (user interviews, usability studies).';
  
  return enhanced;
};

/**
 * Enhance text structure
 */
const enhanceStructure = (text: string): string => {
  // Break text into structured sections
  const sections = text.split('.').filter(s => s.trim().length > 0);
  
  if (sections.length === 1) {
    return `**Overview:** ${text}

**Key Points:**
• Primary focus area identified
• Strategic approach defined
• Implementation pathway established

**Next Steps:**
• Detailed planning and resource allocation
• Stakeholder alignment and communication
• Execution timeline development`;
  }
  
  let structured = '**Summary:** ' + sections[0].trim() + '.\n\n';
  structured += '**Detailed Analysis:**\n';
  
  sections.slice(1).forEach((section, index) => {
    structured += `${index + 1}. ${section.trim()}.\n`;
  });
  
  structured += '\n**Implementation Considerations:**\n';
  structured += '• Resource requirements and timeline\n';
  structured += '• Risk assessment and mitigation strategies\n';
  structured += '• Success metrics and evaluation criteria';
  
  return structured;
};

/**
 * Get suggested enhancement types based on text content
 */
export const getSuggestedEnhancements = (text: string): Array<{
  type: TextEnhancementRequest['enhancementType'];
  label: string;
  description: string;
  icon: string;
}> => {
  const suggestions = [];
  
  // Always suggest clarity
  suggestions.push({
    type: 'clarity',
    label: 'Improve Clarity',
    description: 'Make the text clearer and easier to understand',
    icon: '💡'
  });
  
  // Suggest detail if text is short
  if (text.length < 200) {
    suggestions.push({
      type: 'detail',
      label: 'Add Details',
      description: 'Expand with examples and additional context',
      icon: '📝'
    });
  }
  
  // Suggest professional tone if casual language detected
  if (text.match(/\b(stuff|thing|guys|okay|cool)\b/i)) {
    suggestions.push({
      type: 'professional',
      label: 'Professional Tone',
      description: 'Enhance with professional language and tone',
      icon: '👔'
    });
  }
  
  // Suggest comprehensive if basic content
  if (!text.includes('implementation') && !text.includes('strategy')) {
    suggestions.push({
      type: 'comprehensive',
      label: 'Comprehensive View',
      description: 'Add strategic context and implementation details',
      icon: '🎯'
    });
  }
  
  // Suggest structure if long unstructured text
  if (text.length > 300 && !text.includes('**') && !text.includes('•')) {
    suggestions.push({
      type: 'structure',
      label: 'Improve Structure',
      description: 'Organize content with headings and bullet points',
      icon: '📋'
    });
  }
  
  return suggestions;
};