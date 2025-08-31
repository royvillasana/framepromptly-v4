/**
 * AI Prompt Analyzer and Dissection Service
 * 
 * This service analyzes AI-generated prompts before displaying them in chat bubbles,
 * intelligently dissecting content into coherent, meaningful pieces for better
 * user comprehension and interaction.
 */

export interface PromptAnalysisResult {
  segments: AnalyzedSegment[];
  metadata: PromptMetadata;
  recommendations: string[];
  dissectionStrategy: DissectionStrategy;
}

export interface AnalyzedSegment {
  id: string;
  type: SegmentType;
  content: string;
  priority: 'high' | 'medium' | 'low';
  isActionable: boolean;
  relatedSegments?: string[];
  bubbleConfig: BubbleConfiguration;
}

export interface PromptMetadata {
  totalLength: number;
  estimatedReadingTime: number;
  complexity: 'simple' | 'moderate' | 'complex';
  contentType: ContentType[];
  framework?: string;
  stage?: string;
  tool?: string;
  hasInstructions: boolean;
  hasExamples: boolean;
  hasQuestions: boolean;
  hasLists: boolean;
  hasCodeSnippets: boolean;
}

export interface BubbleConfiguration {
  maxLength: number;
  delayMs: number;
  allowSplit: boolean;
  priority: number;
  showTimestamp: boolean;
  enableActions: boolean;
}

export type SegmentType = 
  | 'introduction'     // Opening context/greeting
  | 'instruction'      // Action-oriented steps
  | 'explanation'      // Conceptual information
  | 'example'         // Sample content or demonstrations
  | 'question'        // Questions or prompts for user
  | 'list'            // Enumerated items
  | 'code'            // Code snippets or technical content
  | 'conclusion'      // Summary or closing statements
  | 'transition'      // Connecting text between sections
  | 'emphasis';       // Important highlighted information

export type ContentType = 
  | 'instructional'   // Step-by-step guidance
  | 'educational'     // Learning-focused content
  | 'creative'        // Brainstorming or ideation
  | 'analytical'      // Analysis or evaluation
  | 'collaborative'   // Team-based activities
  | 'technical'       // Implementation details
  | 'strategic';      // Planning or high-level thinking

export type DissectionStrategy = 
  | 'preserve'        // Keep original structure
  | 'logical_break'   // Break at logical boundaries
  | 'sentence_split'  // Split by sentences
  | 'semantic_chunk'  // Group by semantic meaning
  | 'priority_based'  // Order by importance
  | 'progressive';    // Build up complexity gradually

class AIPromptAnalyzer {
  private readonly MAX_BUBBLE_LENGTH = 280; // Optimal for readability
  private readonly MIN_BUBBLE_LENGTH = 50;
  private readonly SENTENCE_ENDINGS = /[.!?]+\s/g;
  private readonly LIST_PATTERNS = /^\s*[\d\w\-\*\+][\.\)\:]?\s+/gm;
  private readonly CODE_PATTERNS = /```[\s\S]*?```|`[^`]+`/g;
  private readonly EMPHASIS_PATTERNS = /\*\*[^*]+\*\*|__[^_]+__|##+\s[^\n]+/g;

  /**
   * Analyzes an AI-generated prompt and determines the best dissection strategy
   */
  public analyzePrompt(
    promptContent: string, 
    context?: {
      framework?: string;
      stage?: string;
      tool?: string;
      userIntent?: string;
      previousContext?: string[];
    }
  ): PromptAnalysisResult {
    console.log('🔍 Analyzing AI prompt:', promptContent.substring(0, 100) + '...');
    
    // Extract basic metadata
    const metadata = this.extractMetadata(promptContent, context);
    console.log('📊 Prompt metadata:', metadata);
    
    // Determine optimal dissection strategy
    const dissectionStrategy = this.determineDissectionStrategy(promptContent, metadata);
    console.log('🧩 Dissection strategy:', dissectionStrategy);
    
    // Perform content analysis and segmentation
    const segments = this.segmentContent(promptContent, dissectionStrategy, metadata);
    console.log('📝 Generated segments:', segments.length);
    
    // Generate improvement recommendations
    const recommendations = this.generateRecommendations(segments, metadata);
    
    return {
      segments,
      metadata,
      recommendations,
      dissectionStrategy
    };
  }

  /**
   * Converts analyzed segments into chat bubble format
   */
  public convertToChatBubbles(analysisResult: PromptAnalysisResult): Array<{
    content: string;
    delay: number;
    metadata: {
      type: SegmentType;
      priority: 'high' | 'medium' | 'low';
      isActionable: boolean;
      segmentId: string;
    };
  }> {
    const bubbles: Array<{
      content: string;
      delay: number;
      metadata: {
        type: SegmentType;
        priority: 'high' | 'medium' | 'low';
        isActionable: boolean;
        segmentId: string;
      };
    }> = [];

    // Sort segments by priority and logical flow
    const sortedSegments = this.sortSegmentsByFlow(analysisResult.segments);
    
    let cumulativeDelay = 0;
    
    sortedSegments.forEach((segment, index) => {
      const bubbleContent = this.formatSegmentForBubble(segment);
      
      // Calculate delay based on content length and type
      const baseDelay = segment.bubbleConfig.delayMs;
      const contentDelay = Math.max(300, bubbleContent.length * 20); // 20ms per character
      const delay = Math.min(baseDelay + contentDelay, 3000); // Cap at 3 seconds
      
      cumulativeDelay += delay;
      
      bubbles.push({
        content: bubbleContent,
        delay: index === 0 ? 300 : delay, // First bubble appears quickly
        metadata: {
          type: segment.type,
          priority: segment.priority,
          isActionable: segment.isActionable,
          segmentId: segment.id
        }
      });
    });

    console.log('💬 Generated chat bubbles:', bubbles.length, 'with total delay:', cumulativeDelay + 'ms');
    return bubbles;
  }

  private extractMetadata(
    content: string, 
    context?: {
      framework?: string;
      stage?: string;
      tool?: string;
      userIntent?: string;
    }
  ): PromptMetadata {
    const wordCount = content.split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 WPM average
    
    const hasInstructions = /^\s*\d+\.|\*\s|Step \d+|First|Next|Then|Finally/im.test(content);
    const hasExamples = /example|sample|instance|such as|for example|e\.g\./i.test(content);
    const hasQuestions = /\?/g.test(content);
    const hasLists = this.LIST_PATTERNS.test(content);
    const hasCodeSnippets = this.CODE_PATTERNS.test(content);
    
    // Determine complexity based on structure and length
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (content.length > 1000 || (hasInstructions && hasExamples && hasLists)) {
      complexity = 'complex';
    } else if (content.length > 500 || hasInstructions || hasLists) {
      complexity = 'moderate';
    }

    // Determine content types
    const contentTypes: ContentType[] = [];
    if (hasInstructions) contentTypes.push('instructional');
    if (hasExamples) contentTypes.push('educational');
    if (/brainstorm|idea|creative|innovative/i.test(content)) contentTypes.push('creative');
    if (/analyze|evaluate|assess|review/i.test(content)) contentTypes.push('analytical');
    if (/team|collaborate|group|together/i.test(content)) contentTypes.push('collaborative');
    if (hasCodeSnippets || /implement|code|technical|api/i.test(content)) contentTypes.push('technical');
    if (/strategy|plan|roadmap|vision/i.test(content)) contentTypes.push('strategic');

    return {
      totalLength: content.length,
      estimatedReadingTime,
      complexity,
      contentType: contentTypes.length > 0 ? contentTypes : ['educational'],
      framework: context?.framework,
      stage: context?.stage,
      tool: context?.tool,
      hasInstructions,
      hasExamples,
      hasQuestions,
      hasLists,
      hasCodeSnippets
    };
  }

  private determineDissectionStrategy(content: string, metadata: PromptMetadata): DissectionStrategy {
    // Preserve structure for short, well-formatted content
    if (metadata.totalLength < 300 && metadata.complexity === 'simple') {
      return 'preserve';
    }

    // Use logical breaks for structured instructional content
    if (metadata.hasInstructions && metadata.hasLists) {
      return 'logical_break';
    }

    // Use semantic chunking for complex analytical content
    if (metadata.complexity === 'complex' && metadata.contentType.includes('analytical')) {
      return 'semantic_chunk';
    }

    // Use priority-based for strategic or planning content
    if (metadata.contentType.includes('strategic')) {
      return 'priority_based';
    }

    // Use progressive building for educational content
    if (metadata.contentType.includes('educational') && metadata.hasExamples) {
      return 'progressive';
    }

    // Default to sentence splitting for general content
    return 'sentence_split';
  }

  private segmentContent(
    content: string, 
    strategy: DissectionStrategy, 
    metadata: PromptMetadata
  ): AnalyzedSegment[] {
    switch (strategy) {
      case 'preserve':
        return this.preserveStructure(content, metadata);
      case 'logical_break':
        return this.logicalBreakSegmentation(content, metadata);
      case 'semantic_chunk':
        return this.semanticChunking(content, metadata);
      case 'priority_based':
        return this.priorityBasedSegmentation(content, metadata);
      case 'progressive':
        return this.progressiveSegmentation(content, metadata);
      case 'sentence_split':
      default:
        return this.sentenceSplitSegmentation(content, metadata);
    }
  }

  private preserveStructure(content: string, metadata: PromptMetadata): AnalyzedSegment[] {
    return [{
      id: 'preserved-content',
      type: 'instruction',
      content: content.trim(),
      priority: 'high',
      isActionable: metadata.hasInstructions,
      bubbleConfig: {
        maxLength: content.length,
        delayMs: 500,
        allowSplit: false,
        priority: 1,
        showTimestamp: true,
        enableActions: true
      }
    }];
  }

  private logicalBreakSegmentation(content: string, metadata: PromptMetadata): AnalyzedSegment[] {
    const segments: AnalyzedSegment[] = [];
    
    // Split by numbered lists, headers, or clear section breaks
    const sectionBreaks = content.split(/(?=^\s*(?:\d+\.|#{1,6}\s|[A-Z][^.!?]*:))/m);
    
    sectionBreaks.forEach((section, index) => {
      if (section.trim().length < this.MIN_BUBBLE_LENGTH) return;
      
      const type = this.classifySegmentType(section);
      const priority = type === 'instruction' ? 'high' : type === 'example' ? 'medium' : 'low';
      
      segments.push({
        id: `logical-${index}`,
        type,
        content: section.trim(),
        priority,
        isActionable: /^\s*\d+\.|\*\s/.test(section),
        bubbleConfig: {
          maxLength: this.MAX_BUBBLE_LENGTH,
          delayMs: 400,
          allowSplit: section.length > this.MAX_BUBBLE_LENGTH,
          priority: index + 1,
          showTimestamp: true,
          enableActions: true
        }
      });
    });

    return segments;
  }

  private semanticChunking(content: string, metadata: PromptMetadata): AnalyzedSegment[] {
    const segments: AnalyzedSegment[] = [];
    const sentences = content.split(this.SENTENCE_ENDINGS).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return;
      
      // Check if adding this sentence would exceed optimal length
      if (currentChunk.length + trimmedSentence.length > this.MAX_BUBBLE_LENGTH && currentChunk) {
        // Finalize current chunk
        segments.push({
          id: `semantic-${chunkIndex}`,
          type: this.classifySegmentType(currentChunk),
          content: currentChunk.trim(),
          priority: this.determinePriority(currentChunk),
          isActionable: this.isActionableContent(currentChunk),
          bubbleConfig: this.createBubbleConfig(currentChunk.length, chunkIndex)
        });
        
        currentChunk = trimmedSentence;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    });
    
    // Add final chunk
    if (currentChunk.trim()) {
      segments.push({
        id: `semantic-${chunkIndex}`,
        type: this.classifySegmentType(currentChunk),
        content: currentChunk.trim(),
        priority: this.determinePriority(currentChunk),
        isActionable: this.isActionableContent(currentChunk),
        bubbleConfig: this.createBubbleConfig(currentChunk.length, chunkIndex)
      });
    }
    
    return segments;
  }

  private priorityBasedSegmentation(content: string, metadata: PromptMetadata): AnalyzedSegment[] {
    const segments: AnalyzedSegment[] = [];
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    paragraphs.forEach((paragraph, index) => {
      const type = this.classifySegmentType(paragraph);
      const priority = this.determinePriority(paragraph);
      
      segments.push({
        id: `priority-${index}`,
        type,
        content: paragraph.trim(),
        priority,
        isActionable: this.isActionableContent(paragraph),
        bubbleConfig: this.createBubbleConfig(paragraph.length, priority === 'high' ? 0 : priority === 'medium' ? 1 : 2)
      });
    });
    
    // Sort by priority
    return segments.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private progressiveSegmentation(content: string, metadata: PromptMetadata): AnalyzedSegment[] {
    const segments: AnalyzedSegment[] = [];
    
    // First, identify and extract different content types
    const introMatch = content.match(/^[^.!?]*[.!?]/);
    const instructions = content.match(/^\s*\d+\..*$/gm) || [];
    const examples = this.extractExamples(content);
    const questions = content.match(/[^.!?]*\?[^.!?]*/g) || [];
    
    let segmentIndex = 0;
    
    // Add introduction first
    if (introMatch) {
      segments.push({
        id: `progressive-intro-${segmentIndex++}`,
        type: 'introduction',
        content: introMatch[0].trim(),
        priority: 'high',
        isActionable: false,
        bubbleConfig: this.createBubbleConfig(introMatch[0].length, 0)
      });
    }
    
    // Add instructions progressively
    instructions.forEach((instruction, index) => {
      segments.push({
        id: `progressive-instruction-${segmentIndex++}`,
        type: 'instruction',
        content: instruction.trim(),
        priority: 'high',
        isActionable: true,
        bubbleConfig: this.createBubbleConfig(instruction.length, index + 1)
      });
    });
    
    // Add examples
    examples.forEach((example, index) => {
      segments.push({
        id: `progressive-example-${segmentIndex++}`,
        type: 'example',
        content: example.trim(),
        priority: 'medium',
        isActionable: false,
        bubbleConfig: this.createBubbleConfig(example.length, instructions.length + index + 1)
      });
    });
    
    // Add questions last
    questions.forEach((question, index) => {
      segments.push({
        id: `progressive-question-${segmentIndex++}`,
        type: 'question',
        content: question.trim(),
        priority: 'medium',
        isActionable: true,
        bubbleConfig: this.createBubbleConfig(question.length, instructions.length + examples.length + index + 1)
      });
    });
    
    return segments;
  }

  private sentenceSplitSegmentation(content: string, metadata: PromptMetadata): AnalyzedSegment[] {
    const segments: AnalyzedSegment[] = [];
    const sentences = content.split(this.SENTENCE_ENDINGS).filter(s => s.trim().length > 0);
    
    let currentGroup = '';
    let groupIndex = 0;
    
    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return;
      
      if (currentGroup.length + trimmedSentence.length <= this.MAX_BUBBLE_LENGTH) {
        currentGroup += (currentGroup ? '. ' : '') + trimmedSentence;
      } else {
        if (currentGroup) {
          segments.push({
            id: `sentence-group-${groupIndex}`,
            type: this.classifySegmentType(currentGroup),
            content: currentGroup.trim(),
            priority: this.determinePriority(currentGroup),
            isActionable: this.isActionableContent(currentGroup),
            bubbleConfig: this.createBubbleConfig(currentGroup.length, groupIndex)
          });
          groupIndex++;
        }
        currentGroup = trimmedSentence;
      }
    });
    
    if (currentGroup.trim()) {
      segments.push({
        id: `sentence-group-${groupIndex}`,
        type: this.classifySegmentType(currentGroup),
        content: currentGroup.trim(),
        priority: this.determinePriority(currentGroup),
        isActionable: this.isActionableContent(currentGroup),
        bubbleConfig: this.createBubbleConfig(currentGroup.length, groupIndex)
      });
    }
    
    return segments;
  }

  private classifySegmentType(content: string): SegmentType {
    const lowerContent = content.toLowerCase();
    
    if (/^\s*\d+\.|\*\s|step \d+|first|next|then|finally/i.test(content)) {
      return 'instruction';
    }
    if (/example|sample|instance|such as|for example|e\.g\./i.test(content)) {
      return 'example';
    }
    if (/\?/.test(content)) {
      return 'question';
    }
    if (this.CODE_PATTERNS.test(content)) {
      return 'code';
    }
    if (this.EMPHASIS_PATTERNS.test(content)) {
      return 'emphasis';
    }
    if (/^(introduction|overview|background|context)/i.test(content)) {
      return 'introduction';
    }
    if (/(conclusion|summary|in summary|to conclude|finally)/i.test(content)) {
      return 'conclusion';
    }
    if (this.LIST_PATTERNS.test(content)) {
      return 'list';
    }
    if (/(however|therefore|consequently|as a result)/i.test(content)) {
      return 'transition';
    }
    
    return 'explanation';
  }

  private determinePriority(content: string): 'high' | 'medium' | 'low' {
    // Instructions and actionable content are high priority
    if (/^\s*\d+\.|\*\s|step \d+/i.test(content) || this.isActionableContent(content)) {
      return 'high';
    }
    
    // Examples and questions are medium priority
    if (/example|sample|\?/i.test(content)) {
      return 'medium';
    }
    
    // Everything else is low priority
    return 'low';
  }

  private isActionableContent(content: string): boolean {
    return /create|generate|build|design|list|define|analyze|evaluate|identify|develop|implement|execute|perform|conduct/i.test(content);
  }

  private createBubbleConfig(contentLength: number, index: number): BubbleConfiguration {
    return {
      maxLength: Math.min(contentLength, this.MAX_BUBBLE_LENGTH),
      delayMs: Math.max(300, Math.min(1000, contentLength * 15)), // 15ms per character
      allowSplit: contentLength > this.MAX_BUBBLE_LENGTH,
      priority: index,
      showTimestamp: true,
      enableActions: true
    };
  }

  private extractExamples(content: string): string[] {
    const examples: string[] = [];
    
    // Look for "for example" patterns
    const exampleMatches = content.match(/for example[^.!?]*[.!?]/gi) || [];
    examples.push(...exampleMatches);
    
    // Look for "such as" patterns
    const suchAsMatches = content.match(/such as[^.!?]*[.!?]/gi) || [];
    examples.push(...suchAsMatches);
    
    // Look for quoted examples
    const quotedMatches = content.match(/"[^"]+"/g) || [];
    examples.push(...quotedMatches);
    
    return examples;
  }

  private sortSegmentsByFlow(segments: AnalyzedSegment[]): AnalyzedSegment[] {
    // Define the optimal flow order
    const typeOrder: Record<SegmentType, number> = {
      introduction: 0,
      instruction: 1,
      explanation: 2,
      list: 3,
      example: 4,
      code: 5,
      question: 6,
      emphasis: 7,
      transition: 8,
      conclusion: 9
    };

    return segments.sort((a, b) => {
      // First sort by type order
      const typeComparison = typeOrder[a.type] - typeOrder[b.type];
      if (typeComparison !== 0) return typeComparison;
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityComparison !== 0) return priorityComparison;
      
      // Finally by bubble config priority
      return a.bubbleConfig.priority - b.bubbleConfig.priority;
    });
  }

  private formatSegmentForBubble(segment: AnalyzedSegment): string {
    let content = segment.content;
    
    // Clean up formatting for better bubble display
    content = content.replace(/\n{3,}/g, '\n\n'); // Reduce excessive line breaks
    content = content.replace(/\s{2,}/g, ' '); // Reduce excessive spaces
    content = content.trim();
    
    // Add type-specific formatting
    switch (segment.type) {
      case 'instruction':
        // Ensure instructions are clear and actionable
        if (!/^(create|generate|build|design|list|define|analyze)/i.test(content)) {
          content = content.replace(/^/, '→ ');
        }
        break;
      case 'example':
        // Add visual cue for examples
        if (!/^(example|for example|e\.g\.)/i.test(content)) {
          content = `💡 Example: ${content}`;
        }
        break;
      case 'question':
        // Ensure questions stand out
        if (!content.endsWith('?')) {
          content += '?';
        }
        break;
    }
    
    return content;
  }

  private generateRecommendations(segments: AnalyzedSegment[], metadata: PromptMetadata): string[] {
    const recommendations: string[] = [];
    
    if (segments.length > 6) {
      recommendations.push('Consider consolidating some segments for better flow');
    }
    
    if (segments.filter(s => s.isActionable).length === 0) {
      recommendations.push('Add more actionable instructions for better user engagement');
    }
    
    if (metadata.complexity === 'complex' && !metadata.hasExamples) {
      recommendations.push('Add examples to help clarify complex concepts');
    }
    
    if (segments.filter(s => s.type === 'question').length === 0) {
      recommendations.push('Consider adding questions to encourage user interaction');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const aiPromptAnalyzer = new AIPromptAnalyzer();