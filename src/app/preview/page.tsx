"use client";

import { Check, Code2, Copy, Monitor, PanelsTopLeft, Smartphone, X } from "lucide-react";
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
  const [codeDialog, setCodeDialog] = useState<"json" | "embed" | null>(null);
  const [copied, setCopied] = useState<"json" | "embed" | null>(null);
  const schemaJson = useMemo(() => JSON.stringify(form, null, 2), [form]);
  const embedCode = useMemo(() => {
    const encodedSchema = encodeURIComponent(JSON.stringify(form));
    return `<div data-formcraft-schema="${encodedSchema}"></div>\n<script src="https://formcraft.app/embed.js" async></script>`;
  }, [form]);

  const copySchema = async () => {
    try {
      await navigator.clipboard.writeText(schemaJson);
    } catch {
      // Keep the UI responsive even if browser clipboard permission is unavailable.
    }
    setCopied("json");
  };

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
    } catch {
      // Keep the UI responsive even if browser clipboard permission is unavailable.
    }
    setCopied("embed");
  };

  const openCodeDialog = (type: "json" | "embed") => {
    setCopied(null);
    setCodeDialog(type);
  };

  const closeCodeDialog = () => {
    setCodeDialog(null);
    setCopied(null);
  };

  const copyActiveCode = codeDialog === "json" ? copySchema : copyEmbed;
  const activeCode = codeDialog === "json" ? schemaJson : embedCode;
  const activeCopied = copied === codeDialog;

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
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 rounded-3xl border border-[#d8e0ea] bg-white/54 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_60px_rgba(17,24,39,0.08)] backdrop-blur sm:p-8">
            <div className={cn("mx-auto transition-all", device === "mobile" ? "max-w-[390px]" : "max-w-3xl")}>
              <FormRenderer form={form} onSubmit={addSubmission} />
            </div>
          </div>
          <aside className="min-h-0 min-w-0 rounded-3xl border border-[#d8e0ea] bg-[#111418] p-4 text-white shadow-[0_24px_70px_rgba(17,24,39,0.18)]">
            <div className="mb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-[#dce6f5]">
                  <Code2 size={14} />
                  Export preview
                </div>
                <h2 className="mt-3 text-lg font-semibold">Copy form code</h2>
                <p className="mt-1 text-sm leading-6 text-[#aab4c3]">
                  Open a focused code popup when you need the schema or embed snippet.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                className="group rounded-2xl border border-white/10 bg-white/8 p-4 text-left transition hover:border-white/20 hover:bg-white/12"
                onClick={() => openCodeDialog("json")}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#111418]">
                    <Code2 size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-white">View JSON schema</span>
                    <span className="mt-1 block text-xs leading-5 text-[#aab4c3]">
                      {form.fields.length} fields · {new Set(form.fields.map((field) => field.step ?? 1)).size} steps · {form.logicRules?.length ?? 0} rules
                    </span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="group rounded-2xl border border-white/10 bg-white/8 p-4 text-left transition hover:border-white/20 hover:bg-white/12"
                onClick={() => openCodeDialog("embed")}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#111418]">
                    <PanelsTopLeft size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-white">View embed code</span>
                    <span className="mt-1 block text-xs leading-5 text-[#aab4c3]">Snippet for mounting this FormCraft form inside another site.</span>
                  </span>
                </span>
              </button>
            </div>
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-[#aab4c3]">
              Code stays hidden until needed, keeping preview focused on the form experience.
            </p>
          </aside>
        </div>
        {codeDialog && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#111418]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#d8e0ea] bg-white shadow-[0_34px_100px_rgba(17,24,39,0.34)]">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5e9ef] bg-[#f8fafc] p-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-white px-3 py-1 text-xs font-bold text-[#465366]">
                    {codeDialog === "json" ? <Code2 size={14} /> : <PanelsTopLeft size={14} />}
                    {codeDialog === "json" ? "JSON schema" : "Embed code"}
                  </div>
                  <h2 className="mt-3 text-xl font-black text-[#111418]">{codeDialog === "json" ? "Current form JSON" : "Embeddable snippet"}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
                    {codeDialog === "json"
                      ? "Copy the exact schema used by this live preview, including layout, validation, theme, logic rules and multi-step settings."
                      : "Copy this snippet to simulate mounting the current FormCraft schema inside another site."}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="secondary" onClick={copyActiveCode}>
                    {activeCopied ? <Check size={16} /> : <Copy size={16} />}
                    {activeCopied ? "Copied" : "Copy"}
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Close code dialog" onClick={closeCodeDialog}>
                    <X size={18} />
                  </Button>
                </div>
              </div>
              <div className="bg-[#111418] p-4">
                <pre className={cn("formcraft-scrollbar max-w-full overflow-auto rounded-2xl border border-white/10 bg-[#07090d] p-4 text-xs leading-5 text-[#d9e4f2] shadow-inner", codeDialog === "json" ? "max-h-[70vh]" : "max-h-[360px]")}>
                  <code className={cn("select-text", codeDialog === "json" ? "whitespace-pre" : "whitespace-pre-wrap")}>{activeCode}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
