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
        // High contrast variants for gradient backgrounds
        "glass-dark":
          "bg-slate-900/85 text-white border-white/50 font-medium shadow-sm backdrop-blur-sm hover:bg-slate-900/90",
        "glass-light": 
          "bg-white/95 text-slate-900 border-black/10 font-medium shadow-sm backdrop-blur-sm hover:bg-white/98",
        "glass-brand":
          "bg-blue-600/90 text-white border-white/30 font-medium shadow-sm backdrop-blur-sm hover:bg-blue-600/95",
        "glass-gradient":
          "bg-gradient-to-r from-slate-900/85 to-slate-600/85 text-white border-white/40 font-medium shadow-sm backdrop-blur-sm hover:from-slate-900/90 hover:to-slate-600/90",
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
