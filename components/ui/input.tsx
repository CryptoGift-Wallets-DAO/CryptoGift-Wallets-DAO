import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          // Light mode
          "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:border-cyan-500",
          // Dark mode
          "dark:border-white/[0.08] dark:bg-slate-900/10 dark:text-white dark:placeholder:text-white/40 dark:focus-visible:border-white/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }