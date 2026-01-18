"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input, InputProps } from "@/components/ui/input";
import { FormField } from "./form-field";

export interface FormInputProps extends Omit<InputProps, "name"> {
  name: string;
  label?: string;
  helperText?: string;
}

export function FormInput({
  name,
  label,
  helperText,
  required,
  ...props
}: FormInputProps) {
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
          <Input {...props} {...field} error={error} />
        </FormField>
      )}
    />
  );
}
