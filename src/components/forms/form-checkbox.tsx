"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  name: string;
  label: React.ReactNode;
  description?: string;
}

export function FormCheckbox({
  name,
  label,
  description,
  className,
  ...props
}: FormCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <div className={cn("flex items-start gap-3", className)}>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            {...field}
            {...props}
            className={cn(
              "mt-1 h-4 w-4 rounded border-gray-300 text-primary-600",
              "focus:ring-primary-500 focus:ring-2 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500"
            )}
          />
          <div className="space-y-1">
            <label
              htmlFor={props.id}
              className={cn(
                "text-sm font-medium text-gray-700 dark:text-gray-300",
                props.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </div>
      )}
    />
  );
}
