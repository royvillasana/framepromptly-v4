/**
 * @fileoverview Test page to demonstrate enhanced AI prompt instructions
 * This page shows how the enhanced instructions appear in the frameworks page
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getEnhancedInstructions } from '@/lib/enhanced-tool-instructions';
import { MessageSquare, Wrench, ChevronDown } from 'lucide-react';

const TestInstructionsPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Sample tools from the workflow store
  const sampleTools = [
    { id: 'user-interviews', name: 'User Interviews', description: 'Conduct in-depth user interviews' },
    { id: 'observations', name: 'Observations', description: 'Observe users in their environment' },
    { id: 'affinity-mapping', name: 'Affinity Mapping', description: 'Group insights to find patterns' },
    { id: 'how-might-we', name: 'How Might We', description: 'Frame problems as opportunities' },
    { id: 'stakeholder-interviews', name: 'Stakeholder Interviews', description: 'Understand business context' },
    { id: 'contextual-inquiry', name: 'Contextual Inquiry', description: 'Observe users in context' },
    { id: 'synthesis-workshops', name: 'Synthesis Workshops', description: 'Collaborative insight analysis' },
    { id: 'expert-interviews', name: 'Expert Interviews', description: 'Learn from domain experts' },
    { id: 'job-steps', name: 'Job Steps', description: 'Break down customer job process' },
    { id: 'hypothesis-canvas', name: 'Hypothesis Canvas', description: 'Structure testable assumptions' },
    { id: 'user-story-mapping', name: 'User Story Mapping', description: 'Map user journey to features' },
    { id: 'notification-strategy', name: 'Notification Strategy', description: 'Design trigger notifications' }
  ];

  const getFormattedInstructions = (toolId: string): string => {
    try {
      const enhancedInstructions = getEnhancedInstructions(toolId);
      if (enhancedInstructions && enhancedInstructions.length > 0) {
        return `# AI Prompt Instructions for ${toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}

## Core Instructions:
${enhancedInstructions.slice(0, 7).map(instruction => `• ${instruction}`).join('\n')}

## Methodology Guidelines:
${enhancedInstructions.slice(7, 14).map(instruction => `• ${instruction}`).join('\n')}

## Quality Assurance:
${enhancedInstructions.slice(14, 18).map(instruction => `• ${instruction}`).join('\n')}

## AI Optimization:
${enhancedInstructions.slice(18, 22).map(instruction => `• ${instruction}`).join('\n')}

## Knowledge Integration (CRITICAL):
${enhancedInstructions.slice(22).map(instruction => `• ${instruction}`).join('\n')}

---
*Instructions are research-backed and include knowledge base integration for contextual relevance.*`;
      }
    } catch (error) {
      console.warn('Could not load enhanced instructions for tool:', toolId);
    }
    return 'No enhanced instructions found for this tool.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Enhanced AI Prompt Instructions Demo</h1>
            <p className="text-muted-foreground mt-1">
              Demonstrating research-backed UX tool instructions with knowledge integration
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid gap-6">
            {sampleTools.map((tool) => (
              <Card key={tool.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">Enhanced</Badge>
                      <ChevronDown 
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          selectedTool === tool.id ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </div>
                </CardHeader>
                
                {selectedTool === tool.id && (
                  <CardContent className="pt-0">
                    <div className="bg-white rounded border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">AI Prompt Instructions:</span>
                      </div>
                      
                      <pre className="text-sm font-mono bg-gray-50 p-4 rounded whitespace-pre-wrap border overflow-x-auto">
                        {getFormattedInstructions(tool.id)}
                      </pre>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        <strong>Features:</strong>
                        <ul className="mt-1 ml-4 list-disc">
                          <li>Research-backed methodology from 2024 best practices</li>
                          <li>Industry-specific adaptations (fintech, healthcare, etc.)</li>
                          <li>Knowledge base integration for contextual relevance</li>
                          <li>Quality assurance and validation criteria</li>
                          <li>AI optimization for maximum prompt effectiveness</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">🎯 Enhanced AI Prompt System Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">✅ What's Been Implemented:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Research-backed instructions for all 35+ UX tools</li>
                    <li>• Knowledge base integration (CRITICAL feature)</li>
                    <li>• Industry-specific adaptations</li>
                    <li>• Quality assurance frameworks</li>
                    <li>• AI optimization techniques</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🚀 Key Benefits:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Context-aware prompts using project knowledge</li>
                    <li>• 2024 best practices from industry leaders</li>
                    <li>• Automatic customization for different domains</li>
                    <li>• Built-in quality validation</li>
                    <li>• Systematic instruction generation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestInstructionsPage;