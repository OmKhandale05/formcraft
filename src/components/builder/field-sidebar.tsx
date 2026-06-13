"use client";

import { useDraggable } from "@dnd-kit/core";
import { Blocks, Columns2, GripVertical, Rows3, Sparkles } from "lucide-react";
import { useState } from "react";
import { fieldCatalog } from "@/lib/field-catalog";
import { cn } from "@/lib/utils";
import type { FieldLayoutPreference, FieldType } from "@/types/form";

const layoutOptions: Array<{
  value: FieldLayoutPreference;
  label: string;
  description: string;
  icon: typeof Rows3;
}> = [
  { value: "auto", label: "Auto", description: "Smart default", icon: Rows3 },
  { value: "full", label: "Full", description: "1 per row", icon: Rows3 },
  { value: "half", label: "Half", description: "2 per row", icon: Columns2 }
];

export function FieldSidebar() {
  const [layoutPreference, setLayoutPreference] = useState<FieldLayoutPreference>("auto");

  return (
    <div className="formcraft-scrollbar h-full overflow-y-auto border-r border-[#d8e0ea] bg-[#f7f9fc]/90 p-4 backdrop-blur-xl">
      <div className="mb-4 rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111418] text-white shadow-[0_12px_24px_rgba(17,20,24,0.18)]">
              <Blocks size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#111418]">Field blocks</p>
            <p className="mt-1 text-xs leading-5 text-[#667085]">Choose a layout, then drag blocks into the canvas.</p>
          </div>
        </div>
      </div>
      <div className="mb-4 rounded-2xl border border-[#d8e0ea] bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef3ff] text-[#3157d5]">
            <Sparkles size={14} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">Drop layout</p>
            <p className="text-[11px] font-medium text-[#98a2b3]">Applies to newly added fields</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#f3f6fa] p-1">
          {layoutOptions.map((option) => {
            const Icon = option.icon;
            const active = layoutPreference === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "rounded-xl border px-2.5 py-2.5 text-left transition",
                  active
                    ? "border-white bg-white text-[#3157d5] shadow-sm"
                    : "border-transparent text-[#465366] hover:bg-white/72"
                )}
                onClick={() => setLayoutPreference(option.value)}
              >
                <Icon size={15} />
                <span className="mt-1 block text-xs font-bold">{option.label}</span>
                <span className="block text-[10px] font-medium text-[#667085]">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">Components</p>
        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-[#667085] shadow-sm ring-1 ring-[#d8e0ea]">{fieldCatalog.length}</span>
      </div>
      <div className="grid gap-2">
        {fieldCatalog.map((field) => (
          <DraggableField key={field.type} type={field.type} layoutPreference={layoutPreference} />
        ))}
      </div>
    </div>
  );
}

function DraggableField({ type, layoutPreference }: { type: FieldType; layoutPreference: FieldLayoutPreference }) {
  const field = fieldCatalog.find((item) => item.type === type)!;
  const Icon = field.icon;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `catalog-${type}`,
    data: { source: "catalog", type, layoutPreference }
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className="group flex w-full items-center gap-3 rounded-xl border border-[#dce3ec] bg-[#fbfcfe] p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#b7c4d6] hover:bg-white hover:shadow-[0_14px_28px_rgba(17,24,39,0.09)] disabled:opacity-60"
      disabled={isDragging}
      {...listeners}
      {...attributes}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f6fb] text-[#315279] ring-1 ring-[#e3e9f2] transition group-hover:bg-[#eef3ff] group-hover:text-[#3157d5]">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#1f2937]">{field.label}</span>
        <span className="block truncate text-xs text-[#667085]">{field.description}</span>
      </span>
      <span className="flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-[#a1aab7] transition group-hover:bg-[#f3f6fb] group-hover:text-[#667085]">
        <GripVertical size={16} />
      </span>
    </button>
  );
}
