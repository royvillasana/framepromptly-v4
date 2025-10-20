/**
 * @fileoverview CreatePromptDialog - Wizard for creating new prompts
 * Multi-step dialog for creating structured prompts from scratch
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Brain,
  User,
  Target,
  Settings,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateStructuredPromptInput } from '@/types/structured-prompt';
import { createDefaultSections } from '@/lib/structured-prompt-helpers';
import { useStructuredPromptStore } from '@/stores/structured-prompt-store';
import { toast } from 'sonner';

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

type Step = 'info' | 'role' | 'context' | 'task' | 'constraints' | 'format' | 'review';

const STEPS: { id: Step; title: string; icon: any }[] = [
  { id: 'info', title: 'Basic Info', icon: Sparkles },
  { id: 'role', title: 'AI Role', icon: Brain },
  { id: 'context', title: 'Context', icon: User },
  { id: 'task', title: 'Task', icon: Target },
  { id: 'constraints', title: 'Quality', icon: Settings },
  { id: 'format', title: 'Format', icon: FileText },
  { id: 'review', title: 'Review', icon: Check },
];

const TOOL_PRESETS = [
  'User Personas',
  'User Journey Maps',
  'Empathy Maps',
  'Wireframes',
  'Affinity Mapping',
  'Problem Statements',
  'User Interviews',
  'Usability Tests',
  'Custom',
];

export function CreatePromptDialog({
  open,
  onOpenChange,
  projectId,
}: CreatePromptDialogProps) {
  const navigate = useNavigate();
  const { createPrompt } = useStructuredPromptStore();

  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tool_name: '',
    framework_name: '',
    stage_name: '',
    role_content: '',
    context_content: '',
    task_content: '',
    constraints_content: '',
    format_content: '',
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleToolSelect = (toolName: string) => {
    setFormData((prev) => ({ ...prev, tool_name: toolName }));

    // Auto-populate with defaults for known tools
    if (toolName !== 'Custom') {
      const defaults = createDefaultSections(toolName);

      setFormData((prev) => ({
        ...prev,
        role_content: defaults.role_section.content,
        context_content: defaults.context_section.content,
        task_content: defaults.task_section.content,
        constraints_content: defaults.constraints_section.content,
        format_content: defaults.format_section.content,
      }));

      toast.success(`Loaded ${toolName} template`);
    }
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);

      const input: CreateStructuredPromptInput = {
        project_id: projectId,
        title: formData.title,
        description: formData.description || undefined,
        tool_name: formData.tool_name || undefined,
        framework_name: formData.framework_name || undefined,
        stage_name: formData.stage_name || undefined,
        role_section: { content: formData.role_content },
        context_section: { content: formData.context_content },
        task_section: { content: formData.task_content },
        constraints_section: { content: formData.constraints_content },
        format_section: { content: formData.format_content },
      };

      const newId = await createPrompt(input);

      toast.success('Prompt created successfully');
      onOpenChange(false);
      navigate(`/library/${newId}`);
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast.error('Failed to create prompt');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'info':
        return formData.title.trim() !== '' && formData.tool_name !== '';
      case 'role':
        return formData.role_content.trim() !== '';
      case 'context':
        return formData.context_content.trim() !== '';
      case 'task':
        return formData.task_content.trim() !== '';
      case 'constraints':
        return formData.constraints_content.trim() !== '';
      case 'format':
        return formData.format_content.trim() !== '';
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prompt Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., User Personas - Mobile App"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Tool Type *</Label>
              <div className="grid grid-cols-3 gap-2">
                {TOOL_PRESETS.map((tool) => (
                  <Button
                    key={tool}
                    type="button"
                    variant={formData.tool_name === tool ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolSelect(tool)}
                    className="justify-start"
                  >
                    {tool}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this prompt's purpose..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Framework (Optional)</Label>
                <Input
                  value={formData.framework_name}
                  onChange={(e) =>
                    setFormData({ ...formData, framework_name: e.target.value })
                  }
                  placeholder="e.g., Design Thinking"
                />
              </div>
              <div className="space-y-2">
                <Label>Stage (Optional)</Label>
                <Input
                  value={formData.stage_name}
                  onChange={(e) =>
                    setFormData({ ...formData, stage_name: e.target.value })
                  }
                  placeholder="e.g., Empathize"
                />
              </div>
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-purple-900 mb-1">
                  AI Role & Expertise
                </h4>
                <p className="text-xs text-purple-700">
                  Define the AI's role, expertise level, and specialization for this task.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role Content *</Label>
              <Textarea
                value={formData.role_content}
                onChange={(e) =>
                  setFormData({ ...formData, role_content: e.target.value })
                }
                placeholder="You are a senior UX researcher with 15+ years of experience..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {formData.role_content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>
        );

      case 'context':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-blue-900 mb-1">
                  Project Context
                </h4>
                <p className="text-xs text-blue-700">
                  Provide project background, constraints, and contextual information.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Context Content *</Label>
              <Textarea
                value={formData.context_content}
                onChange={(e) =>
                  setFormData({ ...formData, context_content: e.target.value })
                }
                placeholder="## Project Context:&#10;{{knowledgeBase}}&#10;&#10;Working on a project with the following specifics..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {formData.context_content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>
        );

      case 'task':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Target className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-green-900 mb-1">
                  Specific Task
                </h4>
                <p className="text-xs text-green-700">
                  Describe exactly what the AI should create or accomplish.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Task Content *</Label>
              <Textarea
                value={formData.task_content}
                onChange={(e) =>
                  setFormData({ ...formData, task_content: e.target.value })
                }
                placeholder="Create a comprehensive user persona that addresses..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {formData.task_content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>
        );

      case 'constraints':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Settings className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-orange-900 mb-1">
                  Quality Standards & Constraints
                </h4>
                <p className="text-xs text-orange-700">
                  Set quality expectations, methodology requirements, and constraints.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quality Standards *</Label>
              <Textarea
                value={formData.constraints_content}
                onChange={(e) =>
                  setFormData({ ...formData, constraints_content: e.target.value })
                }
                placeholder="## Quality Standards:&#10;- **Evidence-Based**: Every element must..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {formData.constraints_content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>
        );

      case 'format':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <FileText className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-red-900 mb-1">
                  Output Format
                </h4>
                <p className="text-xs text-red-700">
                  Specify the desired structure and format of the AI's output.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format Instructions *</Label>
              <Textarea
                value={formData.format_content}
                onChange={(e) =>
                  setFormData({ ...formData, format_content: e.target.value })
                }
                placeholder="## Output Format:&#10;Structure your response following..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {formData.format_content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Ready to Create</h4>
              </div>
              <p className="text-sm text-green-700">
                Review your prompt configuration before creating.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <p className="font-medium">{formData.title}</p>
              </div>

              {formData.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{formData.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Badge>{formData.tool_name}</Badge>
                {formData.framework_name && <Badge variant="secondary">{formData.framework_name}</Badge>}
                {formData.stage_name && <Badge variant="secondary">{formData.stage_name}</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div>
                  <Label className="text-xs text-muted-foreground">Role Section</Label>
                  <p className="text-sm">{formData.role_content.split(/\s+/).filter(Boolean).length} words</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Context Section</Label>
                  <p className="text-sm">{formData.context_content.split(/\s+/).filter(Boolean).length} words</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Task Section</Label>
                  <p className="text-sm">{formData.task_content.split(/\s+/).filter(Boolean).length} words</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Quality Section</Label>
                  <p className="text-sm">{formData.constraints_content.split(/\s+/).filter(Boolean).length} words</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Format Section</Label>
                  <p className="text-sm">{formData.format_content.split(/\s+/).filter(Boolean).length} words</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
          <DialogDescription>
            Build a structured prompt with card-based sections
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = idx < currentStepIndex;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors whitespace-nowrap',
                  isActive && 'border-primary bg-primary/5',
                  isCompleted && 'border-green-500 bg-green-50',
                  !isActive && !isCompleted && 'border-gray-200'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive && 'text-primary',
                    isCompleted && 'text-green-600',
                    !isActive && !isCompleted && 'text-gray-400'
                  )}
                />
                <span className={cn('text-sm font-medium', isActive && 'text-primary')}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep === 'review' ? (
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Prompt
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
