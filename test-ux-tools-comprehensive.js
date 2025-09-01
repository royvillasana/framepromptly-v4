/**
 * Comprehensive UX Tools AI Stress Test
 * Tests all frameworks, stages, and tools with AI prompt generation and execution
 */

import completeUXFrameworks from './src/lib/complete-ux-frameworks.js';
// Note: This will be run in the browser context, so we'll handle imports differently

// Define comprehensive HealthConnect project context
const HEALTHCONNECT_PROJECT_CONTEXT = {
  projectName: "HealthConnect - Telemedicine Platform",
  description: "A comprehensive telemedicine platform that connects patients with healthcare providers for virtual consultations, prescription management, and health monitoring.",
  
  // Comprehensive knowledge base content
  knowledgeBase: {
    userResearch: `
• Primary User Segments:
  - Patients (ages 25-75): Seeking convenient healthcare access, medication management, chronic condition monitoring
  - Healthcare Providers: Doctors, nurses, specialists looking for efficient patient communication and remote monitoring tools
  - Care Coordinators: Managing multiple patient cases and facilitating provider-patient connections

• Key User Pain Points (from 47 user interviews):
  - Patients struggle with scheduling appointments (avg 2.3 weeks wait time)
  - 73% of patients find current prescription refill process confusing
  - Healthcare providers spend 40% of their time on administrative tasks vs patient care
  - Limited visibility into patient health status between visits
  - Fragmented communication across different healthcare touchpoints

• User Behavioral Patterns:
  - 89% of users prefer mobile-first interactions for scheduling and messaging
  - Peak usage hours: 7-9 AM and 6-8 PM (before/after work)
  - Users abandon complex workflows after 3+ steps (68% drop-off rate)
  - Trust is critical: 94% want clear privacy/security indicators
  - Older patients (65+) prefer voice calls over text-based communication
    `,
    
    businessRequirements: `
• Primary Business Goals:
  - Reduce patient wait times by 60% through virtual consultations
  - Increase provider efficiency by 35% through automation
  - Achieve 90% patient satisfaction score within 12 months
  - Generate $2.5M ARR by end of Year 2
  - Expand to serve 50,000+ patients across 3 states

• Technical Constraints:
  - HIPAA compliance mandatory for all patient data handling
  - Integration required with Epic, Cerner, and Allscripts EHR systems
  - Must support both web and mobile platforms (iOS/Android)
  - 99.9% uptime requirement for critical health monitoring features
  - Maximum 2-second page load times

• Regulatory Requirements:
  - FDA guidelines for digital therapeutics
  - State medical licensing compliance for cross-state consultations
  - DEA requirements for electronic prescribing
  - ADA accessibility compliance (WCAG 2.1 AA)

• Success Metrics:
  - Patient Net Promoter Score (target: 70+)
  - Provider adoption rate (target: 85% of invited providers active within 90 days)
  - Consultation completion rate (target: 95%)
  - Time to prescription fulfillment (target: under 24 hours)
  - Platform uptime (target: 99.9%)
    `,
    
    domainExpertise: `
• Healthcare Industry Context:
  - Telemedicine adoption accelerated 3800% during COVID-19 pandemic
  - Remote Patient Monitoring market expected to reach $31.3B by 2025
  - Average telehealth visit costs $79 vs $176 for in-person visits
  - 76% of patients are willing to use telemedicine for non-emergency care
  - Key competitors: Teladoc ($22.4B market cap), Amwell, MDLive, Doctor on Demand

• Clinical Workflow Requirements:
  - Standard consultation workflow: Intake → Triage → Provider Review → Consultation → Follow-up
  - Emergency escalation protocols must be clearly defined and tested
  - Prescription workflows must include drug interaction checking
  - Clinical documentation must integrate with existing EHR systems
  - Quality metrics tracking for clinical outcomes and patient safety

• Technology Stack Context:
  - Frontend: React Native for mobile, React for web dashboard
  - Backend: Node.js/Express with PostgreSQL database
  - Real-time communication: WebRTC for video calls, Socket.io for messaging
  - Cloud infrastructure: AWS with encrypted data storage
  - Integration layer: FHIR-compliant APIs for EHR connectivity
    `,
    
    teamContext: `
• Team Composition:
  - 2 Senior UX Designers (5+ years healthcare experience)
  - 1 UX Researcher (clinical psychology background)
  - 3 Product Managers (1 clinical, 2 technical)
  - 8 Engineers (4 frontend, 3 backend, 1 DevOps)
  - 1 Compliance Officer (HIPAA/regulatory expertise)
  - 2 Clinical Advisors (practicing physicians)

• Project Timeline:
  - Phase 1: MVP for basic consultations (6 months)
  - Phase 2: Prescription management and EHR integration (4 months)
  - Phase 3: Remote monitoring and advanced features (6 months)
  - Current status: End of Phase 1, entering Phase 2

• Organizational Constraints:
  - Limited budget for user testing ($50K allocated for Year 1)
  - Regulatory approval processes add 2-3 months to feature releases
  - Clinical advisors available 10 hours/week for user research validation
  - Must coordinate with hospital IT departments for integration testing
    `
  },
  
  // Define frameworks and tools to test
  frameworks: {
    designThinking: {
      id: 'design-thinking',
      name: 'Design Thinking',
      stages: {
        empathize: { id: 'empathize', name: 'Empathize' },
        define: { id: 'define', name: 'Define' },
        ideate: { id: 'ideate', name: 'Ideate' },
        prototype: { id: 'prototype', name: 'Prototype' },
        test: { id: 'test', name: 'Test' }
      }
    }
  }
};

// Priority UX tools to test
const PRIORITY_TOOLS = [
  { id: 'personas', name: 'User Personas', stage: 'empathize' },
  { id: 'user-interviews', name: 'User Interviews', stage: 'empathize' },
  { id: 'problem-statements', name: 'Problem Statements', stage: 'define' },
  { id: 'journey-maps', name: 'Customer Journey Maps', stage: 'empathize' },
  { id: 'brainstorming', name: 'Brainstorming', stage: 'ideate' },
  { id: 'wireframes', name: 'Wireframes', stage: 'prototype' },
  { id: 'usability-tests', name: 'Usability Testing', stage: 'test' },
  { id: 'affinity-mapping', name: 'Affinity Mapping', stage: 'define' }
];

// Comprehensive knowledge base content string for injection
const COMPREHENSIVE_KNOWLEDGE_CONTEXT = `
${HEALTHCONNECT_PROJECT_CONTEXT.knowledgeBase.userResearch}

${HEALTHCONNECT_PROJECT_CONTEXT.knowledgeBase.businessRequirements}

${HEALTHCONNECT_PROJECT_CONTEXT.knowledgeBase.domainExpertise}

${HEALTHCONNECT_PROJECT_CONTEXT.knowledgeBase.teamContext}
`.trim();

/**
 * Generate AI prompt for a specific UX tool
 */
function generateToolPrompt(toolConfig) {
  const framework = HEALTHCONNECT_PROJECT_CONTEXT.frameworks.designThinking;
  const stage = framework.stages[toolConfig.stage];
  const tool = {
    id: toolConfig.id,
    name: toolConfig.name
  };

  const context = {
    framework,
    stage,
    tool,
    projectContext: COMPREHENSIVE_KNOWLEDGE_CONTEXT
  };

  // Generate the specific instructions using our enhanced system
  const instructions = generateToolSpecificInstructions(context);
  
  return {
    toolId: toolConfig.id,
    toolName: toolConfig.name,
    generatedPrompt: instructions.promptTemplate.replace(
      '[Insert all relevant project knowledge base content here - user research, business context, industry constraints, target audience, etc.]',
      COMPREHENSIVE_KNOWLEDGE_CONTEXT
    ),
    metadata: {
      framework: framework.name,
      stage: stage.name,
      tool: tool.name,
      contextualGuidance: instructions.contextualGuidance,
      qualityChecks: instructions.qualityChecks,
      expectedOutputFormat: instructions.expectedOutputFormat
    }
  };
}

/**
 * Execute comprehensive test of all priority tools
 */
function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive UX Tools AI Prompt System Test');
  console.log(`📋 Project Context: ${HEALTHCONNECT_PROJECT_CONTEXT.projectName}`);
  console.log(`🔧 Testing ${PRIORITY_TOOLS.length} priority UX tools\n`);

  const results = [];

  PRIORITY_TOOLS.forEach((toolConfig, index) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🛠️  TEST ${index + 1}/${PRIORITY_TOOLS.length}: ${toolConfig.name.toUpperCase()}`);
    console.log(`${'='.repeat(80)}`);
    
    try {
      const result = generateToolPrompt(toolConfig);
      
      console.log(`✅ Generated AI prompt for ${result.toolName}`);
      console.log(`📊 Framework: ${result.metadata.framework} > ${result.metadata.stage}`);
      console.log(`📝 Prompt length: ${result.generatedPrompt.length} characters`);
      console.log(`🎯 Quality checks: ${result.metadata.qualityChecks.length} criteria`);
      
      // Display the first 500 characters of the generated prompt
      console.log(`\n📄 GENERATED AI PROMPT (Preview):`);
      console.log(`${'-'.repeat(50)}`);
      console.log(result.generatedPrompt.substring(0, 500) + '...\n');
      
      results.push({
        success: true,
        ...result,
        qualityAssessment: {
          hasProjectContext: result.generatedPrompt.includes('HealthConnect'),
          hasUserResearch: result.generatedPrompt.includes('user interviews'),
          hasBusinessRequirements: result.generatedPrompt.includes('HIPAA'),
          hasProfessionalRole: result.generatedPrompt.includes('15+ years'),
          hasValidationCriteria: result.metadata.qualityChecks.length > 0,
          isCopyPasteReady: result.generatedPrompt.includes('You are')
        }
      });
      
    } catch (error) {
      console.error(`❌ Failed to generate prompt for ${toolConfig.name}:`, error);
      results.push({
        success: false,
        toolId: toolConfig.id,
        toolName: toolConfig.name,
        error: error.message
      });
    }
  });

  // Generate comprehensive summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log(`${'='.repeat(80)}`);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log(`\n🎯 QUALITY ASSESSMENT:`);
    successful.forEach(result => {
      const qa = result.qualityAssessment;
      console.log(`\n${result.toolName}:`);
      console.log(`  • Project Context: ${qa.hasProjectContext ? '✅' : '❌'}`);
      console.log(`  • User Research: ${qa.hasUserResearch ? '✅' : '❌'}`);
      console.log(`  • Business Requirements: ${qa.hasBusinessRequirements ? '✅' : '❌'}`);
      console.log(`  • Professional Role: ${qa.hasProfessionalRole ? '✅' : '❌'}`);
      console.log(`  • Validation Criteria: ${qa.hasValidationCriteria ? '✅' : '❌'}`);
      console.log(`  • Copy-Paste Ready: ${qa.isCopyPasteReady ? '✅' : '❌'}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED TOOLS:`);
    failed.forEach(result => {
      console.log(`  • ${result.toolName}: ${result.error}`);
    });
  }
  
  return results;
}

// Export for use in other modules
export { runComprehensiveTest, generateToolPrompt, HEALTHCONNECT_PROJECT_CONTEXT, PRIORITY_TOOLS };

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTest();
}