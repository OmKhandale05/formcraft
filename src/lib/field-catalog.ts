import {
  AlignLeft,
  Calendar,
  CalendarRange,
  Calculator,
  CheckSquare,
  CreditCard,
  Divide,
  EyeOff,
  FileUp,
  Hash,
  Heading,
  ListChecks,
  Mail,
  MousePointerSquareDashed,
  Phone,
  Pilcrow,
  Signature,
  SlidersHorizontal,
  Star,
  Table2,
  Type
} from "lucide-react";
import type { FieldLayoutPreference, FieldType, FormField } from "@/types/form";

export const compactFieldTypes: FieldType[] = ["text", "email", "phone", "number", "dropdown", "date", "rating", "slider", "payment", "formula"];
export const fullWidthOnlyFieldTypes: FieldType[] = ["section", "divider", "signature", "matrix", "richtext", "textarea", "file", "hidden"];

export const fieldCatalog: Array<{
  type: FieldType;
  label: string;
  description: string;
  icon: typeof Type;
}> = [
  { type: "text", label: "Text input", description: "Short answer field", icon: Type },
  { type: "email", label: "Email input", description: "Email with validation", icon: Mail },
  { type: "phone", label: "Phone input", description: "Contact number", icon: Phone },
  { type: "textarea", label: "Textarea", description: "Long-form response", icon: AlignLeft },
  { type: "number", label: "Number input", description: "Quantity or budget", icon: Hash },
  { type: "dropdown", label: "Dropdown", description: "Single select menu", icon: MousePointerSquareDashed },
  { type: "radio", label: "Radio group", description: "Visible single choice", icon: ListChecks },
  { type: "checkbox", label: "Checkbox group", description: "Multiple choices", icon: CheckSquare },
  { type: "date", label: "Date picker", description: "Calendar date", icon: Calendar },
  { type: "file", label: "File upload", description: "Drag-drop with restrictions", icon: FileUp },
  { type: "rating", label: "Rating", description: "Star or emoji scale", icon: Star },
  { type: "signature", label: "Signature", description: "Draw and save as base64", icon: Signature },
  { type: "daterange", label: "Date range", description: "Start and end dates", icon: CalendarRange },
  { type: "slider", label: "Slider", description: "Range with live value", icon: SlidersHorizontal },
  { type: "richtext", label: "Rich text", description: "Bold, italic and bullets", icon: Pilcrow },
  { type: "matrix", label: "Matrix / grid", description: "Rows by columns table", icon: Table2 },
  { type: "hidden", label: "Hidden field", description: "UTM or silent metadata", icon: EyeOff },
  { type: "payment", label: "Payment field", description: "Stripe-ready amount", icon: CreditCard },
  { type: "formula", label: "Formula output", description: "Live calculated value", icon: Calculator },
  { type: "section", label: "Section title", description: "Step or content block", icon: Heading },
  { type: "divider", label: "Divider", description: "Visual separator", icon: Divide }
];

export function resolveFieldLayout(type: FieldType, preference: FieldLayoutPreference = "auto") {
  if (fullWidthOnlyFieldTypes.includes(type)) return "full";
  if (preference === "full" || preference === "half") return preference;
  return compactFieldTypes.includes(type) ? "half" : "full";
}

export function createField(type: FieldType, layoutPreference: FieldLayoutPreference = "auto"): FormField {
  const base = fieldCatalog.find((field) => field.type === type);
  const id = `${type}-${crypto.randomUUID()}`;
  const optionDefaults = ["Product", "Design", "Engineering"];
  const matrixRows = ["Ease of use", "Design quality", "Performance"];
  const matrixColumns = ["Poor", "Average", "Great"];

  return {
    id,
    type,
    label: base?.label ?? "Untitled field",
    placeholder: type === "textarea" || type === "richtext" ? "Tell us more..." : "Enter response",
    helperText: "",
    required: !["section", "divider", "file", "hidden", "formula"].includes(type),
    options: ["dropdown", "radio", "checkbox"].includes(type) ? optionDefaults : undefined,
    step: 1,
    layout: resolveFieldLayout(type, layoutPreference),
    validation: {},
    settings: {
      ratingStyle: "stars",
      ratingScale: 5,
      acceptedFileTypes: type === "file" ? ".pdf,.png,.jpg" : undefined,
      maxFileSizeMb: type === "file" ? 10 : undefined,
      countryCode: type === "phone" ? "+91" : undefined,
      sliderMin: type === "slider" ? 0 : undefined,
      sliderMax: type === "slider" ? 100 : undefined,
      sliderStep: type === "slider" ? 5 : undefined,
      matrixRows: type === "matrix" ? matrixRows : undefined,
      matrixColumns: type === "matrix" ? matrixColumns : undefined,
      hiddenValue: type === "hidden" ? "utm_source=portfolio" : undefined,
      currency: type === "payment" ? "USD" : undefined,
      formulaMode: type === "formula" ? "simple" : undefined,
      formulaOperator: type === "formula" ? "add" : undefined,
      formulaUseCustomValue: type === "formula" ? false : undefined,
      formulaCustomValue: type === "formula" ? 0 : undefined,
      formulaExpression: type === "formula" ? "0" : undefined,
      formulaFormat: type === "formula" ? "number" : undefined,
      formulaPrecision: type === "formula" ? 2 : undefined,
      formulaFallback: type === "formula" ? "Waiting for inputs" : undefined
    }
  };
}
