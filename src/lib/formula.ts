import type { FormField } from "@/types/form";

const formulaFunctions = {
  abs: Math.abs,
  avg: (...values: number[]) => values.reduce((total, value) => total + value, 0) / Math.max(values.length, 1),
  ceil: Math.ceil,
  floor: Math.floor,
  max: Math.max,
  min: Math.min,
  round: (value: number, precision = 0) => {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }
};

function valueToNumber(value: unknown) {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function evaluateFormula(expression: string | undefined, values: Record<string, unknown>) {
  if (!expression?.trim()) return { value: 0, error: "Add a formula expression." };

  const substituted = expression.replace(/\{([^}]+)\}/g, (_, fieldId: string) => String(valueToNumber(values[fieldId.trim()])));
  const functionNames = Object.keys(formulaFunctions).join("|");
  const withoutFunctionNames = substituted.replace(new RegExp(`\\b(${functionNames})\\b`, "g"), "");

  if (/[^0-9+\-*/().,\s]/.test(withoutFunctionNames)) {
    return { value: 0, error: "Formula contains unsupported characters." };
  }

  try {
    const result = Function(...Object.keys(formulaFunctions), `"use strict"; return (${substituted});`)(...Object.values(formulaFunctions));
    const value = Number(result);
    if (!Number.isFinite(value)) return { value: 0, error: "Formula did not return a finite number." };
    return { value, error: null };
  } catch {
    return { value: 0, error: "Formula could not be calculated." };
  }
}

export function formatFormulaValue(field: FormField, value: number) {
  const precision = Math.min(Math.max(field.settings?.formulaPrecision ?? 2, 0), 6);
  const format = field.settings?.formulaFormat ?? "number";
  const fixed = value.toLocaleString(undefined, {
    maximumFractionDigits: precision,
    minimumFractionDigits: format === "currency" ? Math.min(precision, 2) : 0
  });

  if (format === "currency") return `${field.settings?.formulaPrefix ?? "$"}${fixed}${field.settings?.formulaSuffix ?? ""}`;
  if (format === "percent") return `${fixed}${field.settings?.formulaSuffix ?? "%"}`;
  if (format === "text") return `${field.settings?.formulaPrefix ?? ""}${fixed}${field.settings?.formulaSuffix ?? ""}`;
  return `${field.settings?.formulaPrefix ?? ""}${fixed}${field.settings?.formulaSuffix ?? ""}`;
}
