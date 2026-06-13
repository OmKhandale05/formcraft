"use client";

import { AlertTriangle, CheckCircle2, Gauge, MonitorSmartphone, ShieldCheck, Wand2 } from "lucide-react";
import { defaultAppearance } from "@/lib/appearance";
import { cn } from "@/lib/utils";
import type { FieldType, FormField, FormSchema } from "@/types/form";

type HealthMetric = {
  label: string;
  score: number;
  icon: typeof Gauge;
};

const inputFieldTypes: FieldType[] = [
  "text",
  "email",
  "phone",
  "textarea",
  "number",
  "dropdown",
  "radio",
  "checkbox",
  "date",
  "file",
  "rating",
  "signature",
  "daterange",
  "slider",
  "richtext",
  "matrix",
  "payment",
  "formula"
];

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function uniqueSteps(fields: FormField[]) {
  return Array.from(new Set(fields.map((field) => field.step ?? 1))).sort((a, b) => a - b);
}

function fieldHasUsefulGuidance(field: FormField) {
  return Boolean(field.placeholder || field.helperText || field.options?.length || field.type === "rating" || field.type === "slider");
}

function getHealth(form: FormSchema) {
  const fields = form.fields.filter((field) => inputFieldTypes.includes(field.type));
  const requiredFields = fields.filter((field) => field.required);
  const steps = uniqueSteps(form.fields);
  const halfFields = fields.filter((field) => field.layout === "half").length;
  const advancedFields = fields.filter((field) => ["matrix", "formula", "signature", "payment", "richtext", "rating", "slider"].includes(field.type)).length;
  const labelIssues = fields.filter((field) => !field.label.trim()).length;
  const guidanceIssues = requiredFields.filter((field) => !fieldHasUsefulGuidance(field)).length;
  const darkContrastRisk = form.theme.mode === "dark" && ["#111827", "#111418", "#000000"].includes(form.theme.accentColor.toLowerCase());
  const tooLongSingleStep = steps.length <= 1 && fields.length > 8;
  const denseMobileRisk = halfFields > 6 && (form.theme.density ?? defaultAppearance.density) === "compact";
  const heavyMatrixRisk = form.fields.some((field) => {
    const rows = field.settings?.matrixRows?.length ?? 0;
    const columns = field.settings?.matrixColumns?.length ?? 0;
    return field.type === "matrix" && rows * columns > 30;
  });

  const accessibility = clampScore(100 - labelIssues * 22 - guidanceIssues * 8 - (darkContrastRisk ? 18 : 0));
  const friction = clampScore(100 - Math.max(0, fields.length - 7) * 5 - requiredFields.length * 2 - (tooLongSingleStep ? 18 : 0));
  const mobile = clampScore(100 - (denseMobileRisk ? 18 : 0) - (heavyMatrixRisk ? 16 : 0) - Math.max(0, halfFields - 4) * 3);
  const consistency = clampScore(
    100 -
      (form.theme.fieldRadius === undefined ? 8 : 0) -
      (form.theme.buttonRadius === undefined ? 8 : 0) -
      (form.theme.fieldStyle === "underline" && (form.theme.buttonStyle ?? defaultAppearance.buttonStyle) === "filled" ? 8 : 0)
  );
  const overall = clampScore((accessibility + friction + mobile + consistency) / 4 + Math.min(advancedFields * 2, 8));

  const metrics: HealthMetric[] = [
    { label: "Accessibility", score: accessibility, icon: ShieldCheck },
    { label: "Completion friction", score: friction, icon: Gauge },
    { label: "Mobile readiness", score: mobile, icon: MonitorSmartphone },
    { label: "Design consistency", score: consistency, icon: Wand2 }
  ];

  const recommendations = [
    labelIssues > 0 ? "Add clear labels to every interactive field." : null,
    guidanceIssues > 0 ? "Add helper text or placeholders to required fields that may need context." : null,
    tooLongSingleStep ? "Split long forms into steps to reduce completion fatigue." : null,
    denseMobileRisk ? "Use comfortable spacing when many two-column fields are present." : null,
    heavyMatrixRisk ? "Keep matrix grids smaller on mobile or split them by topic." : null,
    darkContrastRisk ? "Use a brighter accent color in dark mode for clearer focus states." : null,
    !form.description.trim() ? "Add a short description so users know what happens after submission." : null
  ].filter(Boolean) as string[];

  return { overall, metrics, recommendations };
}

function scoreColor(score: number) {
  if (score >= 86) return "text-[#0f766e]";
  if (score >= 70) return "text-[#c77700]";
  return "text-[#dc2626]";
}

function barColor(score: number) {
  if (score >= 86) return "bg-[#0f766e]";
  if (score >= 70) return "bg-[#d97706]";
  return "bg-[#dc2626]";
}

export function FormHealthPanel({ form, compact = false }: { form: FormSchema; compact?: boolean }) {
  const health = getHealth(form);
  const hasRecommendations = health.recommendations.length > 0;

  if (compact) {
    return (
      <section className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#111418]">
              <Gauge size={15} />
              Form health
            </p>
            <p className="mt-1 text-xs text-[#667085]">{hasRecommendations ? `${health.recommendations.length} suggested fix${health.recommendations.length === 1 ? "" : "es"}` : "Structure looks ready"}</p>
          </div>
          <div className="text-right">
            <p className={cn("text-xl font-bold leading-none", scoreColor(health.overall))}>{health.overall}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#98a2b3]">Score</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5e9ef]">
          <div className={cn("h-full rounded-full", barColor(health.overall))} style={{ width: `${health.overall}%` }} />
        </div>
        {hasRecommendations && <p className="mt-3 text-xs leading-5 text-[#92400e]">{health.recommendations[0]}</p>}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#111418]">
            <Gauge size={16} />
            Form health
          </p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">Checks clarity, mobile fit, accessibility and design consistency.</p>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold leading-none", scoreColor(health.overall))}>{health.overall}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">Score</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {health.metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-[#e5e9ef] bg-[#fbfcfe] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#465366]">
                <metric.icon size={14} />
                {metric.label}
              </span>
              <span className={cn("text-xs font-bold", scoreColor(metric.score))}>{metric.score}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e9ef]">
              <div className={cn("h-full rounded-full", barColor(metric.score))} style={{ width: `${metric.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className={cn("mt-4 rounded-xl border p-3", hasRecommendations ? "border-[#fde68a] bg-[#fffbeb]" : "border-[#bbf7d0] bg-[#f0fdf4]")}>
        <p className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]", hasRecommendations ? "text-[#92400e]" : "text-[#0f766e]")}>
          {hasRecommendations ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          {hasRecommendations ? "Suggested improvements" : "Looks ready"}
        </p>
        {hasRecommendations ? (
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#78350f]">
            {health.recommendations.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs leading-5 text-[#166534]">This form has a healthy structure for preview and portfolio presentation.</p>
        )}
      </div>
    </section>
  );
}
