/**
 * Utility functions for formatting and cleaning text content
 * Enhanced with AI prompt analysis and intelligent dissection
 */

import { aiPromptAnalyzer, type PromptAnalysisResult } from './ai-prompt-analyzer';

/**
 * Strips markdown and special formatting characters from text for display in chat bubbles
 * Removes: *, #, **, ***, _, __, [](links), `code`, ```code blocks```
 */
export function stripMarkdownFormatting(text: string): string {
  if (!text || typeof text !== 'string') return text;

  return text
    // Remove code blocks (```...``` or `...`)
    .replace(/```[\s\S]*?```/g, (match) => {
      // Extract content from code blocks and remove backticks
      return match.replace(/```.*?\n?/g, '').replace(/```/g, '');
    })
    .replace(/`([^`]+)`/g, '$1')
    
    // Remove headers (# ## ### etc.)
    .replace(/^#+\s*/gm, '')
    
    // Remove bold and italic formatting
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Bold italic
    .replace(/\*\*(.+?)\*\*/g, '$1')     // Bold
    .replace(/\*(.+?)\*/g, '$1')         // Italic
    .replace(/___(.+?)___/g, '$1')       // Bold italic (underscores)
    .replace(/__(.+?)__/g, '$1')         // Bold (underscores)
    .replace(/_(.+?)_/g, '$1')           // Italic (underscores)
    
    // Remove links but keep the text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    
    // Remove bullet points and list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, '\n\n')  // Normalize double line breaks
    .replace(/\s+/g, ' ')         // Collapse multiple spaces
    .trim();
}

/**
 * Preserves basic structure but removes special characters for chat display
 * Keeps line breaks and paragraphs but removes markdown syntax
 */
export function formatForChatDisplay(text: string): string {
  if (!text || typeof text !== 'string') return text;

  return text
    // Remove code blocks but preserve content with minimal formatting
    .replace(/```[\s\S]*?```/g, (match) => {
      const content = match.replace(/```.*?\n?/g, '').replace(/```/g, '');
      return content.trim();
    })
    .replace(/`([^`]+)`/g, '$1')
    
    // Remove headers but keep the text with line breaks
    .replace(/^#+\s*(.+)$/gm, '$1\n')
    
    // Remove formatting but keep content
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    
    // Convert bullet points to simple format
    .replace(/^\s*[-*+]\s+(.+)/gm, '• $1')
    .replace(/^\s*(\d+)\.\s+(.+)/gm, '$1. $2')
    
    // Remove unwanted characters from AI generated prompts
    .replace(/[#\-_]+/g, '')  // Remove #, -, _ characters
    
    // Normalize whitespace but preserve structure
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Enhanced bubble generation interface that includes metadata
 */
export interface ChatBubble {
  content: string;
  delay: number;
  metadata: {
    type: string;
    priority: 'high' | 'medium' | 'low';
    isActionable: boolean;
    segmentId: string;
  };
}

/**
 * Splits AI response into multiple conversation bubbles based on intelligent analysis
 * Uses AI prompt analyzer to create coherent, meaningful bubble dissections
 */
export function splitIntoConversationBubbles(
  text: string,
  context?: {
    framework?: string;
    stage?: string;
    tool?: string;
    userIntent?: string;
    previousContext?: string[];
  }
): string[] {
  if (!text || typeof text !== 'string') return [text];

  // First, check if we should use the intelligent analyzer
  if (shouldUseIntelligentAnalysis(text)) {
    console.log('🧠 Using AI prompt analyzer for bubble dissection');
    return createIntelligentBubbles(text, context);
  }

  // Fall back to legacy splitting for simple content
  console.log('📝 Using legacy bubble splitting');
  return createLegacyBubbles(text);
}

/**
 * Creates intelligently analyzed chat bubbles with metadata
 */
export function createAnalyzedChatBubbles(
  text: string,
  context?: {
    framework?: string;
    stage?: string;
    tool?: string;
    userIntent?: string;
    previousContext?: string[];
  }
): ChatBubble[] {
  if (!text || typeof text !== 'string') {
    return [{
      content: text || '',
      delay: 300,
      metadata: {
        type: 'unknown',
        priority: 'medium',
        isActionable: false,
        segmentId: 'fallback'
      }
    }];
  }

  console.log('🔬 Creating analyzed chat bubbles for content:', text.substring(0, 100) + '...');

  try {
    // Analyze the prompt using the AI analyzer
    const analysisResult = aiPromptAnalyzer.analyzePrompt(text, context);
    console.log('📊 Analysis complete:', analysisResult.segments.length, 'segments found');

    // Convert to chat bubbles with enhanced metadata
    const bubbles = aiPromptAnalyzer.convertToChatBubbles(analysisResult);
    
    // Apply additional formatting for chat display
    return bubbles.map(bubble => ({
      ...bubble,
      content: formatForChatDisplay(bubble.content)
    }));
  } catch (error) {
    console.error('❌ Error in prompt analysis, falling back to legacy:', error);
    
    // Fallback to simple bubbles if analysis fails
    const legacyBubbles = createLegacyBubbles(text);
    return legacyBubbles.map((content, index) => ({
      content,
      delay: 300 + (index * 400),
      metadata: {
        type: 'legacy',
        priority: 'medium' as const,
        isActionable: /create|generate|build|design|list|define|analyze|evaluate|identify|develop|implement|execute|perform|conduct/i.test(content),
        segmentId: `legacy-${index}`
      }
    }));
  }
}

/**
 * Determines if content should use intelligent analysis or legacy splitting
 */
function shouldUseIntelligentAnalysis(text: string): boolean {
  // Use intelligent analysis for:
  // - Longer content (>200 characters)
  // - Content with structure (instructions, examples, lists)
  // - Content with multiple sentences
  
  if (text.length < 200) {
    return false;
  }
  
  const hasStructure = /^\s*\d+\.|\*\s|Step \d+|first|next|then|finally|example|for example/im.test(text);
  const hasMultipleSentences = (text.match(/[.!?]+/g) || []).length > 2;
  const hasComplexContent = /create|generate|build|design|list|define|analyze|evaluate|identify|develop|implement|execute|perform|conduct/i.test(text);
  
  return hasStructure || hasMultipleSentences || hasComplexContent;
}

/**
 * Creates intelligently analyzed bubbles
 */
function createIntelligentBubbles(
  text: string,
  context?: {
    framework?: string;
    stage?: string;
    tool?: string;
    userIntent?: string;
    previousContext?: string[];
  }
): string[] {
  try {
    const analysisResult = aiPromptAnalyzer.analyzePrompt(text, context);
    const bubbles = aiPromptAnalyzer.convertToChatBubbles(analysisResult);
    
    return bubbles.map(bubble => formatForChatDisplay(bubble.content));
  } catch (error) {
    console.error('Error in intelligent bubble creation:', error);
    return createLegacyBubbles(text);
  }
}

/**
 * Creates legacy-style bubbles (original implementation)
 */
function createLegacyBubbles(text: string): string[] {
  // Clean the text first
  const cleanedText = formatForChatDisplay(text);
  
  // Split by double line breaks (paragraph breaks) or numbered sections
  const sections = cleanedText
    .split(/\n\s*\n+/)  // Split on double line breaks
    .map(section => section.trim())
    .filter(section => section.length > 0);

  // If we have sections, return them as separate bubbles
  if (sections.length > 1) {
    return sections;
  }

  // If no clear sections, try to split by numbered lists (1., 2., etc.)
  const numberedSections = cleanedText.split(/(?=\d+\.\s)/);
  if (numberedSections.length > 1 && numberedSections[0].trim().length > 0) {
    return numberedSections
      .map(section => section.trim())
      .filter(section => section.length > 0);
  }

  // If still no clear splits, look for headers or major topic changes
  const headerSections = cleanedText.split(/(?=^[A-Z][^.]*:)/m);
  if (headerSections.length > 1) {
    return headerSections
      .map(section => section.trim())
      .filter(section => section.length > 0);
  }

  // If no logical splits found, return as single bubble
  return [cleanedText];
}