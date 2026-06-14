"use client";

import { Check, Layers, MousePointer2, Moon, Sun } from "lucide-react";
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

const buttonStyleOptions: Array<{ value: NonNullable<FormTheme["buttonStyle"]>; label: string }> = [
  { value: "filled", label: "Filled" },
  { value: "outline", label: "Outline" },
  { value: "soft", label: "Soft" },
  { value: "ghost", label: "Ghost" }
];

const buttonWidthOptions: Array<{ value: NonNullable<FormTheme["buttonWidth"]>; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "full", label: "Full width" }
];

const spacingOptions: Array<{ value: "compact" | "comfortable" | "spacious"; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfort" },
  { value: "spacious", label: "Spacious" }
];

const themeColors = ["#2563eb", "#0f766e", "#d97706", "#db2777", "#7c3aed", "#111827"];

export function AppearanceControls({ theme, onChange, compact = false }: AppearanceControlsProps) {
  const currentStyle = theme.fieldStyle ?? defaultAppearance.fieldStyle;
  const radius = theme.fieldRadius ?? (theme.radius === "square" ? 0 : defaultAppearance.fieldRadius);
  const borderWidth = theme.fieldBorderWidth ?? defaultAppearance.fieldBorderWidth;
  const buttonRadius = theme.buttonRadius ?? defaultAppearance.buttonRadius;

  return (
    <div className="space-y-4">
      <ThemeMiniPreview theme={theme} />

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
              <Layers size={16} />
              Style presets
            </p>
            <p className="mt-1 text-xs leading-5 text-[#667085]">Pick a feel first, fine-tune below.</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => onChange({ ...defaultAppearance, radius: "rounded" })}>
            Reset
          </Button>
        </div>
        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {appearancePresets.map((preset) => {
            const selected = currentStyle === preset.theme.fieldStyle && (theme.buttonStyle ?? defaultAppearance.buttonStyle) === preset.theme.buttonStyle;
            const isUnderline = preset.theme.fieldStyle === "underline";
            const isFilled = preset.theme.fieldStyle === "filled";
            const isGlass = preset.theme.fieldStyle === "glass";
            const previewRadius = preset.theme.fieldRadius === 0 ? 0 : Math.min(preset.theme.fieldRadius ?? 14, 18);
            return (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  "flex min-h-[196px] flex-col overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 hover:border-[#3157d5]/50 hover:shadow-md",
                  selected ? "border-[#3157d5] bg-[#f4f7ff] shadow-sm" : "border-[#d8e0ea] bg-[#fbfcfe]"
                )}
                onClick={() => onChange({ ...preset.theme, radius: preset.theme.fieldRadius === 0 ? "square" : "rounded" })}
              >
                <div className="h-[86px] p-3" style={{ background: `linear-gradient(135deg, ${preset.accent}24, #ffffff 62%)` }}>
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="max-w-[92px] truncate rounded-full bg-white/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#667085] shadow-sm">{preset.vibe}</span>
                      <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border bg-white/80", selected ? "border-[#3157d5] text-[#3157d5]" : "border-white/70 text-transparent")}>
                        <Check size={13} />
                      </span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_42px] items-end gap-2">
                      <div className="space-y-1.5">
                        <span
                          className={cn("block h-3 border bg-white/90", isUnderline && "border-x-0 border-t-0 bg-transparent", isFilled && "bg-[#f1f5f9]", isGlass && "bg-white/60 shadow-sm backdrop-blur")}
                          style={{ borderColor: preset.accent, borderRadius: isUnderline ? 0 : previewRadius }}
                        />
                        <span
                          className={cn("block h-3 w-3/4 border bg-white/90", isUnderline && "border-x-0 border-t-0 bg-transparent", isFilled && "bg-[#f1f5f9]", isGlass && "bg-white/60 shadow-sm backdrop-blur")}
                          style={{ borderColor: preset.accent, borderRadius: isUnderline ? 0 : previewRadius }}
                        />
                      </div>
                      <span
                        className={cn("h-7 rounded-full border", preset.theme.buttonStyle === "outline" || preset.theme.buttonStyle === "ghost" ? "bg-white/70" : "")}
                        style={{
                          background: preset.theme.buttonStyle === "outline" || preset.theme.buttonStyle === "ghost" ? "rgba(255,255,255,0.72)" : preset.accent,
                          borderColor: preset.accent,
                          borderRadius: preset.theme.buttonRadius ?? previewRadius
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-semibold text-[#111418]">{preset.name}</span>
                    <span className="shrink-0 rounded-full bg-[#eef2f7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085]">{preset.theme.buttonStyle}</span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-5 text-[#667085]">{preset.description}</p>
                  <div className="mt-auto flex items-center gap-1.5 pt-3">
                    <span className="h-1.5 flex-1 rounded-full bg-[#e5e9ef]" />
                    <span className="h-1.5 w-8 rounded-full" style={{ background: preset.accent }} />
                  </div>
                </div>
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

      <section className="rounded-2xl border border-[#d8e0ea] bg-white/82 p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#111418]">
          <MousePointer2 size={16} />
          Button and spacing
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="appearance-button-style">Button style</Label>
            <Select id="appearance-button-style" className="mt-2" value={theme.buttonStyle ?? defaultAppearance.buttonStyle} onChange={(event) => onChange({ buttonStyle: event.target.value as FormTheme["buttonStyle"] })}>
              {buttonStyleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-button-width">Button width</Label>
            <Select id="appearance-button-width" className="mt-2" value={theme.buttonWidth ?? defaultAppearance.buttonWidth} onChange={(event) => onChange({ buttonWidth: event.target.value as FormTheme["buttonWidth"] })}>
              {buttonWidthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-form-padding">Form padding</Label>
            <Select id="appearance-form-padding" className="mt-2" value={theme.formPadding ?? defaultAppearance.formPadding} onChange={(event) => onChange({ formPadding: event.target.value as FormTheme["formPadding"] })}>
              {spacingOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="appearance-label-spacing">Label spacing</Label>
            <Select id="appearance-label-spacing" className="mt-2" value={theme.labelSpacing ?? defaultAppearance.labelSpacing} onChange={(event) => onChange({ labelSpacing: event.target.value as FormTheme["labelSpacing"] })}>
              {spacingOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="appearance-button-radius">Button radius</Label>
              <span className="text-xs font-semibold text-[#667085]">{buttonRadius}px</span>
            </div>
            <Input
              id="appearance-button-radius"
              type="range"
              min={0}
              max={28}
              value={buttonRadius}
              className="mt-2 h-8 cursor-pointer p-0 shadow-none"
              onChange={(event) => onChange({ buttonRadius: Number(event.target.value) })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ThemeMiniPreview({ theme }: { theme: FormTheme }) {
  const accent = theme.accentColor;
  const radius = theme.fieldStyle === "underline" ? 0 : theme.fieldRadius ?? defaultAppearance.fieldRadius;
  const borderWidth = theme.fieldBorderWidth ?? defaultAppearance.fieldBorderWidth;
  const buttonRadius = theme.buttonRadius ?? defaultAppearance.buttonRadius;
  const isUnderline = theme.fieldStyle === "underline";
  const fieldStyle = {
    borderColor: isUnderline ? "#cbd5e1" : "#d8e0ea",
    borderWidth,
    borderTopWidth: isUnderline ? 0 : borderWidth,
    borderLeftWidth: isUnderline ? 0 : borderWidth,
    borderRightWidth: isUnderline ? 0 : borderWidth,
    borderRadius: radius,
    background: theme.fieldStyle === "filled" ? "#f1f5f9" : theme.fieldStyle === "glass" ? "rgba(255,255,255,0.7)" : "white"
  };

  return (
    <section className="rounded-2xl border border-[#d8e0ea] bg-[#f8fafc] p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#111418]">Theme glance</p>
          <p className="mt-1 text-xs text-[#667085]">Quick read of fields, matrix and action style.</p>
        </div>
        <span className="h-8 w-8 rounded-full border-2 border-white shadow" style={{ background: accent }} />
      </div>
      <div className="grid gap-2">
        <div className="h-9 px-3 py-2 text-xs font-medium text-[#98a2b3]" style={fieldStyle}>Input sample</div>
        <div className="grid grid-cols-3 overflow-hidden text-[11px]" style={{ ...fieldStyle, borderRadius: Math.max(radius, 6) }}>
          <span className="bg-[#eef2f7] p-2 font-semibold text-[#475569]">Matrix</span>
          <span className="border-l border-[#d8e0ea] p-2 text-center">A</span>
          <span className="border-l border-[#d8e0ea] p-2 text-center">B</span>
        </div>
        <div
          className="inline-flex h-9 items-center justify-center px-3 text-xs font-semibold"
          style={{
            borderRadius: buttonRadius,
            background: theme.buttonStyle === "outline" || theme.buttonStyle === "ghost" ? "transparent" : accent,
            border: `1px solid ${theme.buttonStyle === "ghost" ? "transparent" : accent}`,
            color: theme.buttonStyle === "filled" || theme.buttonStyle === "soft" ? "white" : accent,
            width: theme.buttonWidth === "full" ? "100%" : "fit-content"
          }}
        >
          Submit response
        </div>
      </div>
    </section>
  );
}
