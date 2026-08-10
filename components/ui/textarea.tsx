import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 transition-all duration-200 outline-none placeholder:text-slate-400 placeholder:font-medium focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={value ?? ""}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
