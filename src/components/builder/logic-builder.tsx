"use client";

import { Eye, EyeOff, GitBranch, ListChecks, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { isFieldInputLike, ruleNeedsValue } from "@/lib/logic";
import { useFormStore } from "@/store/form-store";
import type { LogicAction, LogicOperator, LogicRule } from "@/types/form";
import { cn } from "@/lib/utils";

const operatorOptions: Array<{ value: LogicOperator; label: string }> = [
  { value: "equals", label: "is exactly" },
  { value: "notEquals", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "notEmpty", label: "has any answer" },
  { value: "empty", label: "is unanswered" },
  { value: "greaterThan", label: "is more than" },
  { value: "lessThan", label: "is less than" }
];

const actionOptions: Array<{ value: LogicAction; label: string }> = [
  { value: "show", label: "show" },
  { value: "hide", label: "hide" },
  { value: "require", label: "make required" },
  { value: "optional", label: "make optional" }
];

const recipeCards: Array<{ title: string; description: string; action: LogicAction; icon: typeof Eye }> = [
  { title: "Show follow-up", description: "Reveal a question only after a matching answer.", action: "show", icon: Eye },
  { title: "Skip irrelevant", description: "Hide fields when they do not apply.", action: "hide", icon: EyeOff },
  { title: "Require when needed", description: "Make a field mandatory only in certain cases.", action: "require", icon: ListChecks }
];

function getSuggestedValue(rule: LogicRule, sourceOptions?: string[]) {
  if (!ruleNeedsValue(rule)) return "";
  return rule.value ?? sourceOptions?.[0] ?? "";
}

function fieldLabel(fields: ReturnType<typeof useFormStore.getState>["form"]["fields"], id: string) {
  return fields.find((field) => field.id === id)?.label || "a field";
}

function ruleSummary(rule: LogicRule, fields: ReturnType<typeof useFormStore.getState>["form"]["fields"]) {
  const source = fieldLabel(fields, rule.sourceFieldId);
  const targets = rule.targetFieldIds.map((id) => fieldLabel(fields, id)).join(", ") || "selected fields";
  const operator = operatorOptions.find((option) => option.value === rule.operator)?.label ?? "matches";
  const action = actionOptions.find((option) => option.value === rule.action)?.label ?? "update";
  const value = ruleNeedsValue(rule) ? ` "${rule.value || "..."}"` : "";
  return `If ${source} ${operator}${value}, then ${action} ${targets}.`;
}

export function LogicBuilder() {
  const form = useFormStore((state) => state.form);
  const addLogicRule = useFormStore((state) => state.addLogicRule);
  const updateLogicRule = useFormStore((state) => state.updateLogicRule);
  const deleteLogicRule = useFormStore((state) => state.deleteLogicRule);
  const usableFields = form.fields.filter(isFieldInputLike);
  const rules = form.logicRules ?? [];
  const canCreateRules = usableFields.length >= 2;

  return (
    <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#111418]">
            <GitBranch size={16} />
            Logic builder
          </p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">Write form behavior as simple if-this-then-that sentences.</p>
        </div>
        <Button type="button" size="sm" variant="primary" className="shrink-0 whitespace-nowrap px-3.5" disabled={!canCreateRules} onClick={addLogicRule}>
          <Plus size={14} />
          Add rule
        </Button>
      </div>

      {!canCreateRules && (
        <div className="rounded-2xl border border-dashed border-[#bfcadc] bg-[#f8fafc] p-4 text-sm leading-6 text-[#667085]">
          Add at least two answer fields to create form logic.
        </div>
      )}

      {canCreateRules && !rules.length && (
        <div className="rounded-2xl border border-dashed border-[#bfcadc] bg-[#f8fafc] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
            <Zap size={15} />
            Start with a common behavior
          </p>
          <div className="mt-3 grid gap-2">
            {recipeCards.map((recipe) => (
              <button
                key={recipe.title}
                type="button"
                className="flex items-start gap-3 rounded-xl border border-[#d8e0ea] bg-white p-3 text-left transition hover:border-[#3157d5]/60 hover:bg-[#f4f7ff]"
                onClick={() => {
                  addLogicRule();
                  window.setTimeout(() => {
                    const latestRule = useFormStore.getState().form.logicRules?.at(-1);
                    if (latestRule) useFormStore.getState().updateLogicRule(latestRule.id, { action: recipe.action, name: recipe.title });
                  });
                }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#3157d5]">
                  <recipe.icon size={16} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#111418]">{recipe.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[#667085]">{recipe.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rules.map((rule, index) => {
          const sourceField = usableFields.find((field) => field.id === rule.sourceFieldId) ?? usableFields[0];
          const targetableFields = usableFields.filter((field) => field.id !== rule.sourceFieldId);
          return (
            <div key={rule.id} className={cn("rounded-2xl border bg-[#fbfcfe] p-4 shadow-sm", rule.enabled ? "border-[#d8e0ea]" : "border-[#e5e9ef] opacity-70")}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111418]">{rule.name || `Rule ${index + 1}`}</p>
                  <p className="mt-1 text-xs leading-5 text-[#667085]">{ruleSummary(rule, form.fields)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex h-8 items-center gap-2 rounded-lg border border-[#d8e0ea] bg-white px-2 text-xs font-semibold text-[#465366]">
                    <input type="checkbox" checked={rule.enabled} onChange={(event) => updateLogicRule(rule.id, { enabled: event.target.checked })} />
                    On
                  </label>
                  <Button type="button" size="icon" variant="danger" onClick={() => deleteLogicRule(rule.id)} aria-label="Delete logic rule">
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                <div>
                  <Label htmlFor={`logic-name-${rule.id}`}>Name this behavior</Label>
                  <Input id={`logic-name-${rule.id}`} className="mt-2" value={rule.name} onChange={(event) => updateLogicRule(rule.id, { name: event.target.value })} />
                </div>

                <div className="rounded-xl border border-[#e5e9ef] bg-white p-3">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">Build the sentence</p>
                  <div className="grid gap-3">
                    <div className="rounded-xl bg-[#f8fafc] p-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">If answer to</p>
                      <Select
                        id={`logic-source-${rule.id}`}
                        value={rule.sourceFieldId}
                        onChange={(event) => {
                          const nextSource = usableFields.find((field) => field.id === event.target.value);
                          updateLogicRule(rule.id, {
                            sourceFieldId: event.target.value,
                            value: nextSource?.options?.[0] ?? "",
                            targetFieldIds: rule.targetFieldIds.filter((targetId) => targetId !== event.target.value)
                          });
                        }}
                      >
                        {usableFields.map((field) => (
                          <option key={field.id} value={field.id}>{field.label}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                      <div>
                        <Label htmlFor={`logic-operator-${rule.id}`}>Condition</Label>
                        <Select
                          id={`logic-operator-${rule.id}`}
                          className="mt-2"
                          value={rule.operator}
                          onChange={(event) => {
                            const operator = event.target.value as LogicOperator;
                            updateLogicRule(rule.id, { operator, value: ruleNeedsValue({ operator }) ? getSuggestedValue(rule, sourceField?.options) : "" });
                          }}
                        >
                          {operatorOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </Select>
                      </div>
                      {ruleNeedsValue(rule) && (
                        <div>
                          <Label htmlFor={`logic-value-${rule.id}`}>Answer value</Label>
                          {sourceField?.options?.length ? (
                            <Select id={`logic-value-${rule.id}`} className="mt-2" value={rule.value ?? ""} onChange={(event) => updateLogicRule(rule.id, { value: event.target.value })}>
                              {sourceField.options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </Select>
                          ) : (
                            <Input id={`logic-value-${rule.id}`} className="mt-2" placeholder="Type the answer to match" value={rule.value ?? ""} onChange={(event) => updateLogicRule(rule.id, { value: event.target.value })} />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`logic-action-${rule.id}`}>Then</Label>
                      <Select id={`logic-action-${rule.id}`} className="mt-2" value={rule.action} onChange={(event) => updateLogicRule(rule.id, { action: event.target.value as LogicAction })}>
                        {actionOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#e5e9ef] bg-white p-3">
                  <Label>Apply this to</Label>
                  <p className="mt-1 text-xs leading-5 text-[#667085]">Choose the fields that should change when the sentence is true.</p>
                  <div className="mt-3 grid gap-2">
                    {targetableFields.map((field) => (
                      <label key={field.id} className="flex items-center gap-3 rounded-xl border border-[#e5e9ef] bg-[#fbfcfe] px-3 py-2 text-sm font-medium text-[#334155]">
                        <input
                          type="checkbox"
                          checked={rule.targetFieldIds.includes(field.id)}
                          onChange={(event) => {
                            const nextTargets = event.target.checked
                              ? [...rule.targetFieldIds, field.id]
                              : rule.targetFieldIds.filter((targetId) => targetId !== field.id);
                            updateLogicRule(rule.id, { targetFieldIds: nextTargets });
                          }}
                        />
                        <span className="min-w-0 truncate">{field.label}</span>
                        <span className="ml-auto rounded-full bg-[#eef2f7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085]">{field.type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
