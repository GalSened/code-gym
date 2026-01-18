"use client";

import * as React from "react";
import {
  useForm,
  FormProvider,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  DefaultValues,
  Mode,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

export interface FormProps<T extends FieldValues> {
  schema?: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode);
  className?: string;
  mode?: Mode;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  mode = "onBlur",
}: FormProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema as any) : undefined,
    defaultValues,
    mode,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
        noValidate
      >
        {typeof children === "function" ? children(methods) : children}
      </form>
    </FormProvider>
  );
}

// Hook to access form context
export { useFormContext } from "react-hook-form";
