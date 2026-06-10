export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "number"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "section"
  | "divider";

export type ValidationRule = {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
};

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: string[];
  step?: number;
  validation?: ValidationRule;
};

export type FormTheme = {
  accentColor: string;
  radius: "rounded" | "square";
  mode: "light" | "dark";
};

export type FormSchema = {
  id: string;
  name: string;
  title: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  updatedAt: string;
};

export type Submission = {
  id: string;
  formId: string;
  submittedAt: string;
  values: Record<string, unknown>;
};
