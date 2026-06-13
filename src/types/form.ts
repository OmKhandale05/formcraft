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
  | "rating"
  | "signature"
  | "daterange"
  | "slider"
  | "richtext"
  | "matrix"
  | "hidden"
  | "payment"
  | "formula"
  | "section"
  | "divider";

export type FieldLayout = "full" | "half";
export type FieldLayoutPreference = FieldLayout | "auto";

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
  layout?: FieldLayout;
  validation?: ValidationRule;
  settings?: {
    ratingStyle?: "stars" | "emoji";
    ratingScale?: number;
    acceptedFileTypes?: string;
    maxFileSizeMb?: number;
    countryCode?: string;
    sliderMin?: number;
    sliderMax?: number;
    sliderStep?: number;
    matrixRows?: string[];
    matrixColumns?: string[];
    matrixHiddenRows?: string[];
    matrixColumnDescriptions?: Record<string, string>;
    matrixColumnWidths?: Record<string, number>;
    matrixInputType?: "radio" | "checkbox" | "text" | "number" | "dropdown" | "rating" | "toggle";
    matrixDropdownOptions?: string[];
    matrixAlternateRows?: boolean;
    matrixHeaderColor?: string;
    matrixRowColor?: string;
    matrixAlternateRowColor?: string;
    matrixBorderColor?: string;
    hiddenValue?: string;
    currency?: string;
    formulaMode?: "simple" | "advanced";
    formulaInputA?: string;
    formulaInputB?: string;
    formulaOperator?: "add" | "subtract" | "multiply" | "divide" | "average" | "percent" | "percentIncrease";
    formulaUseCustomValue?: boolean;
    formulaCustomValue?: number;
    formulaExpression?: string;
    formulaFormat?: "number" | "currency" | "percent" | "text";
    formulaPrecision?: number;
    formulaPrefix?: string;
    formulaSuffix?: string;
    formulaFallback?: string;
  };
};

export type FormTheme = {
  accentColor: string;
  radius: "rounded" | "square";
  mode: "light" | "dark";
  fontFamily?: "inter" | "manrope" | "geist" | "poppins" | "dm-sans" | "serif" | "mono" | "rounded";
  fontScale?: "compact" | "comfortable" | "large";
  fieldStyle?: "outline" | "filled" | "underline" | "glass";
  fieldRadius?: number;
  fieldBorderWidth?: number;
  focusStyle?: "border" | "ring" | "glow" | "lift";
  animation?: "none" | "fade" | "slide" | "scale";
  formWidth?: "narrow" | "medium" | "wide";
  density?: "compact" | "comfortable" | "spacious";
  buttonStyle?: "filled" | "outline" | "soft" | "ghost";
  buttonRadius?: number;
  buttonWidth?: "auto" | "full";
  formPadding?: "compact" | "comfortable" | "spacious";
  labelSpacing?: "compact" | "comfortable" | "spacious";
};

export type LogicOperator = "equals" | "notEquals" | "contains" | "notEmpty" | "empty" | "greaterThan" | "lessThan";
export type LogicAction = "show" | "hide" | "require" | "optional";

export type LogicRule = {
  id: string;
  name: string;
  enabled: boolean;
  sourceFieldId: string;
  operator: LogicOperator;
  value?: string;
  action: LogicAction;
  targetFieldIds: string[];
};

export type FormSchema = {
  id: string;
  name: string;
  title: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  logicRules?: LogicRule[];
  updatedAt: string;
};

export type Submission = {
  id: string;
  formId: string;
  submittedAt: string;
  values: Record<string, unknown>;
};

export type FormVersion = {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
  form: FormSchema;
};
