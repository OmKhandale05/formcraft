"use client";

import { useDraggable } from "@dnd-kit/core";
import { Columns2, GripVertical, Moon, Palette, Rows3, Square, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { fieldCatalog } from "@/lib/field-catalog";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
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

const themeColors = ["#2563eb", "#0f766e", "#d97706", "#db2777", "#7c3aed", "#111827"];

export function FieldSidebar() {
  const [layoutPreference, setLayoutPreference] = useState<FieldLayoutPreference>("auto");

  return (
    <div className="formcraft-scrollbar h-full overflow-y-auto border-r border-[#d8e0ea] bg-white/74 p-4 backdrop-blur-xl">
      <FormDetailsPanel />
      <div className="mb-4 rounded-xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#1f2937]">Field blocks</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">Drag components into the canvas.</p>
      </div>
      <div className="mb-4 rounded-2xl border border-[#d8e0ea] bg-[#f8fafc] p-2 shadow-sm">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">Add layout</p>
        <div className="grid grid-cols-3 gap-1.5">
          {layoutOptions.map((option) => {
            const Icon = option.icon;
            const active = layoutPreference === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "rounded-xl border px-2 py-2 text-left transition",
                  active ? "border-[#3157d5] bg-white text-[#3157d5] shadow-sm" : "border-transparent text-[#465366] hover:bg-white"
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
      <div className="grid gap-2">
        {fieldCatalog.map((field) => (
          <DraggableField key={field.type} type={field.type} layoutPreference={layoutPreference} />
        ))}
      </div>
    </div>
  );
}

function FormDetailsPanel() {
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const setTheme = useFormStore((state) => state.setTheme);

  return (
    <section id="form-details-sidebar" className="mb-4 rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111418] text-white">
          <Palette size={17} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1f2937]">Form details</p>
          <p className="text-xs text-[#667085]">Live canvas settings</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="sidebar-form-name">Form name</Label>
          <Input id="sidebar-form-name" className="mt-2" value={form.name} onChange={(event) => setFormMeta({ name: event.target.value })} />
        </div>
        <div>
          <Label htmlFor="sidebar-form-title">Public title</Label>
          <Input id="sidebar-form-title" className="mt-2" value={form.title} onChange={(event) => setFormMeta({ title: event.target.value })} />
        </div>
        <div>
          <Label htmlFor="sidebar-form-description">Description</Label>
          <Textarea
            id="sidebar-form-description"
            className="mt-2 min-h-24"
            value={form.description}
            onChange={(event) => setFormMeta({ description: event.target.value })}
          />
        </div>
        <div>
          <Label>Accent color</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {themeColors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use ${color}`}
                className="h-8 w-8 rounded-lg border-2 border-white shadow ring-offset-2 transition hover:scale-105"
                style={{ background: color, boxShadow: form.theme.accentColor === color ? `0 0 0 3px ${color}33` : undefined }}
                onClick={() => setTheme({ accentColor: color })}
              />
            ))}
            <Input type="color" value={form.theme.accentColor} onChange={(event) => setTheme({ accentColor: event.target.value })} className="h-8 w-12 rounded-lg p-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" size="sm" variant={form.theme.radius === "rounded" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "rounded" })}>
            <Palette size={15} />
            Rounded
          </Button>
          <Button type="button" size="sm" variant={form.theme.radius === "square" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "square" })}>
            <Square size={15} />
            Square
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
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
    </section>
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
