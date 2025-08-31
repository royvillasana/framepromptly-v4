/**
 * @fileoverview Professional Blue Framework Color System
 * Sophisticated blue color palette for UX professionals
 * 
 * Design Principles:
 * - Professional blue palette with excellent accessibility
 * - Trustworthy and modern appearance for UX professionals
 * - Color hierarchy using various blue tones
 * - WCAG AA compliant contrast ratios
 * - Cohesive visual system across all frameworks
 * 
 * Color Palette:
 * - Denim: #0461C3 (hsla(211, 96%, 39%, 1)) - Primary brand color
 * - Oxford Blue: #000724 (hsla(228, 100%, 7%, 1)) - Deep dark accent
 * - Prussian Blue: #263D58 (hsla(212, 40%, 25%, 1)) - Medium tone
 * - Black: #000000 (hsla(0, 0%, 0%, 1)) - Pure black for text/contrast
 * - Steel Blue: #067CD5 (hsla(206, 95%, 43%, 1)) - Bright accent color
 */

export interface FrameworkColorSystem {
  primary: string;          // Framework level - full saturation
  secondary: string;        // Stage level - lighter variation
  tertiary: string;         // Tool level - lightest variation
  accent: string;           // Hover/active states
  text: {
    primary: string;        // Main text on primary background (WCAG AA compliant)
    secondary: string;      // Secondary text
    light: string;          // Text on light backgrounds
    hover: string;          // Text color for hover states (WCAG AA compliant)
  };
  background: {
    primary: string;        // Main background
    secondary: string;      // Stage background  
    tertiary: string;       // Tool background
    hover: string;          // Hover states
  };
  border: {
    primary: string;        // Main borders
    secondary: string;      // Stage borders
    tertiary: string;       // Tool borders
  };
  tailwind: {
    framework: string[];    // Framework level classes
    stage: string[];        // Stage level classes
    tool: string[];         // Tool level classes
  };
}

/**
 * Professional blue framework color system with varying intensities
 * Each framework gets a unique blue variation while maintaining visual harmony
 */
const createFrameworkColorSystem = (blueVariant: 'denim' | 'steel' | 'prussian', intensity: number): FrameworkColorSystem => {
  const baseColors = {
    denim: { h: 211, s: 96, l: 39 },
    steel: { h: 206, s: 95, l: 43 },
    prussian: { h: 212, s: 40, l: 25 }
  };
  
  const base = baseColors[blueVariant];
  const primaryL = Math.max(25, Math.min(50, base.l + (intensity * 2))); // Adjust lightness
  
  return {
    primary: `hsl(${base.h}, ${base.s}%, ${primaryL}%)`,
    secondary: `hsl(${base.h}, ${Math.max(30, base.s - 40)}%, ${Math.min(95, 85 + intensity)})`,
    tertiary: `hsl(${base.h}, 20%, 97%)`,
    accent: `hsl(${base.h}, ${base.s}%, ${Math.max(30, primaryL - 10)})`,
    text: {
      primary: '#FFFFFF',
      secondary: 'hsl(228, 100%, 7%)', // Oxford Blue
      light: `hsl(${base.h}, 20%, 45%)`,
      hover: '#FFFFFF'
    },
    background: {
      primary: `hsl(${base.h}, ${base.s}%, ${primaryL}%)`,
      secondary: `hsl(${base.h}, ${Math.max(20, base.s - 60)}%, 96%)`,
      tertiary: '#FFFFFF',
      hover: `hsl(${base.h}, ${base.s}%, ${Math.max(20, primaryL - 8)})` 
    },
    border: {
      primary: `hsl(${base.h}, ${base.s}%, ${primaryL}%)`,
      secondary: `hsl(${base.h}, 30%, 80%)`,
      tertiary: `hsl(${base.h}, 20%, 90%)`
    },
    tailwind: {
      framework: [
        `bg-[hsl(${base.h},${base.s}%,${primaryL}%)]`, 
        `border-[hsl(${base.h},${base.s}%,${primaryL}%)]`, 
        'text-white', 
        `hover:bg-[hsl(${base.h},${base.s}%,${Math.max(20, primaryL - 8)}%)]`
      ],
      stage: [
        `bg-[hsl(${base.h},${Math.max(20, base.s - 60)}%,96%)]`,
        `border-[hsl(${base.h},30%,80%)]`,
        'text-[hsl(228,100%,7%)]',
        `hover:bg-[hsl(${base.h},${Math.max(30, base.s - 50)}%,92%)]`
      ],
      tool: [
        'bg-white',
        `border-[hsl(${base.h},20%,90%)]`,
        'text-[hsl(228,100%,7%)]',
        `hover:bg-[hsl(${base.h},20%,97%)]`
      ]
    }
  };
};

export const FRAMEWORK_COLORS: Record<string, FrameworkColorSystem> = {
  'design-thinking': createFrameworkColorSystem('denim', 0),
  'double-diamond': createFrameworkColorSystem('steel', 2),
  'google-design-sprint': createFrameworkColorSystem('denim', 4),
  'human-centered-design': createFrameworkColorSystem('prussian', 8),
  'jobs-to-be-done': createFrameworkColorSystem('steel', 1),
  'lean-ux': createFrameworkColorSystem('denim', 2),
  'agile-ux': createFrameworkColorSystem('steel', 3),
  'heart-framework': createFrameworkColorSystem('prussian', 6),
  'hooked-model': createFrameworkColorSystem('denim', 3)
};

/**
 * Get framework color system by ID
 */
export function getFrameworkColors(frameworkId: string): FrameworkColorSystem {
  return FRAMEWORK_COLORS[frameworkId] || FRAMEWORK_COLORS['design-thinking'];
}

/**
 * Get Tailwind classes for framework hierarchy level
 */
export function getFrameworkTailwindClasses(frameworkId: string, level: 'framework' | 'stage' | 'tool'): string[] {
  const colors = getFrameworkColors(frameworkId);
  return colors.tailwind[level];
}

/**
 * Generate CSS custom properties for a framework
 */
export function generateFrameworkCSSVars(frameworkId: string): Record<string, string> {
  const colors = getFrameworkColors(frameworkId);
  return {
    [`--framework-${frameworkId}-primary`]: colors.primary,
    [`--framework-${frameworkId}-secondary`]: colors.secondary,
    [`--framework-${frameworkId}-tertiary`]: colors.tertiary,
    [`--framework-${frameworkId}-accent`]: colors.accent,
    [`--framework-${frameworkId}-text-primary`]: colors.text.primary,
    [`--framework-${frameworkId}-text-secondary`]: colors.text.secondary,
    [`--framework-${frameworkId}-text-light`]: colors.text.light,
    [`--framework-${frameworkId}-bg-primary`]: colors.background.primary,
    [`--framework-${frameworkId}-bg-secondary`]: colors.background.secondary,
    [`--framework-${frameworkId}-bg-tertiary`]: colors.background.tertiary,
    [`--framework-${frameworkId}-bg-hover`]: colors.background.hover,
    [`--framework-${frameworkId}-border-primary`]: colors.border.primary,
    [`--framework-${frameworkId}-border-secondary`]: colors.border.secondary,
    [`--framework-${frameworkId}-border-tertiary`]: colors.border.tertiary,
  };
}