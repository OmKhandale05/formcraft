"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bold, Calculator, CheckCircle2, CreditCard, Eraser, Italic, List, ListOrdered, PenLine, Quote, Star, Underline, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useForm, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { evaluateFormula, formatFormulaValue } from "@/lib/formula";
import { cn } from "@/lib/utils";
import type { FormField, FormSchema } from "@/types/form";

function schemaForField(field: FormField) {
  if (["section", "divider", "file", "hidden", "formula"].includes(field.type)) return z.any().optional();

  if (["number", "rating", "slider", "payment"].includes(field.type)) {
    let numberSchema = z.coerce.number({ error: "Enter a valid number" });
    if (field.validation?.min !== undefined) numberSchema = numberSchema.min(field.validation.min);
    if (field.validation?.max !== undefined) numberSchema = numberSchema.max(field.validation.max);
    if (field.type === "rating") numberSchema = numberSchema.min(1, "Choose a rating");
    return field.required ? numberSchema : numberSchema.optional().or(z.literal(""));
  }

  if (field.type === "checkbox") {
    const checkboxSchema = z.array(z.string());
    return field.required ? checkboxSchema.min(1, "Choose at least one option") : checkboxSchema.optional();
  }

  if (field.type === "daterange") {
    const rangeSchema = z.object({
      start: z.string().min(field.required ? 1 : 0, "Choose a start date"),
      end: z.string().min(field.required ? 1 : 0, "Choose an end date")
    });
    return field.required ? rangeSchema : rangeSchema.optional();
  }

  if (field.type === "matrix") return z.record(z.string(), z.string()).optional();

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

function validationNamesForField(field: FormField) {
  if (["section", "divider", "hidden", "file", "formula"].includes(field.type)) return [];
  if (field.type === "daterange") return [`${field.id}.start`, `${field.id}.end`];
  return [field.id];
}

type FormRendererProps = {
  form: FormSchema;
  onSubmit?: (values: Record<string, unknown>) => void;
  compact?: boolean;
};

export function FormRenderer({ form, onSubmit, compact = false }: FormRendererProps) {
  const [submitted, setSubmitted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const schema = useMemo(() => buildZodSchema(form.fields), [form.fields]);
  const steps = useMemo(() => {
    const uniqueSteps = Array.from(new Set(form.fields.map((field) => field.step ?? 1))).sort((a, b) => a - b);
    return uniqueSteps.length ? uniqueSteps : [1];
  }, [form.fields]);
  const activeStepIndex = Math.min(currentStepIndex, steps.length - 1);
  const currentStep = steps[activeStepIndex] ?? steps[0];
  const isMultiStep = steps.length > 1;
  const currentStepFields = form.fields.filter((field) => (field.step ?? 1) === currentStep || field.type === "hidden");
  const currentVisibleFields = currentStepFields.filter((field) => field.type !== "hidden");
  const stepSection = currentVisibleFields.find((field) => field.type === "section");
  const progress = ((activeStepIndex + 1) / steps.length) * 100;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
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

  const isDark = form.theme.mode === "dark";
  const rounded = form.theme.radius === "rounded";
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

      <div className="grid gap-5 sm:grid-cols-2">
        {currentStepFields.map((field) => (
          <div key={field.id} className={cn(field.type === "hidden" && "hidden", (field.layout ?? "full") === "half" ? "sm:col-span-1" : "sm:col-span-2")}>
            <RenderedField
              field={field}
              register={register}
              setValue={setValue}
              watch={watch}
              error={errors[field.id]?.message as string | undefined}
              dark={isDark}
              rounded={rounded}
            />
          </div>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        {isMultiStep && (
          <Button
            type="button"
            variant="secondary"
            disabled={activeStepIndex === 0}
            onClick={() => setCurrentStepIndex((index) => Math.max(index - 1, 0))}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        )}
        <div className="ml-auto">
          {isMultiStep && activeStepIndex < steps.length - 1 ? (
            <Button type="button" variant="primary" onClick={goToNextStep}>
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
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
  rounded
}: {
  field: FormField;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
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

  if (field.type === "hidden") {
    return <input type="hidden" value={field.settings?.hiddenValue ?? ""} {...register(field.id)} />;
  }

  return (
    <div>
      <Label htmlFor={field.id} className={cn("mb-2 block", dark && "text-white")}>
        {field.label}
        {field.required && <span className="ml-1 text-[var(--accent)]">*</span>}
      </Label>
      {field.type === "textarea" && <Textarea id={field.id} placeholder={field.placeholder} className={inputClass} {...register(field.id)} />}
      {["text", "email", "number", "date"].includes(field.type) && (
        <Input id={field.id} type={field.type === "phone" ? "tel" : field.type} placeholder={field.placeholder} className={inputClass} {...register(field.id)} />
      )}
      {field.type === "phone" && (
        <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-2">
          <Select className={inputClass} defaultValue={field.settings?.countryCode ?? "+91"} {...register(`${field.id}_country`)}>
            {["+91", "+1", "+44", "+61", "+971"].map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
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
        <label className={cn("flex cursor-pointer items-center gap-3 border border-dashed p-4 text-sm", rounded ? "rounded-xl" : "rounded-none", dark ? "border-white/20 text-white/70" : "border-[#cdd5df] text-[#68707d]")}>
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
      {field.type === "rating" && <RatingField field={field} register={register} setValue={setValue} watch={watch} dark={dark} />}
      {field.type === "signature" && <SignatureField field={field} setValue={setValue} dark={dark} rounded={rounded} />}
      {field.type === "daterange" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" aria-label={`${field.label} start`} className={inputClass} {...register(`${field.id}.start`)} />
          <Input type="date" aria-label={`${field.label} end`} className={inputClass} {...register(`${field.id}.end`)} />
        </div>
      )}
      {field.type === "slider" && (
        <div className="rounded-xl border border-[#d8e0ea] bg-white/70 p-4">
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
      {field.type === "richtext" && <RichTextField field={field} setValue={setValue} dark={dark} rounded={rounded} />}
      {field.type === "matrix" && <MatrixField field={field} register={register} dark={dark} />}
      {field.type === "formula" && <FormulaField field={field} register={register} setValue={setValue} watch={watch} dark={dark} rounded={rounded} />}
      {field.type === "payment" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
          <input type="hidden" {...register(`${field.id}_currency`)} />
          <CurrencySelect
            value={String(watch(`${field.id}_currency`) || field.settings?.currency || "USD")}
            dark={dark}
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

function FormulaField({
  field,
  register,
  setValue,
  watch,
  dark,
  rounded
}: {
  field: FormField;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  dark: boolean;
  rounded: boolean;
}) {
  const values = watch();
  const result = useMemo(() => evaluateFormula(field.settings?.formulaExpression, values), [field.settings?.formulaExpression, values]);
  const formattedValue = result.error ? field.settings?.formulaFallback || "Waiting for inputs" : formatFormulaValue(field, result.value);

  useEffect(() => {
    setValue(field.id, result.error ? null : result.value, { shouldDirty: true, shouldValidate: true });
  }, [field.id, result.error, result.value, setValue]);

  return (
    <div className={cn("border p-4", rounded ? "rounded-xl" : "rounded-none", dark ? "border-white/15 bg-white/5" : "border-[#d8e0ea] bg-[#fbfcfe]")}>
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
      {field.settings?.formulaExpression && <p className={cn("mt-2 font-mono text-xs", dark ? "text-white/45" : "text-[#667085]")}>{field.settings.formulaExpression}</p>}
      {result.error && <p className="mt-2 text-xs font-medium text-[#dc2626]">{result.error}</p>}
    </div>
  );
}

function RatingField({
  field,
  register,
  setValue,
  watch,
  dark
}: {
  field: FormField;
  register: UseFormRegister<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  dark: boolean;
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
                  ? "flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold"
                  : "rounded-lg p-1.5 hover:scale-110 focus-visible:scale-110",
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

function SignatureField({ field, setValue, dark, rounded }: { field: FormField; setValue: UseFormSetValue<Record<string, unknown>>; dark: boolean; rounded: boolean }) {
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
    <div className={cn("overflow-hidden border", rounded ? "rounded-xl" : "rounded-none", dark ? "border-white/15 bg-white/5" : "border-[#d8e0ea] bg-white")}>
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
      <div className="flex items-center justify-between border-t border-[#d8e0ea] px-3 py-2 text-xs text-[#667085]">
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

function RichTextField({ field, setValue, dark, rounded }: { field: FormField; setValue: UseFormSetValue<Record<string, unknown>>; dark: boolean; rounded: boolean }) {
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
    <div className={cn("overflow-hidden border", rounded ? "rounded-xl" : "rounded-none", dark ? "border-white/15 bg-white/5" : "border-[#d8e0ea] bg-white")}>
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

function MatrixField({ field, register, dark }: { field: FormField; register: UseFormRegister<Record<string, unknown>>; dark: boolean }) {
  const rows = field.settings?.matrixRows?.length ? field.settings.matrixRows : ["Quality", "Speed", "Support"];
  const columns = field.settings?.matrixColumns?.length ? field.settings.matrixColumns : ["Poor", "Okay", "Great"];

  return (
    <div className="overflow-x-auto rounded-xl border border-[#d8e0ea]">
      <table className="w-full min-w-[460px] border-collapse text-sm">
        <thead className={dark ? "bg-white/5" : "bg-[#f8fafc]"}>
          <tr>
            <th className="p-3 text-left font-semibold">Criteria</th>
            {columns.map((column) => (
              <th key={column} className="p-3 text-center font-semibold">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-t border-[#e5e9ef]">
              <td className="p-3 font-medium">{row}</td>
              {columns.map((column) => (
                <td key={column} className="p-3 text-center">
                  <input type="radio" value={column} {...register(`${field.id}.${row}`)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
