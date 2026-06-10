"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { fieldCatalog } from "@/lib/field-catalog";
import type { FieldType } from "@/types/form";

export function FieldSidebar() {
  return (
    <div className="h-full border-r border-[#dce1e8] bg-white p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#1f2937]">Field blocks</p>
        <p className="mt-1 text-xs leading-5 text-[#68707d]">Drag components into the canvas.</p>
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
      className="flex w-full items-center gap-3 rounded-lg border border-[#e1e6ee] bg-[#fbfcfe] p-3 text-left shadow-sm transition hover:border-[#cbd5e1] hover:bg-white disabled:opacity-60"
      disabled={isDragging}
      {...listeners}
      {...attributes}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#315279] shadow-sm">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#1f2937]">{field.label}</span>
        <span className="block truncate text-xs text-[#68707d]">{field.description}</span>
      </span>
      <GripVertical size={16} className="text-[#a1aab7]" />
    </button>
  );
}
