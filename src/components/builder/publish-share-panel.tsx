"use client";

import { Check, Code2, Copy, Globe2, Link2, Power, QrCode, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useFormStore } from "@/store/form-store";
import type { PublishedForm } from "@/types/form";
import { cn } from "@/lib/utils";

const destinations: Array<{ id: PublishedForm["destinations"][number]; label: string; description: string }> = [
  { id: "inbox", label: "FormCraft inbox", description: "Save responses locally" },
  { id: "email", label: "Email", description: "Notify owner" },
  { id: "sheets", label: "Google Sheets", description: "Spreadsheet sync" },
  { id: "slack", label: "Slack", description: "Team alert" },
  { id: "webhook", label: "Webhook", description: "POST payload" }
];

function getBaseUrl() {
  if (typeof window === "undefined") return "http://localhost:3000";
  return window.location.origin;
}

function qrCells(value: string) {
  let seed = 0;
  for (const char of value) seed = (seed * 31 + char.charCodeAt(0)) % 9973;
  return Array.from({ length: 49 }, (_, index) => {
    const row = Math.floor(index / 7);
    const col = index % 7;
    const finder = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
    return finder || ((seed + index * 17 + row * col) % 5 < 2);
  });
}

export function PublishSharePanel() {
  const publishedForm = useFormStore((state) => state.publishedForm);
  const publishForm = useFormStore((state) => state.publishForm);
  const unpublishForm = useFormStore((state) => state.unpublishForm);
  const updatePublishSlug = useFormStore((state) => state.updatePublishSlug);
  const updatePublishDestinations = useFormStore((state) => state.updatePublishDestinations);
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const localLink = `${getBaseUrl()}/f/${publishedForm.slug}`;
  const publicLink = `https://formcraft.app/f/${publishedForm.slug}`;
  const embedCode = `<iframe src="${localLink}" width="100%" height="720" style="border:0;border-radius:16px"></iframe>`;
  const cells = useMemo(() => qrCells(localLink), [localLink]);

  const copyText = async (type: "link" | "embed", value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#111418]">
            <Globe2 size={16} />
            Publish and share
          </p>
          <p className="mt-1 text-xs leading-5 text-[#667085]">Simulate publishing a public form link, embed code and response routing.</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", publishedForm.published ? "bg-[#ecfdf5] text-[#0f766e]" : "bg-[#fff7ed] text-[#c77700]")}>
          {publishedForm.published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="grid gap-3">
        <div>
          <Label htmlFor="publish-slug">Share URL slug</Label>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Input id="publish-slug" value={publishedForm.slug} onChange={(event) => updatePublishSlug(event.target.value)} />
            <Button type="button" variant={publishedForm.published ? "danger" : "primary"} onClick={publishedForm.published ? unpublishForm : publishForm}>
              <Power size={15} />
              {publishedForm.published ? "Unpublish" : "Publish"}
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-[#667085]">
            {publishedForm.published && publishedForm.publishedAt ? `Last published ${new Date(publishedForm.publishedAt).toLocaleString()}` : "Publish creates a snapshot used by the public page."}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">
            <Link2 size={14} />
            Share link
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#334155]">{localLink}</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => copyText("link", localLink)}>
              {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "link" ? "Copied" : "Copy link"}
            </Button>
            <a className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-[#d8e0ea] bg-white/90 px-3 text-sm font-medium text-[#20242b] shadow-sm transition hover:bg-white" href={`/f/${publishedForm.slug}`} target="_blank">
              Open form
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-[#e5e9ef] bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">
              <QrCode size={14} />
              QR
            </div>
            <div className="grid aspect-square grid-cols-7 gap-1 rounded-xl bg-[#f8fafc] p-2">
              {cells.map((active, index) => (
                <span key={index} className={cn("rounded-[3px]", active ? "bg-[#111418]" : "bg-white")} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e9ef] bg-[#111418] p-3 text-white">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
              <Code2 size={14} />
              Embed code
            </div>
            <code className="block select-text rounded-xl bg-black/25 p-3 text-xs leading-5 text-[#d9e4f2]">{embedCode}</code>
            <Button type="button" size="sm" variant="secondary" className="mt-2 w-full justify-center" onClick={() => copyText("embed", embedCode)}>
              {copied === "embed" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "embed" ? "Copied" : "Copy embed"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e5e9ef] bg-white p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#98a2b3]">
            <Send size={14} />
            Submission routing
          </div>
          <div className="grid gap-2">
            {destinations.map((destination) => (
              <label key={destination.id} className="flex items-center gap-3 rounded-xl border border-[#e5e9ef] bg-[#fbfcfe] px-3 py-2 text-sm font-medium text-[#334155]">
                <input
                  type="checkbox"
                  checked={publishedForm.destinations.includes(destination.id)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...publishedForm.destinations, destination.id]
                      : publishedForm.destinations.filter((item) => item !== destination.id);
                    updatePublishDestinations(next.length ? next : ["inbox"]);
                  }}
                />
                <span>
                  <span className="block">{destination.label}</span>
                  <span className="block text-xs font-normal text-[#667085]">{destination.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <p className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-xs leading-5 text-[#1d4ed8]">
          Public demo link: {publicLink}. In this portfolio build, the working route uses your local app URL.
        </p>
      </div>
    </section>
  );
}
