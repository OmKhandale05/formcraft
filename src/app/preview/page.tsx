"use client";

import { Check, Code2, Copy, Monitor, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { FormRenderer } from "@/components/form-renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";

export default function PreviewPage() {
  const form = useFormStore((state) => state.form);
  const addSubmission = useFormStore((state) => state.addSubmission);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const schemaJson = useMemo(() => JSON.stringify(form, null, 2), [form]);

  const copySchema = async () => {
    await navigator.clipboard.writeText(schemaJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell>
      <main className="min-h-screen p-4 sm:p-6">
        <div className="soft-panel mb-5 flex flex-wrap items-center gap-3 rounded-2xl p-5">
          <div>
            <h1 className="text-xl font-semibold text-[#111418]">Preview</h1>
            <p className="mt-1 text-sm text-[#667085]">Render the current JSON schema as an accessible, validated form.</p>
          </div>
          <div className="ml-auto flex rounded-xl border border-[#d8e0ea] bg-white p-1 shadow-sm">
            <Button type="button" variant={device === "desktop" ? "primary" : "ghost"} size="sm" onClick={() => setDevice("desktop")}>
              <Monitor size={16} />
              Desktop
            </Button>
            <Button type="button" variant={device === "mobile" ? "primary" : "ghost"} size="sm" onClick={() => setDevice("mobile")}>
              <Smartphone size={16} />
              Mobile
            </Button>
          </div>
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-3xl border border-[#d8e0ea] bg-white/54 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_60px_rgba(17,24,39,0.08)] backdrop-blur sm:p-8">
            <div className={cn("mx-auto transition-all", device === "mobile" ? "max-w-[390px]" : "max-w-3xl")}>
              <FormRenderer form={form} onSubmit={addSubmission} />
            </div>
          </div>
          <aside className="min-h-0 rounded-3xl border border-[#d8e0ea] bg-[#111418] p-4 text-white shadow-[0_24px_70px_rgba(17,24,39,0.18)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-[#dce6f5]">
                  <Code2 size={14} />
                  JSON schema
                </div>
                <h2 className="mt-3 text-lg font-semibold">Copyable form code</h2>
                <p className="mt-1 text-sm leading-6 text-[#aab4c3]">
                  {form.fields.length} fields · {new Set(form.fields.map((field) => field.step ?? 1)).size} steps
                </p>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={copySchema}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="formcraft-scrollbar max-h-[720px] overflow-auto rounded-2xl border border-white/10 bg-[#07090d] p-4 text-xs leading-5 text-[#d9e4f2] shadow-inner">
              <code className="select-text whitespace-pre">{schemaJson}</code>
            </pre>
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-[#aab4c3]">
              This is the exact schema used by the live preview, including field layout, validation, theme, and multi-step settings.
            </p>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
