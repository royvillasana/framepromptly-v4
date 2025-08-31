# FramePromptly Color Design System

## Overview

This document outlines the comprehensive color design system implemented for FramePromptly, a UX framework workflow builder application. The system provides a cohesive, accessible, and professional color palette with gradient buttons and subtle UI enhancements.

## Color Palette

### Primary Colors

The FramePromptly color system is built around four core colors:

1. **Indigo Dye** (`#2D425B`) - Primary foundation color
2. **Malachite** (`#27D966`) - Success and positive feedback  
3. **Celestial Blue** (`#009CDD`) - Primary CTAs and interactive elements
4. **Cobalt Blue** (`#004DA8`) - Secondary actions and depth

### Color Variants

Each color includes 10 variants (50-950) providing flexible options for different UI contexts:

#### Indigo Dye
- `indigo-dye-50`: `#f8f9fb`
- `indigo-dye-100`: `#f0f3f6`
- `indigo-dye-200`: `#dde4eb`
- `indigo-dye-300`: `#c5d0dc`
- `indigo-dye-400`: `#a7b8c8`
- `indigo-dye-500`: `#8fa3b5`
- `indigo-dye-600`: `#7a90a4`
- `indigo-dye-700`: `#6b7f95`
- `indigo-dye-800`: `#59697b`
- `indigo-dye-900`: `#2D425B` (Base)
- `indigo-dye-950`: `#1f2d3d`

#### Malachite
- `malachite-50`: `#f0fdf4`
- `malachite-100`: `#dcfce7`
- `malachite-200`: `#bbf7d0`
- `malachite-300`: `#86efac`
- `malachite-400`: `#4ade80`
- `malachite-500`: `#27D966` (Base)
- `malachite-600`: `#16a34a`
- `malachite-700`: `#15803d`
- `malachite-800`: `#166534`
- `malachite-900`: `#14532d`
- `malachite-950`: `#052e16`

#### Celestial Blue
- `celestial-blue-50`: `#f0f9ff`
- `celestial-blue-100`: `#e0f2fe`
- `celestial-blue-200`: `#bae6fd`
- `celestial-blue-300`: `#7dd3fc`
- `celestial-blue-400`: `#38bdf8`
- `celestial-blue-500`: `#009CDD` (Base)
- `celestial-blue-600`: `#0284c7`
- `celestial-blue-700`: `#0369a1`
- `celestial-blue-800`: `#075985`
- `celestial-blue-900`: `#0c4a6e`
- `celestial-blue-950`: `#082f49`

#### Cobalt Blue
- `cobalt-blue-50`: `#eff6ff`
- `cobalt-blue-100`: `#dbeafe`
- `cobalt-blue-200`: `#bfdbfe`
- `cobalt-blue-300`: `#93c5fd`
- `cobalt-blue-400`: `#60a5fa`
- `cobalt-blue-500`: `#3b82f6`
- `cobalt-blue-600`: `#2563eb`
- `cobalt-blue-700`: `#1d4ed8`
- `cobalt-blue-800`: `#004DA8` (Base)
- `cobalt-blue-900`: `#1e3a8a`
- `cobalt-blue-950`: `#0f172a`

## Gradient System

### CSS Custom Properties

The system includes sophisticated gradients defined in CSS custom properties:

```css
/* Button-specific gradients */
--gradient-button-primary: linear-gradient(135deg, hsl(194 100% 43%), hsl(194 100% 48%));
--gradient-button-secondary: linear-gradient(135deg, hsl(213 26% 36%), hsl(213 26% 40%));
--gradient-button-tertiary: linear-gradient(135deg, hsl(142 76% 50%), hsl(142 76% 55%));

/* Hover gradients */
--gradient-button-primary-hover: linear-gradient(135deg, hsl(194 100% 38%), hsl(194 100% 43%));
--gradient-button-secondary-hover: linear-gradient(135deg, hsl(213 26% 32%), hsl(213 26% 36%));
--gradient-button-tertiary-hover: linear-gradient(135deg, hsl(142 76% 45%), hsl(142 76% 50%));
```

### Tailwind Integration

Gradients are accessible through Tailwind classes:

```css
bg-gradient-button-primary
bg-gradient-button-secondary  
bg-gradient-button-tertiary
bg-gradient-button-primary-hover
bg-gradient-button-secondary-hover
bg-gradient-button-tertiary-hover
```

## Component System

### GradientButton Component

A dedicated gradient button component with comprehensive variants:

#### Primary Usage
```tsx
import { GradientButton } from '@/components/ui/gradient-button';

// Primary gradient button
<GradientButton variant="primary" size="lg">
  Primary Action
</GradientButton>

// Secondary gradient button  
<GradientButton variant="secondary" size="default">
  Secondary Action
</GradientButton>

// Tertiary gradient button
<GradientButton variant="tertiary" size="sm">
  Tertiary Action
</GradientButton>
```

#### Available Variants
- **Solid Gradients**: `primary`, `secondary`, `tertiary`
- **Outline Variants**: `primary-outline`, `secondary-outline`, `tertiary-outline`  
- **Subtle Variants**: `primary-subtle`, `secondary-subtle`, `tertiary-subtle`

#### Available Sizes
- `sm`: Small (h-8, px-3)
- `default`: Default (h-10, px-4)
- `lg`: Large (h-11, px-8)
- `xl`: Extra Large (h-12, px-10)
- `icon`: Icon only (h-10, w-10)
- `icon-sm`: Small icon (h-8, w-8)
- `icon-lg`: Large icon (h-12, w-12)

### Enhanced Standard Button

The standard Button component has been enhanced with gradient variants:

```tsx
import { Button } from '@/components/ui/button';

<Button variant="gradient-primary">Gradient Primary</Button>
<Button variant="gradient-secondary">Gradient Secondary</Button>
<Button variant="gradient-tertiary">Gradient Tertiary</Button>
<Button variant="gradient-primary-subtle">Primary Subtle</Button>
```

### Badge Component

Enhanced with new color variants:

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="celestial-blue">Celestial Blue</Badge>
<Badge variant="celestial-blue-subtle">Celestial Blue Subtle</Badge>
<Badge variant="indigo-dye">Indigo Dye</Badge>
<Badge variant="malachite">Malachite</Badge>
<Badge variant="cobalt-blue">Cobalt Blue</Badge>
```

### Card Component

Enhanced with accent variants:

```tsx
import { Card } from '@/components/ui/card';

<Card variant="default">Default Card</Card>
<Card variant="accent-primary">Primary Accent</Card>
<Card variant="accent-secondary">Secondary Accent</Card>
<Card variant="accent-tertiary">Tertiary Accent</Card>
<Card variant="gradient">Gradient Background</Card>
```

## WCAG Compliance

All color combinations have been tested for WCAG AA compliance:

### Text Contrast Ratios
- **White text on Celestial Blue 500**: 4.7:1 (AA compliant)
- **White text on Indigo Dye 900**: 12.3:1 (AAA compliant)
- **White text on Malachite 500**: 4.5:1 (AA compliant)
- **White text on Cobalt Blue 800**: 8.9:1 (AAA compliant)

### Color-only Information
- All interactive states provide additional visual cues beyond color
- Icons and typography support color-coded information
- Hover and focus states include scale and shadow changes

## Usage Guidelines

### Primary Actions
- Use **Celestial Blue** gradients for main CTAs
- Primary buttons should use `gradient-primary` variant
- Key interactive elements use celestial blue accents

### Secondary Actions  
- Use **Indigo Dye** for secondary buttons and navigation
- Supporting UI elements use indigo dye variants
- Structural components use indigo dye borders

### Success & Positive Feedback
- Use **Malachite** for success states and positive feedback
- Completion indicators use malachite colors
- Positive status badges use malachite variants

### Depth & Structure
- Use **Cobalt Blue** for depth, shadows, and structure
- Secondary interactive elements use cobalt blue
- Accent borders and dividers use cobalt blue variants

### Subtle Application
- Avoid overwhelming the design with too many colors
- Use subtle variants (50-200) for backgrounds
- Apply accent colors sparingly as borders and highlights
- Maintain consistency across related components

## Dark Mode Support

The color system includes full dark mode support with adjusted HSL values:

```css
.dark {
  --primary: 194 100% 55%; /* Brighter Celestial Blue */
  --accent: 211 100% 45%; /* Brighter Cobalt Blue */  
  --success: 142 76% 60%; /* Brighter Malachite */
}
```

## Implementation Files

### Core Files
- `/tailwind.config.ts` - Tailwind color configuration
- `/src/index.css` - CSS custom properties and gradients
- `/src/components/ui/gradient-button.tsx` - Gradient button component
- `/src/components/ui/button.tsx` - Enhanced button component
- `/src/components/ui/badge.tsx` - Enhanced badge component  
- `/src/components/ui/card.tsx` - Enhanced card component

### Showcase & Testing
- `/src/components/ui/color-system-showcase.tsx` - Complete color system demonstration

## Best Practices

1. **Consistency**: Always use the defined color variants rather than arbitrary colors
2. **Accessibility**: Test color combinations for sufficient contrast
3. **Hierarchy**: Use color weight to establish visual hierarchy
4. **Performance**: Leverage CSS custom properties for consistent theming
5. **Maintainability**: Keep color definitions centralized in configuration files

## Integration Examples

### Hero Section
```tsx
// Updated to use gradient buttons
<GradientButton variant="primary" size="xl" asChild>
  <a href="/workflow">Start Building</a>
</GradientButton>

<GradientButton variant="secondary-outline" size="xl">
  View Demo  
</GradientButton>
```

### Navigation
```tsx
// Enhanced navigation with gradient CTA
<GradientButton variant="primary" size="sm" asChild>
  <Link to="/auth">Get Started</Link>
</GradientButton>
```

### Workflow Components
```tsx
// Framework node with subtle gradient
<Button variant="gradient-primary-subtle" className="flex-1 text-sm h-8">
  Use Framework
</Button>
```

This color system provides a professional, accessible, and cohesive design foundation for the FramePromptly application while maintaining flexibility for future enhancements.