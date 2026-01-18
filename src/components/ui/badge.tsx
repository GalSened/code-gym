import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "primary" | "success" | "warning" | "error" | "easy" | "medium" | "hard";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  secondary: "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
  success: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
  warning: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
  error: "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300",
  easy: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
  medium: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
  hard: "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300",
};

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
