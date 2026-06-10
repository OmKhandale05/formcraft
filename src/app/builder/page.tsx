"use client";

import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Link from "next/link";
import { Download, Eye, FileUp, Save } from "lucide-react";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BuilderCanvas } from "@/components/builder/canvas";
import { FieldSettingsPanel } from "@/components/builder/settings-panel";
import { FieldSidebar } from "@/components/builder/field-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportHtml, exportPdf, exportReactComponent, exportTypescriptType, exportZodSchema } from "@/lib/exporters";
import { createField } from "@/lib/field-catalog";
import { downloadFile, formatTimestamp, slugify } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { FieldType, FormSchema } from "@/types/form";

const exportOptions = [
  { label: "Form JSON", description: "Reusable FormCraft schema", extension: "json" },
  { label: "HTML", description: "Standalone embeddable form", extension: "html" },
  { label: "React Component", description: "Ready TSX component", extension: "tsx" },
  { label: "Zod Schema", description: "Validation schema", extension: "ts" },
  { label: "TypeScript Type", description: "Response type definition", extension: "ts" },
  { label: "PDF", description: "Printable form summary", extension: "pdf" }
] as const;

type ExportExtension = (typeof exportOptions)[number]["extension"];

export default function BuilderPage() {
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const addField = useFormStore((state) => state.addField);
  const reorderFields = useFormStore((state) => state.reorderFields);
  const replaceForm = useFormStore((state) => state.replaceForm);
  const [saved, setSaved] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.source === "catalog") {
      const targetIndex = form.fields.findIndex((field) => field.id === over.id);
      addField(createField(active.data.current.type as FieldType), targetIndex >= 0 ? targetIndex : undefined);
      return;
    }

    if (over.id === "builder-canvas") return;

    if (active.id !== over.id) {
      const oldIndex = form.fields.findIndex((field) => field.id === active.id);
      const newIndex = form.fields.findIndex((field) => field.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const moved = arrayMove(form.fields, oldIndex, newIndex);
        reorderFields(oldIndex, moved.findIndex((field) => field.id === active.id));
      }
    }
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    replaceForm(JSON.parse(text) as FormSchema);
  };

  const handleExport = (extension: ExportExtension, label: string) => {
    const filename = slugify(form.name || form.title);
    setExportOpen(false);

    if (label === "Form JSON") {
      downloadFile(`${filename}.json`, JSON.stringify(form, null, 2));
      return;
    }

    if (label === "HTML") {
      downloadFile(`${filename}.html`, exportHtml(form), "text/html");
      return;
    }

    if (label === "React Component") {
      downloadFile(`${filename}.tsx`, exportReactComponent(form), "text/tsx");
      return;
    }

    if (label === "Zod Schema") {
      downloadFile(`${filename}.schema.ts`, exportZodSchema(form), "text/typescript");
      return;
    }

    if (label === "TypeScript Type") {
      downloadFile(`${filename}.types.ts`, exportTypescriptType(form), "text/typescript");
      return;
    }

    if (extension === "pdf") {
      downloadFile(`${filename}.pdf`, exportPdf(form), "application/pdf");
    }
  };

  return (
    <AppShell>
      <DndContext id="formcraft-builder-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex h-screen flex-col">
          <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-[#d8e0ea] bg-white/82 px-4 backdrop-blur-xl sm:px-5">
            <Input
              aria-label="Form name"
              value={form.name}
              onChange={(event) => setFormMeta({ name: event.target.value })}
              className="h-9 max-w-[260px] border-transparent bg-[#eef2f7] font-semibold shadow-none"
            />
            <p className="hidden text-xs text-[#68707d] sm:block">Saved locally · {formatTimestamp(form.updatedAt)}</p>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
                <FileUp size={16} />
                Import
              </Button>
              <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
              <div className="relative">
                <Button type="button" variant="secondary" onClick={() => setExportOpen((open) => !open)} aria-expanded={exportOpen} aria-haspopup="menu">
                  <Download size={16} />
                  Export
                </Button>
                {exportOpen && (
                  <div className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-2xl border border-[#d8e0ea] bg-white p-1.5 shadow-2xl">
                    {exportOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f4f6f8]"
                        onClick={() => handleExport(option.extension, option.label)}
                      >
                        <span className="mt-0.5 rounded-md bg-[#111418] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          {option.extension}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#111418]">{option.label}</span>
                          <span className="mt-0.5 block text-xs text-[#667085]">{option.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="button" variant="secondary" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600); }}>
                <Save size={16} />
                {saved ? "Saved" : "Save"}
              </Button>
              <Link href="/preview" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white">
                <Eye size={16} />
                Preview
              </Link>
            </div>
          </header>
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
            <div className="hidden min-h-0 lg:block">
              <FieldSidebar />
            </div>
            <BuilderCanvas />
            <div className="hidden min-h-0 xl:block">
              <FieldSettingsPanel />
            </div>
          </div>
        </div>
      </DndContext>
    </AppShell>
  );
}
