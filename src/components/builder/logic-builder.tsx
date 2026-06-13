"use client";

import { GitBranch, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { isFieldInputLike, ruleNeedsValue } from "@/lib/logic";
import { useFormStore } from "@/store/form-store";
import type { LogicAction, LogicOperator, LogicRule } from "@/types/form";
import { cn } from "@/lib/utils";

const operatorOptions: Array<{ value: LogicOperator; label: string }> = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "notEmpty", label: "is filled" },
  { value: "empty", label: "is empty" },
  { value: "greaterThan", label: "is greater than" },
  { value: "lessThan", label: "is less than" }
];

const actionOptions: Array<{ value: LogicAction; label: string }> = [
  { value: "show", label: "Show fields" },
  { value: "hide", label: "Hide fields" },
  { value: "require", label: "Make required" },
  { value: "optional", label: "Make optional" }
];

function getSuggestedValue(rule: LogicRule, sourceOptions?: string[]) {
  if (!ruleNeedsValue(rule)) return "";
  return rule.value ?? sourceOptions?.[0] ?? "";
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
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#111418]">
            <GitBranch size={16} />
            Logic builder
          </p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">Create conditional show, hide and required rules from form answers.</p>
        </div>
        <Button type="button" size="sm" variant="primary" disabled={!canCreateRules} onClick={addLogicRule}>
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
            No rules yet
          </p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">Example: If budget is greater than 5000, show the sales call field.</p>
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
                  <p className="text-sm font-semibold text-[#111418]">Rule {index + 1}</p>
                  <p className="mt-1 text-xs text-[#667085]">{rule.enabled ? "Active in preview" : "Paused"}</p>
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
                  <Label htmlFor={`logic-name-${rule.id}`}>Rule name</Label>
                  <Input id={`logic-name-${rule.id}`} className="mt-2" value={rule.name} onChange={(event) => updateLogicRule(rule.id, { name: event.target.value })} />
                </div>

                <div className="rounded-xl border border-[#e5e9ef] bg-white p-3">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">When</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`logic-source-${rule.id}`}>Field</Label>
                      <Select
                        id={`logic-source-${rule.id}`}
                        className="mt-2"
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
                  </div>
                  {ruleNeedsValue(rule) && (
                    <div className="mt-3">
                      <Label htmlFor={`logic-value-${rule.id}`}>Value</Label>
                      {sourceField?.options?.length ? (
                        <Select id={`logic-value-${rule.id}`} className="mt-2" value={rule.value ?? ""} onChange={(event) => updateLogicRule(rule.id, { value: event.target.value })}>
                          {sourceField.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      ) : (
                        <Input id={`logic-value-${rule.id}`} className="mt-2" value={rule.value ?? ""} onChange={(event) => updateLogicRule(rule.id, { value: event.target.value })} />
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#e5e9ef] bg-white p-3">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">Then</p>
                  <div>
                    <Label htmlFor={`logic-action-${rule.id}`}>Action</Label>
                    <Select id={`logic-action-${rule.id}`} className="mt-2" value={rule.action} onChange={(event) => updateLogicRule(rule.id, { action: event.target.value as LogicAction })}>
                      {actionOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="mt-3">
                    <Label>Target fields</Label>
                    <div className="mt-2 grid gap-2">
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
