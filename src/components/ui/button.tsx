import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-glow",
        hero: "bg-foreground text-primary-foreground shadow-lift hover:-translate-y-0.5 hover:shadow-glow",
        ai: "bg-gradient-ai text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-border-strong bg-surface text-foreground shadow-soft hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift",
        secondary:
          "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-accent hover:shadow-soft",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded-md",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-[0.95rem]",
        xl: "h-14 px-9 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
