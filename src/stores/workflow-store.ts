import { create } from 'zustand';
import { Node, Edge, Connection } from '@xyflow/react';

export interface UXFramework {
  id: string;
  name: string;
  description: string;
  stages: UXStage[];
  color: string;
}

export interface UXStage {
  id: string;
  name: string;
  description: string;
  tools: UXTool[];
  position: { x: number; y: number };
}

export interface UXTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface WorkflowState {
  // Workflow Builder State
  nodes: Node[];
  edges: Edge[];
  selectedFramework: UXFramework | null;
  selectedStage: UXStage | null;
  
  // Available Resources
  frameworks: UXFramework[];
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNode: (id: string, data: any) => void;
  selectFramework: (framework: UXFramework) => void;
  selectStage: (stage: UXStage) => void;
  initializeFrameworks: () => void;
}

// Complete UX frameworks data with all stages and tools
const sampleFrameworks: UXFramework[] = [
  {
    id: 'design-thinking',
    name: 'Design Thinking',
    description: 'Human-centered approach to innovation',
    color: '#8B5CF6',
    stages: [
      {
        id: 'empathize',
        name: 'Empathize',
        description: 'Understand user needs and context',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'user-interviews', name: 'User Interviews', description: 'Conduct in-depth user interviews', category: 'Research', icon: 'MessageCircle' },
          { id: 'surveys', name: 'Surveys', description: 'Collect quantitative data', category: 'Research', icon: 'BarChart' },
          { id: 'observations', name: 'Observations', description: 'Observe users in their environment', category: 'Research', icon: 'Eye' },
          { id: 'empathy-maps', name: 'Empathy Maps', description: 'Visualize user thoughts and feelings', category: 'Analysis', icon: 'Heart' }
        ]
      },
      {
        id: 'define',
        name: 'Define',
        description: 'Frame the problem clearly',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'personas', name: 'Personas', description: 'Create user personas', category: 'Definition', icon: 'User' },
          { id: 'journey-maps', name: 'Journey Maps', description: 'Map user journeys', category: 'Definition', icon: 'Map' },
          { id: 'affinity-mapping', name: 'Affinity Mapping', description: 'Group related insights', category: 'Analysis', icon: 'Grid' },
          { id: 'problem-statements', name: 'Problem Statements', description: 'Define core problems', category: 'Definition', icon: 'Target' }
        ]
      },
      {
        id: 'ideate',
        name: 'Ideate',
        description: 'Generate creative solutions',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'brainstorming', name: 'Brainstorming', description: 'Generate creative ideas', category: 'Ideation', icon: 'Lightbulb' },
          { id: 'how-might-we', name: 'How Might We', description: 'Frame opportunity questions', category: 'Ideation', icon: 'HelpCircle' },
          { id: 'scamper', name: 'SCAMPER', description: 'Systematic creative thinking', category: 'Ideation', icon: 'Zap' },
          { id: 'crazy-8s', name: 'Crazy 8s', description: 'Rapid sketching exercise', category: 'Ideation', icon: 'PenTool' }
        ]
      },
      {
        id: 'prototype',
        name: 'Prototype',
        description: 'Build testable solutions',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'wireframes', name: 'Wireframes', description: 'Create low-fidelity prototypes', category: 'Prototyping', icon: 'Square' },
          { id: 'mockups', name: 'Mockups', description: 'Create high-fidelity designs', category: 'Prototyping', icon: 'Smartphone' },
          { id: 'sketching', name: 'Sketching', description: 'Quick idea visualization', category: 'Prototyping', icon: 'Edit' },
          { id: 'storyboards', name: 'Storyboards', description: 'Visualize user scenarios', category: 'Prototyping', icon: 'Film' }
        ]
      },
      {
        id: 'test',
        name: 'Test',
        description: 'Validate solutions with users',
        position: { x: 800, y: 0 },
        tools: [
          { id: 'usability-tests', name: 'Usability Tests', description: 'Test with real users', category: 'Testing', icon: 'Users' },
          { id: 'ab-tests', name: 'A/B Tests', description: 'Compare design variants', category: 'Testing', icon: 'ToggleLeft' },
          { id: 'analytics-review', name: 'Analytics Review', description: 'Analyze usage data', category: 'Testing', icon: 'TrendingUp' },
          { id: 'feedback-sessions', name: 'Feedback Sessions', description: 'Gather user feedback', category: 'Testing', icon: 'MessageSquare' }
        ]
      }
    ]
  },
  {
    id: 'double-diamond',
    name: 'Double Diamond',
    description: 'Divergent and convergent thinking process',
    color: '#06B6D4',
    stages: [
      {
        id: 'discover',
        name: 'Discover',
        description: 'Explore the problem space broadly',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'stakeholder-interviews', name: 'Stakeholder Interviews', description: 'Interview key stakeholders', category: 'Research', icon: 'MessageCircle' },
          { id: 'contextual-inquiry', name: 'Contextual Inquiry', description: 'Observe users in context', category: 'Research', icon: 'Eye' },
          { id: 'competitive-analysis', name: 'Competitive Analysis', description: 'Analyze competitors', category: 'Research', icon: 'BarChart3' },
          { id: 'desk-research', name: 'Desk Research', description: 'Secondary research', category: 'Research', icon: 'BookOpen' }
        ]
      },
      {
        id: 'define-dd',
        name: 'Define',
        description: 'Synthesize insights and define the challenge',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'synthesis-workshops', name: 'Synthesis Workshops', description: 'Collaborative insight generation', category: 'Definition', icon: 'Users' },
          { id: 'problem-framing', name: 'Problem Framing', description: 'Frame the core problem', category: 'Definition', icon: 'Target' },
          { id: 'insight-statements', name: 'Insight Statements', description: 'Key insight documentation', category: 'Definition', icon: 'FileText' },
          { id: 'design-principles', name: 'Design Principles', description: 'Define guiding principles', category: 'Definition', icon: 'Compass' }
        ]
      },
      {
        id: 'develop',
        name: 'Develop',
        description: 'Create and iterate on potential solutions',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'concept-sketches', name: 'Concept Sketches', description: 'Sketch solution concepts', category: 'Development', icon: 'PenTool' },
          { id: 'prototyping-dd', name: 'Prototyping', description: 'Build testable prototypes', category: 'Development', icon: 'Box' },
          { id: 'co-creation', name: 'Co-creation', description: 'Collaborative design sessions', category: 'Development', icon: 'Users' },
          { id: 'service-blueprints', name: 'Service Blueprints', description: 'Map service interactions', category: 'Development', icon: 'GitBranch' }
        ]
      },
      {
        id: 'deliver',
        name: 'Deliver',
        description: 'Launch and iterate based on real-world feedback',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'pilot-testing', name: 'Pilot Testing', description: 'Test in real environment', category: 'Delivery', icon: 'PlayCircle' },
          { id: 'implementation-plans', name: 'Implementation Plans', description: 'Plan rollout strategy', category: 'Delivery', icon: 'Calendar' },
          { id: 'success-metrics', name: 'Success Metrics', description: 'Define success measures', category: 'Delivery', icon: 'TrendingUp' },
          { id: 'feedback-loops', name: 'Feedback Loops', description: 'Continuous improvement', category: 'Delivery', icon: 'RotateCcw' }
        ]
      }
    ]
  },
  {
    id: 'google-design-sprint',
    name: 'Google Design Sprint',
    description: '5-day process for rapid prototyping and validation',
    color: '#F59E0B',
    stages: [
      {
        id: 'understand',
        name: 'Understand',
        description: 'Build understanding of the challenge',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'expert-interviews', name: 'Expert Interviews', description: 'Interview internal experts', category: 'Research', icon: 'MessageCircle' },
          { id: 'user-journeys', name: 'User Journeys', description: 'Map current user journeys', category: 'Research', icon: 'Map' },
          { id: 'lightning-demos', name: 'Lightning Demos', description: 'Review existing solutions', category: 'Research', icon: 'Zap' },
          { id: 'hmw-questions', name: 'HMW Questions', description: 'Generate opportunity questions', category: 'Research', icon: 'HelpCircle' }
        ]
      },
      {
        id: 'sketch',
        name: 'Sketch',
        description: 'Generate solution ideas individually',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'crazy-8s-sprint', name: 'Crazy 8s', description: 'Rapid idea sketching', category: 'Ideation', icon: 'PenTool' },
          { id: 'solution-sketch', name: 'Solution Sketch', description: 'Detailed solution concepts', category: 'Ideation', icon: 'Edit' },
          { id: 'four-step-sketch', name: 'Four Step Sketch', description: 'Structured sketching process', category: 'Ideation', icon: 'Grid' },
          { id: 'heat-map-voting', name: 'Heat Map Voting', description: 'Vote on promising ideas', category: 'Ideation', icon: 'ThumbsUp' }
        ]
      },
      {
        id: 'decide',
        name: 'Decide',
        description: 'Choose the best solution to prototype',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'decision-matrix', name: 'Decision Matrix', description: 'Systematic solution evaluation', category: 'Decision', icon: 'Grid' },
          { id: 'storyboarding', name: 'Storyboarding', description: 'Map user experience flow', category: 'Decision', icon: 'Film' },
          { id: 'dot-voting', name: 'Dot Voting', description: 'Democratic decision making', category: 'Decision', icon: 'Circle' },
          { id: 'assumption-mapping', name: 'Assumption Mapping', description: 'Identify key assumptions', category: 'Decision', icon: 'Target' }
        ]
      },
      {
        id: 'prototype-sprint',
        name: 'Prototype',
        description: 'Build a realistic prototype',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'high-fidelity-mockup', name: 'High-Fidelity Mockup', description: 'Realistic prototype', category: 'Prototyping', icon: 'Smartphone' },
          { id: 'facade-prototype', name: 'Facade Prototype', description: 'Surface-level prototype', category: 'Prototyping', icon: 'Square' },
          { id: 'interactive-prototype', name: 'Interactive Prototype', description: 'Clickable prototype', category: 'Prototyping', icon: 'MousePointer' },
          { id: 'prototype-assets', name: 'Prototype Assets', description: 'Supporting materials', category: 'Prototyping', icon: 'Package' }
        ]
      },
      {
        id: 'validate',
        name: 'Validate',
        description: 'Test with real users',
        position: { x: 800, y: 0 },
        tools: [
          { id: 'customer-testing', name: 'Customer Testing', description: 'One-on-one user tests', category: 'Testing', icon: 'Users' },
          { id: 'feedback-analysis', name: 'Feedback Analysis', description: 'Synthesize test findings', category: 'Testing', icon: 'BarChart' },
          { id: 'learning-synthesis', name: 'Learning Synthesis', description: 'Document key learnings', category: 'Testing', icon: 'BookOpen' },
          { id: 'next-steps', name: 'Next Steps', description: 'Plan follow-up actions', category: 'Testing', icon: 'ArrowRight' }
        ]
      }
    ]
  },
  {
    id: 'human-centered-design',
    name: 'Human-Centered Design',
    description: 'People-first approach to innovation',
    color: '#EF4444',
    stages: [
      {
        id: 'hear',
        name: 'Hear',
        description: 'Listen to and learn from people',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'empathy-map-hcd', name: 'Empathy Map', description: 'Capture user thoughts and feelings', category: 'Research', icon: 'Heart' },
          { id: 'contextual-interviews', name: 'Contextual Interviews', description: 'In-context user interviews', category: 'Research', icon: 'MessageCircle' },
          { id: 'participant-observation', name: 'Participant Observation', description: 'Immersive observation', category: 'Research', icon: 'Eye' },
          { id: 'community-mapping', name: 'Community Mapping', description: 'Map community dynamics', category: 'Research', icon: 'Map' }
        ]
      },
      {
        id: 'create',
        name: 'Create',
        description: 'Generate solutions through ideation',
        position: { x: 300, y: 0 },
        tools: [
          { id: 'ideation-workshops', name: 'Ideation Workshops', description: 'Collaborative idea generation', category: 'Ideation', icon: 'Lightbulb' },
          { id: 'prototyping-hcd', name: 'Prototyping', description: 'Build and test ideas quickly', category: 'Prototyping', icon: 'Box' },
          { id: 'co-design', name: 'Co-design', description: 'Design with users', category: 'Ideation', icon: 'Users' },
          { id: 'rapid-prototyping', name: 'Rapid Prototyping', description: 'Quick prototype iteration', category: 'Prototyping', icon: 'Zap' }
        ]
      },
      {
        id: 'deliver',
        name: 'Deliver',
        description: 'Implement sustainable solutions',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'pilot-launch', name: 'Pilot Launch', description: 'Small-scale implementation', category: 'Implementation', icon: 'PlayCircle' },
          { id: 'impact-assessment', name: 'Impact Assessment', description: 'Measure solution impact', category: 'Evaluation', icon: 'TrendingUp' },
          { id: 'scaling-strategy', name: 'Scaling Strategy', description: 'Plan for growth', category: 'Implementation', icon: 'ArrowUp' },
          { id: 'sustainability-plan', name: 'Sustainability Plan', description: 'Long-term viability', category: 'Implementation', icon: 'Repeat' }
        ]
      }
    ]
  },
  {
    id: 'jobs-to-be-done',
    name: 'Jobs-to-Be-Done',
    description: 'Understand customer motivations and needs',
    color: '#10B981',
    stages: [
      {
        id: 'job-mapping',
        name: 'Job Mapping',
        description: 'Map the customer job process',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'job-steps', name: 'Job Steps', description: 'Break down job into steps', category: 'Mapping', icon: 'List' },
          { id: 'job-statements', name: 'Job Statements', description: 'Define functional jobs', category: 'Definition', icon: 'FileText' },
          { id: 'job-executor-map', name: 'Job Executor Map', description: 'Identify who does the job', category: 'Mapping', icon: 'User' },
          { id: 'job-ecosystem', name: 'Job Ecosystem', description: 'Map supporting ecosystem', category: 'Mapping', icon: 'Globe' }
        ]
      },
      {
        id: 'outcomes',
        name: 'Outcomes',
        description: 'Identify desired outcomes',
        position: { x: 300, y: 0 },
        tools: [
          { id: 'desired-outcomes', name: 'Desired Outcome Statements', description: 'Define success metrics', category: 'Definition', icon: 'Target' },
          { id: 'outcome-prioritization', name: 'Outcome Prioritization', description: 'Rank outcome importance', category: 'Analysis', icon: 'BarChart' },
          { id: 'satisfaction-gaps', name: 'Satisfaction Gaps', description: 'Find improvement opportunities', category: 'Analysis', icon: 'Gap' },
          { id: 'emotional-jobs', name: 'Emotional Jobs', description: 'Identify emotional needs', category: 'Definition', icon: 'Heart' }
        ]
      },
      {
        id: 'solutions',
        name: 'Solutions',
        description: 'Generate solutions aligned with jobs',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'concept-generation', name: 'Concept Generation', description: 'Create solution concepts', category: 'Ideation', icon: 'Lightbulb' },
          { id: 'solution-prioritization', name: 'Prioritization', description: 'Rank solution potential', category: 'Analysis', icon: 'ArrowUp' },
          { id: 'job-solution-fit', name: 'Job-Solution Fit', description: 'Validate solution alignment', category: 'Validation', icon: 'CheckCircle' },
          { id: 'roadmap-planning', name: 'Roadmap Planning', description: 'Plan solution delivery', category: 'Planning', icon: 'Calendar' }
        ]
      }
    ]
  },
  {
    id: 'lean-ux',
    name: 'Lean UX',
    description: 'Iterative, hypothesis-driven design',
    color: '#8B5CF6',
    stages: [
      {
        id: 'hypothesize',
        name: 'Hypothesize',
        description: 'Form testable assumptions',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'hypothesis-canvas', name: 'Hypothesis Canvas', description: 'Structure hypothesis formation', category: 'Planning', icon: 'FileText' },
          { id: 'assumption-mapping-lean', name: 'Assumption Mapping', description: 'Map and prioritize assumptions', category: 'Planning', icon: 'Map' },
          { id: 'problem-hypothesis', name: 'Problem Hypothesis', description: 'Define problem assumptions', category: 'Definition', icon: 'Target' },
          { id: 'solution-hypothesis', name: 'Solution Hypothesis', description: 'Define solution assumptions', category: 'Definition', icon: 'Lightbulb' }
        ]
      },
      {
        id: 'experiment',
        name: 'Experiment',
        description: 'Test assumptions with real users',
        position: { x: 300, y: 0 },
        tools: [
          { id: 'design-experiments', name: 'Design Experiments', description: 'Plan validation experiments', category: 'Testing', icon: 'Flask' },
          { id: 'mvp-prototypes', name: 'MVP Prototypes', description: 'Minimum viable prototypes', category: 'Prototyping', icon: 'Box' },
          { id: 'landing-pages', name: 'Landing Pages', description: 'Test concept interest', category: 'Testing', icon: 'Globe' },
          { id: 'user-interviews-lean', name: 'User Interviews', description: 'Validate with interviews', category: 'Testing', icon: 'MessageCircle' }
        ]
      },
      {
        id: 'learn',
        name: 'Learn',
        description: 'Analyze results and iterate',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'metrics-dashboard', name: 'Metrics Dashboard', description: 'Track key metrics', category: 'Analysis', icon: 'BarChart' },
          { id: 'retrospective-lean', name: 'Retrospective', description: 'Reflect on learnings', category: 'Analysis', icon: 'RotateCcw' },
          { id: 'pivot-persevere', name: 'Pivot or Persevere', description: 'Decide next direction', category: 'Decision', icon: 'GitBranch' },
          { id: 'learning-synthesis', name: 'Learning Synthesis', description: 'Document insights', category: 'Analysis', icon: 'BookOpen' }
        ]
      }
    ]
  },
  {
    id: 'agile-ux',
    name: 'Agile UX',
    description: 'UX integrated with agile development',
    color: '#6366F1',
    stages: [
      {
        id: 'plan',
        name: 'Plan',
        description: 'Sprint planning with UX considerations',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'user-story-mapping', name: 'User Story Mapping', description: 'Map user stories', category: 'Planning', icon: 'Map' },
          { id: 'sprint-planning-ux', name: 'Sprint Planning', description: 'Plan UX work in sprints', category: 'Planning', icon: 'Calendar' },
          { id: 'backlog-grooming', name: 'Backlog Grooming', description: 'Prioritize UX backlog', category: 'Planning', icon: 'List' },
          { id: 'design-debt', name: 'Design Debt', description: 'Track design technical debt', category: 'Planning', icon: 'AlertTriangle' }
        ]
      },
      {
        id: 'design-agile',
        name: 'Design',
        description: 'Collaborative design within sprints',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'collaborative-sketching', name: 'Collaborative Sketching', description: 'Team sketching sessions', category: 'Design', icon: 'PenTool' },
          { id: 'design-studios', name: 'Design Studios', description: 'Rapid design exploration', category: 'Design', icon: 'Palette' },
          { id: 'design-system', name: 'Design System', description: 'Consistent component library', category: 'Design', icon: 'Grid' },
          { id: 'style-guides', name: 'Style Guides', description: 'Visual design standards', category: 'Design', icon: 'Book' }
        ]
      },
      {
        id: 'build',
        name: 'Build',
        description: 'Development with UX oversight',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'developer-handoff', name: 'Developer Handoff', description: 'Transfer designs to dev', category: 'Implementation', icon: 'ArrowRight' },
          { id: 'iterative-prototyping', name: 'Iterative Prototyping', description: 'Continuous prototype updates', category: 'Prototyping', icon: 'RotateCcw' },
          { id: 'design-reviews', name: 'Design Reviews', description: 'Review implemented designs', category: 'Review', icon: 'Eye' },
          { id: 'pair-designing', name: 'Pair Designing', description: 'Designer-developer pairing', category: 'Collaboration', icon: 'Users' }
        ]
      },
      {
        id: 'test-agile',
        name: 'Test',
        description: 'Continuous testing and validation',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'sprint-review-testing', name: 'Sprint Review Testing', description: 'Test sprint deliverables', category: 'Testing', icon: 'CheckCircle' },
          { id: 'bug-triage-ux', name: 'Bug Triage', description: 'Prioritize UX issues', category: 'Testing', icon: 'Bug' },
          { id: 'continuous-research', name: 'Continuous Research', description: 'Ongoing user research', category: 'Research', icon: 'Search' },
          { id: 'analytics-monitoring', name: 'Analytics Monitoring', description: 'Track usage patterns', category: 'Testing', icon: 'TrendingUp' }
        ]
      },
      {
        id: 'iterate',
        name: 'Iterate',
        description: 'Continuous improvement cycle',
        position: { x: 800, y: 0 },
        tools: [
          { id: 'backlog-refinement', name: 'Backlog Refinement', description: 'Update based on learnings', category: 'Planning', icon: 'RefreshCw' },
          { id: 'continuous-improvement', name: 'Continuous Improvement', description: 'Process optimization', category: 'Optimization', icon: 'TrendingUp' },
          { id: 'retrospectives-agile', name: 'Retrospectives', description: 'Team learning sessions', category: 'Analysis', icon: 'MessageSquare' },
          { id: 'version-planning', name: 'Version Planning', description: 'Plan future releases', category: 'Planning', icon: 'GitBranch' }
        ]
      }
    ]
  },
  {
    id: 'heart-framework',
    name: 'HEART Framework',
    description: 'User-centered metrics framework',
    color: '#F59E0B',
    stages: [
      {
        id: 'happiness',
        name: 'Happiness',
        description: 'Measure user satisfaction and sentiment',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'nps-surveys', name: 'NPS Surveys', description: 'Net Promoter Score measurement', category: 'Measurement', icon: 'ThumbsUp' },
          { id: 'satisfaction-surveys', name: 'Satisfaction Surveys', description: 'User satisfaction tracking', category: 'Measurement', icon: 'Heart' },
          { id: 'sentiment-analysis', name: 'Sentiment Analysis', description: 'Analyze user sentiment', category: 'Analysis', icon: 'MessageCircle' },
          { id: 'app-store-reviews', name: 'App Store Reviews', description: 'Monitor review sentiment', category: 'Monitoring', icon: 'Star' }
        ]
      },
      {
        id: 'engagement',
        name: 'Engagement',
        description: 'Track user interaction levels',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'interaction-logs', name: 'Interaction Logs', description: 'Track user interactions', category: 'Tracking', icon: 'MousePointer' },
          { id: 'session-analysis', name: 'Session Analysis', description: 'Analyze user sessions', category: 'Analysis', icon: 'Clock' },
          { id: 'feature-usage', name: 'Feature Usage', description: 'Track feature adoption', category: 'Tracking', icon: 'BarChart' },
          { id: 'time-on-task', name: 'Time on Task', description: 'Measure task duration', category: 'Measurement', icon: 'Timer' }
        ]
      },
      {
        id: 'adoption',
        name: 'Adoption',
        description: 'Monitor new user onboarding',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'onboarding-flow', name: 'Onboarding Flow Analysis', description: 'Optimize user onboarding', category: 'Analysis', icon: 'ArrowRight' },
          { id: 'conversion-funnels', name: 'Conversion Funnels', description: 'Track adoption funnels', category: 'Analysis', icon: 'TrendingDown' },
          { id: 'first-use', name: 'First Use Analytics', description: 'Track initial user experience', category: 'Tracking', icon: 'Play' },
          { id: 'activation-metrics', name: 'Activation Metrics', description: 'Measure user activation', category: 'Measurement', icon: 'Zap' }
        ]
      },
      {
        id: 'retention',
        name: 'Retention',
        description: 'Track user return patterns',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'churn-reports', name: 'Churn Reports', description: 'Analyze user churn', category: 'Analysis', icon: 'TrendingDown' },
          { id: 'cohort-analysis', name: 'Cohort Analysis', description: 'Track user cohorts', category: 'Analysis', icon: 'Users' },
          { id: 'return-frequency', name: 'Return Frequency', description: 'Measure return patterns', category: 'Measurement', icon: 'RotateCcw' },
          { id: 'lifetime-value', name: 'Lifetime Value', description: 'Calculate user LTV', category: 'Analysis', icon: 'DollarSign' }
        ]
      },
      {
        id: 'task-success',
        name: 'Task Success',
        description: 'Measure task completion effectiveness',
        position: { x: 800, y: 0 },
        tools: [
          { id: 'completion-tests', name: 'Task Completion Tests', description: 'Measure task success rates', category: 'Testing', icon: 'CheckCircle' },
          { id: 'error-tracking', name: 'Error Tracking', description: 'Monitor user errors', category: 'Monitoring', icon: 'AlertTriangle' },
          { id: 'efficiency-metrics', name: 'Efficiency Metrics', description: 'Measure task efficiency', category: 'Measurement', icon: 'Zap' },
          { id: 'goal-completion', name: 'Goal Completion', description: 'Track goal achievement', category: 'Tracking', icon: 'Target' }
        ]
      }
    ]
  },
  {
    id: 'hooked-model',
    name: 'Hooked Model',
    description: 'Build habit-forming products',
    color: '#EC4899',
    stages: [
      {
        id: 'trigger',
        name: 'Trigger',
        description: 'Prompt users to take action',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'notification-strategy', name: 'Notification Strategy', description: 'Design notification systems', category: 'Strategy', icon: 'Bell' },
          { id: 'contextual-triggers', name: 'Contextual Triggers', description: 'Environment-based prompts', category: 'Design', icon: 'MapPin' },
          { id: 'internal-triggers', name: 'Internal Triggers', description: 'Emotion-driven prompts', category: 'Psychology', icon: 'Heart' },
          { id: 'external-triggers', name: 'External Triggers', description: 'Outside prompts to action', category: 'Marketing', icon: 'ExternalLink' }
        ]
      },
      {
        id: 'action',
        name: 'Action',
        description: 'Simplify the desired behavior',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'microcopy-generation', name: 'Microcopy Generation', description: 'Craft persuasive microcopy', category: 'Content', icon: 'Type' },
          { id: 'ux-gesture-design', name: 'UX Gesture Design', description: 'Design intuitive interactions', category: 'Interaction', icon: 'Hand' },
          { id: 'friction-reduction', name: 'Friction Reduction', description: 'Minimize action barriers', category: 'Optimization', icon: 'Minus' },
          { id: 'motivation-mapping', name: 'Motivation Mapping', description: 'Understand user motivations', category: 'Psychology', icon: 'Target' }
        ]
      },
      {
        id: 'variable-reward',
        name: 'Variable Reward',
        description: 'Provide unpredictable rewards',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'reward-system-design', name: 'Reward System Prototyping', description: 'Design reward mechanisms', category: 'Gamification', icon: 'Gift' },
          { id: 'surprise-elements', name: 'Surprise Elements', description: 'Add unexpected delights', category: 'Experience', icon: 'Sparkles' },
          { id: 'progress-indicators', name: 'Progress Indicators', description: 'Show advancement', category: 'Feedback', icon: 'TrendingUp' },
          { id: 'social-rewards', name: 'Social Rewards', description: 'Leverage social validation', category: 'Social', icon: 'Users' }
        ]
      },
      {
        id: 'investment',
        name: 'Investment',
        description: 'Increase user commitment',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'feature-roadmap', name: 'Feature Roadmap Planning', description: 'Plan investment features', category: 'Planning', icon: 'Calendar' },
          { id: 'profile-building', name: 'Profile Building', description: 'Encourage profile completion', category: 'Onboarding', icon: 'User' },
          { id: 'content-creation', name: 'Content Creation', description: 'User-generated content', category: 'Content', icon: 'Edit' },
          { id: 'social-connections', name: 'Social Connections', description: 'Build user networks', category: 'Social', icon: 'Link' }
        ]
      }
    ]
  }
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedFramework: null,
  selectedStage: null,
  frameworks: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),
  
  selectFramework: (framework) => set({ selectedFramework: framework }),
  selectStage: (stage) => set({ selectedStage: stage }),
  
  initializeFrameworks: () => set({ frameworks: sampleFrameworks })
}));