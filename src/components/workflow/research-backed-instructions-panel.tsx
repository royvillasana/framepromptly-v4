/**
 * @fileoverview Research-Backed Instructions Panel
 * Displays comprehensive framework instructions, methodology backing, and accessibility protocols
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Target,
  Users,
  Clock,
  Lightbulb,
  FileText,
  Award,
  Globe,
  Eye,
  Heart,
  Zap
} from 'lucide-react';
import { frameworkIntegrationService } from '@/lib/framework-integration-service';
import { EnhancedUXFramework } from '@/lib/research-backed-frameworks';

interface ResearchBackedInstructionsPanelProps {
  frameworkId: string;
  stageId?: string;
  toolId?: string;
  onClose: () => void;
}

export const ResearchBackedInstructionsPanel: React.FC<ResearchBackedInstructionsPanelProps> = ({
  frameworkId,
  stageId,
  toolId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const framework = frameworkIntegrationService.getEnhancedFramework(frameworkId);

  if (!framework) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Enhanced Instructions Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Research-backed instructions are not available for this framework yet. 
              Basic framework guidance will be used.
            </p>
            <Button onClick={onClose} className="w-full">
              Continue with Basic Instructions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{framework.name}</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Research-Backed
                </Badge>
              </div>
              <p className="text-gray-700 max-w-3xl">{framework.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {framework.characteristics.timeline}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {framework.characteristics.teamSize}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {framework.characteristics.complexity}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="methodology">Research</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Framework Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-4">
                    {framework.comprehensiveInstructions.overview}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        When to Use
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {framework.comprehensiveInstructions.whenToUse.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        When NOT to Use
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {framework.comprehensiveInstructions.whenNotToUse.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {framework.comprehensiveInstructions.prerequisites.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Expected Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {framework.comprehensiveInstructions.expectedOutcomes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Research/Methodology Tab */}
            <TabsContent value="methodology" className="space-y-6">
              <Alert>
                <Award className="w-4 h-4" />
                <AlertDescription>
                  This framework is backed by extensive research and proven methodologies. 
                  All recommendations are based on academic research and industry best practices.
                </AlertDescription>
              </Alert>

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="theory">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Foundational Theory
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.methodology.foundationalTheory.map((theory, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {theory}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="evidence">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-500" />
                      Research Evidence
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.methodology.researchEvidence.map((evidence, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="standards">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-500" />
                      Industry Standards
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.methodology.industryStandards.map((standard, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          {standard}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sources">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Academic Sources
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.methodology.academicSources.map((source, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          {source}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6">
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  This framework integrates comprehensive accessibility and inclusion protocols 
                  to ensure equitable outcomes for all users.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="w-5 h-5 text-pink-500" />
                      Inclusive Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.accessibilityProtocols.inclusiveDesign.map((principle, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-pink-500 mt-1 flex-shrink-0" />
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Eye className="w-5 h-5 text-blue-500" />
                      Accessibility Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.accessibilityProtocols.accessibilityGuidelines.map((guideline, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                          {guideline}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="w-5 h-5 text-green-500" />
                      Diversity Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.accessibilityProtocols.diversityConsiderations.map((consideration, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="w-5 h-5 text-purple-500" />
                      Ethical Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.accessibilityProtocols.ethicalGuidelines.map((guideline, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                          {guideline}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Best Practices Tab */}
            <TabsContent value="best-practices" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Preparation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.bestPractices.preparation.map((practice, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      Execution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.bestPractices.execution.map((practice, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.bestPractices.analysis.map((practice, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Deliverables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.bestPractices.deliverables.map((practice, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Quality Tab */}
            <TabsContent value="quality" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-500" />
                      Success Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.qualityAssurance.successMetrics.map((metric, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Common Pitfalls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.researchBacking.qualityAssurance.commonPitfalls.map((pitfall, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-1">⚠</span>
                          {pitfall}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    Quality Assurance Checklist
                  </CardTitle>
                  <CardDescription>
                    Use this checklist to ensure your implementation meets quality standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {framework.researchBacking.qualityAssurance.qualityChecklist.map((item, index) => (
                      <div key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-500">{item.startsWith('✓') ? item : `✓ ${item}`}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Implementation Tab */}
            <TabsContent value="implementation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Team Composition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {framework.comprehensiveInstructions.teamComposition.map((role, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{role}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Time Investment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    {framework.comprehensiveInstructions.timeInvestment}
                  </p>
                </CardContent>
              </Card>

              <Alert>
                <Lightbulb className="w-4 h-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Start with a pilot implementation to validate the approach 
                  and build team confidence before scaling to larger projects.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Research-backed framework with comprehensive accessibility integration
          </div>
          <Button onClick={onClose}>
            Apply Framework
          </Button>
        </div>
      </div>
    </div>
  );
};