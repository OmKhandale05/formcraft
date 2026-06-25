"use client";

import { Copy, History, RotateCcw, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { VERSION_LIMIT, useFormStore } from "@/store/form-store";

function formatVersionDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function versionSummary(fieldCount: number, ruleCount: number) {
  return `${fieldCount} fields · ${ruleCount} rules`;
}

export function VersionHistoryPanel() {
  const form = useFormStore((state) => state.form);
  const versions = useFormStore((state) => state.versions);
  const saveVersion = useFormStore((state) => state.saveVersion);
  const restoreVersion = useFormStore((state) => state.restoreVersion);
  const duplicateVersion = useFormStore((state) => state.duplicateVersion);
  const deleteVersion = useFormStore((state) => state.deleteVersion);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState(false);
  const suggestedName = useMemo(() => `${form.name || form.title} v${versions.length + 1}`, [form.name, form.title, versions.length]);

  const handleSave = () => {
    const saved = saveVersion(name || suggestedName, note);
    if (!saved) {
      setLimitNotice(true);
      return;
    }

    setName("");
    setNote("");
    setLimitNotice(false);
  };

  return (
    <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#111418]">
            <History size={16} />
            Version history
          </p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">Save restore points before major edits, theme changes or logic updates.</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#eef2f7] px-2.5 py-1 text-xs font-bold text-[#667085]">
          {versions.length}/{VERSION_LIMIT}
        </span>
      </div>

      <div className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-3">
        <div>
          <Label htmlFor="version-name">Snapshot name</Label>
          <Input id="version-name" className="mt-2" placeholder={suggestedName} value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="mt-3">
          <Label htmlFor="version-note">Note</Label>
          <Textarea id="version-note" className="mt-2 min-h-20" placeholder="What changed in this version?" value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <Button type="button" variant="primary" className="mt-3 w-full" onClick={handleSave}>
          <Save size={15} />
          Save current version
        </Button>
        {limitNotice && (
          <div className="mt-3 rounded-2xl border border-[#fed7aa] bg-[#fff7ed] px-3 py-2.5 text-xs leading-5 text-[#9a3412]">
            Version history is full at {VERSION_LIMIT}/{VERSION_LIMIT}. Delete an older restore point before saving another one.
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {!versions.length && (
          <div className="rounded-2xl border border-dashed border-[#bfcadc] bg-[#f8fafc] p-4 text-sm leading-6 text-[#667085]">
            No saved versions yet. Save one before you make a big change.
          </div>
        )}

        {versions.map((version) => (
          <article key={version.id} className="rounded-2xl border border-[#d8e0ea] bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111418]">{version.name}</p>
                <p className="mt-1 text-xs text-[#667085]">
                  {formatVersionDate(version.createdAt)} · {versionSummary(version.form.fields.length, version.form.logicRules?.length ?? 0)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" size="icon" variant="ghost" aria-label="Duplicate version" onClick={() => duplicateVersion(version.id)}>
                  <Copy size={14} />
                </Button>
                <Button type="button" size="icon" variant="danger" aria-label="Delete version" onClick={() => deleteVersion(version.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            {version.note && <p className="mt-2 rounded-xl bg-[#f8fafc] px-3 py-2 text-xs leading-5 text-[#667085]">{version.note}</p>}
            {restoreId === version.id ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setRestoreId(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    restoreVersion(version.id);
                    setRestoreId(null);
                  }}
                >
                  Restore
                </Button>
              </div>
            ) : (
              <Button type="button" size="sm" variant="secondary" className="mt-3 w-full justify-center" onClick={() => setRestoreId(version.id)}>
                <RotateCcw size={14} />
                Restore this version
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
