import React from 'react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Color System Showcase Component
 * 
 * Demonstrates the comprehensive FramePromptly color design system including:
 * - Primary, Secondary, and Tertiary gradient buttons
 * - Color palette variants
 * - WCAG compliant contrast ratios
 * - Subtle color accents and lines
 * 
 * Color Palette:
 * - Indigo Dye (#2D425B): Primary foundation color
 * - Malachite (#27D966): Success and positive feedback
 * - Celestial Blue (#009CDD): Primary CTAs and interactive elements
 * - Cobalt Blue (#004DA8): Secondary actions and depth
 */
export function ColorSystemShowcase() {
  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-celestial-blue-500 via-cobalt-blue-800 to-indigo-dye-900 bg-clip-text text-transparent">
          FramePromptly Color System
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive design system with WCAG compliant colors, gradient buttons, and subtle accents
        </p>
      </div>

      {/* Gradient Buttons Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-primary rounded-full"></div>
            Gradient Button System
          </CardTitle>
          <CardDescription>
            Primary, Secondary, and Tertiary gradient buttons with proper contrast compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Primary Gradient Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-celestial-blue-700 dark:text-celestial-blue-300 border-l-4 border-celestial-blue-500 pl-3">
              Primary Gradient (Celestial Blue)
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <GradientButton variant="primary" size="sm">Primary Small</GradientButton>
              <GradientButton variant="primary" size="default">Primary Default</GradientButton>
              <GradientButton variant="primary" size="lg">Primary Large</GradientButton>
              <GradientButton variant="primary" size="xl">Primary XL</GradientButton>
              <GradientButton variant="primary-outline" size="default">Primary Outline</GradientButton>
              <GradientButton variant="primary-subtle" size="default">Primary Subtle</GradientButton>
            </div>
          </div>

          {/* Secondary Gradient Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-indigo-dye-700 dark:text-indigo-dye-300 border-l-4 border-indigo-dye-900 pl-3">
              Secondary Gradient (Indigo Dye)
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <GradientButton variant="secondary" size="sm">Secondary Small</GradientButton>
              <GradientButton variant="secondary" size="default">Secondary Default</GradientButton>
              <GradientButton variant="secondary" size="lg">Secondary Large</GradientButton>
              <GradientButton variant="secondary" size="xl">Secondary XL</GradientButton>
              <GradientButton variant="secondary-outline" size="default">Secondary Outline</GradientButton>
              <GradientButton variant="secondary-subtle" size="default">Secondary Subtle</GradientButton>
            </div>
          </div>

          {/* Tertiary Gradient Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-malachite-700 dark:text-malachite-300 border-l-4 border-malachite-500 pl-3">
              Tertiary Gradient (Malachite)
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <GradientButton variant="tertiary" size="sm">Tertiary Small</GradientButton>
              <GradientButton variant="tertiary" size="default">Tertiary Default</GradientButton>
              <GradientButton variant="tertiary" size="lg">Tertiary Large</GradientButton>
              <GradientButton variant="tertiary" size="xl">Tertiary XL</GradientButton>
              <GradientButton variant="tertiary-outline" size="default">Tertiary Outline</GradientButton>
              <GradientButton variant="tertiary-subtle" size="default">Tertiary Subtle</GradientButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standard Button Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-secondary rounded-full"></div>
            Enhanced Standard Buttons
          </CardTitle>
          <CardDescription>
            Standard button component enhanced with gradient variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="gradient-primary">Gradient Primary</Button>
            <Button variant="gradient-secondary">Gradient Secondary</Button>
            <Button variant="gradient-tertiary">Gradient Tertiary</Button>
            <Button variant="gradient-primary-subtle">Primary Subtle</Button>
            <Button variant="gradient-secondary-subtle">Secondary Subtle</Button>
            <Button variant="gradient-tertiary-subtle">Tertiary Subtle</Button>
          </div>
        </CardContent>
      </Card>

      {/* Badge System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-tertiary rounded-full"></div>
            Badge Color Variants
          </CardTitle>
          <CardDescription>
            Color-coded badges for different states and categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Badge variant="celestial-blue">Celestial Blue</Badge>
              <Badge variant="celestial-blue-subtle">Celestial Blue Subtle</Badge>
              <Badge variant="indigo-dye">Indigo Dye</Badge>
              <Badge variant="indigo-dye-subtle">Indigo Dye Subtle</Badge>
              <Badge variant="malachite">Malachite</Badge>
              <Badge variant="malachite-subtle">Malachite Subtle</Badge>
              <Badge variant="cobalt-blue">Cobalt Blue</Badge>
              <Badge variant="cobalt-blue-subtle">Cobalt Blue Subtle</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-hero rounded-full"></div>
            Card Accent System
          </CardTitle>
          <CardDescription>
            Cards with subtle color accents for visual hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card variant="default">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Default Card</h4>
                <p className="text-sm text-muted-foreground">Standard card without accent colors</p>
              </CardContent>
            </Card>
            
            <Card variant="accent-primary">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Primary Accent</h4>
                <p className="text-sm text-muted-foreground">Card with celestial blue left accent</p>
              </CardContent>
            </Card>
            
            <Card variant="accent-secondary">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Secondary Accent</h4>
                <p className="text-sm text-muted-foreground">Card with indigo dye left accent</p>
              </CardContent>
            </Card>
            
            <Card variant="accent-tertiary">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Tertiary Accent</h4>
                <p className="text-sm text-muted-foreground">Card with malachite left accent</p>
              </CardContent>
            </Card>
            
            <Card variant="gradient" className="md:col-span-2">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Gradient Background</h4>
                <p className="text-sm text-muted-foreground">Subtle gradient background card</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-hero rounded-full"></div>
            Color Palette Reference
          </CardTitle>
          <CardDescription>
            Complete color variants with hex codes and usage guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Celestial Blue */}
          <div className="space-y-3">
            <h4 className="font-semibold text-celestial-blue-700 dark:text-celestial-blue-300">Celestial Blue (#009CDD)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className={`bg-celestial-blue-${shade} h-12 rounded flex items-end p-1`}>
                  <span className={`text-xs font-mono ${shade >= 500 ? 'text-white' : 'text-black'}`}>
                    {shade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Indigo Dye */}
          <div className="space-y-3">
            <h4 className="font-semibold text-indigo-dye-700 dark:text-indigo-dye-300">Indigo Dye (#2D425B)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className={`bg-indigo-dye-${shade} h-12 rounded flex items-end p-1`}>
                  <span className={`text-xs font-mono ${shade >= 500 ? 'text-white' : 'text-black'}`}>
                    {shade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Malachite */}
          <div className="space-y-3">
            <h4 className="font-semibold text-malachite-700 dark:text-malachite-300">Malachite (#27D966)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className={`bg-malachite-${shade} h-12 rounded flex items-end p-1`}>
                  <span className={`text-xs font-mono ${shade >= 600 ? 'text-white' : 'text-black'}`}>
                    {shade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cobalt Blue */}
          <div className="space-y-3">
            <h4 className="font-semibold text-cobalt-blue-700 dark:text-cobalt-blue-300">Cobalt Blue (#004DA8)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className={`bg-cobalt-blue-${shade} h-12 rounded flex items-end p-1`}>
                  <span className={`text-xs font-mono ${shade >= 500 ? 'text-white' : 'text-black'}`}>
                    {shade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
          <CardDescription>Best practices for applying the color system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-celestial-blue-500 rounded-full mt-2"></div>
              <div>
                <h5 className="font-medium">Primary Actions</h5>
                <p className="text-sm text-muted-foreground">Use Celestial Blue gradients for main CTAs, primary buttons, and key interactive elements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-dye-900 rounded-full mt-2"></div>
              <div>
                <h5 className="font-medium">Secondary Actions</h5>
                <p className="text-sm text-muted-foreground">Use Indigo Dye for secondary buttons, navigation elements, and supporting UI</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-malachite-500 rounded-full mt-2"></div>
              <div>
                <h5 className="font-medium">Success & Positive</h5>
                <p className="text-sm text-muted-foreground">Use Malachite for success states, positive feedback, and completion indicators</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cobalt-blue-800 rounded-full mt-2"></div>
              <div>
                <h5 className="font-medium">Depth & Structure</h5>
                <p className="text-sm text-muted-foreground">Use Cobalt Blue for depth, shadows, and structural elements</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}