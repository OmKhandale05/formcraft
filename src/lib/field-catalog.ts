import {
  AlignLeft,
  Calendar,
  CheckSquare,
  Divide,
  FileUp,
  Hash,
  Heading,
  ListChecks,
  Mail,
  MousePointerSquareDashed,
  Phone,
  Type
} from "lucide-react";
import type { FieldType, FormField } from "@/types/form";

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
  { type: "file", label: "File upload", description: "Upload placeholder", icon: FileUp },
  { type: "section", label: "Section title", description: "Step or content block", icon: Heading },
  { type: "divider", label: "Divider", description: "Visual separator", icon: Divide }
];

export function createField(type: FieldType): FormField {
  const base = fieldCatalog.find((field) => field.type === type);
  const id = `${type}-${crypto.randomUUID()}`;
  const optionDefaults = ["Product", "Design", "Engineering"];

  return {
    id,
    type,
    label: base?.label ?? "Untitled field",
    placeholder: type === "textarea" ? "Tell us more..." : "Enter response",
    helperText: "",
    required: !["section", "divider", "file"].includes(type),
    options: ["dropdown", "radio", "checkbox"].includes(type) ? optionDefaults : undefined,
    step: 1,
    validation: {}
  };
}
