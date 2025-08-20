import * as React from "react"
import { cn } from "@/lib/utils"

const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-1 p-1 bg-background border border-border rounded-lg shadow-sm",
      className
    )}
    {...props}
  />
))
Toolbar.displayName = "Toolbar"

const ToolbarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-px h-6 bg-border", className)}
    {...props}
  />
))
ToolbarSeparator.displayName = "ToolbarSeparator"

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      "h-9 px-3 hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))
ToolbarButton.displayName = "ToolbarButton"

export { Toolbar, ToolbarSeparator, ToolbarButton }