"use client";

import { Activity, FileText, GitBranch, History, Palette, Settings2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AppearanceControls } from "@/components/builder/appearance-controls";
import { FormHealthPanel } from "@/components/builder/form-health-panel";
import { LogicBuilder } from "@/components/builder/logic-builder";
import { VersionHistoryPanel } from "@/components/builder/version-history-panel";
import { FormRenderer } from "@/components/form-renderer";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";

const settingsTabs = [
  { id: "basics", label: "Basics", description: "Name, title and intro copy", icon: FileText },
  { id: "appearance", label: "Appearance", description: "Visual system and motion", icon: Palette },
  { id: "logic", label: "Logic", description: "Conditional behavior", icon: GitBranch },
  { id: "health", label: "Health", description: "Readiness and quality checks", icon: Activity },
  { id: "history", label: "History", description: "Saved versions and restore", icon: History }
] as const;

type SettingsTab = (typeof settingsTabs)[number]["id"];

export default function SettingsPage() {
  const form = useFormStore((state) => state.form);
  const setFormMeta = useFormStore((state) => state.setFormMeta);
  const setTheme = useFormStore((state) => state.setTheme);
  const [activeTab, setActiveTab] = useState<SettingsTab>("basics");
  const active = settingsTabs.find((tab) => tab.id === activeTab) ?? settingsTabs[0];
  const ActiveIcon = active.icon;

  return (
    <AppShell>
      <main className="grid min-h-screen gap-6 p-4 sm:p-6 xl:h-screen xl:grid-cols-[560px_minmax(0,1fr)] xl:overflow-hidden">
        <section className="soft-panel flex min-h-0 flex-col overflow-hidden rounded-2xl p-0 xl:max-h-[calc(100vh-48px)]">
          <div className="border-b border-[#d8e0ea] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111418] text-white shadow-lg">
                <Settings2 size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-[#111418]">Form settings</h1>
                <p className="mt-1 text-sm leading-5 text-[#667085]">Control center for form details, appearance, logic, health and versions.</p>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)]">
            <div className="border-b border-[#d8e0ea] bg-[#fbfcfe] p-3 md:border-b-0 md:border-r">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#98a2b3]">Control center</p>
              <div className="grid gap-1.5">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={cn(
                        "group flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                        selected
                          ? "border-[#111418] bg-[#111418] text-white shadow-[0_14px_30px_rgba(17,20,24,0.18)]"
                          : "border-transparent bg-transparent text-[#465366] hover:border-[#d8e0ea] hover:bg-white"
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition", selected ? "bg-white text-[#111418]" : "bg-white text-[#667085] ring-1 ring-[#d8e0ea] group-hover:text-[#111418]")}>
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{tab.label}</span>
                        <span className={cn("mt-0.5 block text-[11px] leading-4", selected ? "text-white/62" : "text-[#8a94a6]")}>{tab.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="border-b border-[#e5e9ef] bg-white px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                  <ActiveIcon size={16} />
                  {active.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#667085]">{active.description}</p>
              </div>

              <div className="formcraft-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
                {activeTab === "basics" && (
                  <section className="space-y-5">
                    <div className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-[#111418]">Form identity</p>
                        <p className="mt-1 text-xs leading-5 text-[#667085]">These details appear across the builder, preview and exports.</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="settings-form-name">Internal form name</Label>
                          <Input id="settings-form-name" className="mt-2" value={form.name} onChange={(event) => setFormMeta({ name: event.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="settings-title">Public title</Label>
                          <Input id="settings-title" className="mt-2" value={form.title} onChange={(event) => setFormMeta({ title: event.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="settings-description">Description</Label>
                          <Textarea id="settings-description" className="mt-2 min-h-28" value={form.description} onChange={(event) => setFormMeta({ description: event.target.value })} />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === "appearance" && <AppearanceControls theme={form.theme} onChange={setTheme} />}
                {activeTab === "logic" && <LogicBuilder />}
                {activeTab === "health" && <FormHealthPanel form={form} />}
                {activeTab === "history" && <VersionHistoryPanel />}
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-0 xl:max-h-[calc(100vh-48px)] xl:overflow-hidden">
          <div className="sticky top-6 flex h-full min-h-0 flex-col">
            <div className="mb-4 shrink-0 rounded-2xl border border-[#d8e0ea] bg-white/74 p-4 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-[#111418]">Live form preview</h2>
              <p className="mt-1 text-sm leading-5 text-[#667085]">Changes from each settings tab update here immediately.</p>
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
