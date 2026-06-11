"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MouseEvent } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Columns2, Copy, GripVertical, Grid3X3, Layers3, Moon, MousePointer2, Palette, Pencil, Rows3, Square, Sun, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { fullWidthOnlyFieldTypes } from "@/lib/field-catalog";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { FormField } from "@/types/form";

const themeColors = ["#2563eb", "#0f766e", "#d97706", "#db2777", "#7c3aed", "#111827"];

export function BuilderCanvas() {
  const form = useFormStore((state) => state.form);
  const clearSelection = useFormStore((state) => state.clearSelection);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { isOver, setNodeRef } = useDroppable({
    id: "builder-canvas",
    data: { type: "canvas" }
  });

  return (
    <div className="formcraft-scrollbar h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="soft-panel mb-5 rounded-2xl p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">Canvas</p>
            <div className="flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-white px-3 py-1 text-xs font-medium text-[#465366]">
              <span className="h-2 w-2 rounded-full bg-[#0f766e]" />
              {form.fields.length} fields
            </div>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-[#111418]">{form.title}</h1>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{form.description}</p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8e0ea] bg-white/90 px-3 text-sm font-semibold text-[#20242b] shadow-sm transition hover:border-[#c5d0dc] hover:bg-white"
              onClick={() => setDetailsOpen(true)}
            >
              <Pencil size={15} />
              Edit
            </button>
          </div>
        </div>
        <SortableContext items={form.fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            data-testid="builder-canvas-dropzone"
            className={cn(
              "relative min-h-[480px] overflow-hidden rounded-2xl border border-dashed border-[#bfcadc] bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_60px_rgba(17,24,39,0.08)] backdrop-blur transition",
              isOver && "border-[#3157d5] bg-[#f8faff] ring-4 ring-[#3157d5]/10"
            )}
            onClick={(event) => {
              if (event.currentTarget === event.target) clearSelection();
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,116,139,0.18)_1px,transparent_0)] [background-size:18px_18px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent" />
            <div className="relative z-10 mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e0ea] bg-white/92 px-3 py-1 text-xs font-semibold text-[#465366] shadow-sm">
                <Grid3X3 size={13} />
                8px snap grid
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e0ea] bg-white/92 px-3 py-1 text-xs font-semibold text-[#465366] shadow-sm">
                <MousePointer2 size={13} />
                Shift+click multi-select
              </span>
            </div>
            <BulkSelectionToolbar />
            {form.fields.length === 0 ? (
              <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111418] text-white shadow-xl">
                  <GripVertical size={24} />
                </div>
                <h2 className="text-lg font-semibold text-[#1f2937]">Start building your form</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#667085]">
                  Drag fields from the sidebar to compose a schema-driven form with validation and preview support.
                </p>
              </div>
            ) : (
              <div className="relative z-10 grid gap-3 sm:grid-cols-2">
                {form.fields.map((field, index) => (
                  <CanvasField key={field.id} field={field} index={index} />
                ))}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
      {detailsOpen && <FormDetailsDialog onClose={() => setDetailsOpen(false)} />}
    </div>
  );
}

function FormDetailsDialog({ onClose }: { onClose: () => void }) {
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const setTheme = useFormStore((state) => state.setTheme);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111418]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="form-details-title">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close form details" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-[#d8e0ea] bg-white shadow-[0_30px_90px_rgba(17,24,39,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e3e8ef] p-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#465366]">
              <Palette size={14} />
              Form details
            </div>
            <h2 id="form-details-title" className="text-xl font-semibold text-[#111418]">Edit form identity</h2>
            <p className="mt-1 text-sm leading-6 text-[#667085]">Update the title, description, and visual style without leaving the canvas.</p>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose} aria-label="Close form details">
            <X size={18} />
          </Button>
        </div>
        <div className="formcraft-scrollbar max-h-[calc(92vh-116px)] overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="canvas-form-name">Form name</Label>
              <Input id="canvas-form-name" className="mt-2" value={form.name} onChange={(event) => setFormMeta({ name: event.target.value })} />
            </div>
            <div>
              <Label htmlFor="canvas-form-title">Public title</Label>
              <Input id="canvas-form-title" className="mt-2" value={form.title} onChange={(event) => setFormMeta({ title: event.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="canvas-form-description">Description</Label>
              <Textarea id="canvas-form-description" className="mt-2 min-h-28" value={form.description} onChange={(event) => setFormMeta({ description: event.target.value })} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#d8e0ea] bg-[#f8fafc] p-4">
            <Label>Accent color</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {themeColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color}`}
                  className="h-10 w-10 rounded-xl border-2 border-white shadow ring-offset-2 transition hover:scale-105"
                  style={{ background: color, boxShadow: form.theme.accentColor === color ? `0 0 0 3px ${color}33` : undefined }}
                  onClick={() => setTheme({ accentColor: color })}
                />
              ))}
              <Input type="color" value={form.theme.accentColor} onChange={(event) => setTheme({ accentColor: event.target.value })} className="h-10 w-16 p-1" />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
              <Label>Corner style</Label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" variant={form.theme.radius === "rounded" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "rounded" })}>
                  <Palette size={16} />
                  Rounded
                </Button>
                <Button type="button" variant={form.theme.radius === "square" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "square" })}>
                  <Square size={16} />
                  Square
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
              <Label>Preview mode</Label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" variant={form.theme.mode === "light" ? "primary" : "secondary"} onClick={() => setTheme({ mode: "light" })}>
                  <Sun size={16} />
                  Light
                </Button>
                <Button type="button" variant={form.theme.mode === "dark" ? "primary" : "secondary"} onClick={() => setTheme({ mode: "dark" })}>
                  <Moon size={16} />
                  Dark
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-[#e3e8ef] pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
            <Button type="button" onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CanvasField({ field, index }: { field: FormField; index: number }) {
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const selectedFieldIds = useFormStore((state) => state.selectedFieldIds);
  const setSelectedField = useFormStore((state) => state.setSelectedField);
  const toggleFieldSelection = useFormStore((state) => state.toggleFieldSelection);
  const duplicateField = useFormStore((state) => state.duplicateField);
  const deleteField = useFormStore((state) => state.deleteField);
  const selected = selectedFieldId === field.id || selectedFieldIds.includes(field.id);
  const layout = field.layout ?? "full";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const handleSelect = (event: MouseEvent<HTMLDivElement>) => {
    if (event.shiftKey) {
      toggleFieldSelection(field.id);
      return;
    }

    setSelectedField(field.id);
  };

  return (
    <div
      ref={setNodeRef}
      data-testid="builder-canvas-field"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group card-hover relative cursor-grab rounded-xl border bg-white p-4 shadow-sm active:cursor-grabbing",
        layout === "half" ? "sm:col-span-1" : "sm:col-span-2",
        selected ? "border-[#3157d5] ring-4 ring-[#3157d5]/10" : "border-[#dce3ec] hover:border-[#bfcadc]",
        isDragging && "opacity-50"
      )}
      onClick={handleSelect}
      {...listeners}
      {...attributes}
    >
      <span
        className={cn(
          "absolute -left-1 top-4 h-10 w-1.5 rounded-full transition",
          selected ? "bg-[#3157d5]" : "bg-transparent group-hover:bg-[#c7d2fe]"
        )}
      />
      <div className="flex items-start gap-3">
        <div className="mt-1 text-[#a1aab7] transition group-hover:text-[#667085]" aria-hidden="true">
          <GripVertical size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#e9f7f5] px-2 py-1 text-xs font-semibold text-[#0f766e]">Step {field.step ?? 1}</span>
            <span className="rounded-md bg-[#f1f4f8] px-2 py-1 text-xs font-semibold text-[#64748b]">{field.type}</span>
            <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#3157d5]">{layout === "half" ? "1/2 row" : "full row"}</span>
            <span className="text-xs text-[#9aa3af]">#{index + 1}</span>
          </div>
          {field.type === "divider" ? (
            <div className="my-3 h-px bg-[#d8e0ea]" />
          ) : field.type === "section" ? (
            <div>
              <h3 className="text-base font-semibold text-[#15161a]">{field.label}</h3>
              {field.helperText && <p className="mt-1 text-sm text-[#667085]">{field.helperText}</p>}
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-[#1f2937]">
                {field.label}
                {field.required && <span className="ml-1 text-[#dc2626]">*</span>}
              </p>
              {field.placeholder && <p className="mt-1 text-sm text-[#98a2b3]">{field.placeholder}</p>}
              {field.options?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {field.options.map((option) => (
                    <span key={option} className="rounded-md border border-[#d8e0ea] bg-[#fbfcfe] px-2.5 py-1 text-xs font-medium text-[#465366]">
                      {option}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
        <div className={cn("flex opacity-0 transition group-hover:opacity-100", selected && "opacity-100")} onPointerDown={(event) => event.stopPropagation()}>
          <Button type="button" size="icon" variant="ghost" onClick={(event) => { event.stopPropagation(); duplicateField(field.id); }} aria-label="Duplicate field">
            <Copy size={16} />
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={(event) => { event.stopPropagation(); deleteField(field.id); }} aria-label="Delete field">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function BulkSelectionToolbar() {
  const form = useFormStore((state) => state.form);
  const selectedFieldIds = useFormStore((state) => state.selectedFieldIds);
  const duplicateSelectedFields = useFormStore((state) => state.duplicateSelectedFields);
  const deleteSelectedFields = useFormStore((state) => state.deleteSelectedFields);
  const updateSelectedFields = useFormStore((state) => state.updateSelectedFields);
  const updateField = useFormStore((state) => state.updateField);
  const selectedFields = form.fields.filter((field) => selectedFieldIds.includes(field.id));

  if (selectedFields.length < 2) return null;

  const allRequired = selectedFields.every((field) => field.required);
  const selectedFieldsWithHalfLayout = selectedFields.filter((field) => !fullWidthOnlyFieldTypes.includes(field.type));
  const updateHalfLayout = () => {
    selectedFieldsWithHalfLayout.forEach((field) => updateField(field.id, { layout: "half" }));
  };

  return (
    <div className="relative z-20 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[#c8d4e4] bg-white/95 p-2 shadow-[0_18px_45px_rgba(17,24,39,0.14)] backdrop-blur">
      <div className="flex items-center gap-2 px-2 text-sm font-semibold text-[#111418]">
        <Layers3 size={16} />
        {selectedFields.length} selected
      </div>
      <div className="h-6 w-px bg-[#d8e0ea]" />
      <Button type="button" size="sm" variant="secondary" onClick={duplicateSelectedFields}>
        <Copy size={15} />
        Duplicate
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={() => updateSelectedFields({ required: !allRequired })}>
        {allRequired ? "Make optional" : "Mark required"}
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={() => updateSelectedFields({ layout: "full" })}>
        <Rows3 size={15} />
        Full row
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={updateHalfLayout} disabled={selectedFieldsWithHalfLayout.length === 0}>
        <Columns2 size={15} />
        Two columns
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={() => updateSelectedFields({ step: 1 })}>
        Step 1
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={() => updateSelectedFields({ step: 2 })}>
        Step 2
      </Button>
      <Button type="button" size="sm" variant="danger" onClick={deleteSelectedFields}>
        <Trash2 size={15} />
        Delete
      </Button>
    </div>
  );
}
