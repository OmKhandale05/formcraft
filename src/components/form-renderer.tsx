"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, type MotionProps } from "framer-motion";
import { ArrowLeft, ArrowRight, Bold, Calculator, Check, CheckCircle2, ChevronDown, CreditCard, Eraser, Italic, List, ListOrdered, PenLine, Quote, Star, Underline, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useForm, useWatch, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { defaultAppearance, getFontFamily } from "@/lib/appearance";
import { evaluateFormula, formatFormulaValue } from "@/lib/formula";
import { evaluateLogic } from "@/lib/logic";
import { phoneCountries } from "@/lib/phone-countries";
import { cn } from "@/lib/utils";
import type { FormField, FormSchema, FormTheme } from "@/types/form";

function fieldHasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    if ("start" in value || "end" in value) {
      const range = value as { start?: unknown; end?: unknown };
      return Boolean(String(range.start ?? "").trim() && String(range.end ?? "").trim());
    }
    return Object.values(value).some(fieldHasValue);
  }
  return String(value ?? "").trim().length > 0;
}

function schemaForField(field: FormField) {
  if (["section", "divider", "file", "hidden", "formula"].includes(field.type)) return z.any().optional();

  if (["number", "rating", "slider", "payment"].includes(field.type)) {
    let numberSchema = z.coerce.number({ error: "Enter a valid number" });
    if (field.validation?.min !== undefined) numberSchema = numberSchema.min(field.validation.min);
    if (field.validation?.max !== undefined) numberSchema = numberSchema.max(field.validation.max);
    return numberSchema.optional().or(z.literal(""));
  }

  if (field.type === "checkbox") {
    return z.array(z.string()).optional();
  }

  if (field.type === "daterange") {
    return z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional();
  }

  if (field.type === "matrix") return z.record(z.string(), z.string()).optional();

  let stringSchema = z.string();
  if (field.type === "email") stringSchema = stringSchema.email("Enter a valid email");
  if (field.validation?.minLength) stringSchema = stringSchema.min(field.validation.minLength);
  if (field.validation?.maxLength) stringSchema = stringSchema.max(field.validation.maxLength);

  return stringSchema.optional().or(z.literal(""));
}

function buildZodSchema(form: FormSchema) {
  return z.object(
    form.fields.reduce<Record<string, z.ZodTypeAny>>((shape, field) => {
      shape[field.id] = schemaForField(field);
      return shape;
    }, {})
  ).superRefine((values, context) => {
    const effects = evaluateLogic(form, values);
    for (const field of form.fields) {
      if (effects.hiddenFieldIds.has(field.id) || !effects.requiredFieldIds.has(field.id)) continue;
      if (!fieldHasValue(values[field.id])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: field.type === "checkbox" ? "Choose at least one option" : field.type === "rating" ? "Choose a rating" : "This field is required",
          path: [field.id]
        });
      }
    }
  });
}

function validationNamesForField(field: FormField) {
  if (["section", "divider", "hidden", "file", "formula"].includes(field.type)) return [];
  if (field.type === "daterange") return [`${field.id}.start`, `${field.id}.end`];
  return [field.id];
}

function formWidthClass(width?: FormTheme["formWidth"]) {
  if (width === "narrow") return "max-w-2xl";
  if (width === "wide") return "max-w-5xl";
  return "max-w-3xl";
}

function fieldGapClass(density?: FormTheme["density"]) {
  if (density === "compact") return "gap-4";
  if (density === "spacious") return "gap-7";
  return "gap-5";
}

function fieldHeightClass(density?: FormTheme["density"]) {
  if (density === "compact") return "h-9";
  if (density === "spacious") return "h-12";
  return "h-10";
}

function textScaleClass(scale?: FormTheme["fontScale"]) {
  if (scale === "compact") return "text-[13px]";
  if (scale === "large") return "text-base";
  return "text-sm";
}

function textareaMinHeightClass(density?: FormTheme["density"]) {
  if (density === "compact") return "min-h-20";
  if (density === "spacious") return "min-h-32";
  return "min-h-24";
}

function formPaddingClass(padding?: FormTheme["formPadding"], compact?: boolean) {
  if (compact) {
    if (padding === "compact") return "p-4";
    if (padding === "spacious") return "p-6";
    return "p-5";
  }
  if (padding === "compact") return "p-5 sm:p-6";
  if (padding === "spacious") return "p-8 sm:p-10";
  return "p-7 sm:p-8";
}

function labelSpacingClass(spacing?: FormTheme["labelSpacing"]) {
  if (spacing === "compact") return "mb-1.5";
  if (spacing === "spacious") return "mb-3";
  return "mb-2";
}

function controlClass(theme: FormTheme, dark: boolean, rounded: boolean, kind: "input" | "textarea" = "input") {
  const style = theme.fieldStyle ?? defaultAppearance.fieldStyle;
  const density = theme.density ?? defaultAppearance.density;
  const radiusClass = rounded ? "!rounded-[var(--field-radius)]" : "!rounded-none";

  return cn(
    "formcraft-control w-full !border-[length:var(--field-border-width)] text-[#111827] transition duration-200 placeholder:text-[#98a2b3] focus:outline-none",
    kind === "input" ? fieldHeightClass(density) : textareaMinHeightClass(density),
    radiusClass,
    style === "outline" && "border-[#d8e0ea] bg-white/90 shadow-sm",
    style === "filled" && "border-transparent bg-[#f1f5f9] shadow-none",
    style === "underline" && "!rounded-none !border-x-0 !border-t-0 !border-b-[length:var(--field-border-width)] border-[#cbd5e1] bg-transparent px-0 shadow-none",
    style === "glass" && "border-white/60 bg-white/70 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur",
    dark && style !== "underline" && "border-white/15 bg-white/5 text-white placeholder:text-white/35",
    dark && style === "filled" && "bg-white/10",
    dark && style === "underline" && "border-white/20 text-white placeholder:text-white/35",
    dark && "focus:bg-white/10"
  );
}

function surfaceClass(theme: FormTheme, dark: boolean, rounded: boolean) {
  const style = theme.fieldStyle ?? defaultAppearance.fieldStyle;
  const radiusClass = rounded ? "rounded-[var(--field-radius)]" : "rounded-none";

  return cn(
    "border-[length:var(--field-border-width)] transition duration-200",
    radiusClass,
    style === "outline" && "border-[#d8e0ea] bg-white/90 shadow-sm",
    style === "filled" && "border-transparent bg-[#f1f5f9] shadow-none",
    style === "underline" && "!rounded-none !border-x-0 !border-t-0 !border-b-[length:var(--field-border-width)] border-[#cbd5e1] bg-transparent shadow-none",
    style === "glass" && "border-white/60 bg-white/70 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur",
    dark && style !== "underline" && "border-white/15 bg-white/5 text-white",
    dark && style === "filled" && "bg-white/10",
    dark && style === "underline" && "border-white/20 text-white"
  );
}

function themedButtonClass(theme: FormTheme, dark: boolean, tone: "primary" | "secondary" = "primary") {
  const style = theme.buttonStyle ?? defaultAppearance.buttonStyle;
  const width = theme.buttonWidth ?? defaultAppearance.buttonWidth;
  const radius = theme.buttonRadius ?? defaultAppearance.buttonRadius;
  const base = "border transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
  const widthClass = width === "full" && tone === "primary" ? "w-full sm:w-full" : "w-full sm:w-auto";
  const primary =
    style === "outline"
      ? "border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
      : style === "soft"
        ? "border-transparent bg-[color-mix(in_srgb,var(--accent)_14%,white)] text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_20%,white)]"
        : style === "ghost"
          ? "border-transparent bg-transparent text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
          : "border-transparent bg-[var(--accent)] text-white shadow-[0_12px_26px_color-mix(in_srgb,var(--accent)_24%,transparent)] hover:brightness-95";
  const secondary = dark
    ? "border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
    : "border-[#d8e0ea] bg-white/80 text-[#334155] hover:border-[#c5d0dc] hover:bg-white";

  return cn(base, tone === "primary" ? primary : secondary, widthClass, "h-10 px-4 text-sm font-semibold", radius === 0 ? "!rounded-none" : "!rounded-[var(--button-radius)]");
}

function fieldMotion(animation: FormTheme["animation"], index: number): MotionProps {
  const delay = Math.min(index * 0.045, 0.22);
  if (animation === "fade") return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.34, delay } };
  if (animation === "scale") return { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.34, delay, type: "spring", stiffness: 260, damping: 24 } };
  if (animation === "none") return { initial: false as const, animate: undefined, transition: undefined };
  return { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.34, delay, type: "spring", stiffness: 240, damping: 26 } };
}

function hexToRgb(color?: string) {
  if (!color?.startsWith("#")) return null;
  const hex = color.slice(1);
  const normalized = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function readableTextColor(backgroundColor: string | undefined, fallback: string) {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return fallback;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.58 ? "#111827" : "#ffffff";
}

function mutedTextColor(textColor: string) {
  return textColor === "#ffffff" ? "rgba(255,255,255,0.68)" : "#667085";
}

type FormRendererProps = {
  form: FormSchema;
  onSubmit?: (values: Record<string, unknown>) => void;
  compact?: boolean;
};

export function FormRenderer({ form, onSubmit, compact = false }: FormRendererProps) {
  const [submitted, setSubmitted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const schema = useMemo(() => buildZodSchema(form), [form]);
  const steps = useMemo(() => {
    const uniqueSteps = Array.from(new Set(form.fields.map((field) => field.step ?? 1))).sort((a, b) => a - b);
    return uniqueSteps.length ? uniqueSteps : [1];
  }, [form.fields]);
  const activeStepIndex = Math.min(currentStepIndex, steps.length - 1);
  const currentStep = steps[activeStepIndex] ?? steps[0];
  const isMultiStep = steps.length > 1;
  const progress = ((activeStepIndex + 1) / steps.length) * 100;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors }
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: form.fields.reduce<Record<string, unknown>>((values, field) => {
      if (field.type === "checkbox") values[field.id] = [];
      else if (field.type === "daterange") values[field.id] = { start: "", end: "" };
      else if (field.type === "matrix") values[field.id] = {};
      else if (field.type === "slider") values[field.id] = field.settings?.sliderMin ?? 0;
      else if (field.type === "hidden") values[field.id] = field.settings?.hiddenValue ?? "";
      else {
        values[field.id] = "";
        if (field.type === "payment") values[`${field.id}_currency`] = field.settings?.currency ?? "USD";
      }
      return values;
    }, {})
  });
  const watchedValues = useWatch({ control }) as Record<string, unknown>;
  const logicEffects = useMemo(() => evaluateLogic(form, watchedValues), [form, watchedValues]);
  const currentStepFields = form.fields.filter((field) => ((field.step ?? 1) === currentStep || field.type === "hidden") && !logicEffects.hiddenFieldIds.has(field.id));
  const currentVisibleFields = currentStepFields.filter((field) => field.type !== "hidden");
  const stepSection = currentVisibleFields.find((field) => field.type === "section");

  const isDark = form.theme.mode === "dark";
  const rounded = form.theme.radius === "rounded";
  const fieldRadius = form.theme.fieldRadius ?? (rounded ? defaultAppearance.fieldRadius : 0);
  const formAnimation = form.theme.animation ?? defaultAppearance.animation;
  const formDensity = form.theme.density ?? defaultAppearance.density;
  const currentStepValidationNames = currentStepFields.flatMap(validationNamesForField);

  const goToNextStep = async () => {
    const valid = await trigger(currentStepValidationNames);
    if (!valid) return;
    setCurrentStepIndex((index) => Math.min(index + 1, steps.length - 1));
  };

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
      style={{
        "--accent": form.theme.accentColor,
        "--field-radius": `${fieldRadius}px`,
        "--field-border-width": `${form.theme.fieldBorderWidth ?? defaultAppearance.fieldBorderWidth}px`,
        "--button-radius": `${form.theme.buttonRadius ?? defaultAppearance.buttonRadius}px`,
        fontFamily: getFontFamily(form.theme.fontFamily)
      } as CSSProperties}
      data-focus-style={form.theme.focusStyle ?? defaultAppearance.focusStyle}
      className={cn(
        "mx-auto w-full border shadow-sm",
        formWidthClass(form.theme.formWidth),
        textScaleClass(form.theme.fontScale),
        formPaddingClass(form.theme.formPadding, compact),
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

      {isMultiStep && (
        <div className={cn("mb-6 rounded-2xl border p-4", isDark ? "border-white/10 bg-white/5" : "border-[#e5e9ef] bg-[#f8fafc]")}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", isDark ? "text-white/45" : "text-[#98a2b3]")}>
                Step {activeStepIndex + 1} of {steps.length}
              </p>
              <h2 className="mt-1 text-base font-semibold">{stepSection?.label ?? `Step ${currentStep}`}</h2>
            </div>
            <div className="flex gap-1.5">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    index <= activeStepIndex ? "bg-[var(--accent)]" : isDark ? "bg-white/16" : "bg-[#d8e0ea]"
                  )}
                />
              ))}
            </div>
          </div>
          <div className={cn("h-2 overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-[#e5e9ef]")}>
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className={cn("grid sm:grid-cols-2", fieldGapClass(formDensity))}>
        {currentStepFields.map((field, index) => (
          <motion.div key={`${field.id}-${formAnimation}`} {...fieldMotion(formAnimation, index)} className={cn(field.type === "hidden" && "hidden", (field.layout ?? "full") === "half" ? "sm:col-span-1" : "sm:col-span-2")}>
            <RenderedField
              field={field}
              register={register}
              setValue={setValue}
              watch={watch}
              error={errors[field.id]?.message as string | undefined}
              dark={isDark}
              rounded={rounded}
              theme={form.theme}
              required={logicEffects.requiredFieldIds.has(field.id)}
            />
          </motion.div>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        {isMultiStep && (
          <Button
            type="button"
            variant="secondary"
            className={themedButtonClass(form.theme, isDark, "secondary")}
            disabled={activeStepIndex === 0}
            onClick={() => setCurrentStepIndex((index) => Math.max(index - 1, 0))}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        )}
        <div className="ml-auto">
          {isMultiStep && activeStepIndex < steps.length - 1 ? (
            <Button type="button" variant="primary" className={themedButtonClass(form.theme, isDark)} onClick={goToNextStep}>
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button type="submit" variant="primary" className={themedButtonClass(form.theme, isDark)}>
              <CheckCircle2 size={16} />
              Submit response
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function RenderedField({
  field,
  register,
  setValue,
  watch,
  error,
  dark,
  rounded,
  theme,
  required
}: {
  field: FormField;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  error?: string;
  dark: boolean;
  rounded: boolean;
  theme: FormTheme;
  required: boolean;
}) {
  const inputClass = controlClass(theme, dark, rounded);
  const textareaClass = controlClass(theme, dark, rounded, "textarea");

  if (field.type === "divider") return <div className={cn("h-px", dark ? "bg-white/10" : "bg-[#e5e9ef]")} />;
  if (field.type === "section") {
    return (
      <div className={cn("border-l-4 py-1 pl-4", dark ? "border-white/25" : "border-[var(--accent)]")}>
        <h2 className="text-base font-semibold">{field.label}</h2>
        {field.helperText && <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-[#68707d]")}>{field.helperText}</p>}
      </div>
    );
  }

  if (field.type === "hidden") {
    return <input type="hidden" value={field.settings?.hiddenValue ?? ""} {...register(field.id)} />;
  }

  return (
    <div>
      <Label htmlFor={field.id} className={cn("block", labelSpacingClass(theme.labelSpacing), dark && "text-white")}>
        {field.label}
        {required && <span className="ml-1 text-[var(--accent)]">*</span>}
      </Label>
      {field.type === "textarea" && <Textarea id={field.id} placeholder={field.placeholder} className={textareaClass} {...register(field.id)} />}
      {["text", "email", "number", "date"].includes(field.type) && (
        <Input id={field.id} type={field.type === "phone" ? "tel" : field.type} placeholder={field.placeholder} className={inputClass} {...register(field.id)} />
      )}
      {field.type === "phone" && (
        <div className="grid grid-cols-[minmax(136px,168px)_minmax(0,1fr)] gap-2 max-sm:grid-cols-1">
          <PhoneCountrySelect
            name={`${field.id}_country`}
            defaultValue={field.settings?.countryCode ?? "+91"}
            register={register}
            setValue={setValue}
            watch={watch}
            dark={dark}
            rounded={rounded}
            theme={theme}
            label={field.label}
          />
          <Input id={field.id} type="tel" placeholder={field.placeholder} className={inputClass} {...register(field.id)} />
        </div>
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
            <label key={option} className={cn("flex items-center gap-3 p-3 text-sm", surfaceClass(theme, dark, rounded))}>
              <input type="radio" value={option} {...register(field.id)} />
              {option}
            </label>
          ))}
        </div>
      )}
      {field.type === "checkbox" && (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <label key={option} className={cn("flex items-center gap-3 p-3 text-sm", surfaceClass(theme, dark, rounded))}>
              <input type="checkbox" value={option} {...register(field.id)} />
              {option}
            </label>
          ))}
        </div>
      )}
      {field.type === "file" && (
        <label className={cn("flex cursor-pointer items-center gap-3 border-dashed p-4 text-sm", surfaceClass(theme, dark, rounded), dark ? "text-white/70" : "text-[#68707d]")}>
          <UploadCloud size={20} />
          <span>
            Drag files here or browse
            <span className="mt-1 block text-xs">
              {field.settings?.acceptedFileTypes || "Any file"} · Max {field.settings?.maxFileSizeMb ?? 10}MB
            </span>
          </span>
          <input className="hidden" type="file" accept={field.settings?.acceptedFileTypes} {...register(field.id)} />
        </label>
      )}
      {field.type === "rating" && <RatingField field={field} register={register} setValue={setValue} watch={watch} dark={dark} rounded={rounded} theme={theme} />}
      {field.type === "signature" && <SignatureField field={field} setValue={setValue} dark={dark} rounded={rounded} theme={theme} />}
      {field.type === "daterange" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" aria-label={`${field.label} start`} className={inputClass} {...register(`${field.id}.start`)} />
          <Input type="date" aria-label={`${field.label} end`} className={inputClass} {...register(`${field.id}.end`)} />
        </div>
      )}
      {field.type === "slider" && (
        <div className={cn("p-4", surfaceClass(theme, dark, rounded))}>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#667085]">
            <span>{field.settings?.sliderMin ?? 0}</span>
            <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-white">{String(watch(field.id) ?? field.settings?.sliderMin ?? 0)}</span>
            <span>{field.settings?.sliderMax ?? 100}</span>
          </div>
          <input
            type="range"
            min={field.settings?.sliderMin ?? 0}
            max={field.settings?.sliderMax ?? 100}
            step={field.settings?.sliderStep ?? 1}
            className="w-full accent-[var(--accent)]"
            {...register(field.id)}
          />
        </div>
      )}
      {field.type === "richtext" && <RichTextField field={field} setValue={setValue} dark={dark} rounded={rounded} theme={theme} />}
      {field.type === "matrix" && <MatrixField field={field} register={register} setValue={setValue} watch={watch} dark={dark} rounded={rounded} theme={theme} />}
      {field.type === "formula" && <FormulaField field={field} register={register} setValue={setValue} watch={watch} dark={dark} rounded={rounded} theme={theme} />}
      {field.type === "payment" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
          <input type="hidden" {...register(`${field.id}_currency`)} />
          <CurrencySelect
            value={String(watch(`${field.id}_currency`) || field.settings?.currency || "USD")}
            dark={dark}
            className={inputClass}
            onChange={(currency) => setValue(`${field.id}_currency`, currency, { shouldDirty: true, shouldValidate: true })}
          />
          <Input id={field.id} type="number" min={0} step="0.01" placeholder="0.00" className={inputClass} {...register(field.id)} />
          <p className={cn("flex items-center gap-1 text-xs sm:col-span-2", dark ? "text-white/50" : "text-[#667085]")}>
            <CreditCard size={13} />
            Stripe-ready amount input with selectable currency.
          </p>
        </div>
      )}
      {field.helperText && <p className={cn("mt-1.5 text-xs", dark ? "text-white/50" : "text-[#68707d]")}>{field.helperText}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-[#dc2626]">{error}</p>}
    </div>
  );
}

function PhoneCountrySelect({
  name,
  defaultValue,
  register,
  setValue,
  watch,
  dark,
  rounded,
  theme,
  label
}: {
  name: string;
  defaultValue: string;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  dark: boolean;
  rounded: boolean;
  theme: FormTheme;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedValue = String(watch(name) || defaultValue);
  const selectedCountry = phoneCountries.find((country) => country.code === selectedValue) ?? phoneCountries.find((country) => country.code === defaultValue) ?? phoneCountries[0];

  useEffect(() => {
    setValue(name, selectedCountry.code, { shouldDirty: false, shouldValidate: false });
  }, [name, selectedCountry.code, setValue]);

  return (
    <div className="relative">
      <input type="hidden" {...register(name)} />
      <button
        type="button"
        aria-label={`${label} country code`}
        aria-expanded={open}
        className={cn(
          controlClass(theme, dark, rounded),
          "flex min-w-0 items-center justify-between gap-3 pl-4 pr-3"
        )}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate font-semibold">
          <span className="shrink-0">{selectedCountry.flag}</span>
          <span className="truncate">{selectedCountry.code}</span>
        </span>
        <ChevronDown size={16} className={cn("shrink-0 text-[#667085] transition", open && "rotate-180", dark && "text-white/55")} />
      </button>
      {open && (
        <div className={cn("absolute left-0 top-11 z-30 max-h-64 w-72 overflow-y-auto rounded-xl border border-[#d8e0ea] bg-white p-1 shadow-xl", dark && "border-white/15 bg-[#151922]")}>
          {phoneCountries.map((country) => {
            const selected = country.code === selectedCountry.code;
            return (
              <button
                key={`${country.code}-${country.country}`}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[#f1f5f9]",
                  selected ? "bg-[#eef4ff] font-semibold text-[#1d3fbf]" : "text-[#283140]",
                  dark && (selected ? "bg-white/10 text-white" : "text-white/78 hover:bg-white/10")
                )}
                onClick={() => {
                  setValue(name, country.code, { shouldDirty: true, shouldValidate: true });
                  setOpen(false);
                }}
              >
                <span className="min-w-0 truncate">{country.flag} {country.code} {country.country}</span>
                {selected && <Check size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormulaField({
  field,
  register,
  setValue,
  watch,
  dark,
  rounded,
  theme
}: {
  field: FormField;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  dark: boolean;
  rounded: boolean;
  theme: FormTheme;
}) {
  const values = watch();
  const result = useMemo(() => evaluateFormula(field.settings?.formulaExpression, values), [field.settings?.formulaExpression, values]);
  const formattedValue = result.error ? field.settings?.formulaFallback || "Waiting for inputs" : formatFormulaValue(field, result.value);

  useEffect(() => {
    setValue(field.id, result.error ? null : result.value, { shouldDirty: true, shouldValidate: true });
  }, [field.id, result.error, result.value, setValue]);

  return (
    <div className={cn("p-4", surfaceClass(theme, dark, rounded))}>
      <input type="hidden" {...register(field.id)} />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
          <Calculator size={15} />
          Formula result
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", result.error ? "bg-[#fef2f2] text-[#dc2626]" : "bg-[#eef8f5] text-[#0f766e]")}>
          {result.error ? "Needs input" : "Live"}
        </span>
      </div>
      <p className={cn("mt-3 text-2xl font-semibold", dark ? "text-white" : "text-[#111418]")}>{formattedValue}</p>
      {result.error && <p className="mt-2 text-xs font-medium text-[#dc2626]">{result.error}</p>}
    </div>
  );
}

function RatingField({
  field,
  register,
  setValue,
  watch,
  dark,
  rounded,
  theme
}: {
  field: FormField;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  dark: boolean;
  rounded: boolean;
  theme: FormTheme;
}) {
  const scale = Math.min(Math.max(field.settings?.ratingScale ?? 5, 3), 10);
  const selectedValue = Number(watch(field.id) || 0);
  const emojis = ["😡", "😕", "😐", "🙂", "😍", "🤩", "🚀", "🏆", "💎", "✨"];
  const isEmoji = field.settings?.ratingStyle === "emoji";

  return (
    <div>
      <input type="hidden" {...register(field.id)} />
      <div className={cn("flex flex-wrap items-center", isEmoji ? "gap-2" : "gap-1")}>
        {Array.from({ length: scale }, (_, index) => {
          const value = index + 1;
          const selected = selectedValue === value;
          const filled = selectedValue >= value;

          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              aria-label={`Select ${value} out of ${scale}`}
              className={cn(
                "cursor-pointer transition",
                isEmoji
                  ? "flex h-11 min-w-11 items-center justify-center px-3 text-sm font-semibold"
                  : "rounded-lg p-1.5 hover:scale-110 focus-visible:scale-110",
                isEmoji && surfaceClass(theme, dark, rounded),
                isEmoji && selected && "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_10px_24px_rgba(49,87,213,0.22)]",
                isEmoji && !selected && (dark ? "border-white/10 bg-white/5 text-white/75 hover:border-white/25 hover:bg-white/10" : "border-[#dce1e8] bg-[#fbfcfe] text-[#465366] hover:border-[var(--accent)] hover:bg-[#f4f7ff]")
              )}
              onClick={() => setValue(field.id, value, { shouldDirty: true, shouldValidate: true })}
            >
              {isEmoji ? (
                <span className="text-lg leading-none">{emojis[index] ?? "🙂"}</span>
              ) : (
                <Star
                  size={30}
                  className={cn(
                    "transition",
                    filled ? "fill-[#f59e0b] text-[#f59e0b]" : dark ? "fill-transparent text-white/30" : "fill-transparent text-[#cbd5e1]"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
      {!isEmoji && (
        <p className={cn("mt-2 text-xs font-medium", dark ? "text-white/55" : "text-[#667085]")}>
          {selectedValue ? `${selectedValue} / ${scale} selected` : "No rating selected"}
        </p>
      )}
    </div>
  );
}

function SignatureField({ field, setValue, dark, rounded, theme }: { field: FormField; setValue: UseFormSetValue<Record<string, unknown>>; dark: boolean; rounded: boolean; theme: FormTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawing.current) return;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = dark ? "#ffffff" : "#111418";
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
    setValue(field.id, canvas.toDataURL("image/png"), { shouldValidate: true });
  };

  return (
    <div className={cn("overflow-hidden", surfaceClass(theme, dark, rounded))}>
      <canvas
        ref={canvasRef}
        width={720}
        height={180}
        className="h-36 w-full touch-none"
        onPointerDown={(event) => {
          drawing.current = true;
          const context = canvasRef.current?.getContext("2d");
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!context || !rect) return;
          context.beginPath();
          context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
        }}
        onPointerMove={draw}
        onPointerUp={() => {
          drawing.current = false;
        }}
        onPointerLeave={() => {
          drawing.current = false;
        }}
      />
      <input type="hidden" {...registerSignature(field.id, setValue)} />
      <div className={cn("flex items-center justify-between border-t-[length:var(--field-border-width)] px-3 py-2 text-xs", dark ? "border-white/15 text-white/60" : "border-[#d8e0ea] text-[#667085]")}>
        <span className="inline-flex items-center gap-1.5"><PenLine size={13} /> Draw signature</span>
        <button
          type="button"
          className="font-semibold text-[var(--accent)]"
          onClick={() => {
            const canvas = canvasRef.current;
            canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
            setValue(field.id, "", { shouldValidate: true });
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function registerSignature(id: string, setValue: UseFormSetValue<Record<string, unknown>>) {
  return {
    name: id,
    readOnly: true,
    onChange: () => setValue(id, "")
  };
}

function RichTextField({ field, setValue, dark, rounded, theme }: { field: FormField; setValue: UseFormSetValue<Record<string, unknown>>; dark: boolean; rounded: boolean; theme: FormTheme }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarItems = [
    { command: "bold", label: "Bold", icon: Bold },
    { command: "italic", label: "Italic", icon: Italic },
    { command: "underline", label: "Underline", icon: Underline },
    { command: "insertUnorderedList", label: "Bullet list", icon: List },
    { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
    { command: "quoteText", label: "Quote", icon: Quote },
    { command: "clearText", label: "Clear", icon: Eraser }
  ];

  const runCommand = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    if (command === "clearText") {
      editor.innerHTML = "";
      setValue(field.id, "", { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (command === "quoteText") {
      const activeSelection = window.getSelection();
      const selection = activeSelection?.toString() ?? "";
      if (selection) {
        const trimmedSelection = selection.trim();
        if (trimmedSelection.startsWith("\"") && trimmedSelection.endsWith("\"")) return;
        document.execCommand("insertText", false, `"${selection}"`);
      } else {
        if (activeSelection?.rangeCount) {
          const range = activeSelection.getRangeAt(0);
          if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const text = range.startContainer.textContent ?? "";
            const before = text.at(range.startOffset - 1);
            const after = text.at(range.startOffset);
            if (before === "\"" && after === "\"") return;
          }
        }

        document.execCommand("insertText", false, "\"\"");
        const nextSelection = window.getSelection();
        if (nextSelection?.rangeCount) {
          const range = nextSelection.getRangeAt(0);
          range.setStart(range.startContainer, Math.max(range.startOffset - 1, 0));
          range.collapse(true);
          nextSelection.removeAllRanges();
          nextSelection.addRange(range);
        }
      }
    } else {
      document.execCommand(command, false, value);
    }
    setValue(field.id, editor.innerHTML, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className={cn("overflow-hidden", controlClass(theme, dark, rounded, "textarea"))}>
      <div className={cn("flex flex-wrap gap-1 border-b p-2", dark ? "border-white/10" : "border-[#d8e0ea]")}>
        {toolbarItems.map((item) => (
          <button
            key={`${item.command}-${item.label}`}
            type="button"
            title={item.label}
            aria-label={item.label}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition",
              dark ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-[#465366] hover:bg-[#eef2f7] hover:text-[#111418]"
            )}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(item.command)}
          >
            <item.icon size={13} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "rich-text-editor min-h-32 px-3 py-2 text-sm leading-6 outline-none",
          dark ? "text-white marker:text-white/70" : "text-[#111827] marker:text-[#475569]"
        )}
        data-placeholder={field.placeholder}
        onInput={(event) => setValue(field.id, event.currentTarget.innerHTML, { shouldValidate: true })}
      />
    </div>
  );
}

function MatrixField({
  field,
  register,
  setValue,
  watch,
  dark,
  rounded,
  theme
}: {
  field: FormField;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  dark: boolean;
  rounded: boolean;
  theme: FormTheme;
}) {
  const rows = field.settings?.matrixRows?.length ? field.settings.matrixRows : ["Quality", "Speed", "Support"];
  const columns = field.settings?.matrixColumns?.length ? field.settings.matrixColumns : ["Poor", "Okay", "Great"];
  const visibleRows = rows.filter((row) => !field.settings?.matrixHiddenRows?.includes(row));
  const descriptions = field.settings?.matrixColumnDescriptions ?? {};
  const widths = field.settings?.matrixColumnWidths ?? {};
  const inputType = field.settings?.matrixInputType ?? "radio";
  const dropdownOptions = field.settings?.matrixDropdownOptions?.length ? field.settings.matrixDropdownOptions : ["Low", "Medium", "High"];
  const alternateRows = field.settings?.matrixAlternateRows ?? true;
  const headerColor = field.settings?.matrixHeaderColor;
  const rowColor = field.settings?.matrixRowColor;
  const alternateRowColor = field.settings?.matrixAlternateRowColor;
  const borderColor = field.settings?.matrixBorderColor;
  const defaultTextColor = dark ? "#ffffff" : "#111418";
  const headerTextColor = readableTextColor(headerColor, defaultTextColor);
  const matrixControlClass = cn(controlClass(theme, false, rounded), "bg-white/92 text-[#111827] placeholder:text-[#98a2b3]");

  return (
    <div className={cn("overflow-hidden", surfaceClass(theme, dark, rounded))} style={{ borderColor }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] border-separate border-spacing-0 text-sm">
          <thead className={dark ? "bg-white/5" : "bg-[#f8fafc]"} style={{ backgroundColor: headerColor, color: headerTextColor }}>
            <tr>
              <th className="p-3 text-left font-semibold">Criteria</th>
              {columns.map((column) => (
                <th key={column} className="p-3 text-center font-semibold" style={{ minWidth: widths[column] ?? 140 }}>
                  <span className="block">{column}</span>
                  {descriptions[column] && <span className="mt-1 block text-xs font-normal" style={{ color: mutedTextColor(headerTextColor) }}>{descriptions[column]}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => {
              const rowBackground = alternateRows && rowIndex % 2 === 1 ? alternateRowColor : rowColor;
              const rowTextColor = readableTextColor(rowBackground, defaultTextColor);
              return (
                <tr
                  key={row}
                  className={cn("border-t-[length:var(--field-border-width)] border-[#e5e9ef]", alternateRows && rowIndex % 2 === 1 && (dark ? "bg-white/[0.03]" : "bg-[#fbfcfe]"))}
                  style={{ backgroundColor: rowBackground, borderColor, color: rowTextColor }}
                >
                  <td className="p-3 font-medium">{row}</td>
                  {columns.map((column) => (
                    <td key={column} className="border-l-[length:var(--field-border-width)] border-[#e5e9ef] p-3 text-center" style={{ borderColor }}>
                      {inputType === "radio" && <input type="radio" value={column} {...register(`${field.id}.${row}`)} />}
                      {inputType === "checkbox" && <input type="checkbox" {...register(`${field.id}.${row}.${column}`)} />}
                      {inputType === "text" && <Input aria-label={`${row} ${column}`} className={cn("min-w-28", matrixControlClass)} {...register(`${field.id}.${row}.${column}`)} />}
                      {inputType === "number" && <Input type="number" aria-label={`${row} ${column}`} className={cn("min-w-24", matrixControlClass)} {...register(`${field.id}.${row}.${column}`)} />}
                      {inputType === "dropdown" && (
                        <Select aria-label={`${row} ${column}`} className={cn("min-w-32", matrixControlClass)} {...register(`${field.id}.${row}.${column}`)}>
                          <option value="">Select</option>
                          {dropdownOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      )}
                      {inputType === "rating" && (
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((value) => {
                            const name = `${field.id}.${row}.${column}`;
                            const selected = Number(watch(name) || 0) >= value;
                            return (
                              <button key={value} type="button" aria-label={`${value} stars`} onClick={() => setValue(name, value, { shouldDirty: true, shouldValidate: true })}>
                                <Star size={18} className={selected ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#cbd5e1]"} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {inputType === "toggle" && (
                        <label className="inline-flex cursor-pointer items-center justify-center">
                          <input type="checkbox" className="peer sr-only" {...register(`${field.id}.${row}.${column}`)} />
                          <span className="h-6 w-11 rounded-full bg-[#cbd5e1] p-0.5 transition peer-checked:bg-[var(--accent)] peer-checked:[&_span]:translate-x-5">
                            <span className="block h-5 w-5 rounded-full bg-white transition" />
                          </span>
                        </label>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
