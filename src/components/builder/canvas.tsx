"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { FormField } from "@/types/form";

export function BuilderCanvas() {
  const form = useFormStore((state) => state.form);

  return (
    <div className="formcraft-scrollbar h-full overflow-y-auto bg-[#f7f8fb] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 rounded-xl border border-[#dce1e8] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#68707d]">Canvas</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#15161a]">{form.title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#68707d]">{form.description}</p>
        </div>
        <SortableContext items={form.fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[480px] rounded-xl border border-dashed border-[#cbd5e1] bg-white p-3 shadow-sm">
            {form.fields.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#eef4ff] text-[#1749ba]">
                  <GripVertical size={24} />
                </div>
                <h2 className="text-lg font-semibold text-[#1f2937]">Start building your form</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#68707d]">
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
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group rounded-xl border bg-white p-4 shadow-sm transition",
        selected ? "border-[var(--accent)] ring-2 ring-blue-100" : "border-[#e1e6ee] hover:border-[#cbd5e1]",
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
            <span className="rounded-md bg-[#eef2f7] px-2 py-1 text-xs font-medium text-[#4b5563]">Step {field.step ?? 1}</span>
            <span className="rounded-md bg-[#f1f5f9] px-2 py-1 text-xs font-medium text-[#64748b]">{field.type}</span>
            <span className="text-xs text-[#9aa3af]">#{index + 1}</span>
          </div>
          {field.type === "divider" ? (
            <div className="my-3 h-px bg-[#dce1e8]" />
          ) : field.type === "section" ? (
            <div>
              <h3 className="text-base font-semibold text-[#15161a]">{field.label}</h3>
              {field.helperText && <p className="mt-1 text-sm text-[#68707d]">{field.helperText}</p>}
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-[#1f2937]">
                {field.label}
                {field.required && <span className="ml-1 text-[#dc2626]">*</span>}
              </p>
              {field.placeholder && <p className="mt-1 text-sm text-[#9aa3af]">{field.placeholder}</p>}
              {field.options?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {field.options.map((option) => (
                    <span key={option} className="rounded-md border border-[#dce1e8] px-2.5 py-1 text-xs text-[#4b5563]">
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
