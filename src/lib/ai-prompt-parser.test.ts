/**
 * AI Prompt Parser Tests
 *
 * Comprehensive test suite for the AI prompt parser
 */

import { describe, it, expect } from 'vitest';
import {
  parseAIPromptToStructured,
  hasStandardStructure,
  estimateParsingConfidence,
} from './ai-prompt-parser';

describe('parseAIPromptToStructured', () => {
  describe('Standard 6-section prompts', () => {
    it('should parse a complete prompt with all 6 sections', () => {
      const input = `# Role & Expertise
You are a senior UX researcher with expertise in user interviews.

---

## Project Context
Working on a mobile banking app for millennials. Target audience: ages 25-35.

---

## Specific Task
Conduct user interviews to understand pain points in the current onboarding flow.

---

## Quality Standards & Constraints
Ensure interviews follow ethical research practices. Maintain confidentiality.

---

## Output Format
Provide a detailed interview report with key insights and quotes.

---

## Examples & Guidance
Example question: "Can you walk me through your last experience opening a bank account?"`;

      const result = parseAIPromptToStructured(input, 'User Interviews');

      expect(result.role_section.content).toContain('senior UX researcher');
      expect(result.context_section.content).toContain('mobile banking app');
      expect(result.task_section.content).toContain('Conduct user interviews');
      expect(result.constraints_section.content).toContain('ethical research');
      expect(result.format_section.content).toContain('interview report');
      expect(result.examples_section?.content).toContain('Example question');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.warnings.length).toBe(0);
    });

    it('should parse prompt with ## headers (no # for role)', () => {
      const input = `## Role & Expertise
You are an expert UX designer.

## Context
Working on e-commerce website redesign.

## Task
Create wireframes for checkout flow.

## Constraints
Must be mobile-responsive and accessible.

## Format
Deliver wireframes in Figma format.`;

      const result = parseAIPromptToStructured(input, 'Wireframing');

      expect(result.role_section.content).toContain('expert UX designer');
      expect(result.context_section.content).toContain('e-commerce');
      expect(result.task_section.content).toContain('wireframes');
    });

    it('should handle prompts without separators (---)', () => {
      const input = `# Role
UX professional specializing in personas.

## Project Context
Healthcare app for elderly users.

## Task
Create 3-5 detailed user personas.

## Quality Standards
Each persona should include demographics, goals, and pain points.

## Output Format
Use persona template provided in knowledge base.`;

      const result = parseAIPromptToStructured(input, 'Personas');

      expect(result.role_section.content).toContain('UX professional');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Missing sections (with fallbacks)', () => {
    it('should handle missing examples section (optional)', () => {
      const input = `# Role
Expert researcher.

## Context
Mobile app project.

## Task
Conduct usability testing.

## Constraints
Follow WCAG guidelines.

## Format
Deliver test results in report format.`;

      const result = parseAIPromptToStructured(input, 'Usability Testing');

      expect(result.examples_section).toBeNull();
      expect(result.role_section.content).toContain('Expert researcher');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should use fallback for missing role section', () => {
      const input = `## Project Context
Working on SaaS dashboard redesign.

## Task
Create journey map for power users.

## Constraints
Focus on enterprise features.

## Format
Visual journey map with touchpoints.`;

      const result = parseAIPromptToStructured(input, 'Journey Maps');

      expect(result.role_section.content).toContain('Journey Maps');
      expect(result.warnings).toContain('Role section not found - used fallback');
      expect(result.confidence).toBeLessThan(0.9);
    });

    it('should use fallback for multiple missing sections', () => {
      const input = `You are a UX expert specializing in research.

Working on a fitness app for beginners.

Create detailed user personas based on research data.`;

      const result = parseAIPromptToStructured(input, 'User Personas');

      expect(result.role_section.content).toBeTruthy();
      expect(result.context_section.content).toBeTruthy();
      expect(result.task_section.content).toBeTruthy();
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Content-based fallback detection', () => {
    it('should detect role from "you are" pattern', () => {
      const input = `You are an expert UX designer with 10 years of experience in fintech.

This project involves redesigning a payment flow.

Create mockups for the new design.`;

      const result = parseAIPromptToStructured(input, 'Design');

      expect(result.role_section.content).toContain('expert UX designer');
    });

    it('should detect context from variables/brackets', () => {
      const input = `Expert designer role here.

Working on [project_name] with target audience of [target_users]. Project timeline is [timeline].

Design a new feature.`;

      const result = parseAIPromptToStructured(input, 'Feature Design');

      expect(result.context_section.content).toContain('[project_name]');
      expect(result.context_section.content).toContain('[target_users]');
    });

    it('should detect task from action verbs', () => {
      const input = `You are a researcher.

Project context here.

Create comprehensive user personas including demographics, goals, behaviors, and pain points.

Ensure quality standards.

Deliver in PDF format.`;

      const result = parseAIPromptToStructured(input, 'Personas');

      expect(result.task_section.content).toContain('Create comprehensive');
    });

    it('should detect constraints from quality keywords', () => {
      const input = `Expert role.

Context info.

Design task.

Ensure all designs follow WCAG 2.1 AA standards and must be mobile-responsive.

Output in Figma.`;

      const result = parseAIPromptToStructured(input, 'Design');

      expect(result.constraints_section.content).toContain('Ensure all designs');
    });

    it('should detect format from structure keywords', () => {
      const input = `Role.

Context.

Task.

Quality.

Deliver output in markdown format with clear headings and bullet points.`;

      const result = parseAIPromptToStructured(input, 'Documentation');

      expect(result.format_section.content).toContain('markdown format');
    });

    it('should detect examples from code blocks', () => {
      const input = `# Role
Expert coder.

## Task
Write functions.

## Format
Code format.

\`\`\`typescript
function example() {
  return "sample";
}
\`\`\``;

      const result = parseAIPromptToStructured(input, 'Coding');

      expect(result.examples_section?.content).toContain('function example');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty or very short prompts', () => {
      const result = parseAIPromptToStructured('', 'Test Tool');

      expect(result.role_section.content).toBeTruthy();
      expect(result.context_section.content).toBeTruthy();
      expect(result.task_section.content).toBeTruthy();
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should handle prompts with unusual header formats', () => {
      const input = `# Role and Expertise
Expert designer.

## Project Background
App redesign.

## Objective
Create mockups.

## Requirements
High quality needed.

## Deliverable Format
Figma files.`;

      const result = parseAIPromptToStructured(input, 'Design');

      expect(result.role_section.content).toContain('Expert designer');
      expect(result.context_section.content).toContain('App redesign');
      expect(result.task_section.content).toContain('mockups');
    });

    it('should clean section content (remove separators)', () => {
      const input = `# Role
Expert researcher
---

## Context
---
Project context here
---

## Task
Research task
---`;

      const result = parseAIPromptToStructured(input, 'Research');

      expect(result.role_section.content).not.toContain('---');
      expect(result.context_section.content).not.toContain('---');
      expect(result.task_section.content).not.toContain('---');
    });

    it('should handle prompts with extra whitespace', () => {
      const input = `# Role


Expert designer


## Context


Project here


## Task


Design something`;

      const result = parseAIPromptToStructured(input, 'Design');

      expect(result.role_section.content).not.toMatch(/\n{3,}/);
      expect(result.context_section.content).not.toMatch(/\n{3,}/);
    });

    it('should handle mixed case headers', () => {
      const input = `# ROLE & EXPERTISE
Expert here.

## project context
Context here.

## Specific TASK
Task here.`;

      const result = parseAIPromptToStructured(input, 'Mixed');

      expect(result.role_section.content).toContain('Expert here');
      expect(result.context_section.content).toContain('Context here');
      expect(result.task_section.content).toContain('Task here');
    });
  });

  describe('Confidence scoring', () => {
    it('should have high confidence for well-structured prompts', () => {
      const input = `# Role
Expert.

## Context
Context.

## Task
Task.

## Constraints
Constraints.

## Format
Format.`;

      const result = parseAIPromptToStructured(input, 'Test');

      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should have lower confidence when using fallbacks', () => {
      const input = `Some text without clear structure.`;

      const result = parseAIPromptToStructured(input, 'Test');

      expect(result.confidence).toBeLessThan(0.7);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should record warnings for each fallback used', () => {
      const input = `## Context
Only context provided.`;

      const result = parseAIPromptToStructured(input, 'Test');

      expect(result.warnings).toContain('Role section not found - used fallback');
      expect(result.warnings).toContain('Task section not found - used fallback');
      expect(result.warnings.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Parser version tracking', () => {
    it('should include parser version in result', () => {
      const result = parseAIPromptToStructured('Test', 'Tool');

      expect(result.parser_version).toBe('1.0.0');
    });
  });
});

describe('hasStandardStructure', () => {
  it('should return true for prompts with 4+ section headers', () => {
    const input = `# Role
Test

## Context
Test

## Task
Test

## Constraints
Test`;

    expect(hasStandardStructure(input)).toBe(true);
  });

  it('should return false for prompts with <4 section headers', () => {
    const input = `# Role
Test

## Context
Test`;

    expect(hasStandardStructure(input)).toBe(false);
  });

  it('should return false for plain text without headers', () => {
    const input = 'This is just plain text without any markdown headers.';

    expect(hasStandardStructure(input)).toBe(false);
  });
});

describe('estimateParsingConfidence', () => {
  it('should estimate high confidence for structured text', () => {
    const input = `# Role

## Context

Task: create something

Constraints: quality standards

Format: output structure`;

    const confidence = estimateParsingConfidence(input);

    expect(confidence).toBeGreaterThan(0.7);
  });

  it('should estimate low confidence for unstructured text', () => {
    const input = 'Random text without structure or keywords.';

    const confidence = estimateParsingConfidence(input);

    expect(confidence).toBeLessThan(0.5);
  });

  it('should give partial confidence for some structure', () => {
    const input = `# Heading

Some role and context information here.`;

    const confidence = estimateParsingConfidence(input);

    expect(confidence).toBeGreaterThan(0.3);
    expect(confidence).toBeLessThan(0.8);
  });
});

describe('Real-world examples', () => {
  it('should parse a real user personas prompt', () => {
    const input = `# AI Role & Expertise

You are a senior UX researcher with deep expertise in user personas creation, qualitative research analysis, and behavioral psychology.

---

## Project Context

Working on a project with the following context:

Target Audience: [target_audience]
Project Goals: [project_goals]
Key Constraints: [constraints]

---

## Specific Task

Create detailed user personas based on the research data provided. Include:
- Demographics and background
- Goals and motivations
- Pain points and frustrations
- Behavioral patterns
- Technology proficiency

---

## Quality Standards & Constraints

- Base personas on actual research data
- Include 3-5 distinct personas
- Ensure each persona is realistic and actionable
- Follow UX best practices for persona creation

---

## Output Format

Structure each persona as:
1. Name and photo placeholder
2. Demographics (age, location, occupation)
3. Background story
4. Goals (what they want to achieve)
5. Pain points (current frustrations)
6. Quote (representing their mindset)`;

    const result = parseAIPromptToStructured(input, 'User Personas');

    expect(result.role_section.content).toContain('senior UX researcher');
    expect(result.context_section.content).toContain('[target_audience]');
    expect(result.task_section.content).toContain('demographics and background');
    expect(result.constraints_section.content).toContain('3-5 distinct personas');
    expect(result.format_section.content).toContain('Demographics');
    expect(result.examples_section).toBeNull(); // No examples in this prompt
    expect(result.confidence).toBeGreaterThan(0.95);
    expect(result.warnings.length).toBe(0);
  });

  it('should parse a real journey map prompt', () => {
    const input = `# Role & Expertise

You are an expert UX designer specializing in customer journey mapping with experience across multiple industries.

## Project Context

Creating a journey map for [product_type] targeting [target_users].

## Specific Task

Develop a comprehensive customer journey map that includes:
- Customer touchpoints
- User actions at each stage
- Emotions and pain points
- Opportunities for improvement

## Quality Standards

Ensure the journey map is:
- Based on real user research
- Visually clear and easy to understand
- Actionable for the design team

## Output Format

Deliver as a visual diagram with:
1. Stages of the journey
2. Customer actions
3. Touchpoints
4. Emotional journey line
5. Pain points and opportunities

## Examples

Example touchpoint: "User visits website homepage"
Example emotion: "Confused about where to start"`;

    const result = parseAIPromptToStructured(input, 'Journey Maps');

    expect(result.role_section.content).toContain('customer journey mapping');
    expect(result.context_section.content).toContain('[product_type]');
    expect(result.task_section.content).toContain('touchpoints');
    expect(result.constraints_section.content).toContain('real user research');
    expect(result.format_section.content).toContain('visual diagram');
    expect(result.examples_section?.content).toContain('Example touchpoint');
    expect(result.confidence).toBeGreaterThan(0.95);
  });
});
