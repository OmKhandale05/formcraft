"use client";

import { Palette } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppearanceControls } from "@/components/builder/appearance-controls";
import { FormHealthPanel } from "@/components/builder/form-health-panel";
import { LogicBuilder } from "@/components/builder/logic-builder";
import { VersionHistoryPanel } from "@/components/builder/version-history-panel";
import { FormRenderer } from "@/components/form-renderer";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useFormStore } from "@/store/form-store";

export default function SettingsPage() {
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const setTheme = useFormStore((state) => state.setTheme);

  return (
    <AppShell>
      <main className="grid min-h-screen gap-6 p-4 sm:p-6 xl:h-screen xl:grid-cols-[430px_minmax(0,1fr)] xl:overflow-hidden">
        <section className="soft-panel flex min-h-0 flex-col rounded-2xl p-0 xl:max-h-[calc(100vh-48px)]">
          <div className="border-b border-[#d8e0ea] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111418] text-white shadow-lg">
                <Palette size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#111418]">Theme and settings</h1>
                <p className="text-sm text-[#667085]">Tune the published form experience.</p>
              </div>
            </div>
          </div>
          <div className="formcraft-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <div>
              <Label htmlFor="title">Form title</Label>
              <Input id="title" className="mt-2" value={form.title} onChange={(event) => setFormMeta({ title: event.target.value })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-2" value={form.description} onChange={(event) => setFormMeta({ description: event.target.value })} />
            </div>
            <FormHealthPanel form={form} />
            <VersionHistoryPanel />
            <LogicBuilder />
            <AppearanceControls theme={form.theme} onChange={setTheme} />
          </div>
        </section>
        <section className="min-h-0 xl:max-h-[calc(100vh-48px)] xl:overflow-hidden">
          <div className="sticky top-6 flex h-full min-h-0 flex-col">
            <div className="mb-4 shrink-0">
              <h2 className="text-lg font-semibold text-[#111418]">Live theme preview</h2>
              <p className="mt-1 text-sm text-[#667085]">The same renderer powers preview and submission capture.</p>
            </div>
            <div className="formcraft-scrollbar min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[#d8e0ea] bg-white/50 p-4">
              <FormRenderer form={form} compact />
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
