import * as React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    secondary: "bg-white/10 text-slate-300 border-white/10",
    destructive: "bg-red-500/20 text-red-300 border-red-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    outline: "border-white/20 text-slate-300",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
