"use client";

import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useFormStore } from "@/store/form-store";

export function FieldSettingsPanel() {
  const form = useFormStore((state) => state.form);
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const updateField = useFormStore((state) => state.updateField);
  const duplicateField = useFormStore((state) => state.duplicateField);
  const deleteField = useFormStore((state) => state.deleteField);
  const field = form.fields.find((item) => item.id === selectedFieldId);

  if (!field) {
    return (
      <aside className="h-full border-l border-[#dce1e8] bg-white p-5">
        <p className="text-sm font-semibold text-[#1f2937]">Field settings</p>
        <div className="mt-5 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5 text-sm leading-6 text-[#68707d]">
          Select a field on the canvas to edit labels, validation, steps and options.
        </div>
      </aside>
    );
  }

  const hasTextSettings = !["divider"].includes(field.type);
  const hasOptions = ["dropdown", "radio", "checkbox"].includes(field.type);
  const optionText = field.options?.join("\n") ?? "";

  return (
    <aside className="formcraft-scrollbar h-full overflow-y-auto border-l border-[#dce1e8] bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1f2937]">Field settings</p>
          <p className="text-xs text-[#68707d]">{field.type}</p>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => duplicateField(field.id)} aria-label="Duplicate field">
            <Copy size={16} />
          </Button>
          <Button size="icon" variant="danger" onClick={() => deleteField(field.id)} aria-label="Delete field">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {hasTextSettings && (
          <>
            <div>
              <Label htmlFor="field-label">Label</Label>
              <Input id="field-label" className="mt-2" value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} />
            </div>
            <div>
              <Label htmlFor="field-helper">Helper text</Label>
              <Textarea id="field-helper" className="mt-2 min-h-20" value={field.helperText ?? ""} onChange={(event) => updateField(field.id, { helperText: event.target.value })} />
            </div>
          </>
        )}
        {!["section", "divider", "file"].includes(field.type) && (
          <div>
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input id="field-placeholder" className="mt-2" value={field.placeholder ?? ""} onChange={(event) => updateField(field.id, { placeholder: event.target.value })} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="field-step">Step</Label>
            <Input id="field-step" type="number" min={1} className="mt-2" value={field.step ?? 1} onChange={(event) => updateField(field.id, { step: Number(event.target.value) || 1 })} />
          </div>
          {!["section", "divider", "file"].includes(field.type) && (
            <label className="mt-7 flex h-10 items-center gap-2 rounded-lg border border-[#dce1e8] px-3 text-sm text-[#1f2937]">
              <input type="checkbox" checked={Boolean(field.required)} onChange={(event) => updateField(field.id, { required: event.target.checked })} />
              Required
            </label>
          )}
        </div>
        {hasOptions && (
          <div>
            <Label htmlFor="field-options">Options</Label>
            <Textarea
              id="field-options"
              className="mt-2 min-h-28 font-mono text-xs"
              value={optionText}
              onChange={(event) =>
                updateField(field.id, {
                  options: event.target.value
                    .split("\n")
                    .map((option) => option.trim())
                    .filter(Boolean)
                })
              }
            />
            <p className="mt-1 text-xs text-[#68707d]">One option per line.</p>
          </div>
        )}
        {!["section", "divider", "file"].includes(field.type) && (
          <div className="rounded-xl border border-[#e1e6ee] bg-[#fbfcfe] p-4">
            <p className="mb-3 text-sm font-semibold text-[#1f2937]">Validation</p>
            {field.type === "number" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="min">Min</Label>
                  <Input id="min" type="number" className="mt-2" value={field.validation?.min ?? ""} onChange={(event) => updateField(field.id, { validation: { ...field.validation, min: event.target.value ? Number(event.target.value) : undefined } })} />
                </div>
                <div>
                  <Label htmlFor="max">Max</Label>
                  <Input id="max" type="number" className="mt-2" value={field.validation?.max ?? ""} onChange={(event) => updateField(field.id, { validation: { ...field.validation, max: event.target.value ? Number(event.target.value) : undefined } })} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="minLength">Min length</Label>
                  <Input id="minLength" type="number" className="mt-2" value={field.validation?.minLength ?? ""} onChange={(event) => updateField(field.id, { validation: { ...field.validation, minLength: event.target.value ? Number(event.target.value) : undefined } })} />
                </div>
                <div>
                  <Label htmlFor="maxLength">Max length</Label>
                  <Input id="maxLength" type="number" className="mt-2" value={field.validation?.maxLength ?? ""} onChange={(event) => updateField(field.id, { validation: { ...field.validation, maxLength: event.target.value ? Number(event.target.value) : undefined } })} />
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <Label htmlFor="field-type">Field type</Label>
          <Select id="field-type" className="mt-2" value={field.type} disabled>
            <option>{field.type}</option>
          </Select>
        </div>
      </div>
    </aside>
  );
}
