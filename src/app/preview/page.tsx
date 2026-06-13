"use client";

import { Check, Code2, Copy, Monitor, PanelsTopLeft, Smartphone } from "lucide-react";
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
  const [codeTab, setCodeTab] = useState<"json" | "embed">("json");
  const [copied, setCopied] = useState<"json" | "embed" | null>(null);
  const schemaJson = useMemo(() => JSON.stringify(form, null, 2), [form]);
  const embedCode = useMemo(() => {
    const encodedSchema = encodeURIComponent(JSON.stringify(form));
    return `<div data-formcraft-schema="${encodedSchema}"></div>\n<script src="https://formcraft.app/embed.js" async></script>`;
  }, [form]);

  const copySchema = async () => {
    await navigator.clipboard.writeText(schemaJson);
    setCopied("json");
    window.setTimeout(() => setCopied(null), 1600);
  };

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied("embed");
    window.setTimeout(() => setCopied(null), 1600);
  };

  const copyActiveCode = codeTab === "json" ? copySchema : copyEmbed;
  const activeCode = codeTab === "json" ? schemaJson : embedCode;
  const activeCopied = copied === codeTab;

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
                  {codeTab === "json" ? <Code2 size={14} /> : <PanelsTopLeft size={14} />}
                  {codeTab === "json" ? "JSON schema" : "Embed code"}
                </div>
                <h2 className="mt-3 text-lg font-semibold">Copyable form code</h2>
                <p className="mt-1 text-sm leading-6 text-[#aab4c3]">
                  {codeTab === "json"
                    ? `${form.fields.length} fields · ${new Set(form.fields.map((field) => field.step ?? 1)).size} steps · ${form.logicRules?.length ?? 0} rules`
                    : "Snippet for simulating an embedded FormCraft form"}
                </p>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={copyActiveCode}>
                {activeCopied ? <Check size={15} /> : <Copy size={15} />}
                {activeCopied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="mb-3 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/8 p-1">
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition",
                  codeTab === "json" ? "bg-white text-[#111418] shadow-sm" : "text-[#aab4c3] hover:bg-white/8 hover:text-white"
                )}
                onClick={() => setCodeTab("json")}
              >
                <Code2 size={15} />
                JSON
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition",
                  codeTab === "embed" ? "bg-white text-[#111418] shadow-sm" : "text-[#aab4c3] hover:bg-white/8 hover:text-white"
                )}
                onClick={() => setCodeTab("embed")}
              >
                <PanelsTopLeft size={15} />
                Embed
              </button>
            </div>

            <pre className={cn("formcraft-scrollbar overflow-auto rounded-2xl border border-white/10 bg-[#07090d] p-4 text-xs leading-5 text-[#d9e4f2] shadow-inner", codeTab === "json" ? "max-h-[720px]" : "max-h-72")}>
              <code className={cn("select-text", codeTab === "json" ? "whitespace-pre" : "whitespace-pre-wrap")}>{activeCode}</code>
            </pre>
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-[#aab4c3]">
              {codeTab === "json"
                ? "This is the exact schema used by the live preview, including field layout, validation, theme, logic rules, and multi-step settings."
                : "This embed snippet simulates how the current FormCraft schema could be mounted inside another site."}
            </p>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
