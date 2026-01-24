import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border placeholder:text-muted-foreground focus-visible:border-primary aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-xl border bg-background px-4 py-3 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 aria-invalid:ring-2 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
