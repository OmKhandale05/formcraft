"use client";

import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors, type Modifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Link from "next/link";
import { CheckCircle2, Clock3, Download, Eye, FileUp, GripVertical, History, Save, Trash2 } from "lucide-react";
import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BuilderCanvas } from "@/components/builder/canvas";
import { FieldSettingsPanel, FormDetailsPanel } from "@/components/builder/settings-panel";
import { FieldSidebar } from "@/components/builder/field-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportHtml, exportReactComponent, exportTypescriptType, exportZodSchema } from "@/lib/exporters";
import { createField } from "@/lib/field-catalog";
import { downloadFile, formatTimestamp, slugify } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { FieldLayoutPreference, FieldType, FormSchema } from "@/types/form";

const exportOptions = [
  { label: "Form JSON", description: "Reusable FormCraft schema", extension: "json" },
  { label: "HTML", description: "Standalone embeddable form", extension: "html" },
  { label: "React Component", description: "Ready TSX component", extension: "tsx" },
  { label: "Zod Schema", description: "Validation schema", extension: "ts" },
  { label: "TypeScript Type", description: "Response type definition", extension: "ts" }
] as const;

type ExportExtension = (typeof exportOptions)[number]["extension"];
type ResizePane = "left" | "right";
type RightPanelMode = "field" | "form";
type SavedSnapshotDetails = {
  name: string;
  createdAt: string;
  fieldCount: number;
  ruleCount: number;
  versionCount: number;
};

const snapToGrid: Modifier = ({ transform }) => {
  const grid = 8;
  return {
    ...transform,
    x: Math.round(transform.x / grid) * grid,
    y: Math.round(transform.y / grid) * grid
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function BuilderPage() {
  const hasHydrated = useFormStore((state) => state.hasHydrated);
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const addField = useFormStore((state) => state.addField);
  const reorderFields = useFormStore((state) => state.reorderFields);
  const replaceForm = useFormStore((state) => state.replaceForm);
  const deleteForm = useFormStore((state) => state.deleteForm);
  const saveVersion = useFormStore((state) => state.saveVersion);
  const versions = useFormStore((state) => state.versions);
  const [savedSnapshot, setSavedSnapshot] = useState<SavedSnapshotDetails | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("field");
  const [leftWidth, setLeftWidth] = useState(330);
  const [rightWidth, setRightWidth] = useState(340);
  const inputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const builderGridStyle = {
    "--builder-columns": `${leftWidth}px 14px minmax(460px, 1fr) 14px ${rightWidth}px`
  } as CSSProperties;

  useEffect(() => {
    if (!exportOpen) return;

    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (exportRef.current?.contains(event.target as Node)) return;
      setExportOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExportOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [exportOpen]);

  useEffect(() => {
    if (!savedSnapshot) return;

    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (saveRef.current?.contains(event.target as Node)) return;
      setSavedSnapshot(null);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSavedSnapshot(null);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [savedSnapshot]);

  useEffect(() => {
    if (!deleteOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeleteOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [deleteOpen]);

  const startResize = (pane: ResizePane, event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = pane === "left" ? leftWidth : rightWidth;

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      if (pane === "left") {
        setLeftWidth(clamp(startWidth + delta, 280, 440));
        return;
      }

      setRightWidth(clamp(startWidth - delta, 280, 480));
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.source === "catalog") {
      const targetIndex = form.fields.findIndex((field) => field.id === over.id);
      addField(createField(active.data.current.type as FieldType, active.data.current.layoutPreference as FieldLayoutPreference), targetIndex >= 0 ? targetIndex : undefined);
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

    void extension;
  };

  const requestDeleteForm = () => {
    if (form.fields.length === 0) return;

    setExportOpen(false);
    setDeleteOpen(true);
  };

  const confirmDeleteForm = () => {
    deleteForm();
    setDeleteOpen(false);
  };

  const handleSaveCurrentVersion = () => {
    const createdAt = new Date().toISOString();
    const versionName = `${form.name || form.title} v${versions.length + 1}`;
    const ruleCount = form.logicRules?.filter((rule) => rule.enabled).length ?? 0;

    saveVersion(versionName, `Saved from the builder top bar with ${form.fields.length} fields and ${ruleCount} active logic rules.`);
    setExportOpen(false);
    setSavedSnapshot({
      name: versionName,
      createdAt,
      fieldCount: form.fields.length,
      ruleCount,
      versionCount: Math.min(versions.length + 1, 20)
    });
  };

  if (!hasHydrated) {
    return (
      <AppShell>
        <main className="flex h-screen items-center justify-center bg-[#eef2f6] p-6">
          <div className="w-full max-w-md rounded-3xl border border-[#d8e0ea] bg-white p-6 text-center shadow-[0_24px_70px_rgba(17,24,39,0.1)]">
            <div className="mx-auto mb-4 h-10 w-10 rounded-2xl border border-[#d8e0ea] bg-[#f6f8fb]" />
            <p className="text-sm font-bold text-[#111418]">Loading current form</p>
            <p className="mt-2 text-sm leading-6 text-[#667085]">Restoring your saved FormCraft workspace from this browser.</p>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <DndContext id="formcraft-builder-dnd" sensors={sensors} collisionDetection={closestCenter} modifiers={[snapToGrid]} onDragEnd={handleDragEnd}>
        <div className="flex h-screen max-h-screen flex-col overflow-hidden bg-[#eef2f6]">
          <header className="relative z-20 shrink-0 border-b border-[#d6dfeb] bg-white/88 px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[300px] flex-1 items-center gap-3">
                <div className="hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-[#d8e0ea] bg-[#f8fafc] px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7b8797] shadow-sm sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                  Builder
                </div>
                <Input
                  aria-label="Form name"
                  value={form.name}
                  onChange={(event) => setFormMeta({ name: event.target.value })}
                  className="h-10 max-w-[360px] border-[#d8e0ea] bg-[#f3f6fa] text-[15px] font-bold shadow-sm focus:bg-white"
                />
              </div>
              <div className="hidden h-10 shrink-0 items-center rounded-xl border border-[#d8e0ea] bg-[#f8fafc] px-3 text-xs font-semibold text-[#465366] shadow-sm xl:flex">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 size={14} className="text-[#0f766e]" />
                  {form.fields.length} fields
                </span>
                <span className="mx-2 h-4 w-px bg-[#d8e0ea]" />
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[#687386]">
                  <Clock3 size={14} className="text-[#64748b]" />
                  Updated {formatTimestamp(form.updatedAt)}
                </span>
              </div>
              <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
                  <FileUp size={16} />
                  Import
                </Button>
                <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
                <div ref={exportRef} className="relative">
                  <Button type="button" variant="secondary" onClick={() => setExportOpen((open) => !open)} aria-expanded={exportOpen} aria-haspopup="menu">
                    <Download size={16} />
                    Export
                  </Button>
                  {exportOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close export menu"
                        className="fixed inset-0 z-[9998] cursor-default bg-transparent"
                        onClick={() => setExportOpen(false)}
                      />
                      <div className="absolute left-0 top-[calc(100%+8px)] z-[9999] w-72 overflow-hidden rounded-2xl border border-[#d8e0ea] bg-white p-1.5 shadow-[0_24px_70px_rgba(17,24,39,0.24)]">
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
                    </>
                  )}
                </div>
              <div ref={saveRef} className="relative">
                <Button type="button" variant="secondary" onClick={handleSaveCurrentVersion} aria-expanded={Boolean(savedSnapshot)} aria-haspopup="dialog">
                  {savedSnapshot ? <CheckCircle2 size={16} /> : <Save size={16} />}
                  {savedSnapshot ? "Saved" : "Save"}
                </Button>
                {savedSnapshot && (
                  <div
                    role="dialog"
                    aria-label="Saved locally"
                    className="absolute left-0 top-[calc(100%+8px)] z-[9999] w-[320px] overflow-hidden rounded-2xl border border-[#d8e0ea] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.24)]"
                  >
                    <div className="border-b border-[#e5e9ef] bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_58%,#eef2ff_100%)] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#99f6e4] bg-white text-[#0f766e] shadow-[0_12px_24px_rgba(15,118,110,0.12)]">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">Saved locally</p>
                          <h2 className="mt-1 truncate text-base font-black text-[#111418]">{savedSnapshot.name}</h2>
                          <p className="mt-1 text-xs leading-5 text-[#667085]">{formatTimestamp(savedSnapshot.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-[#e5e9ef] bg-[#f8fafc] p-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8b95a7]">Fields</p>
                          <p className="mt-1 text-sm font-black text-[#111418]">{savedSnapshot.fieldCount}</p>
                        </div>
                        <div className="rounded-xl border border-[#e5e9ef] bg-[#f8fafc] p-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8b95a7]">Rules</p>
                          <p className="mt-1 text-sm font-black text-[#111418]">{savedSnapshot.ruleCount}</p>
                        </div>
                        <div className="rounded-xl border border-[#e5e9ef] bg-[#f8fafc] p-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8b95a7]">History</p>
                          <p className="mt-1 text-sm font-black text-[#111418]">{savedSnapshot.versionCount}/20</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl border border-[#dbe4f0] bg-[#fbfcfe] px-3 py-2.5 text-xs leading-5 text-[#5f6b7a]">
                        This restore point is available in Settings under Version history.
                      </div>
                      <Link
                        href="/settings?tab=history"
                        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#d8e0ea] bg-white px-3 text-sm font-bold text-[#111418] shadow-sm transition hover:bg-[#f6f8fb]"
                      >
                        <History size={15} />
                        View in history
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Button type="button" variant="danger" onClick={requestDeleteForm} disabled={form.fields.length === 0}>
                <Trash2 size={16} />
                Delete form
              </Button>
              <Link href="/preview" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111418] px-4 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(17,20,24,0.18)] transition hover:bg-[#20242b]">
                <Eye size={16} />
                Preview
              </Link>
              </div>
            </div>
          </header>
          <div
            className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f6_100%)] lg:[grid-template-columns:var(--builder-columns)]"
            style={builderGridStyle}
          >
            <div className="hidden min-h-0 overflow-hidden lg:block">
              <FieldSidebar />
            </div>
            <ResizeHandle label="Resize left sidebar" onPointerDown={(event) => startResize("left", event)} />
            <BuilderCanvas onEditForm={() => setRightPanelMode("form")} />
            <ResizeHandle label="Resize field settings panel" onPointerDown={(event) => startResize("right", event)} />
            <div className="hidden min-h-0 overflow-hidden lg:block">
              {rightPanelMode === "form" ? <FormDetailsPanel onClose={() => setRightPanelMode("field")} /> : <FieldSettingsPanel />}
            </div>
          </div>
          {deleteOpen && (
            <div
              aria-modal="true"
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#111418]/45 p-4 backdrop-blur-sm"
              onMouseDown={() => setDeleteOpen(false)}
              role="dialog"
            >
              <div
                className="w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#d8e0ea] bg-white shadow-[0_34px_100px_rgba(17,24,39,0.34)]"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="border-b border-[#f0d7dc] bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_58%,#fff1f2_100%)] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#fecdd3] bg-white text-[#be123c] shadow-[0_12px_24px_rgba(190,18,60,0.12)]">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#be123c]">Delete form</p>
                      <h2 className="mt-2 text-2xl font-black leading-tight text-[#111418]">Clear this canvas?</h2>
                      <p className="mt-2 text-sm leading-6 text-[#5f6b7a]">
                        This removes {form.fields.length} fields from <span className="font-semibold text-[#111418]">{form.name}</span> and clears its locally stored submissions.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="rounded-2xl border border-[#fee2e2] bg-[#fff7f8] px-4 py-3 text-sm leading-6 text-[#7f1d1d]">
                    This action cannot be undone. Export the form JSON first if you want a backup.
                  </div>
                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={confirmDeleteForm}>
                      <Trash2 size={16} />
                      Delete permanently
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DndContext>
    </AppShell>
  );
}

function ResizeHandle({ label, onPointerDown }: { label: string; onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="group relative hidden min-h-0 cursor-col-resize items-center justify-center bg-transparent outline-none lg:flex"
      onPointerDown={onPointerDown}
    >
      <span className="absolute inset-y-4 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-[#d7e0ec] transition group-hover:bg-[#aebcce] group-focus-visible:bg-[#3157d5]/55" />
      <span className="relative z-10 flex h-16 w-7 items-center justify-center rounded-full border border-[#cfd9e7] bg-white/95 text-[#667085] shadow-[0_12px_30px_rgba(17,24,39,0.12)] transition group-hover:border-[#aebcce] group-hover:text-[#3157d5] group-hover:shadow-[0_16px_34px_rgba(49,87,213,0.18)] group-focus-visible:ring-4 group-focus-visible:ring-[#3157d5]/15">
        <GripVertical size={17} />
      </span>
    </button>
  );
}
