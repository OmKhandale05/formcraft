import type { FormField, FormSchema, LogicRule } from "@/types/form";

export type LogicEffects = {
  hiddenFieldIds: Set<string>;
  requiredFieldIds: Set<string>;
};

function valueAsText(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function valueAsNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ruleNeedsValue(rule: Pick<LogicRule, "operator">) {
  return !["notEmpty", "empty"].includes(rule.operator);
}

export function evaluateCondition(rule: LogicRule, values: Record<string, unknown>) {
  const currentValue = values[rule.sourceFieldId];
  const currentText = valueAsText(currentValue).trim();
  const expectedText = String(rule.value ?? "").trim();

  if (rule.operator === "notEmpty") return currentText.length > 0 && currentText !== "[]" && currentText !== "{}";
  if (rule.operator === "empty") return currentText.length === 0 || currentText === "[]" || currentText === "{}";
  if (rule.operator === "equals") return currentText.toLowerCase() === expectedText.toLowerCase();
  if (rule.operator === "notEquals") return currentText.toLowerCase() !== expectedText.toLowerCase();
  if (rule.operator === "contains") return currentText.toLowerCase().includes(expectedText.toLowerCase());

  const currentNumber = valueAsNumber(currentValue);
  const expectedNumber = valueAsNumber(rule.value);
  if (currentNumber === null || expectedNumber === null) return false;
  if (rule.operator === "greaterThan") return currentNumber > expectedNumber;
  if (rule.operator === "lessThan") return currentNumber < expectedNumber;
  return false;
}

export function evaluateLogic(form: Pick<FormSchema, "fields" | "logicRules">, values: Record<string, unknown>): LogicEffects {
  const hiddenFieldIds = new Set<string>();
  const requiredFieldIds = new Set(form.fields.filter((field) => field.required).map((field) => field.id));
  const validFieldIds = new Set(form.fields.map((field) => field.id));

  for (const rule of form.logicRules ?? []) {
    if (!rule.enabled || !validFieldIds.has(rule.sourceFieldId) || !rule.targetFieldIds.length) continue;
    const targets = rule.targetFieldIds.filter((id) => validFieldIds.has(id) && id !== rule.sourceFieldId);
    if (rule.action === "show") {
      for (const targetId of targets) hiddenFieldIds.add(targetId);
    }
  }

  for (const rule of form.logicRules ?? []) {
    if (!rule.enabled || !validFieldIds.has(rule.sourceFieldId) || !rule.targetFieldIds.length) continue;
    const matches = evaluateCondition(rule, values);
    if (!matches) continue;

    for (const targetId of rule.targetFieldIds) {
      if (!validFieldIds.has(targetId) || targetId === rule.sourceFieldId) continue;
      if (rule.action === "hide") hiddenFieldIds.add(targetId);
      if (rule.action === "show") hiddenFieldIds.delete(targetId);
      if (rule.action === "require") requiredFieldIds.add(targetId);
      if (rule.action === "optional") requiredFieldIds.delete(targetId);
    }
  }

  return { hiddenFieldIds, requiredFieldIds };
}

export function isFieldInputLike(field: FormField) {
  return !["section", "divider", "hidden", "formula"].includes(field.type);
}
