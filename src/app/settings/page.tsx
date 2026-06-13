"use client";

import { Palette } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppearanceControls } from "@/components/builder/appearance-controls";
import { FormRenderer } from "@/components/form-renderer";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useFormStore } from "@/store/form-store";

export default function SettingsPage() {
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const setTheme = useFormStore((state) => state.setTheme);

  return (
    <AppShell>
      <main className="grid min-h-screen gap-6 p-4 sm:p-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="soft-panel rounded-2xl p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111418] text-white shadow-lg">
              <Palette size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#111418]">Theme and settings</h1>
              <p className="text-sm text-[#667085]">Tune the published form experience.</p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <Label htmlFor="title">Form title</Label>
              <Input id="title" className="mt-2" value={form.title} onChange={(event) => setFormMeta({ title: event.target.value })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-2" value={form.description} onChange={(event) => setFormMeta({ description: event.target.value })} />
            </div>
            <AppearanceControls theme={form.theme} onChange={setTheme} />
          </div>
        </section>
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#111418]">Live theme preview</h2>
            <p className="mt-1 text-sm text-[#667085]">The same renderer powers preview and submission capture.</p>
          </div>
          <div>
            <FormRenderer form={form} compact />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
