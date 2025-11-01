import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Sparkles, Brain, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
}

interface ProgressOverlayProps {
  isVisible: boolean;
  currentStep: number;
  totalSteps: number;
  onComplete?: () => void;
}

export function ProgressOverlay({ isVisible, currentStep, totalSteps, onComplete }: ProgressOverlayProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'analyzing',
      label: 'Analyzing Context',
      description: 'Processing framework, stage, and tool requirements',
      icon: <Brain className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'knowledge',
      label: 'Gathering Knowledge',
      description: 'Retrieving project context and knowledge base',
      icon: <FileText className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'generating',
      label: 'Generating Prompt',
      description: 'Creating AI-optimized prompt using expert frameworks',
      icon: <Sparkles className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'saving',
      label: 'Saving Prompt',
      description: 'Storing generated prompt to database',
      icon: <FileText className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'executing',
      label: 'Executing Prompt',
      description: 'Auto-executing prompt to get deliverable',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      status: 'pending'
    },
    {
      id: 'creating',
      label: 'Updating Canvas',
      description: 'Creating or updating prompt node with result',
      icon: <CheckCircle className="w-4 h-4" />,
      status: 'pending'
    }
  ]);

  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    setSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        status: index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'
      }))
    );
  }, [currentStep]);

  useEffect(() => {
    if (currentStep >= totalSteps && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, totalSteps, onComplete]);

  // Cleanup effect to ensure proper portal cleanup
  useEffect(() => {
    return () => {
      // Restore body scroll and pointer events
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, []);

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-96 max-w-sm pointer-events-auto"
          >
            <Card className="p-4 shadow-2xl bg-white/95 backdrop-blur-sm border border-gray-200/50">
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-3 border border-blue-200/50"
                  >
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Generating AI Prompt</h3>
                  <p className="text-sm text-gray-600">
                    Creating intelligent prompts for your workflow
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Progress</span>
                    <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-gray-100" />
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        step.status === 'active' 
                          ? 'bg-primary/5 border border-primary/20' 
                          : step.status === 'completed'
                          ? 'bg-success/5 border border-success/20'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        step.status === 'active' 
                          ? 'bg-primary text-primary-foreground' 
                          : step.status === 'completed'
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : step.status === 'active' && step.id === 'executing' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-xs ${
                          step.status === 'active' 
                            ? 'text-primary' 
                            : step.status === 'completed'
                            ? 'text-success'
                            : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                      {step.status === 'active' && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-primary rounded-full flex-shrink-0"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Completion Message */}
                {currentStep >= totalSteps && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-3 bg-success/10 rounded-lg border border-success/20"
                  >
                    <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
                    <p className="font-medium text-sm text-success">Generated Successfully!</p>
                    <p className="text-xs text-success/80">Switching to prompt panel...</p>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}