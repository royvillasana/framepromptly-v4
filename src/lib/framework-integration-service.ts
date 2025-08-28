/**
 * @fileoverview Framework Integration Service
 * Integrates research-backed frameworks into the existing workflow system
 */

import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { 
  EnhancedUXFramework, 
  EnhancedUXStage, 
  EnhancedUXTool,
  RESEARCH_BACKED_INSTRUCTIONS 
} from './research-backed-frameworks';
import { COMPREHENSIVE_FRAMEWORK_LIBRARY } from './comprehensive-framework-library';

export interface FrameworkIntegrationOptions {
  includeAccessibilityProtocols: boolean;
  includeResearchBacking: boolean;
  includeComprehensiveInstructions: boolean;
  accessibilityLevel: 'basic' | 'enhanced' | 'comprehensive';
}

/**
 * Service for integrating enhanced frameworks with existing workflow system
 */
export class FrameworkIntegrationService {
  private enhancedFrameworks: Map<string, EnhancedUXFramework>;
  private frameworkMappings: Map<string, string>; // Maps legacy IDs to enhanced IDs

  constructor() {
    this.enhancedFrameworks = new Map();
    this.frameworkMappings = new Map();
    this.initializeFrameworks();
  }

  /**
   * Initialize enhanced frameworks and create mappings
   */
  private initializeFrameworks(): void {
    // Load research-backed frameworks
    Object.entries(RESEARCH_BACKED_INSTRUCTIONS.frameworks).forEach(([id, framework]) => {
      this.enhancedFrameworks.set(id, framework);
    });

    // Load comprehensive framework library
    Object.entries(COMPREHENSIVE_FRAMEWORK_LIBRARY).forEach(([id, framework]) => {
      this.enhancedFrameworks.set(id, framework);
    });

    // Create mappings from legacy framework IDs to enhanced versions
    this.frameworkMappings.set('design-thinking', 'design-thinking-enhanced');
    this.frameworkMappings.set('double-diamond', 'double-diamond-enhanced');
    this.frameworkMappings.set('design-sprint', 'design-sprint-enhanced');
  }

  /**
   * Get enhanced framework by ID or legacy ID
   */
  getEnhancedFramework(frameworkId: string): EnhancedUXFramework | null {
    // Try direct lookup first
    let framework = this.enhancedFrameworks.get(frameworkId);
    
    // If not found, try mapping from legacy ID
    if (!framework && this.frameworkMappings.has(frameworkId)) {
      const enhancedId = this.frameworkMappings.get(frameworkId)!;
      framework = this.enhancedFrameworks.get(enhancedId);
    }

    return framework || null;
  }

  /**
   * Convert enhanced framework to legacy framework format for compatibility
   */
  convertToLegacyFramework(enhanced: EnhancedUXFramework): UXFramework {
    return {
      id: enhanced.id,
      name: enhanced.name,
      description: enhanced.description,
      color: enhanced.color,
      characteristics: enhanced.characteristics,
      stages: enhanced.stages.map(stage => this.convertToLegacyStage(stage))
    };
  }

  /**
   * Convert enhanced stage to legacy stage format
   */
  private convertToLegacyStage(enhanced: EnhancedUXStage): UXStage {
    return {
      id: enhanced.id,
      name: enhanced.name,
      description: enhanced.description,
      position: enhanced.position,
      characteristics: enhanced.characteristics,
      tools: enhanced.tools.map(tool => this.convertToLegacyTool(tool))
    };
  }

  /**
   * Convert enhanced tool to legacy tool format
   */
  private convertToLegacyTool(enhanced: EnhancedUXTool): UXTool {
    return {
      id: enhanced.id,
      name: enhanced.name,
      description: enhanced.description,
      category: enhanced.category,
      icon: enhanced.icon,
      characteristics: enhanced.characteristics
    };
  }

  /**
   * Get comprehensive instructions for a framework
   */
  getFrameworkInstructions(frameworkId: string): EnhancedUXFramework['comprehensiveInstructions'] | null {
    const framework = this.getEnhancedFramework(frameworkId);
    return framework?.comprehensiveInstructions || null;
  }

  /**
   * Get research backing for a framework
   */
  getFrameworkResearchBacking(frameworkId: string): EnhancedUXFramework['researchBacking'] | null {
    const framework = this.getEnhancedFramework(frameworkId);
    return framework?.researchBacking || null;
  }

  /**
   * Get accessibility protocols for a framework
   */
  getAccessibilityProtocols(frameworkId: string): EnhancedUXFramework['researchBacking']['accessibilityProtocols'] | null {
    const framework = this.getEnhancedFramework(frameworkId);
    return framework?.researchBacking.accessibilityProtocols || null;
  }

  /**
   * Generate enhanced prompt context with research backing
   */
  generateEnhancedPromptContext(
    frameworkId: string, 
    stageId: string, 
    toolId: string,
    options: FrameworkIntegrationOptions = {
      includeAccessibilityProtocols: true,
      includeResearchBacking: true,
      includeComprehensiveInstructions: true,
      accessibilityLevel: 'enhanced'
    }
  ): string {
    const framework = this.getEnhancedFramework(frameworkId);
    if (!framework) return '';

    let context = '';

    // Add comprehensive instructions
    if (options.includeComprehensiveInstructions && framework.comprehensiveInstructions) {
      context += `## Framework Overview\n${framework.comprehensiveInstructions.overview}\n\n`;
      context += `## When to Use\n${framework.comprehensiveInstructions.whenToUse.map(item => `- ${item}`).join('\n')}\n\n`;
      context += `## Prerequisites\n${framework.comprehensiveInstructions.prerequisites.map(item => `- ${item}`).join('\n')}\n\n`;
    }

    // Add research backing
    if (options.includeResearchBacking && framework.researchBacking) {
      context += `## Methodology Foundation\n`;
      context += `### Foundational Theory\n${framework.researchBacking.methodology.foundationalTheory.map(item => `- ${item}`).join('\n')}\n\n`;
      context += `### Industry Standards\n${framework.researchBacking.methodology.industryStandards.map(item => `- ${item}`).join('\n')}\n\n`;
    }

    // Add accessibility protocols based on level
    if (options.includeAccessibilityProtocols && framework.researchBacking.accessibilityProtocols) {
      const protocols = framework.researchBacking.accessibilityProtocols;
      
      context += `## Accessibility Requirements\n`;
      
      if (options.accessibilityLevel === 'comprehensive') {
        context += `### Inclusive Design Principles\n${protocols.inclusiveDesign.map(item => `- ${item}`).join('\n')}\n\n`;
        context += `### Accessibility Guidelines\n${protocols.accessibilityGuidelines.map(item => `- ${item}`).join('\n')}\n\n`;
        context += `### Diversity Considerations\n${protocols.diversityConsiderations.map(item => `- ${item}`).join('\n')}\n\n`;
        context += `### Ethical Guidelines\n${protocols.ethicalGuidelines.map(item => `- ${item}`).join('\n')}\n\n`;
      } else if (options.accessibilityLevel === 'enhanced') {
        context += `### Key Accessibility Requirements\n`;
        context += `${protocols.accessibilityGuidelines.slice(0, 3).map(item => `- ${item}`).join('\n')}\n\n`;
        context += `${protocols.inclusiveDesign.slice(0, 2).map(item => `- ${item}`).join('\n')}\n\n`;
      } else {
        context += `### Basic Accessibility\n`;
        context += `- Follow WCAG 2.1 AA standards\n`;
        context += `- Include keyboard navigation\n`;
        context += `- Ensure proper color contrast\n\n`;
      }
    }

    // Add best practices
    if (framework.researchBacking.bestPractices) {
      context += `## Best Practices\n`;
      context += `### Preparation\n${framework.researchBacking.bestPractices.preparation.slice(0, 3).map(item => `- ${item}`).join('\n')}\n\n`;
      context += `### Execution\n${framework.researchBacking.bestPractices.execution.slice(0, 3).map(item => `- ${item}`).join('\n')}\n\n`;
    }

    return context;
  }

  /**
   * Get quality assurance checklist for a framework
   */
  getQualityAssuranceChecklist(frameworkId: string): string[] {
    const framework = this.getEnhancedFramework(frameworkId);
    return framework?.researchBacking.qualityAssurance.qualityChecklist || [];
  }

  /**
   * Get success metrics for a framework
   */
  getSuccessMetrics(frameworkId: string): string[] {
    const framework = this.getEnhancedFramework(frameworkId);
    return framework?.researchBacking.qualityAssurance.successMetrics || [];
  }

  /**
   * Get common pitfalls to avoid for a framework
   */
  getCommonPitfalls(frameworkId: string): string[] {
    const framework = this.getEnhancedFramework(frameworkId);
    return framework?.researchBacking.qualityAssurance.commonPitfalls || [];
  }

  /**
   * Generate accessibility-enhanced tool guidance
   */
  generateAccessibleToolGuidance(toolId: string): string {
    // Check if we have enhanced version of this tool
    const enhancedTool = RESEARCH_BACKED_INSTRUCTIONS.tools[toolId as keyof typeof RESEARCH_BACKED_INSTRUCTIONS.tools];
    
    if (!enhancedTool) {
      return this.generateBasicAccessibilityGuidance();
    }

    let guidance = `## ${enhancedTool.name}\n`;
    guidance += `${enhancedTool.comprehensiveGuidance.purpose}\n\n`;
    
    guidance += `### Accessibility Preparation\n`;
    guidance += `${enhancedTool.comprehensiveGuidance.preparation.materials.filter(item => 
      item.toLowerCase().includes('accessible') || 
      item.toLowerCase().includes('alternative') ||
      item.toLowerCase().includes('format')
    ).map(item => `- ${item}`).join('\n')}\n\n`;

    guidance += `### Inclusive Execution\n`;
    guidance += `${enhancedTool.comprehensiveGuidance.execution.facilitationTips.map(item => `- ${item}`).join('\n')}\n\n`;

    guidance += `### Accessibility Validation\n`;
    guidance += `${enhancedTool.researchBacking.qualityAssurance.qualityChecklist.map(item => `${item}`).join('\n')}\n\n`;

    return guidance;
  }

  /**
   * Generate basic accessibility guidance for tools without enhanced versions
   */
  private generateBasicAccessibilityGuidance(): string {
    return `## Accessibility Guidelines

### Preparation
- Ensure all materials are available in multiple formats
- Set up accessible meeting environments
- Recruit diverse participants including people with disabilities
- Test all technology with assistive devices

### Execution  
- Use inclusive language throughout
- Provide multiple ways to participate
- Allow extra time for responses and processing
- Document accessibility accommodations provided

### Validation
- Test outputs with assistive technologies
- Validate with diverse user groups
- Ensure WCAG 2.1 AA compliance where applicable
- Document accessibility considerations in deliverables`;
  }

  /**
   * Get all available enhanced frameworks
   */
  getAllEnhancedFrameworks(): EnhancedUXFramework[] {
    return Array.from(this.enhancedFrameworks.values());
  }

  /**
   * Check if framework has enhanced version available
   */
  hasEnhancedVersion(frameworkId: string): boolean {
    return this.getEnhancedFramework(frameworkId) !== null;
  }
}

// Export singleton instance
export const frameworkIntegrationService = new FrameworkIntegrationService();