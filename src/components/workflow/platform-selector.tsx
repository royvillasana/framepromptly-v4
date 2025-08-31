/**
 * @fileoverview Platform Selection Component
 * Allows users to choose between different UX tool platforms (Miro, FigJam, Figma)
 * with recommendations and capability information
 */

import React, { useState } from 'react';
import { ChevronDown, Cpu, Users, Palette, Star, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  PlatformType, 
  getPlatformRecommendation, 
  getPlatformComparison 
} from '@/lib/ux-tool-platform-optimizer';

interface PlatformSelectorProps {
  toolId: string;
  toolName: string;
  selectedPlatform?: PlatformType;
  onPlatformChange: (platform: PlatformType) => void;
  onGenerate: (platform: PlatformType) => void;
  className?: string;
}

const PLATFORM_CONFIG = {
  miro: {
    name: 'Miro AI',
    icon: Cpu,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'AI-powered diagrams, prototypes, and collaboration',
    tagline: 'Best for: Comprehensive visualization and prototyping'
  },
  figjam: {
    name: 'FigJam AI',
    icon: Users,
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Templates, workshops, and research synthesis',
    tagline: 'Best for: Collaborative workshops and research'
  },
  figma: {
    name: 'Figma AI',
    icon: Palette,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'High-fidelity design and interactive prototypes',
    tagline: 'Best for: Production-ready design and prototyping'
  }
} as const;

export function PlatformSelector({
  toolId,
  toolName,
  selectedPlatform,
  onPlatformChange,
  onGenerate,
  className = ''
}: PlatformSelectorProps) {
  const [showComparison, setShowComparison] = useState(false);
  
  const recommendation = getPlatformRecommendation(toolId);
  const comparison = getPlatformComparison(toolId);
  const currentPlatform = selectedPlatform || recommendation?.platform || 'miro';
  const currentConfig = PLATFORM_CONFIG[currentPlatform];
  const IconComponent = currentConfig.icon;

  const handlePlatformSelect = (platform: PlatformType) => {
    onPlatformChange(platform);
  };

  const handleGenerate = () => {
    onGenerate(currentPlatform);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Platform Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs bg-white border-gray-200 hover:bg-gray-50"
          >
            <IconComponent className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">{currentConfig.name}</span>
            <span className="sm:hidden">{currentPlatform}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <span>Choose Platform for {toolName}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => setShowComparison(true)}
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compare platforms</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => {
            const Icon = config.icon;
            const isRecommended = recommendation?.platform === platform;
            const isSelected = currentPlatform === platform;
            
            return (
              <DropdownMenuItem
                key={platform}
                onClick={() => handlePlatformSelect(platform as PlatformType)}
                className="flex items-start gap-3 p-3 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <div className={`p-1 rounded ${config.color} text-white`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{config.name}</span>
                    {isRecommended && (
                      <Badge className="text-xs px-1 py-0 h-4 bg-amber-100 text-amber-800 border-amber-200">
                        <Star className="w-2 h-2 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    {isSelected && (
                      <Badge className="text-xs px-1 py-0 h-4 bg-blue-100 text-blue-800 border-blue-200">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{config.tagline}</p>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          {recommendation && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="text-xs text-gray-600">
                  <strong>Why {PLATFORM_CONFIG[recommendation.platform].name}?</strong>
                  <p className="mt-1">{recommendation.reasoning}</p>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Generate Button */}
      <Button
        size="sm"
        onClick={handleGenerate}
        className={`h-8 text-xs ${currentConfig.color} text-white`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        Generate with {currentConfig.name}
      </Button>

      {/* Platform Comparison Dialog */}
      {comparison && (
        <Dialog open={showComparison} onOpenChange={setShowComparison}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Platform Comparison for {toolName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comparison.platforms.map((platform) => {
                const config = PLATFORM_CONFIG[platform.platform];
                const Icon = config.icon;
                const isRecommended = recommendation?.platform === platform.platform;
                
                return (
                  <Card key={platform.platform} className={`relative ${isRecommended ? 'ring-2 ring-amber-200 bg-amber-50/50' : ''}`}>
                    {isRecommended && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Star className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${config.color} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{config.name}</CardTitle>
                          <CardDescription className="text-sm">{config.description}</CardDescription>
                        </div>
                        <div className="ml-auto">
                          <Badge variant="outline" className="text-sm">
                            {platform.suitability}% match
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm text-green-700 mb-2">Strengths</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {platform.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Considerations</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {platform.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}