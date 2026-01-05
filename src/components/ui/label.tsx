"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  children?: React.ReactNode
  className?: string
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      {...props}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      ) as any}
    />
  )
})

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
export type { LabelProps }