"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Copy, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { FormField } from "@/types/form";

export function BuilderCanvas() {
  const form = useFormStore((state) => state.form);
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
            <Link
              href="/settings"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8e0ea] bg-white/90 px-3 text-sm font-semibold text-[#20242b] shadow-sm transition hover:border-[#c5d0dc] hover:bg-white"
            >
              <Pencil size={15} />
              Edit
            </Link>
          </div>
        </div>
        <SortableContext items={form.fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            data-testid="builder-canvas-dropzone"
            className={cn(
              "min-h-[480px] rounded-2xl border border-dashed border-[#bfcadc] bg-white/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_60px_rgba(17,24,39,0.08)] backdrop-blur transition",
              isOver && "border-[#3157d5] bg-[#f8faff] ring-4 ring-[#3157d5]/10"
            )}
          >
            {form.fields.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111418] text-white shadow-xl">
                  <GripVertical size={24} />
                </div>
                <h2 className="text-lg font-semibold text-[#1f2937]">Start building your form</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#667085]">
                  Drag fields from the sidebar to compose a schema-driven form with validation and preview support.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.fields.map((field, index) => (
                  <CanvasField key={field.id} field={field} index={index} />
                ))}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function CanvasField({ field, index }: { field: FormField; index: number }) {
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const setSelectedField = useFormStore((state) => state.setSelectedField);
  const duplicateField = useFormStore((state) => state.duplicateField);
  const deleteField = useFormStore((state) => state.deleteField);
  const selected = selectedFieldId === field.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  return (
    <div
      ref={setNodeRef}
      data-testid="builder-canvas-field"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group card-hover rounded-xl border bg-white p-4 shadow-sm",
        selected ? "border-[#3157d5] ring-4 ring-[#3157d5]/10" : "border-[#dce3ec] hover:border-[#bfcadc]",
        isDragging && "opacity-50"
      )}
      onClick={() => setSelectedField(field.id)}
    >
      <div className="flex items-start gap-3">
        <button className="mt-1 text-[#a1aab7]" type="button" {...listeners} {...attributes} aria-label="Reorder field">
          <GripVertical size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#e9f7f5] px-2 py-1 text-xs font-semibold text-[#0f766e]">Step {field.step ?? 1}</span>
            <span className="rounded-md bg-[#f1f4f8] px-2 py-1 text-xs font-semibold text-[#64748b]">{field.type}</span>
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
        <div className="flex opacity-0 transition group-hover:opacity-100">
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
