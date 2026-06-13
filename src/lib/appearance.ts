import type { FormTheme } from "@/types/form";

export type AppearancePreset = {
  id: string;
  name: string;
  description: string;
  theme: Partial<FormTheme>;
  accent: string;
  vibe: string;
};

export const fontOptions = [
  { value: "inter", label: "System Sans", family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', ui-sans-serif, system-ui, sans-serif" },
  { value: "manrope", label: "Humanist", family: "'Avenir Next', Avenir, 'Nunito Sans', ui-sans-serif, system-ui, sans-serif" },
  { value: "geist", label: "Modern UI", family: "'Helvetica Neue', Helvetica, Arial, ui-sans-serif, system-ui, sans-serif" },
  { value: "poppins", label: "Geometric", family: "Futura, 'Trebuchet MS', 'Century Gothic', ui-sans-serif, system-ui, sans-serif" },
  { value: "dm-sans", label: "Friendly", family: "'Trebuchet MS', Verdana, ui-sans-serif, system-ui, sans-serif" },
  { value: "rounded", label: "Rounded", family: "'Arial Rounded MT Bold', 'Avenir Next Rounded', ui-rounded, ui-sans-serif, system-ui, sans-serif" },
  { value: "mono", label: "Mono", family: "'SFMono-Regular', 'SF Mono', Consolas, 'Liberation Mono', ui-monospace, monospace" },
  { value: "serif", label: "Editorial", family: "Georgia, 'Times New Roman', ui-serif, serif" }
] as const;

export const appearancePresets: AppearancePreset[] = [
  {
    id: "outline",
    name: "Clean SaaS",
    description: "Crisp borders, calm spacing and dependable focus states.",
    accent: "#3157d5",
    vibe: "Product",
    theme: { accentColor: "#3157d5", fieldStyle: "outline", focusStyle: "ring", fieldRadius: 14, fieldBorderWidth: 1, density: "comfortable", animation: "slide", buttonStyle: "filled", buttonRadius: 14, buttonWidth: "auto", formPadding: "comfortable", labelSpacing: "comfortable" }
  },
  {
    id: "filled",
    name: "Filled Surface",
    description: "Soft gray inputs with clear active contrast.",
    accent: "#0f766e",
    vibe: "Friendly",
    theme: { accentColor: "#0f766e", fieldStyle: "filled", focusStyle: "glow", fieldRadius: 16, fieldBorderWidth: 1, density: "comfortable", animation: "fade", buttonStyle: "soft", buttonRadius: 16, buttonWidth: "auto", formPadding: "comfortable", labelSpacing: "comfortable" }
  },
  {
    id: "underline",
    name: "Minimal Line",
    description: "Lean editorial form with animated underline focus.",
    accent: "#111827",
    vibe: "Editorial",
    theme: { accentColor: "#111827", fieldStyle: "underline", focusStyle: "border", fieldRadius: 0, fieldBorderWidth: 2, density: "compact", animation: "fade", buttonStyle: "outline", buttonRadius: 0, buttonWidth: "auto", formPadding: "compact", labelSpacing: "compact" }
  },
  {
    id: "glass",
    name: "Soft Glass",
    description: "Premium translucent fields with a subtle lift.",
    accent: "#7c3aed",
    vibe: "Premium",
    theme: { accentColor: "#7c3aed", fieldStyle: "glass", focusStyle: "lift", fieldRadius: 20, fieldBorderWidth: 1, density: "spacious", animation: "scale", buttonStyle: "filled", buttonRadius: 22, buttonWidth: "auto", formPadding: "spacious", labelSpacing: "comfortable" }
  },
  {
    id: "enterprise",
    name: "Enterprise Calm",
    description: "Dense, accessible, and built for operational workflows.",
    accent: "#334155",
    vibe: "Ops",
    theme: { accentColor: "#334155", fieldStyle: "outline", focusStyle: "border", fieldRadius: 8, fieldBorderWidth: 1, density: "compact", animation: "none", buttonStyle: "filled", buttonRadius: 8, buttonWidth: "auto", formPadding: "compact", labelSpacing: "compact" }
  },
  {
    id: "mobile",
    name: "Mobile App",
    description: "Chunkier controls, full-width action and generous touch space.",
    accent: "#db2777",
    vibe: "Consumer",
    theme: { accentColor: "#db2777", fieldStyle: "filled", focusStyle: "ring", fieldRadius: 22, fieldBorderWidth: 1, density: "spacious", animation: "slide", buttonStyle: "filled", buttonRadius: 22, buttonWidth: "full", formPadding: "spacious", labelSpacing: "comfortable" }
  },
  {
    id: "neon",
    name: "Neon Dark",
    description: "Dark-mode first with energetic focus and compact rhythm.",
    accent: "#06b6d4",
    vibe: "Launch",
    theme: { accentColor: "#06b6d4", mode: "dark", fieldStyle: "glass", focusStyle: "glow", fieldRadius: 18, fieldBorderWidth: 1, density: "comfortable", animation: "scale", buttonStyle: "soft", buttonRadius: 18, buttonWidth: "auto", formPadding: "comfortable", labelSpacing: "comfortable" }
  }
];

export const defaultAppearance: Required<Pick<FormTheme, "fontFamily" | "fontScale" | "fieldStyle" | "fieldRadius" | "fieldBorderWidth" | "focusStyle" | "animation" | "formWidth" | "density" | "buttonStyle" | "buttonRadius" | "buttonWidth" | "formPadding" | "labelSpacing">> = {
  fontFamily: "inter",
  fontScale: "comfortable",
  fieldStyle: "outline",
  fieldRadius: 14,
  fieldBorderWidth: 1,
  focusStyle: "ring",
  animation: "slide",
  formWidth: "medium",
  density: "comfortable",
  buttonStyle: "filled",
  buttonRadius: 14,
  buttonWidth: "auto",
  formPadding: "comfortable",
  labelSpacing: "comfortable"
};

export function getFontFamily(fontFamily?: FormTheme["fontFamily"]) {
  return fontOptions.find((font) => font.value === (fontFamily ?? defaultAppearance.fontFamily))?.family ?? fontOptions[0].family;
}
