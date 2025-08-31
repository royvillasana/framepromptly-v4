import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Professional blue glass variants
        "glass-dark":
          "bg-[hsl(228,100%,7%)]/90 text-white border-[hsl(206,95%,43%)]/50 font-medium shadow-sm backdrop-blur-sm hover:bg-[hsl(228,100%,7%)]/95",
        "glass-light": 
          "bg-white/95 text-[hsl(228,100%,7%)] border-[hsl(212,40%,25%)]/10 font-medium shadow-sm backdrop-blur-sm hover:bg-white/98",
        "glass-brand":
          "bg-[hsl(211,96%,39%)]/90 text-white border-[hsl(206,95%,43%)]/30 font-medium shadow-sm backdrop-blur-sm hover:bg-[hsl(211,96%,39%)]/95",
        "glass-gradient":
          "bg-gradient-to-r from-[hsl(211,96%,39%)]/85 to-[hsl(212,40%,25%)]/85 text-white border-[hsl(206,95%,43%)]/40 font-medium shadow-sm backdrop-blur-sm hover:from-[hsl(211,96%,39%)]/90 hover:to-[hsl(212,40%,25%)]/90",
        // New blue-specific variants
        "blue-steel":
          "bg-[hsl(206,95%,43%)] text-white border-transparent font-medium shadow-sm hover:bg-[hsl(206,95%,38%)]",
        "blue-denim":
          "bg-[hsl(211,96%,39%)] text-white border-transparent font-medium shadow-sm hover:bg-[hsl(211,96%,34%)]",
        "blue-prussian":
          "bg-[hsl(212,40%,25%)] text-white border-transparent font-medium shadow-sm hover:bg-[hsl(212,40%,20%)]",
        "blue-oxford":
          "bg-[hsl(228,100%,7%)] text-white border-transparent font-medium shadow-sm hover:bg-[hsl(228,100%,12%)]",
        // FramePromptly Color System badges
        "celestial-blue":
          "bg-celestial-blue-500 text-white border-transparent font-medium shadow-sm hover:bg-celestial-blue-600",
        "celestial-blue-subtle":
          "bg-celestial-blue-100 text-celestial-blue-800 border-celestial-blue-200 font-medium hover:bg-celestial-blue-200",
        "indigo-dye":
          "bg-indigo-dye-900 text-white border-transparent font-medium shadow-sm hover:bg-indigo-dye-800",
        "indigo-dye-subtle":
          "bg-indigo-dye-100 text-indigo-dye-800 border-indigo-dye-200 font-medium hover:bg-indigo-dye-200",
        "malachite":
          "bg-malachite-500 text-white border-transparent font-medium shadow-sm hover:bg-malachite-600",
        "malachite-subtle":
          "bg-malachite-100 text-malachite-800 border-malachite-200 font-medium hover:bg-malachite-200",
        "cobalt-blue":
          "bg-cobalt-blue-800 text-white border-transparent font-medium shadow-sm hover:bg-cobalt-blue-900",
        "cobalt-blue-subtle":
          "bg-cobalt-blue-100 text-cobalt-blue-800 border-cobalt-blue-200 font-medium hover:bg-cobalt-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
