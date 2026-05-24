import * as React from "react"
import { cn } from "../../lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-white/80 p-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-[linear-gradient(180deg,rgba(72,130,255,0.92)_0%,rgba(37,99,235,0.92)_100%)] shadow-[0_10px_24px_rgba(37,99,235,0.24)]"
            : "bg-[rgba(221,228,241,0.9)]",
          className
        )}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-[0_8px_20px_rgba(21,33,63,0.16)] ring-0 transition-transform duration-300",
            checked ? "translate-x-6" : "translate-x-0"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
