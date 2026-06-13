"use client";

import { Check, Layers, Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { appearancePresets, defaultAppearance, fontOptions } from "@/lib/appearance";
import type { FormTheme } from "@/types/form";
import { cn } from "@/lib/utils";

type AppearanceControlsProps = {
  theme: FormTheme;
  onChange: (theme: Partial<FormTheme>) => void;
  compact?: boolean;
};

const focusOptions: Array<{ value: NonNullable<FormTheme["focusStyle"]>; label: string }> = [
  { value: "ring", label: "Ring" },
  { value: "glow", label: "Glow" },
  { value: "border", label: "Border" },
  { value: "lift", label: "Lift" }
];

const animationOptions: Array<{ value: NonNullable<FormTheme["animation"]>; label: string }> = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide up" },
  { value: "scale", label: "Soft scale" }
];

const widthOptions: Array<{ value: NonNullable<FormTheme["formWidth"]>; label: string }> = [
  { value: "narrow", label: "Narrow" },
  { value: "medium", label: "Medium" },
  { value: "wide", label: "Wide" }
];

const scaleOptions: Array<{ value: NonNullable<FormTheme["fontScale"]>; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfort" },
  { value: "large", label: "Large" }
];

const densityOptions: Array<{ value: NonNullable<FormTheme["density"]>; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfort" },
  { value: "spacious", label: "Spacious" }
];

const themeColors = ["#2563eb", "#0f766e", "#d97706", "#db2777", "#7c3aed", "#111827"];

export function AppearanceControls({ theme, onChange, compact = false }: AppearanceControlsProps) {
  const currentStyle = theme.fieldStyle ?? defaultAppearance.fieldStyle;
  const radius = theme.fieldRadius ?? (theme.radius === "square" ? 0 : defaultAppearance.fieldRadius);
  const borderWidth = theme.fieldBorderWidth ?? defaultAppearance.fieldBorderWidth;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
        <div className="grid gap-4">
          <div>
            <Label>Accent color</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {themeColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color}`}
                  className="h-9 w-9 rounded-xl border-2 border-white shadow ring-offset-2 transition hover:scale-105"
                  style={{ background: color, boxShadow: theme.accentColor === color ? `0 0 0 3px ${color}33` : undefined }}
                  onClick={() => onChange({ accentColor: color })}
                />
              ))}
              <Input type="color" value={theme.accentColor} onChange={(event) => onChange({ accentColor: event.target.value })} className="h-9 w-14 p-1" />
            </div>
          </div>
          <div>
            <Label>Preview mode</Label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" size="sm" variant={theme.mode === "light" ? "primary" : "secondary"} onClick={() => onChange({ mode: "light" })}>
                <Sun size={15} />
                Light
              </Button>
              <Button type="button" size="sm" variant={theme.mode === "dark" ? "primary" : "secondary"} onClick={() => onChange({ mode: "dark" })}>
                <Moon size={15} />
                Dark
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#111418]">
              <Sparkles size={16} />
              Style presets
            </p>
            <p className="mt-1 text-xs leading-5 text-[#667085]">Pick a feel first, fine-tune below.</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => onChange({ ...defaultAppearance, radius: "rounded" })}>
            Reset
          </Button>
        </div>
        <div className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {appearancePresets.map((preset) => {
            const selected = currentStyle === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  "rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-[#3157d5]/50 hover:shadow-md",
                  selected ? "border-[#3157d5] bg-[#f4f7ff] shadow-sm" : "border-[#d8e0ea] bg-[#fbfcfe]"
                )}
                onClick={() => onChange({ ...preset.theme, radius: preset.theme.fieldRadius === 0 ? "square" : "rounded" })}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#111418]">{preset.name}</span>
                  {selected && <Check size={16} className="text-[#3157d5]" />}
                </div>
                <div className="mb-3 flex gap-1.5">
                  <span className={cn("h-8 flex-1 border bg-white", preset.id === "underline" ? "rounded-none border-x-0 border-t-0" : "rounded-xl border-[#d8e0ea]", preset.id === "filled" && "bg-[#f1f5f9]", preset.id === "glass" && "bg-white/60 shadow-sm")} />
                  <span className={cn("h-8 w-10 border", preset.id === "underline" ? "rounded-none border-x-0 border-t-0" : "rounded-xl border-[#d8e0ea]", preset.id === "filled" && "bg-[#f1f5f9]", preset.id === "glass" && "bg-white/60 shadow-sm")} />
                </div>
                <p className="text-xs leading-5 text-[#667085]">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111418]">
          <Layers size={16} />
          Fine tuning
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="appearance-font">Font</Label>
            <Select id="appearance-font" className="mt-2" value={theme.fontFamily ?? defaultAppearance.fontFamily} onChange={(event) => onChange({ fontFamily: event.target.value as FormTheme["fontFamily"] })}>
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-scale">Text scale</Label>
            <Select id="appearance-scale" className="mt-2" value={theme.fontScale ?? defaultAppearance.fontScale} onChange={(event) => onChange({ fontScale: event.target.value as FormTheme["fontScale"] })}>
              {scaleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-focus">Focus effect</Label>
            <Select id="appearance-focus" className="mt-2" value={theme.focusStyle ?? defaultAppearance.focusStyle} onChange={(event) => onChange({ focusStyle: event.target.value as FormTheme["focusStyle"] })}>
              {focusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-animation">Animation</Label>
            <Select id="appearance-animation" className="mt-2" value={theme.animation ?? defaultAppearance.animation} onChange={(event) => onChange({ animation: event.target.value as FormTheme["animation"] })}>
              {animationOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-width">Form width</Label>
            <Select id="appearance-width" className="mt-2" value={theme.formWidth ?? defaultAppearance.formWidth} onChange={(event) => onChange({ formWidth: event.target.value as FormTheme["formWidth"] })}>
              {widthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-density">Spacing</Label>
            <Select id="appearance-density" className="mt-2" value={theme.density ?? defaultAppearance.density} onChange={(event) => onChange({ density: event.target.value as FormTheme["density"] })}>
              {densityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="appearance-radius">Field radius</Label>
              <span className="text-xs font-semibold text-[#667085]">{radius}px</span>
            </div>
            <Input
              id="appearance-radius"
              type="range"
              min={0}
              max={28}
              value={radius}
              className="mt-2 h-8 cursor-pointer p-0 shadow-none"
              onChange={(event) => {
                const value = Number(event.target.value);
                onChange({ fieldRadius: value, radius: value === 0 ? "square" : "rounded" });
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="appearance-border">Border width</Label>
              <span className="text-xs font-semibold text-[#667085]">{borderWidth}px</span>
            </div>
            <Input
              id="appearance-border"
              type="range"
              min={1}
              max={3}
              value={borderWidth}
              className="mt-2 h-8 cursor-pointer p-0 shadow-none"
              onChange={(event) => onChange({ fieldBorderWidth: Number(event.target.value) })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
