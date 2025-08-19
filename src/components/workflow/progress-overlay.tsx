import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Sparkles, Brain, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

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
      id: 'executing',
      label: 'Executing AI Request',
      description: 'Getting intelligent response from AI model',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card className="w-96 p-6 shadow-2xl">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3"
                  >
                    <Sparkles className="w-6 h-6 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold">Generating AI Prompt</h3>
                  <p className="text-sm text-muted-foreground">
                    Creating intelligent prompts for your UX workflow
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        step.status === 'active' 
                          ? 'bg-primary/5 border border-primary/20' 
                          : step.status === 'completed'
                          ? 'bg-success/5 border border-success/20'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step.status === 'active' 
                          ? 'bg-primary text-primary-foreground' 
                          : step.status === 'completed'
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          step.status === 'active' 
                            ? 'text-primary' 
                            : step.status === 'completed'
                            ? 'text-success'
                            : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {step.status === 'active' && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-primary rounded-full"
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
                    className="text-center p-4 bg-success/10 rounded-lg border border-success/20"
                  >
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="font-medium text-success">Prompt Generated Successfully!</p>
                    <p className="text-xs text-success/80">Switching to prompt panel...</p>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}