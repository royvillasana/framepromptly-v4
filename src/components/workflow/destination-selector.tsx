/**
 * @fileoverview Destination Selection Component
 * UI for selecting and configuring prompt destination before execution
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  MessageSquare, 
  Grid3x3, 
  Paintbrush, 
  Palette, 
  ChevronRight,
  Info,
  Zap,
  AlertTriangle
} from 'lucide-react';

import {
  DestinationType,
  AIProviderType,
  DestinationContext,
  getDestinationIcon,
  getDestinationDescription
} from '@/lib/destination-driven-tailoring';

interface DestinationSelectorProps {
  onDestinationSelect: (context: DestinationContext) => void;
  onCancel: () => void;
  defaultContext?: Partial<DestinationContext>;
  isLoading?: boolean;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  onDestinationSelect,
  onCancel,
  defaultContext,
  isLoading = false
}) => {
  const [selectedDestination, setSelectedDestination] = useState<DestinationType>(
    defaultContext?.destination || 'AI Provider'
  );
  const [selectedAIProvider, setSelectedAIProvider] = useState<AIProviderType>(
    defaultContext?.aiProvider || 'Claude'
  );
  const [userIntent, setUserIntent] = useState(
    defaultContext?.userIntent || ''
  );

  const destinations: Array<{
    type: DestinationType;
    icon: React.ReactNode;
    color: string;
    description: string;
    features: string[];
    requiresIntegration: boolean;
  }> = [
    {
      type: 'AI Provider',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-blue-500',
      description: 'Structured AI analysis and insights',
      features: ['Analytical output', 'Next steps', 'Validation notes', 'Structured sections'],
      requiresIntegration: false
    },
    {
      type: 'Miro',
      icon: <Grid3x3 className="w-5 h-5" />,
      color: 'bg-yellow-500',
      description: 'Visual collaboration board with sticky notes',
      features: ['Sticky notes (≤12 words)', 'Cluster mapping', 'Grid layout', 'Team collaboration'],
      requiresIntegration: true
    },
    {
      type: 'FigJam',
      icon: <Paintbrush className="w-5 h-5" />,
      color: 'bg-purple-500',  
      description: 'Workshop-ready brainstorming session',
      features: ['Facilitation script', 'Divergent thinking', 'Affinity mapping', 'Workshop guidance'],
      requiresIntegration: true
    },
    {
      type: 'Figma',
      icon: <Palette className="w-5 h-5" />,
      color: 'bg-green-500',
      description: 'UI-focused design specifications',
      features: ['Component blocks', 'Sizing specs', 'Copy guidance', 'Layout recommendations'],
      requiresIntegration: true
    }
  ];

  const aiProviders: AIProviderType[] = ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Other'];

  const handleProceed = () => {
    // User intent is now optional

    const context: DestinationContext = {
      destination: selectedDestination,
      aiProvider: selectedDestination === 'AI Provider' ? selectedAIProvider : undefined,
      userIntent: userIntent.trim() || `Generate output optimized for ${selectedDestination}`,
      originalPrompt: defaultContext?.originalPrompt || '',
      variables: defaultContext?.variables,
      metadata: defaultContext?.metadata
    };

    onDestinationSelect(context);
  };

  const selectedDestinationInfo = destinations.find(d => d.type === selectedDestination);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Target className="w-8 h-8 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Choose Your Destination</h2>
        <p className="text-muted-foreground">
          Select where you'll use this prompt to get tailored, optimized output
        </p>
      </div>

      {/* Destination Cards */}
      <div className="grid grid-cols-1 gap-3">
        {destinations.map((dest) => (
          <Card 
            key={dest.type}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedDestination === dest.type 
                ? 'ring-2 ring-primary border-primary shadow-md' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedDestination(dest.type)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${dest.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {dest.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-medium">{dest.type}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {dest.description}
                    </CardDescription>
                  </div>
                </div>
                {dest.requiresIntegration && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Integration
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Key Features:</p>
                <div className="flex flex-wrap gap-1">
                  {dest.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {dest.features.length > 3 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{dest.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Provider Selection */}
      {selectedDestination === 'AI Provider' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Provider Configuration
            </CardTitle>
            <CardDescription>
              Choose your preferred AI provider for optimal prompt formatting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select value={selectedAIProvider} onValueChange={(value) => setSelectedAIProvider(value as AIProviderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Warning */}
      {selectedDestinationInfo?.requiresIntegration && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{selectedDestination}</strong> integration is coming soon. 
            For now, you'll receive optimized output formatted for manual import.
          </AlertDescription>
        </Alert>
      )}

      {/* User Intent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            What Are You Trying to Achieve?
          </CardTitle>
          <CardDescription>
            Describe your specific goal to get the most relevant tailored output
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Your Intent (Optional)</Label>
            <Textarea
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder={`e.g., "Create user research insights for our mobile app redesign" or "Generate workshop activities for stakeholder alignment"`}
              rows={3}
              className="border-input"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Be specific about your desired outcome</span>
              <span>{userIntent.length}/500</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Destination Summary */}
      {selectedDestinationInfo && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" />
              Ready to Tailor for {selectedDestination}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {getDestinationDescription(selectedDestination)}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span>Your prompt will be optimized for {selectedDestination} workflow and output format</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleProceed} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Tailoring...
            </>
          ) : (
            <>
              Tailor Prompt
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};