"use client";

import { Copy, GripVertical, Moon, Palette, Plus, Square, Sun, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { fieldCatalog, fullWidthOnlyFieldTypes } from "@/lib/field-catalog";
import { phoneCountries } from "@/lib/phone-countries";
import { useFormStore } from "@/store/form-store";
import type { FieldType, FormField, ValidationRule } from "@/types/form";

const optionFieldTypes: FieldType[] = ["dropdown", "radio", "checkbox"];
const themeColors = ["#2563eb", "#0f766e", "#d97706", "#db2777", "#7c3aed", "#111827"];
const matrixColorPresets = ["#eef4ff", "#f8fafc", "#ffffff", "#fef3c7", "#ecfdf5", "#fdf2f8", "#f1f5f9", "#111827"];
const defaultMatrixColors = {
  matrixHeaderColor: "#eef4ff",
  matrixRowColor: "#ffffff",
  matrixAlternateRowColor: "#f8fafc",
  matrixBorderColor: "#d8e0ea"
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
  "rating",
  "daterange",
  "slider",
  "richtext",
  "matrix",
  "payment",
  "formula"
];

function normalizeFieldTypeChange(field: FormField, nextType: FieldType): Partial<FormField> {
  const usesOptions = optionFieldTypes.includes(nextType);
  const supportsPlaceholder = !["section", "divider", "file", "rating", "signature", "matrix", "hidden", "formula"].includes(nextType);
  const supportsRequired = !["section", "divider", "file", "hidden", "formula"].includes(nextType);
  const supportsValidation = inputFieldTypes.includes(nextType);
  const nextValidation: ValidationRule = nextType === "number"
    ? { min: field.validation?.min, max: field.validation?.max }
    : { minLength: field.validation?.minLength, maxLength: field.validation?.maxLength };

  return {
    type: nextType,
    placeholder: supportsPlaceholder ? field.placeholder || "Enter response" : undefined,
    required: supportsRequired ? Boolean(field.required) : false,
    layout: fullWidthOnlyFieldTypes.includes(nextType) ? "full" : field.layout ?? "full",
    options: usesOptions ? field.options?.length ? field.options : ["Option one", "Option two", "Option three"] : undefined,
    validation: supportsValidation ? nextValidation : {},
    settings: {
      ...field.settings,
      ratingStyle: nextType === "rating" ? field.settings?.ratingStyle ?? "stars" : field.settings?.ratingStyle,
      ratingScale: nextType === "rating" ? field.settings?.ratingScale ?? 5 : field.settings?.ratingScale,
      acceptedFileTypes: nextType === "file" ? field.settings?.acceptedFileTypes ?? ".pdf,.png,.jpg" : field.settings?.acceptedFileTypes,
      maxFileSizeMb: nextType === "file" ? field.settings?.maxFileSizeMb ?? 10 : field.settings?.maxFileSizeMb,
      countryCode: nextType === "phone" ? field.settings?.countryCode ?? "+91" : field.settings?.countryCode,
      sliderMin: nextType === "slider" ? field.settings?.sliderMin ?? 0 : field.settings?.sliderMin,
      sliderMax: nextType === "slider" ? field.settings?.sliderMax ?? 100 : field.settings?.sliderMax,
      sliderStep: nextType === "slider" ? field.settings?.sliderStep ?? 5 : field.settings?.sliderStep,
      matrixRows: nextType === "matrix" ? field.settings?.matrixRows ?? ["Ease of use", "Design quality", "Performance"] : field.settings?.matrixRows,
      matrixColumns: nextType === "matrix" ? field.settings?.matrixColumns ?? ["Poor", "Average", "Great"] : field.settings?.matrixColumns,
      matrixInputType: nextType === "matrix" ? field.settings?.matrixInputType ?? "radio" : field.settings?.matrixInputType,
      matrixDropdownOptions: nextType === "matrix" ? field.settings?.matrixDropdownOptions ?? ["Low", "Medium", "High"] : field.settings?.matrixDropdownOptions,
      matrixAlternateRows: nextType === "matrix" ? field.settings?.matrixAlternateRows ?? true : field.settings?.matrixAlternateRows,
      matrixHeaderColor: nextType === "matrix" ? field.settings?.matrixHeaderColor ?? defaultMatrixColors.matrixHeaderColor : field.settings?.matrixHeaderColor,
      matrixRowColor: nextType === "matrix" ? field.settings?.matrixRowColor ?? defaultMatrixColors.matrixRowColor : field.settings?.matrixRowColor,
      matrixAlternateRowColor: nextType === "matrix" ? field.settings?.matrixAlternateRowColor ?? defaultMatrixColors.matrixAlternateRowColor : field.settings?.matrixAlternateRowColor,
      matrixBorderColor: nextType === "matrix" ? field.settings?.matrixBorderColor ?? defaultMatrixColors.matrixBorderColor : field.settings?.matrixBorderColor,
      hiddenValue: nextType === "hidden" ? field.settings?.hiddenValue ?? "utm_source=portfolio" : field.settings?.hiddenValue,
      currency: nextType === "payment" ? field.settings?.currency ?? "USD" : field.settings?.currency,
      formulaMode: nextType === "formula" ? field.settings?.formulaMode ?? "simple" : field.settings?.formulaMode,
      formulaOperator: nextType === "formula" ? field.settings?.formulaOperator ?? "add" : field.settings?.formulaOperator,
      formulaUseCustomValue: nextType === "formula" ? field.settings?.formulaUseCustomValue ?? false : field.settings?.formulaUseCustomValue,
      formulaCustomValue: nextType === "formula" ? field.settings?.formulaCustomValue ?? 0 : field.settings?.formulaCustomValue,
      formulaExpression: nextType === "formula" ? field.settings?.formulaExpression ?? "0" : field.settings?.formulaExpression,
      formulaFormat: nextType === "formula" ? field.settings?.formulaFormat ?? "number" : field.settings?.formulaFormat,
      formulaPrecision: nextType === "formula" ? field.settings?.formulaPrecision ?? 2 : field.settings?.formulaPrecision,
      formulaFallback: nextType === "formula" ? field.settings?.formulaFallback ?? "Waiting for inputs" : field.settings?.formulaFallback
    }
  };
}

function linesToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function FieldSettingsPanel() {
  const form = useFormStore((state) => state.form);
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const updateField = useFormStore((state) => state.updateField);
  const duplicateField = useFormStore((state) => state.duplicateField);
  const deleteField = useFormStore((state) => state.deleteField);
  const field = form.fields.find((item) => item.id === selectedFieldId);

  if (!field) {
    return (
      <aside className="h-full border-l border-[#d8e0ea] bg-white/74 p-5 backdrop-blur-xl">
        <p className="text-sm font-semibold text-[#1f2937]">Field settings</p>
        <div className="mt-5 rounded-2xl border border-dashed border-[#bfcadc] bg-white/70 p-5 text-sm leading-6 text-[#667085] shadow-sm">
          Select a field on the canvas to edit labels, validation, steps and options.
        </div>
      </aside>
    );
  }

  const hasTextSettings = !["divider"].includes(field.type);
  const hasOptions = ["dropdown", "radio", "checkbox"].includes(field.type);
  const optionText = field.options?.join("\n") ?? "";

  return (
    <aside className="formcraft-scrollbar h-full overflow-y-auto border-l border-[#d8e0ea] bg-white/74 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-[#1f2937]">Field settings</p>
          <p className="text-xs text-[#667085]">{field.type}</p>
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
        {!["section", "divider", "file", "rating", "signature", "matrix", "hidden", "formula"].includes(field.type) && (
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
          {!["section", "divider", "file", "hidden", "formula"].includes(field.type) && (
            <label className="mt-7 flex h-10 items-center gap-2 rounded-xl border border-[#d8e0ea] bg-white/90 px-3 text-sm font-medium text-[#1f2937] shadow-sm">
              <input type="checkbox" checked={Boolean(field.required)} onChange={(event) => updateField(field.id, { required: event.target.checked })} />
              Required
            </label>
          )}
        </div>
        {!["hidden"].includes(field.type) && (
          <div className="rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
            <Label htmlFor="field-layout">Layout</Label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                  (field.layout ?? "full") === "full"
                    ? "border-[#3157d5] bg-[#eef3ff] text-[#3157d5]"
                    : "border-[#d8e0ea] bg-white text-[#465366] hover:border-[#bfcadc]"
                }`}
                onClick={() => updateField(field.id, { layout: "full" })}
              >
                <span className="block">Single row</span>
                <span className="mt-1 block text-xs font-medium text-[#667085]">1 field per row</span>
              </button>
              <button
                type="button"
                disabled={fullWidthOnlyFieldTypes.includes(field.type)}
                className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  field.layout === "half"
                    ? "border-[#3157d5] bg-[#eef3ff] text-[#3157d5]"
                    : "border-[#d8e0ea] bg-white text-[#465366] hover:border-[#bfcadc]"
                }`}
                onClick={() => updateField(field.id, { layout: "half" })}
              >
                <span className="block">Two columns</span>
                <span className="mt-1 block text-xs font-medium text-[#667085]">2 fields in 1 row</span>
              </button>
            </div>
            {fullWidthOnlyFieldTypes.includes(field.type) && <p className="mt-2 text-xs text-[#667085]">This field type stays full-width for readability.</p>}
          </div>
        )}
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
            <p className="mt-1 text-xs text-[#667085]">One option per line.</p>
          </div>
        )}
        {field.type === "rating" && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
            <div>
              <Label htmlFor="rating-style">Rating style</Label>
              <Select
                id="rating-style"
                className="mt-2"
                value={field.settings?.ratingStyle ?? "stars"}
                onChange={(event) => updateField(field.id, { settings: { ...field.settings, ratingStyle: event.target.value as "stars" | "emoji" } })}
              >
                <option value="stars">Stars</option>
                <option value="emoji">Emoji</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="rating-scale">Scale</Label>
              <Input id="rating-scale" type="number" min={3} max={10} className="mt-2" value={field.settings?.ratingScale ?? 5} onChange={(event) => updateField(field.id, { settings: { ...field.settings, ratingScale: Number(event.target.value) || 5 } })} />
            </div>
          </div>
        )}
        {field.type === "file" && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
            <div>
              <Label htmlFor="accepted-types">Accepted types</Label>
              <Input id="accepted-types" className="mt-2" value={field.settings?.acceptedFileTypes ?? ""} onChange={(event) => updateField(field.id, { settings: { ...field.settings, acceptedFileTypes: event.target.value } })} />
            </div>
            <div>
              <Label htmlFor="max-file">Max MB</Label>
              <Input id="max-file" type="number" min={1} className="mt-2" value={field.settings?.maxFileSizeMb ?? ""} onChange={(event) => updateField(field.id, { settings: { ...field.settings, maxFileSizeMb: event.target.value ? Number(event.target.value) : undefined } })} />
            </div>
          </div>
        )}
        {field.type === "phone" && (
          <div className="rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
            <Label htmlFor="country-code">Default country</Label>
            <Select id="country-code" className="mt-2" value={field.settings?.countryCode ?? "+91"} onChange={(event) => updateField(field.id, { settings: { ...field.settings, countryCode: event.target.value } })}>
              {phoneCountries.map((country) => (
                <option key={`${country.code}-${country.country}`} value={country.code}>
                  {country.flag} {country.code} {country.country}
                </option>
              ))}
            </Select>
            <p className="mt-2 text-xs leading-5 text-[#667085]">Shows a flag and dial code in the preview phone input.</p>
          </div>
        )}
        {field.type === "slider" && (
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
            <div>
              <Label htmlFor="slider-min">Min</Label>
              <Input id="slider-min" type="number" className="mt-2" value={field.settings?.sliderMin ?? 0} onChange={(event) => updateField(field.id, { settings: { ...field.settings, sliderMin: Number(event.target.value) } })} />
            </div>
            <div>
              <Label htmlFor="slider-max">Max</Label>
              <Input id="slider-max" type="number" className="mt-2" value={field.settings?.sliderMax ?? 100} onChange={(event) => updateField(field.id, { settings: { ...field.settings, sliderMax: Number(event.target.value) } })} />
            </div>
            <div>
              <Label htmlFor="slider-step">Step</Label>
              <Input id="slider-step" type="number" min={1} className="mt-2" value={field.settings?.sliderStep ?? 1} onChange={(event) => updateField(field.id, { settings: { ...field.settings, sliderStep: Number(event.target.value) || 1 } })} />
            </div>
          </div>
        )}
        {field.type === "matrix" && <MatrixSettings field={field} onChange={(settings) => updateField(field.id, { settings: { ...field.settings, ...settings } })} />}
        {field.type === "hidden" && (
          <div>
            <Label htmlFor="hidden-value">Hidden value</Label>
            <Input id="hidden-value" className="mt-2" value={field.settings?.hiddenValue ?? ""} onChange={(event) => updateField(field.id, { settings: { ...field.settings, hiddenValue: event.target.value } })} />
          </div>
        )}
        {field.type === "payment" && (
          <div>
            <Label htmlFor="currency">Currency</Label>
            <CurrencySelect
              value={field.settings?.currency ?? "USD"}
              className="mt-2"
              onChange={(currency) => updateField(field.id, { settings: { ...field.settings, currency } })}
            />
          </div>
        )}
        {field.type === "formula" && <FormulaSettings field={field} fields={form.fields} onChange={(settings) => updateField(field.id, { settings: { ...field.settings, ...settings } })} />}
        {!["section", "divider", "file", "rating", "signature", "daterange", "slider", "matrix", "hidden", "payment", "formula"].includes(field.type) && (
          <div className="rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
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
          <Select
            id="field-type"
            className="mt-2"
            value={field.type}
            onChange={(event) => updateField(field.id, normalizeFieldTypeChange(field, event.target.value as FieldType))}
          >
            {fieldCatalog.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-[#667085]">Converts this field while preserving compatible settings.</p>
        </div>
      </div>
    </aside>
  );
}

function moveItem(items: string[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function MatrixSettings({ field, onChange }: { field: FormField; onChange: (settings: NonNullable<FormField["settings"]>) => void }) {
  const rows = field.settings?.matrixRows?.length ? field.settings.matrixRows : ["Ease of use", "Design quality", "Performance"];
  const columns = field.settings?.matrixColumns?.length ? field.settings.matrixColumns : ["Poor", "Average", "Great"];
  const hiddenRows = field.settings?.matrixHiddenRows ?? [];
  const columnDescriptions = field.settings?.matrixColumnDescriptions ?? {};
  const columnWidths = field.settings?.matrixColumnWidths ?? {};
  const draggedRow = useRef<number | null>(null);
  const draggedColumn = useRef<number | null>(null);
  const [rowDropIndex, setRowDropIndex] = useState<number | null>(null);
  const [columnDropIndex, setColumnDropIndex] = useState<number | null>(null);

  const updateRow = (index: number, value: string) => onChange({ matrixRows: rows.map((row, rowIndex) => (rowIndex === index ? value : row)) });
  const updateColumn = (index: number, value: string) => {
    const oldColumn = columns[index];
    const nextColumns = columns.map((column, columnIndex) => (columnIndex === index ? value : column));
    const nextDescriptions = { ...columnDescriptions };
    const nextWidths = { ...columnWidths };
    if (oldColumn && oldColumn !== value) {
      nextDescriptions[value] = nextDescriptions[oldColumn] ?? "";
      nextWidths[value] = nextWidths[oldColumn] ?? 160;
      delete nextDescriptions[oldColumn];
      delete nextWidths[oldColumn];
    }
    onChange({ matrixColumns: nextColumns, matrixColumnDescriptions: nextDescriptions, matrixColumnWidths: nextWidths });
  };

  return (
    <div className="space-y-5 rounded-2xl border border-[#d8e0ea] bg-[#f8fafc] p-3 shadow-sm">
      <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#111418]">Matrix behavior</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">Choose how each cell should collect an answer.</p>
        <div>
          <Label htmlFor="matrix-input-type">Input type</Label>
          <Select id="matrix-input-type" className="mt-2" value={field.settings?.matrixInputType ?? "radio"} onChange={(event) => onChange({ matrixInputType: event.target.value as NonNullable<FormField["settings"]>["matrixInputType"] })}>
            <option value="radio">Radio - single select</option>
            <option value="checkbox">Checkbox - multi select</option>
            <option value="text">Text input</option>
            <option value="number">Number input</option>
            <option value="dropdown">Dropdown</option>
            <option value="rating">Rating</option>
            <option value="toggle">Toggle switch</option>
          </Select>
        </div>
        <label className="mt-3 flex min-h-10 items-center gap-3 rounded-xl border border-[#d8e0ea] bg-[#fbfcfe] px-3 py-2 text-sm font-medium text-[#1f2937]">
          <input type="checkbox" checked={field.settings?.matrixAlternateRows ?? true} onChange={(event) => onChange({ matrixAlternateRows: event.target.checked })} />
          Alternate rows
        </label>
      </div>

      <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#111418]">Grid colors</p>
            <p className="mt-1 text-xs leading-5 text-[#667085]">Style the header, body rows and grid lines.</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => onChange(defaultMatrixColors)}>
            Reset
          </Button>
        </div>
        <div className="grid gap-3">
          <MatrixColorControl
            label="Header"
            value={field.settings?.matrixHeaderColor ?? defaultMatrixColors.matrixHeaderColor}
            onChange={(value) => onChange({ matrixHeaderColor: value })}
          />
          <MatrixColorControl
            label="All rows"
            value={field.settings?.matrixRowColor ?? defaultMatrixColors.matrixRowColor}
            onChange={(value) => onChange({ matrixRowColor: value })}
          />
          <MatrixColorControl
            label="Alternate rows"
            value={field.settings?.matrixAlternateRowColor ?? defaultMatrixColors.matrixAlternateRowColor}
            onChange={(value) => onChange({ matrixAlternateRowColor: value })}
          />
          <MatrixColorControl
            label="Grid lines"
            value={field.settings?.matrixBorderColor ?? defaultMatrixColors.matrixBorderColor}
            onChange={(value) => onChange({ matrixBorderColor: value })}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3">
          <div>
            <p className="text-sm font-semibold text-[#111418]">Rows</p>
            <p className="mt-1 text-xs text-[#667085]">{rows.length} rows · drag to reorder</p>
          </div>
          <Button type="button" size="sm" variant="secondary" className="w-full justify-center" onClick={() => onChange({ matrixRows: [...rows, `Row ${rows.length + 1}`] })}>
            <Plus size={14} />
            Add row
          </Button>
        </div>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={`${row}-${index}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggedRow.current !== null && draggedRow.current !== index) setRowDropIndex(index);
              }}
              onDragLeave={() => setRowDropIndex(null)}
              onDrop={() => {
                if (draggedRow.current === null || draggedRow.current === index) return;
                onChange({ matrixRows: moveItem(rows, draggedRow.current, index) });
                draggedRow.current = null;
                setRowDropIndex(null);
              }}
              className={`group rounded-2xl border bg-[#fbfcfe] p-3 transition hover:border-[#c5d0dc] hover:bg-white ${
                rowDropIndex === index ? "border-[#3157d5] ring-4 ring-[#3157d5]/10" : "border-[#d8e0ea]"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
                  <span
                    draggable
                    onDragStart={(event) => {
                      draggedRow.current = index;
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      draggedRow.current = null;
                      setRowDropIndex(null);
                    }}
                    className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#98a2b3] active:cursor-grabbing"
                    title="Drag to reorder row"
                  >
                    <GripVertical size={15} />
                  </span>
                  Row {index + 1}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#667085] transition hover:border-[#3157d5] hover:text-[#3157d5]"
                    onClick={() => onChange({ matrixRows: [...rows.slice(0, index + 1), `${row} copy`, ...rows.slice(index + 1)] })}
                    aria-label="Duplicate row"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff1f3] text-[#e11d48] transition hover:bg-[#ffe4e9]"
                    onClick={() => onChange({ matrixRows: rows.filter((_, rowIndex) => rowIndex !== index) })}
                    aria-label="Delete row"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <Input value={row} className="w-full" onChange={(event) => updateRow(index, event.target.value)} />
              <label className="mt-3 flex min-w-0 items-center gap-2 text-xs font-medium text-[#667085]">
                    <input
                      className="shrink-0"
                      type="checkbox"
                      checked={hiddenRows.includes(row)}
                      onChange={(event) => onChange({ matrixHiddenRows: event.target.checked ? [...hiddenRows, row] : hiddenRows.filter((item) => item !== row) })}
                    />
                    <span className="whitespace-nowrap">Hide this row in preview</span>
                  </label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3">
          <div>
            <p className="text-sm font-semibold text-[#111418]">Columns</p>
            <p className="mt-1 text-xs text-[#667085]">{columns.length} columns · help text and width</p>
          </div>
          <Button type="button" size="sm" variant="secondary" className="w-full justify-center" onClick={() => onChange({ matrixColumns: [...columns, `Column ${columns.length + 1}`] })}>
            <Plus size={14} />
            Add column
          </Button>
        </div>
        <div className="space-y-3">
          {columns.map((column, index) => (
            <div
              key={`${column}-${index}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggedColumn.current !== null && draggedColumn.current !== index) setColumnDropIndex(index);
              }}
              onDragLeave={() => setColumnDropIndex(null)}
              onDrop={() => {
                if (draggedColumn.current === null || draggedColumn.current === index) return;
                onChange({ matrixColumns: moveItem(columns, draggedColumn.current, index) });
                draggedColumn.current = null;
                setColumnDropIndex(null);
              }}
              className={`space-y-3 rounded-2xl border bg-[#fbfcfe] p-3 transition hover:border-[#c5d0dc] hover:bg-white ${
                columnDropIndex === index ? "border-[#3157d5] ring-4 ring-[#3157d5]/10" : "border-[#d8e0ea]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
                  <span
                    draggable
                    onDragStart={(event) => {
                      draggedColumn.current = index;
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      draggedColumn.current = null;
                      setColumnDropIndex(null);
                    }}
                    className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#98a2b3] active:cursor-grabbing"
                    title="Drag to reorder column"
                  >
                    <GripVertical size={15} />
                  </span>
                  Column {index + 1}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#667085] transition hover:border-[#3157d5] hover:text-[#3157d5]"
                    onClick={() => {
                      const copyName = `${column} copy`;
                      onChange({
                        matrixColumns: [...columns.slice(0, index + 1), copyName, ...columns.slice(index + 1)],
                        matrixColumnDescriptions: { ...columnDescriptions, [copyName]: columnDescriptions[column] ?? "" },
                        matrixColumnWidths: { ...columnWidths, [copyName]: columnWidths[column] ?? 160 }
                      });
                    }}
                    aria-label="Duplicate column"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff1f3] text-[#e11d48] transition hover:bg-[#ffe4e9]"
                    onClick={() => onChange({ matrixColumns: columns.filter((_, columnIndex) => columnIndex !== index) })}
                    aria-label="Delete column"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <Input value={column} className="w-full" onChange={(event) => updateColumn(index, event.target.value)} />
              <div className="grid gap-3">
                <div>
                  <Label htmlFor={`matrix-help-${index}`}>Help text</Label>
                  <Input id={`matrix-help-${index}`} className="mt-2" placeholder="Shown under the column name" value={columnDescriptions[column] ?? ""} onChange={(event) => onChange({ matrixColumnDescriptions: { ...columnDescriptions, [column]: event.target.value } })} />
                </div>
                <div>
                  <Label htmlFor={`matrix-width-${index}`}>Width px</Label>
                  <Input id={`matrix-width-${index}`} type="number" min={96} max={360} className="mt-2" value={columnWidths[column] ?? 160} onChange={(event) => onChange({ matrixColumnWidths: { ...columnWidths, [column]: Number(event.target.value) || 160 } })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(field.settings?.matrixInputType ?? "radio") === "dropdown" && (
        <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
          <Label htmlFor="matrix-dropdown-options">Dropdown options</Label>
          <Textarea id="matrix-dropdown-options" className="mt-2 min-h-20 font-mono text-xs" value={(field.settings?.matrixDropdownOptions ?? []).join("\n")} onChange={(event) => onChange({ matrixDropdownOptions: linesToList(event.target.value) })} />
        </div>
      )}
    </div>
  );
}

function MatrixColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-xl border border-[#d8e0ea] bg-[#fbfcfe] p-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-semibold text-[#344054]">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg border border-[#d8e0ea]" style={{ background: value }} />
          <Input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 cursor-pointer p-1" aria-label={`${label} color`} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {matrixColorPresets.map((color) => (
          <button
            key={`${label}-${color}`}
            type="button"
            className="h-7 w-7 rounded-lg border border-[#d8e0ea] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3157d5]/30"
            style={{ background: color, boxShadow: value === color ? `0 0 0 3px ${color}55` : undefined }}
            onClick={() => onChange(color)}
            aria-label={`Use ${color} for ${label}`}
          />
        ))}
      </div>
    </div>
  );
}

function FormulaSettings({
  field,
  fields,
  onChange
}: {
  field: FormField;
  fields: FormField[];
  onChange: (settings: NonNullable<FormField["settings"]>) => void;
}) {
  const formulaFields = fields.filter((item) => item.id !== field.id && !["section", "divider", "file", "signature", "richtext", "matrix", "formula"].includes(item.type));
  const expression = field.settings?.formulaExpression ?? "";
  const operator = field.settings?.formulaOperator ?? "add";
  const inputA = field.settings?.formulaInputA ?? formulaFields[0]?.id ?? "";
  const inputB = field.settings?.formulaInputB ?? formulaFields[1]?.id ?? formulaFields[0]?.id ?? "";
  const useCustomValue = Boolean(field.settings?.formulaUseCustomValue);
  const customValue = field.settings?.formulaCustomValue ?? 0;
  const numberedLabel = (item: FormField, index: number) => `${index + 1}. ${item.label} (${item.type})`;
  const exampleA = formulaFields[0]?.id ?? "First field";
  const exampleB = formulaFields[1]?.id ?? formulaFields[0]?.id ?? "Second field";

  const buildExpression = (next: {
    formulaInputA?: string;
    formulaInputB?: string;
    formulaOperator?: NonNullable<FormField["settings"]>["formulaOperator"];
    formulaUseCustomValue?: boolean;
    formulaCustomValue?: number;
  }) => {
    const nextInputA = next.formulaInputA ?? inputA;
    const nextInputB = next.formulaInputB ?? inputB;
    const nextOperator = next.formulaOperator ?? operator;
    const nextUseCustomValue = next.formulaUseCustomValue ?? useCustomValue;
    const nextCustomValue = next.formulaCustomValue ?? customValue;
    const left = nextInputA ? `{${nextInputA}}` : "0";
    const right = nextUseCustomValue ? String(nextCustomValue || 0) : nextInputB ? `{${nextInputB}}` : "0";

    if (nextOperator === "subtract") return `${left} - ${right}`;
    if (nextOperator === "multiply") return `${left} * ${right}`;
    if (nextOperator === "divide") return `${left} / ${right}`;
    if (nextOperator === "average") return `avg(${left}, ${right})`;
    if (nextOperator === "percent") return `(${left} / ${right}) * 100`;
    if (nextOperator === "percentIncrease") return `((${right} - ${left}) / ${left}) * 100`;
    return `${left} + ${right}`;
  };

  const updateSimpleFormula = (updates: NonNullable<FormField["settings"]>) => {
    onChange({
      ...updates,
      formulaMode: "simple",
      formulaExpression: buildExpression(updates)
    });
  };

  const insertVariable = (fieldId: string) => {
    onChange({ formulaMode: "advanced", formulaExpression: `${expression}${expression.endsWith(" ") || !expression ? "" : " "}{${fieldId}}` });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
      <div className="rounded-xl border border-[#d8e0ea] bg-[#f8fafc] p-3">
        <p className="text-sm font-semibold text-[#111418]">Build calculation</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">Pick fields already on the canvas. The result updates live in Preview.</p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="formula-input-a">1. Choose first field</Label>
          <Select id="formula-input-a" className="mt-2" value={inputA} onChange={(event) => updateSimpleFormula({ formulaInputA: event.target.value })}>
            <option value="">Choose field</option>
            {formulaFields.map((item, index) => (
              <option key={item.id} value={item.id}>
                {numberedLabel(item, index)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="formula-operator">2. Choose calculation</Label>
          <Select id="formula-operator" className="mt-2" value={operator} onChange={(event) => updateSimpleFormula({ formulaOperator: event.target.value as NonNullable<FormField["settings"]>["formulaOperator"] })}>
            <option value="add">Add first + second</option>
            <option value="subtract">Subtract first - second</option>
            <option value="multiply">Multiply first x second</option>
            <option value="divide">Divide first / second</option>
            <option value="average">Average of both</option>
            <option value="percent">First as percent of second</option>
            <option value="percentIncrease">Percent change from first to second</option>
          </Select>
        </div>
        <div className="rounded-xl border border-[#d8e0ea] bg-[#fbfcfe] p-3">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1f2937]">
            <input type="checkbox" checked={useCustomValue} onChange={(event) => updateSimpleFormula({ formulaUseCustomValue: event.target.checked })} />
            Use a number instead of another field
          </label>
          {useCustomValue ? (
            <>
              <Label htmlFor="formula-custom-value">3. Enter number</Label>
              <Input id="formula-custom-value" type="number" className="mt-2" value={customValue} onChange={(event) => updateSimpleFormula({ formulaCustomValue: Number(event.target.value) || 0 })} />
            </>
          ) : (
            <>
              <Label htmlFor="formula-input-b">3. Choose second field</Label>
              <Select id="formula-input-b" className="mt-2" value={inputB} onChange={(event) => updateSimpleFormula({ formulaInputB: event.target.value })}>
                <option value="">Choose field</option>
                {formulaFields.map((item, index) => (
                  <option key={item.id} value={item.id}>
                    {numberedLabel(item, index)}
                  </option>
                ))}
              </Select>
            </>
          )}
        </div>
        {!formulaFields.length && <p className="text-xs leading-5 text-[#dc2626]">Add at least one input field before this formula.</p>}
      </div>

      <details className="rounded-xl border border-[#d8e0ea] bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#465366]">Need a custom formula? Open guide</summary>
        <div className="mt-3 space-y-4">
          <div className="rounded-xl border border-[#d8e0ea] bg-[#f8fafc] p-3 text-xs leading-5 text-[#667085]">
            <p className="font-semibold text-[#111418]">How it works</p>
            <p className="mt-1">1. Click a field button below to insert it into the formula.</p>
            <p>2. Add math symbols like +, -, *, / between fields.</p>
            <p>3. Preview will calculate the answer live.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">Insert field</p>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
              {formulaFields.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className="rounded-lg border border-[#d8e0ea] bg-white px-2.5 py-1 text-xs font-semibold text-[#465366] transition hover:border-[#3157d5] hover:text-[#3157d5]"
                  onClick={() => insertVariable(item.id)}
                >
                  {index + 1}. {item.label}
                </button>
              ))}
              {!formulaFields.length && <span className="text-xs text-[#667085]">Add input fields first.</span>}
            </div>
          </div>
          <Textarea
            className="min-h-24 font-mono text-xs"
            value={expression}
            placeholder="{Price} * {Quantity}"
            onChange={(event) => onChange({ formulaMode: "advanced", formulaExpression: event.target.value })}
          />
          <div className="grid gap-2 text-xs text-[#667085]">
            <p className="font-semibold text-[#111418]">Examples</p>
            <button type="button" className="rounded-lg bg-[#f8fafc] px-2.5 py-2 text-left font-mono hover:bg-[#eef2f7]" onClick={() => onChange({ formulaMode: "advanced", formulaExpression: `{${exampleA}} * {${exampleB}}` })}>
              {`{${exampleA}} * {${exampleB}}`} <span className="font-sans text-[#667085]">total cost</span>
            </button>
            <button type="button" className="rounded-lg bg-[#f8fafc] px-2.5 py-2 text-left font-mono hover:bg-[#eef2f7]" onClick={() => onChange({ formulaMode: "advanced", formulaExpression: `({${exampleA}} / {${exampleB}}) * 100` })}>
              {`({${exampleA}} / {${exampleB}}) * 100`} <span className="font-sans text-[#667085]">percentage</span>
            </button>
            <button type="button" className="rounded-lg bg-[#f8fafc] px-2.5 py-2 text-left font-mono hover:bg-[#eef2f7]" onClick={() => onChange({ formulaMode: "advanced", formulaExpression: `avg({${exampleA}}, {${exampleB}})` })}>
              {`avg({${exampleA}}, {${exampleB}})`} <span className="font-sans text-[#667085]">average</span>
            </button>
          </div>
        </div>
      </details>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="formula-format">Format</Label>
          <Select id="formula-format" className="mt-2" value={field.settings?.formulaFormat ?? "number"} onChange={(event) => onChange({ formulaFormat: event.target.value as NonNullable<FormField["settings"]>["formulaFormat"] })}>
            <option value="number">Number</option>
            <option value="currency">Currency</option>
            <option value="percent">Percent</option>
            <option value="text">Text with affixes</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="formula-precision">Precision</Label>
          <Input id="formula-precision" type="number" min={0} max={6} className="mt-2" value={field.settings?.formulaPrecision ?? 2} onChange={(event) => onChange({ formulaPrecision: Number(event.target.value) || 0 })} />
        </div>
        <div>
          <Label htmlFor="formula-prefix">Prefix</Label>
          <Input id="formula-prefix" className="mt-2" value={field.settings?.formulaPrefix ?? ""} placeholder="$" onChange={(event) => onChange({ formulaPrefix: event.target.value })} />
        </div>
        <div>
          <Label htmlFor="formula-suffix">Suffix</Label>
          <Input id="formula-suffix" className="mt-2" value={field.settings?.formulaSuffix ?? ""} placeholder="%" onChange={(event) => onChange({ formulaSuffix: event.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="formula-fallback">Fallback text</Label>
        <Input id="formula-fallback" className="mt-2" value={field.settings?.formulaFallback ?? ""} placeholder="Waiting for inputs" onChange={(event) => onChange({ formulaFallback: event.target.value })} />
      </div>
    </div>
  );
}

export function FormDetailsPanel({ onClose }: { onClose: () => void }) {
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const setTheme = useFormStore((state) => state.setTheme);

  return (
    <aside className="formcraft-scrollbar h-full overflow-y-auto border-l border-[#d8e0ea] bg-white/74 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111418] text-white">
            <Palette size={19} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1f2937]">Form details</p>
            <p className="text-xs text-[#667085]">Live canvas settings</p>
          </div>
        </div>
        <Button type="button" size="icon" variant="ghost" onClick={onClose} aria-label="Close form details">
          <X size={17} />
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="right-form-name">Form name</Label>
          <Input id="right-form-name" className="mt-2" value={form.name} onChange={(event) => setFormMeta({ name: event.target.value })} />
        </div>
        <div>
          <Label htmlFor="right-form-title">Public title</Label>
          <Input id="right-form-title" className="mt-2" value={form.title} onChange={(event) => setFormMeta({ title: event.target.value })} />
        </div>
        <div>
          <Label htmlFor="right-form-description">Description</Label>
          <Textarea id="right-form-description" className="mt-2 min-h-28" value={form.description} onChange={(event) => setFormMeta({ description: event.target.value })} />
        </div>
        <div className="rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
          <Label>Accent color</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {themeColors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use ${color}`}
                className="h-9 w-9 rounded-xl border-2 border-white shadow ring-offset-2 transition hover:scale-105"
                style={{ background: color, boxShadow: form.theme.accentColor === color ? `0 0 0 3px ${color}33` : undefined }}
                onClick={() => setTheme({ accentColor: color })}
              />
            ))}
            <Input type="color" value={form.theme.accentColor} onChange={(event) => setTheme({ accentColor: event.target.value })} className="h-9 w-14 p-1" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
          <Label>Corner style</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" size="sm" variant={form.theme.radius === "rounded" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "rounded" })}>
              <Palette size={15} />
              Rounded
            </Button>
            <Button type="button" size="sm" variant={form.theme.radius === "square" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "square" })}>
              <Square size={15} />
              Square
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-[#d8e0ea] bg-white/78 p-4 shadow-sm">
          <Label>Preview mode</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" size="sm" variant={form.theme.mode === "light" ? "primary" : "secondary"} onClick={() => setTheme({ mode: "light" })}>
              <Sun size={15} />
              Light
            </Button>
            <Button type="button" size="sm" variant={form.theme.mode === "dark" ? "primary" : "secondary"} onClick={() => setTheme({ mode: "dark" })}>
              <Moon size={15} />
              Dark
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
