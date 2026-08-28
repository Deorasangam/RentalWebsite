import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const buttonVariants = {
  default: "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/25",
  outline: "border border-violet-500/30 bg-transparent text-violet-300 hover:bg-violet-500/10 hover:border-violet-400",
  ghost: "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  link: "text-violet-400 underline-offset-4 hover:underline",
};

const sizeVariants = {
  default: "h-10 px-5 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          buttonVariants[variant] || buttonVariants.default,
          sizeVariants[size] || sizeVariants.default,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
