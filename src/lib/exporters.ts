import type { FieldType, FormField, FormSchema } from "@/types/form";

const inputTypes: FieldType[] = ["text", "email", "phone", "textarea", "number", "dropdown", "radio", "checkbox", "date", "file"];

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
  if (field.type === "number") return "number";
  if (field.type === "checkbox") return "string[]";
  if (field.type === "file") return "File | null";
  return "string";
}

function fieldSchemaForZod(field: FormField) {
  const requiredMessage = "{ message: \"This field is required\" }";

  if (field.type === "number") {
    const rules = ["z.coerce.number()"];
    if (field.validation?.min !== undefined) rules.push(`.min(${field.validation.min})`);
    if (field.validation?.max !== undefined) rules.push(`.max(${field.validation.max})`);
    return field.required ? rules.join("") : `${rules.join("")}.optional()`;
  }

  if (field.type === "checkbox") {
    return field.required ? `z.array(z.string()).min(1, ${requiredMessage})` : "z.array(z.string()).optional()";
  }

  if (field.type === "file") return "z.any().optional()";

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
  if (field.type === "textarea") return `<label>${label}<textarea name="${id}" placeholder="${placeholder}"${required}></textarea></label>${helper}`;
  if (field.type === "dropdown") {
    return `<label>${label}<select name="${id}"${required}><option value="">Select an option</option>${field.options?.map((option) => `<option>${escapeHtml(option)}</option>`).join("") ?? ""}</select></label>${helper}`;
  }
  if (field.type === "radio" || field.type === "checkbox") {
    return `<fieldset><legend>${label}</legend>${field.options?.map((option) => `<label class="choice"><input type="${field.type}" name="${id}" value="${escapeHtml(option)}"${required} /> ${escapeHtml(option)}</label>`).join("") ?? ""}</fieldset>${helper}`;
  }
  if (field.type === "file") return `<label>${label}<input type="file" name="${id}" /></label>${helper}`;
  const type = field.type === "phone" ? "tel" : field.type;
  return `<label>${label}<input type="${type}" name="${id}" placeholder="${placeholder}"${required} /></label>${helper}`;
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
    label, fieldset { display: grid; gap: 8px; margin-top: 18px; font-weight: 650; }
    input, textarea, select { width: 100%; border: 1px solid #d8e0ea; border-radius: 12px; padding: 11px 12px; font: inherit; }
    textarea { min-height: 120px; }
    .choice { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .choice input { width: auto; }
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
      ${form.fields.map(renderHtmlField).join("\n      ")}
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
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div>
        <h1>${escapeHtml(form.title)}</h1>
        <p>${escapeHtml(form.description)}</p>
      </div>
${form.fields.map(renderReactField).join("\n")}
      <button type="submit">Submit</button>
    </form>
  );
}
`;
}

function renderReactField(field: FormField) {
  const key = keyForField(field);
  const label = field.label.replaceAll('"', '\\"');
  const placeholder = (field.placeholder ?? "").replaceAll('"', '\\"');

  if (field.type === "section") return `      <section><h2>${label}</h2></section>`;
  if (field.type === "divider") return "      <hr />";
  if (field.type === "textarea") return `      <label>${label}<textarea name="${key}" placeholder="${placeholder}" onChange={(event) => setValues({ ...values, ${quotedKey(field)}: event.target.value })} /></label>`;
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

function pdfEscape(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "").replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function wrapText(text: string, max = 84) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    if (`${line} ${word}`.trim().length > max) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  });
  if (line) lines.push(line);
  return lines;
}

export function exportPdf(form: FormSchema) {
  const lines = [
    form.title,
    form.description,
    "",
    ...form.fields.flatMap((field, index) => [
      `${index + 1}. ${field.label} (${field.type}${field.required ? ", required" : ""})`,
      field.helperText ? `   ${field.helperText}` : "",
      field.options?.length ? `   Options: ${field.options.join(", ")}` : ""
    ])
  ].flatMap((line) => wrapText(line)).filter(Boolean);

  const content = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    ...lines.flatMap((line, index) => [
      index === 1 ? "/F1 11 Tf" : index === 3 ? "/F1 12 Tf" : "",
      `(${pdfEscape(line)}) Tj`,
      "0 -18 Td"
    ]),
    "ET"
  ].filter(Boolean).join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}
