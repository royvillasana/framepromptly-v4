import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Brain, 
  Settings, 
  ExternalLink,
  Thermometer,
  Target,
  Hash,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectStore } from '@/stores/project-store';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIParametersIndicatorProps {
  className?: string;
}

interface AIMethodSettings {
  creativityLevel?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export function AIParametersIndicator({ className }: AIParametersIndicatorProps) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { getEnhancedSettings, currentProject, projects } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AIMethodSettings>({
    creativityLevel: 'balanced',
    temperature: 0.7,
    topP: 0.9,
    topK: 50
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load AI settings for current project
  useEffect(() => {
    const loadAISettings = async () => {
      if (!projectId) {
        // If no current project, try to get the last used project or show defaults
        const lastProjectId = localStorage.getItem('lastAccessedProjectId');
        if (lastProjectId) {
          try {
            setIsLoading(true);
            const settings = await getEnhancedSettings(lastProjectId);
            if (settings?.aiMethodSettings) {
              setAiSettings({
                creativityLevel: settings.aiMethodSettings.creativityLevel || 'balanced',
                temperature: settings.aiMethodSettings.temperature || 0.7,
                topP: settings.aiMethodSettings.topP || 0.9,
                topK: settings.aiMethodSettings.topK || 50
              });
            }
          } catch (error) {
            console.error('Failed to load settings from last project:', error);
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const settings = await getEnhancedSettings(projectId);
        
        if (settings?.aiMethodSettings) {
          setAiSettings({
            creativityLevel: settings.aiMethodSettings.creativityLevel || 'balanced',
            temperature: settings.aiMethodSettings.temperature || 0.7,
            topP: settings.aiMethodSettings.topP || 0.9,
            topK: settings.aiMethodSettings.topK || 50
          });
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAISettings();
  }, [projectId, getEnhancedSettings]);

  // Don't show indicator if loading and no stored project access
  if (isLoading && !projectId && !localStorage.getItem('lastAccessedProjectId')) {
    return null;
  }

  const handleOpenSettings = () => {
    setIsOpen(false);
    
    // Use current project ID, current project from store, last accessed project ID, or first available project
    const targetProjectId = projectId || 
                           currentProject?.id || 
                           localStorage.getItem('lastAccessedProjectId') ||
                           (projects.length > 0 ? projects[0].id : null);
    
    if (targetProjectId) {
      const navigationUrl = `/project/${targetProjectId}/settings?tab=ai-methods#advanced-generation-parameters`;
      navigate(navigationUrl);
    } else {
      // Fallback to projects list if no project is available
      navigate('/projects');
    }
  };

  const getCreativityColor = (level: string) => {
    switch (level) {
      case 'conservative':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'balanced':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'creative':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'experimental':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getParameterColor = (value: number, min: number, max: number) => {
    const percentage = (value - min) / (max - min);
    if (percentage < 0.3) return 'text-blue-600';
    if (percentage < 0.7) return 'text-green-600';
    return 'text-orange-600';
  };

  return (
    <TooltipProvider>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className={cn("flex items-center", className)}
        >
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 bg-background/60 backdrop-blur-sm border border-border/40 hover:bg-gray-100/80 hover:border-gray-300 transition-all duration-200"
            >
              <Brain className="w-4 h-4" />
              <div className="flex items-center gap-1 text-xs font-mono">
                <span className={getParameterColor(aiSettings.temperature || 0.7, 0, 2)}>
                  T:{aiSettings.temperature?.toFixed(1)}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className={getParameterColor(aiSettings.topP || 0.9, 0, 1)}>
                  P:{aiSettings.topP?.toFixed(1)}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className={getParameterColor(aiSettings.topK || 50, 1, 100)}>
                  K:{aiSettings.topK}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" side="bottom" align="end">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">AI Generation Parameters</h3>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getCreativityColor(aiSettings.creativityLevel || 'balanced'))}
                  >
                    {aiSettings.creativityLevel || 'balanced'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Temperature */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Temperature</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Controls randomness in AI responses. Lower values (0.1-0.3) produce more focused, predictable outputs. Higher values (0.7-1.0) increase creativity and variation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-mono", getParameterColor(aiSettings.temperature || 0.7, 0, 2))}>
                        {aiSettings.temperature?.toFixed(2)}
                      </span>
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", 
                            getParameterColor(aiSettings.temperature || 0.7, 0, 2).includes('blue') ? 'bg-blue-500' :
                            getParameterColor(aiSettings.temperature || 0.7, 0, 2).includes('green') ? 'bg-green-500' : 'bg-orange-500'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${((aiSettings.temperature || 0.7) / 2) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top P */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Top P</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Nucleus sampling that considers only the top tokens with cumulative probability P. Lower values (0.1-0.5) focus on likely words, higher values (0.8-1.0) allow more diverse vocabulary.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-mono", getParameterColor(aiSettings.topP || 0.9, 0, 1))}>
                        {aiSettings.topP?.toFixed(2)}
                      </span>
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full",
                            getParameterColor(aiSettings.topP || 0.9, 0, 1).includes('blue') ? 'bg-blue-500' :
                            getParameterColor(aiSettings.topP || 0.9, 0, 1).includes('green') ? 'bg-green-500' : 'bg-orange-500'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${(aiSettings.topP || 0.9) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top K */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Top K</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Limits AI to consider only the K most likely next tokens. Lower values (10-20) create more focused responses, higher values (50-100) allow broader word choices and creativity.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-mono", getParameterColor(aiSettings.topK || 50, 1, 100))}>
                        {aiSettings.topK}
                      </span>
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full",
                            getParameterColor(aiSettings.topK || 50, 1, 100).includes('blue') ? 'bg-blue-500' :
                            getParameterColor(aiSettings.topK || 50, 1, 100).includes('green') ? 'bg-green-500' : 'bg-orange-500'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${((aiSettings.topK || 50) / 100) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <Button 
                    onClick={handleOpenSettings}
                    size="sm" 
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Settings className="w-4 h-4" />
                    Adjust Parameters
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>These parameters control AI creativity and output diversity for this project.</p>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
}