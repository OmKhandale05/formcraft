import type { FieldType, FormField, FormSchema } from "@/types/form";
import { currencyCodes } from "@/lib/currencies";

const inputTypes: FieldType[] = [
  "text",
  "email",
  "phone",
  "textarea",
  "number",
  "dropdown",
  "radio",
  "checkbox",
  "date",
  "file",
  "rating",
  "signature",
  "daterange",
  "slider",
  "richtext",
  "matrix",
  "hidden",
  "payment"
];

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toIdentifier(value: string) {
  const clean = value.replace(/[^a-zA-Z0-9_$]/g, "_");
  return /^[a-zA-Z_$]/.test(clean) ? clean : `field_${clean}`;
}

function keyForField(field: FormField) {
  return toIdentifier(field.id || field.label);
}

function quotedKey(field: FormField) {
  const key = field.id || field.label;
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function fieldTypeForTs(field: FormField) {
  if (["number", "rating", "slider", "payment"].includes(field.type)) return "number";
  if (field.type === "checkbox") return "string[]";
  if (field.type === "daterange") return "{ start: string; end: string }";
  if (field.type === "matrix") return "Record<string, string>";
  if (field.type === "file") return "File | null";
  return "string";
}

function fieldSchemaForZod(field: FormField) {
  const requiredMessage = "{ message: \"This field is required\" }";

  if (["number", "slider", "payment"].includes(field.type)) {
    const rules = ["z.coerce.number()"];
    if (field.validation?.min !== undefined) rules.push(`.min(${field.validation.min})`);
    if (field.validation?.max !== undefined) rules.push(`.max(${field.validation.max})`);
    return field.required ? rules.join("") : `${rules.join("")}.optional()`;
  }

  if (field.type === "rating") return field.required ? "z.coerce.number().min(1)" : "z.coerce.number().optional()";

  if (field.type === "checkbox") {
    return field.required ? `z.array(z.string()).min(1, ${requiredMessage})` : "z.array(z.string()).optional()";
  }

  if (field.type === "file") return "z.any().optional()";
  if (field.type === "daterange") return "z.object({ start: z.string(), end: z.string() })";
  if (field.type === "matrix") return "z.record(z.string(), z.string()).optional()";

  const rules = ["z.string()"];
  if (field.required) rules.push(`.min(1, ${requiredMessage})`);
  if (field.type === "email") rules.push(".email()");
  if (field.validation?.minLength) rules.push(`.min(${field.validation.minLength})`);
  if (field.validation?.maxLength) rules.push(`.max(${field.validation.maxLength})`);
  const schema = rules.join("");
  return field.required ? schema : `${schema}.optional()`;
}

function renderHtmlField(field: FormField) {
  const id = escapeHtml(field.id);
  const label = escapeHtml(field.label);
  const placeholder = escapeHtml(field.placeholder ?? "");
  const required = field.required ? " required" : "";
  const helper = field.helperText ? `<p class="helper">${escapeHtml(field.helperText)}</p>` : "";

  if (field.type === "section") return `<section class="section"><h2>${label}</h2>${helper}</section>`;
  if (field.type === "divider") return "<hr />";
  if (field.type === "hidden") return `<input type="hidden" name="${id}" value="${escapeHtml(field.settings?.hiddenValue ?? "")}" />`;
  if (field.type === "textarea") return `<label>${label}<textarea name="${id}" placeholder="${placeholder}"${required}></textarea></label>${helper}`;
  if (field.type === "richtext") return `<label>${label}<textarea name="${id}" placeholder="${placeholder}"${required}></textarea></label>${helper}`;
  if (field.type === "dropdown") {
    return `<label>${label}<select name="${id}"${required}><option value="">Select an option</option>${field.options?.map((option) => `<option>${escapeHtml(option)}</option>`).join("") ?? ""}</select></label>${helper}`;
  }
  if (field.type === "radio" || field.type === "checkbox") {
    return `<fieldset><legend>${label}</legend>${field.options?.map((option) => `<label class="choice"><input type="${field.type}" name="${id}" value="${escapeHtml(option)}"${required} /> ${escapeHtml(option)}</label>`).join("") ?? ""}</fieldset>${helper}`;
  }
  if (field.type === "file") return `<label>${label}<input type="file" name="${id}" accept="${escapeHtml(field.settings?.acceptedFileTypes ?? "")}" /></label>${helper}`;
  if (field.type === "rating") {
    const scale = field.settings?.ratingScale ?? 5;
    return `<fieldset><legend>${label}</legend>${Array.from({ length: scale }, (_, index) => `<label class="choice"><input type="radio" name="${id}" value="${index + 1}"${required} /> ${field.settings?.ratingStyle === "emoji" ? "🙂" : "★"} ${index + 1}</label>`).join("")}</fieldset>${helper}`;
  }
  if (field.type === "signature") return `<label>${label}<textarea name="${id}" placeholder="Base64 signature data"${required}></textarea></label>${helper}`;
  if (field.type === "daterange") return `<fieldset><legend>${label}</legend><input type="date" name="${id}_start"${required} /><input type="date" name="${id}_end"${required} /></fieldset>${helper}`;
  if (field.type === "slider") return `<label>${label}<input type="range" name="${id}" min="${field.settings?.sliderMin ?? 0}" max="${field.settings?.sliderMax ?? 100}" step="${field.settings?.sliderStep ?? 1}" /></label>${helper}`;
  if (field.type === "matrix") {
    const rows = field.settings?.matrixRows ?? [];
    const columns = field.settings?.matrixColumns ?? [];
    return `<fieldset><legend>${label}</legend>${rows.map((row) => `<div class="matrix-row"><span>${escapeHtml(row)}</span>${columns.map((column) => `<label class="choice"><input type="radio" name="${id}_${escapeHtml(row)}" value="${escapeHtml(column)}" /> ${escapeHtml(column)}</label>`).join("")}</div>`).join("")}</fieldset>${helper}`;
  }
  if (field.type === "payment") {
    const currencySelect = `<select name="${id}_currency">${currencyCodes.map((currency) => `<option value="${currency}"${currency === (field.settings?.currency ?? "USD") ? " selected" : ""}>${currency}</option>`).join("")}</select>`;
    return `<label>${label}<div class="payment-row">${currencySelect}<input type="number" name="${id}" min="0" step="0.01" placeholder="0.00"${required} /></div></label>${helper}`;
  }
  const type = field.type === "phone" ? "tel" : field.type;
  return `<label>${label}<input type="${type}" name="${id}" placeholder="${placeholder}"${required} /></label>${helper}`;
}

function renderHtmlFieldWithLayout(field: FormField) {
  if (field.type === "hidden") return renderHtmlField(field);
  const layoutClass = (field.layout ?? "full") === "half" ? "field field-half" : "field field-full";
  return `<div class="${layoutClass}">${renderHtmlField(field)}</div>`;
}

export function exportHtml(form: FormSchema) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(form.title)}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; background: #f4f6f8; color: #111418; }
    main { max-width: 720px; margin: 48px auto; padding: 32px; background: #fff; border: 1px solid #d8e0ea; border-radius: 18px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .field-full { grid-column: 1 / -1; }
    .field-half { grid-column: span 1; }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .field-half { grid-column: 1 / -1; } }
    label, fieldset { display: grid; gap: 8px; font-weight: 650; }
    input, textarea, select { width: 100%; border: 1px solid #d8e0ea; border-radius: 12px; padding: 11px 12px; font: inherit; }
    textarea { min-height: 120px; }
    .choice { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .choice input { width: auto; }
    .payment-row { display: grid; grid-template-columns: 132px 1fr; gap: 8px; }
    .helper, p { color: #667085; line-height: 1.6; }
    .section { margin-top: 28px; }
    button { margin-top: 24px; border: 0; border-radius: 12px; padding: 12px 18px; background: #111418; color: #fff; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(form.title)}</h1>
    <p>${escapeHtml(form.description)}</p>
    <form>
      <div class="form-grid">
        ${form.fields.map(renderHtmlFieldWithLayout).join("\n        ")}
      </div>
      <button type="submit">Submit</button>
    </form>
  </main>
</body>
</html>`;
}

export function exportReactComponent(form: FormSchema) {
  const fields = form.fields.filter((field) => inputTypes.includes(field.type));

  return `import { useState } from "react";

type FormValues = {
${fields.map((field) => `  ${quotedKey(field)}: ${fieldTypeForTs(field)};`).join("\n")}
};

export function ${toIdentifier(form.name || "FormCraftForm")}() {
  const [values, setValues] = useState<Partial<FormValues>>({});

  return (
    <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
      <div className="sm:col-span-2">
        <h1>${escapeHtml(form.title)}</h1>
        <p>${escapeHtml(form.description)}</p>
      </div>
${form.fields.map(renderReactFieldWithLayout).join("\n")}
      <button className="sm:col-span-2" type="submit">Submit</button>
    </form>
  );
}
`;
}

function renderReactFieldWithLayout(field: FormField) {
  if (field.type === "hidden") return renderReactField(field);
  const className = (field.layout ?? "full") === "half" ? "sm:col-span-1" : "sm:col-span-2";
  return `      <div className="${className}">\n${renderReactField(field)}\n      </div>`;
}

function renderReactField(field: FormField) {
  const key = keyForField(field);
  const label = field.label.replaceAll('"', '\\"');
  const placeholder = (field.placeholder ?? "").replaceAll('"', '\\"');

  if (field.type === "section") return `      <section><h2>${label}</h2></section>`;
  if (field.type === "divider") return "      <hr />";
  if (field.type === "hidden") return `      <input type="hidden" name="${key}" value="${(field.settings?.hiddenValue ?? "").replaceAll('"', '\\"')}" />`;
  if (field.type === "textarea") return `      <label>${label}<textarea name="${key}" placeholder="${placeholder}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: event.target.value })} /></label>`;
  if (field.type === "richtext") return `      <label>${label}<textarea name="${key}" placeholder="${placeholder}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: event.target.value })} /></label>`;
  if (field.type === "dropdown") {
    return `      <label>${label}<select name="${key}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: event.target.value })}><option value="">Select an option</option>${field.options?.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("") ?? ""}</select></label>`;
  }
  if (field.type === "radio") {
    return `      <fieldset><legend>${label}</legend>${field.options?.map((option) => `<label><input type="radio" name="${key}" value="${escapeHtml(option)}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: event.target.value })} /> ${escapeHtml(option)}</label>`).join("") ?? ""}</fieldset>`;
  }
  if (field.type === "checkbox") {
    return `      <fieldset><legend>${label}</legend>${field.options?.map((option) => `<label><input type="checkbox" value="${escapeHtml(option)}" /> ${escapeHtml(option)}</label>`).join("") ?? ""}</fieldset>`;
  }
  if (field.type === "file") return `      <label>${label}<input type="file" name="${key}" /></label>`;
  if (field.type === "rating") return `      <fieldset><legend>${label}</legend>${Array.from({ length: field.settings?.ratingScale ?? 5 }, (_, index) => `<label><input type="radio" name="${key}" value="${index + 1}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: Number(event.target.value) })} /> ${index + 1}</label>`).join("")}</fieldset>`;
  if (field.type === "signature") return `      <label>${label}<textarea name="${key}" placeholder="Base64 signature data" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: event.target.value })} /></label>`;
  if (field.type === "daterange") return `      <fieldset><legend>${label}</legend><input type="date" name="${key}_start" /><input type="date" name="${key}_end" /></fieldset>`;
  if (field.type === "slider") return `      <label>${label}<input type="range" name="${key}" min="${field.settings?.sliderMin ?? 0}" max="${field.settings?.sliderMax ?? 100}" step="${field.settings?.sliderStep ?? 1}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: Number(event.target.value) })} /></label>`;
  if (field.type === "matrix") return `      <fieldset><legend>${label}</legend><p>Matrix response: ${field.settings?.matrixRows?.join(", ") ?? ""}</p></fieldset>`;
  if (field.type === "payment") return `      <label>${label}<select name="${key}_currency">${currencyCodes.map((currency) => `<option value="${currency}"${currency === (field.settings?.currency ?? "USD") ? " selected" : ""}>${currency}</option>`).join("")}</select><input type="number" min="0" step="0.01" name="${key}" placeholder="0.00" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: Number(event.target.value) })} /></label>`;
  const type = field.type === "phone" ? "tel" : field.type;
  return `      <label>${label}<input type="${type}" name="${key}" placeholder="${placeholder}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: event.target.value })} /></label>`;
}

export function exportZodSchema(form: FormSchema) {
  const fields = form.fields.filter((field) => inputTypes.includes(field.type));
  return `import { z } from "zod";

export const ${toIdentifier(form.name || "form")}Schema = z.object({
${fields.map((field) => `  ${quotedKey(field)}: ${fieldSchemaForZod(field)},`).join("\n")}
});

export type ${toIdentifier(form.name || "Form")}Values = z.infer<typeof ${toIdentifier(form.name || "form")}Schema>;
`;
}

export function exportTypescriptType(form: FormSchema) {
  const fields = form.fields.filter((field) => inputTypes.includes(field.type));
  return `export type ${toIdentifier(form.name || "FormCraft")}Response = {
${fields.map((field) => `  ${quotedKey(field)}${field.required ? "" : "?"}: ${fieldTypeForTs(field)};`).join("\n")}
};
`;
}
