"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Select, SelectProps } from "@/components/ui/select";
import { FormField } from "./form-field";

export interface FormSelectProps extends Omit<SelectProps, "name"> {
  name: string;
  label?: string;
  helperText?: string;
}

export function FormSelect({
  name,
  label,
  helperText,
  required,
  ...props
}: FormSelectProps) {
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
          <Select {...props} {...field} error={error} />
        </FormField>
      )}
    />
  );
}
