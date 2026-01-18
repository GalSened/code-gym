"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Textarea, TextareaProps } from "@/components/ui/textarea";
import { FormField } from "./form-field";

export interface FormTextareaProps extends Omit<TextareaProps, "name"> {
  name: string;
  label?: string;
  helperText?: string;
}

export function FormTextarea({
  name,
  label,
  helperText,
  required,
  ...props
}: FormTextareaProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormField
          label={label}
          error={error}
          helperText={helperText}
          required={required}
        >
          <Textarea {...props} {...field} error={error} />
        </FormField>
      )}
    />
  );
}
