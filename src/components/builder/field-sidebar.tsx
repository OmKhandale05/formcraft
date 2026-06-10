"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { fieldCatalog } from "@/lib/field-catalog";
import type { FieldType } from "@/types/form";

export function FieldSidebar() {
  return (
    <div className="h-full border-r border-[#d8e0ea] bg-white/74 p-4 backdrop-blur-xl">
      <div className="mb-4 rounded-xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#1f2937]">Field blocks</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">Drag components into the canvas.</p>
      </div>
      <div className="grid gap-2">
        {fieldCatalog.map((field) => (
          <DraggableField key={field.type} type={field.type} />
        ))}
      </div>
    </div>
  );
}

function DraggableField({ type }: { type: FieldType }) {
  const field = fieldCatalog.find((item) => item.type === type)!;
  const Icon = field.icon;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `catalog-${type}`,
    data: { source: "catalog", type }
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className="card-hover flex w-full items-center gap-3 rounded-xl border border-[#dce3ec] bg-white/88 p-3 text-left shadow-sm transition hover:border-[#bfcadc] disabled:opacity-60"
      disabled={isDragging}
      {...listeners}
      {...attributes}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f6fb] text-[#315279] shadow-sm ring-1 ring-[#e3e9f2]">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#1f2937]">{field.label}</span>
        <span className="block truncate text-xs text-[#667085]">{field.description}</span>
      </span>
      <GripVertical size={16} className="text-[#a1aab7]" />
    </button>
  );
}
