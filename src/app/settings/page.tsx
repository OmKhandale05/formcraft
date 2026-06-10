"use client";

import { Moon, Palette, Square, Sun } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormRenderer } from "@/components/form-renderer";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useFormStore } from "@/store/form-store";

const colors = ["#2563eb", "#0f766e", "#d97706", "#db2777", "#7c3aed", "#111827"];

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
            <div>
              <Label>Accent color</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color}`}
                    className="h-10 w-10 rounded-xl border-2 border-white shadow ring-offset-2 transition hover:scale-105"
                    style={{ background: color, boxShadow: form.theme.accentColor === color ? `0 0 0 3px ${color}33` : undefined }}
                    onClick={() => setTheme({ accentColor: color })}
                  />
                ))}
                <Input type="color" value={form.theme.accentColor} onChange={(event) => setTheme({ accentColor: event.target.value })} className="h-10 w-16 p-1" />
              </div>
            </div>
            <div>
              <Label>Corner style</Label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant={form.theme.radius === "rounded" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "rounded" })}>
                  <Palette size={16} />
                  Rounded
                </Button>
                <Button variant={form.theme.radius === "square" ? "primary" : "secondary"} onClick={() => setTheme({ radius: "square" })}>
                  <Square size={16} />
                  Square
                </Button>
              </div>
            </div>
            <div>
              <Label>Preview mode</Label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant={form.theme.mode === "light" ? "primary" : "secondary"} onClick={() => setTheme({ mode: "light" })}>
                  <Sun size={16} />
                  Light
                </Button>
                <Button variant={form.theme.mode === "dark" ? "primary" : "secondary"} onClick={() => setTheme({ mode: "dark" })}>
                  <Moon size={16} />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#111418]">Live theme preview</h2>
            <p className="mt-1 text-sm text-[#667085]">The same renderer powers preview and submission capture.</p>
          </div>
          <div className="max-w-3xl">
            <FormRenderer form={form} compact />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
