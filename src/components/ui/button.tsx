import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // New gradient button variants with WCAG compliant text colors
        "gradient-primary": 
          "bg-gradient-button-primary text-white font-semibold shadow-md hover:bg-gradient-button-primary-hover hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
        "gradient-secondary": 
          "bg-gradient-button-secondary text-white font-semibold shadow-md hover:bg-gradient-button-secondary-hover hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
        "gradient-tertiary": 
          "bg-gradient-button-tertiary text-white font-semibold shadow-md hover:bg-gradient-button-tertiary-hover hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
        // Subtle gradient variants for less prominent actions
        "gradient-primary-subtle": 
          "bg-gradient-to-r from-celestial-blue-50 to-celestial-blue-100 text-celestial-blue-800 border border-celestial-blue-200 hover:from-celestial-blue-100 hover:to-celestial-blue-200 hover:border-celestial-blue-300",
        "gradient-secondary-subtle": 
          "bg-gradient-to-r from-indigo-dye-50 to-indigo-dye-100 text-indigo-dye-800 border border-indigo-dye-200 hover:from-indigo-dye-100 hover:to-indigo-dye-200 hover:border-indigo-dye-300",
        "gradient-tertiary-subtle": 
          "bg-gradient-to-r from-malachite-50 to-malachite-100 text-malachite-800 border border-malachite-200 hover:from-malachite-100 hover:to-malachite-200 hover:border-malachite-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-12 rounded-lg px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
