
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          {
            "bg-primary text-primary-foreground hover:brightness-110 shadow-sm": variant === "default",
            "border border-white/10 bg-transparent hover:bg-white/5 text-foreground": variant === "outline",
            "bg-transparent hover:bg-white/5 text-foreground": variant === "ghost",
            "bg-transparent underline-offset-4 hover:underline text-foreground": variant === "link",
            "bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-button-glow hover:brightness-110": variant === "gradient",
          },
          
          // Sizes
          {
            "h-9 px-4 rounded-md text-sm": size === "sm",
            "h-11 px-6 rounded-md text-base": size === "md",
            "h-14 px-8 rounded-md text-lg": size === "lg",
            "h-10 w-10 rounded-md": size === "icon",
          },
          
          // Fix horizontal alignment of icon and text
          "[&>svg]:inline-block [&>svg]:align-middle",
          
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : null}
        <span className={cn(isLoading ? "opacity-0" : "opacity-100", "flex items-center")}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
