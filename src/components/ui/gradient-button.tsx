import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-lg hover:shadow-xl",
  {
    variants: {
      variant: {
        // Primary gradient: Celestial Blue dominant (main CTAs)
        primary: [
          "bg-gradient-button-primary",
          "text-white",
          "hover:bg-gradient-button-primary-hover",
          "focus-visible:ring-celestial-blue-500",
          "active:scale-[0.98]",
          "hover:scale-[1.02]",
          "transform"
        ].join(" "),
        
        // Secondary gradient: Indigo Dye dominant (secondary actions)
        secondary: [
          "bg-gradient-button-secondary", 
          "text-white",
          "hover:bg-gradient-button-secondary-hover",
          "focus-visible:ring-indigo-dye-500",
          "active:scale-[0.98]",
          "hover:scale-[1.02]", 
          "transform"
        ].join(" "),
        
        // Tertiary gradient: Malachite dominant (success/positive actions)
        tertiary: [
          "bg-gradient-button-tertiary",
          "text-white", 
          "hover:bg-gradient-button-tertiary-hover",
          "focus-visible:ring-malachite-500",
          "active:scale-[0.98]",
          "hover:scale-[1.02]",
          "transform"
        ].join(" "),

        // Outlined gradient variants
        "primary-outline": [
          "border-2 border-celestial-blue-500",
          "bg-gradient-to-r from-transparent to-transparent",
          "text-celestial-blue-700 dark:text-celestial-blue-300",
          "hover:bg-gradient-to-r hover:from-celestial-blue-50 hover:to-celestial-blue-100",
          "dark:hover:from-celestial-blue-950/20 dark:hover:to-celestial-blue-900/20",
          "focus-visible:ring-celestial-blue-500"
        ].join(" "),
        
        "secondary-outline": [
          "border-2 border-indigo-dye-500", 
          "bg-gradient-to-r from-transparent to-transparent",
          "text-indigo-dye-700 dark:text-indigo-dye-300",
          "hover:bg-gradient-to-r hover:from-indigo-dye-50 hover:to-indigo-dye-100",
          "dark:hover:from-indigo-dye-950/20 dark:hover:to-indigo-dye-900/20",
          "focus-visible:ring-indigo-dye-500"
        ].join(" "),
        
        "tertiary-outline": [
          "border-2 border-malachite-500",
          "bg-gradient-to-r from-transparent to-transparent", 
          "text-malachite-700 dark:text-malachite-300",
          "hover:bg-gradient-to-r hover:from-malachite-50 hover:to-malachite-100",
          "dark:hover:from-malachite-950/20 dark:hover:to-malachite-900/20",
          "focus-visible:ring-malachite-500"
        ].join(" "),

        // Subtle gradient variants for secondary UI elements
        "primary-subtle": [
          "bg-gradient-to-r from-celestial-blue-50 to-celestial-blue-100",
          "dark:from-celestial-blue-950/30 dark:to-celestial-blue-900/30",
          "text-celestial-blue-800 dark:text-celestial-blue-200",
          "border border-celestial-blue-200 dark:border-celestial-blue-800",
          "hover:from-celestial-blue-100 hover:to-celestial-blue-200",
          "dark:hover:from-celestial-blue-900/40 dark:hover:to-celestial-blue-800/40",
          "shadow-sm hover:shadow-md"
        ].join(" "),
        
        "secondary-subtle": [
          "bg-gradient-to-r from-indigo-dye-50 to-indigo-dye-100",
          "dark:from-indigo-dye-950/30 dark:to-indigo-dye-900/30", 
          "text-indigo-dye-800 dark:text-indigo-dye-200",
          "border border-indigo-dye-200 dark:border-indigo-dye-800",
          "hover:from-indigo-dye-100 hover:to-indigo-dye-200",
          "dark:hover:from-indigo-dye-900/40 dark:hover:to-indigo-dye-800/40",
          "shadow-sm hover:shadow-md"
        ].join(" "),
        
        "tertiary-subtle": [
          "bg-gradient-to-r from-malachite-50 to-malachite-100",
          "dark:from-malachite-950/30 dark:to-malachite-900/30",
          "text-malachite-800 dark:text-malachite-200", 
          "border border-malachite-200 dark:border-malachite-800",
          "hover:from-malachite-100 hover:to-malachite-200",
          "dark:hover:from-malachite-900/40 dark:hover:to-malachite-800/40",
          "shadow-sm hover:shadow-md"
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-8 rounded-xl",
        xl: "h-12 px-10 text-base rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }