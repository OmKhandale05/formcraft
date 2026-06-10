"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FormField, FormSchema } from "@/types/form";

function schemaForField(field: FormField) {
  if (["section", "divider", "file"].includes(field.type)) return z.any().optional();

  if (field.type === "number") {
    let numberSchema = z.coerce.number({ error: "Enter a valid number" });
    if (field.validation?.min !== undefined) numberSchema = numberSchema.min(field.validation.min);
    if (field.validation?.max !== undefined) numberSchema = numberSchema.max(field.validation.max);
    return field.required ? numberSchema : numberSchema.optional().or(z.literal(""));
  }

  if (field.type === "checkbox") {
    const checkboxSchema = z.array(z.string());
    return field.required ? checkboxSchema.min(1, "Choose at least one option") : checkboxSchema.optional();
  }

  let stringSchema = z.string();
  if (field.required) stringSchema = stringSchema.min(1, "This field is required");
  if (field.type === "email") stringSchema = stringSchema.email("Enter a valid email");
  if (field.validation?.minLength) stringSchema = stringSchema.min(field.validation.minLength);
  if (field.validation?.maxLength) stringSchema = stringSchema.max(field.validation.maxLength);

  return field.required ? stringSchema : stringSchema.optional().or(z.literal(""));
}

function buildZodSchema(fields: FormField[]) {
  return z.object(
    fields.reduce<Record<string, z.ZodTypeAny>>((shape, field) => {
      shape[field.id] = schemaForField(field);
      return shape;
    }, {})
  );
}

type FormRendererProps = {
  form: FormSchema;
  onSubmit?: (values: Record<string, unknown>) => void;
  compact?: boolean;
};

export function FormRenderer({ form, onSubmit, compact = false }: FormRendererProps) {
  const [submitted, setSubmitted] = useState(false);
  const schema = useMemo(() => buildZodSchema(form.fields), [form.fields]);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: form.fields.reduce<Record<string, unknown>>((values, field) => {
      values[field.id] = field.type === "checkbox" ? [] : "";
      return values;
    }, {})
  });

  const isDark = form.theme.mode === "dark";
  const rounded = form.theme.radius === "rounded";

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "border p-8 text-center shadow-sm",
          rounded ? "rounded-2xl" : "rounded-none",
          isDark ? "border-white/10 bg-[#15161a] text-white" : "border-[#dce1e8] bg-white text-[#15161a]"
        )}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white">
          ✓
        </div>
        <h2 className="text-xl font-semibold">Submission received</h2>
        <p className={cn("mt-2 text-sm", isDark ? "text-white/65" : "text-[#68707d]")}>
          Your response was saved locally for the FormCraft submissions dashboard.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      style={{ "--accent": form.theme.accentColor } as React.CSSProperties}
      className={cn(
        "border shadow-sm",
        compact ? "p-5" : "p-7 sm:p-8",
        rounded ? "rounded-2xl" : "rounded-none",
        isDark ? "border-white/10 bg-[#15161a] text-white" : "border-[#dce1e8] bg-white text-[#15161a]"
      )}
      onSubmit={handleSubmit((values) => {
        onSubmit?.(values);
        setSubmitted(true);
      })}
    >
      <div className="mb-6">
        <h1 className={cn("font-semibold", compact ? "text-xl" : "text-2xl")}>{form.title}</h1>
        <p className={cn("mt-2 text-sm leading-6", isDark ? "text-white/65" : "text-[#68707d]")}>{form.description}</p>
      </div>
      <div className="space-y-5">
        {form.fields.map((field) => (
          <RenderedField key={field.id} field={field} register={register} error={errors[field.id]?.message as string | undefined} dark={isDark} rounded={rounded} />
        ))}
      </div>
      <Button type="submit" variant="primary" className="mt-7 w-full sm:w-auto">
        Submit response
      </Button>
    </form>
  );
}

function RenderedField({
  field,
  register,
  error,
  dark,
  rounded
}: {
  field: FormField;
  register: ReturnType<typeof useForm<Record<string, unknown>>>["register"];
  error?: string;
  dark: boolean;
  rounded: boolean;
}) {
  const inputClass = cn(!rounded && "rounded-none", dark && "border-white/15 bg-white/5 text-white placeholder:text-white/35");

  if (field.type === "divider") return <div className={cn("h-px", dark ? "bg-white/10" : "bg-[#e5e9ef]")} />;
  if (field.type === "section") {
    return (
      <div className={cn("border-l-4 py-1 pl-4", dark ? "border-white/25" : "border-[var(--accent)]")}>
        <h2 className="text-base font-semibold">{field.label}</h2>
        {field.helperText && <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-[#68707d]")}>{field.helperText}</p>}
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={field.id} className={cn("mb-2 block", dark && "text-white")}>
        {field.label}
        {field.required && <span className="ml-1 text-[var(--accent)]">*</span>}
      </Label>
      {field.type === "textarea" && <Textarea id={field.id} placeholder={field.placeholder} className={inputClass} {...register(field.id)} />}
      {["text", "email", "phone", "number", "date"].includes(field.type) && (
        <Input id={field.id} type={field.type === "phone" ? "tel" : field.type} placeholder={field.placeholder} className={inputClass} {...register(field.id)} />
      )}
      {field.type === "dropdown" && (
        <Select id={field.id} className={inputClass} {...register(field.id)}>
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      )}
      {field.type === "radio" && (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <label key={option} className={cn("flex items-center gap-3 rounded-lg border p-3 text-sm", dark ? "border-white/10" : "border-[#dce1e8]")}>
              <input type="radio" value={option} {...register(field.id)} />
              {option}
            </label>
          ))}
        </div>
      )}
      {field.type === "checkbox" && (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <label key={option} className={cn("flex items-center gap-3 rounded-lg border p-3 text-sm", dark ? "border-white/10" : "border-[#dce1e8]")}>
              <input type="checkbox" value={option} {...register(field.id)} />
              {option}
            </label>
          ))}
        </div>
      )}
      {field.type === "file" && (
        <div className={cn("flex items-center gap-3 border border-dashed p-4 text-sm", rounded ? "rounded-xl" : "rounded-none", dark ? "border-white/20 text-white/70" : "border-[#cdd5df] text-[#68707d]")}>
          <UploadCloud size={20} />
          File upload placeholder
        </div>
      )}
      {field.helperText && <p className={cn("mt-1.5 text-xs", dark ? "text-white/50" : "text-[#68707d]")}>{field.helperText}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-[#dc2626]">{error}</p>}
    </div>
  );
}
