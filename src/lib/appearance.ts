import type { FormTheme } from "@/types/form";

export type AppearancePreset = {
  id: NonNullable<FormTheme["fieldStyle"]>;
  name: string;
  description: string;
  theme: Partial<FormTheme>;
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
    theme: { fieldStyle: "outline", focusStyle: "ring", fieldRadius: 14, fieldBorderWidth: 1, density: "comfortable", animation: "slide" }
  },
  {
    id: "filled",
    name: "Filled Surface",
    description: "Soft gray inputs with clear active contrast.",
    theme: { fieldStyle: "filled", focusStyle: "glow", fieldRadius: 16, fieldBorderWidth: 1, density: "comfortable", animation: "fade" }
  },
  {
    id: "underline",
    name: "Minimal Line",
    description: "Lean editorial form with animated underline focus.",
    theme: { fieldStyle: "underline", focusStyle: "border", fieldRadius: 0, fieldBorderWidth: 2, density: "compact", animation: "fade" }
  },
  {
    id: "glass",
    name: "Soft Glass",
    description: "Premium translucent fields with a subtle lift.",
    theme: { fieldStyle: "glass", focusStyle: "lift", fieldRadius: 20, fieldBorderWidth: 1, density: "spacious", animation: "scale" }
  }
];

export const defaultAppearance: Required<Pick<FormTheme, "fontFamily" | "fontScale" | "fieldStyle" | "fieldRadius" | "fieldBorderWidth" | "focusStyle" | "animation" | "formWidth" | "density">> = {
  fontFamily: "inter",
  fontScale: "comfortable",
  fieldStyle: "outline",
  fieldRadius: 14,
  fieldBorderWidth: 1,
  focusStyle: "ring",
  animation: "slide",
  formWidth: "medium",
  density: "comfortable"
};

export function getFontFamily(fontFamily?: FormTheme["fontFamily"]) {
  return fontOptions.find((font) => font.value === (fontFamily ?? defaultAppearance.fontFamily))?.family ?? fontOptions[0].family;
}
