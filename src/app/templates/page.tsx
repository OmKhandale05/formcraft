"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Handshake, MessageSquareText, SearchCheck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { templates, type TemplateSchema } from "@/lib/templates";
import { useFormStore } from "@/store/form-store";
import type { FieldType, FormField, FormSchema } from "@/types/form";

const categoryIcons = {
  Support: MessageSquareText,
  Hiring: UsersRound,
  Events: CalendarDays,
  Product: SearchCheck,
  Sales: BriefcaseBusiness
} as const;

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  email: "Email",
  phone: "Phone",
  textarea: "Long answer",
  number: "Number",
  dropdown: "Dropdown",
  radio: "Choice",
  checkbox: "Multi-choice",
  date: "Date",
  file: "Upload",
  rating: "Rating",
  signature: "Signature",
  daterange: "Date range",
  slider: "Slider",
  richtext: "Rich text",
  matrix: "Matrix",
  hidden: "Hidden",
  payment: "Payment",
  formula: "Formula",
  section: "Section",
  divider: "Divider"
};

function cloneField(field: FormField): FormField {
  return {
    ...field,
    id: `${field.id}-${crypto.randomUUID()}`,
    options: field.options ? [...field.options] : undefined,
    validation: field.validation ? { ...field.validation } : undefined,
    settings: field.settings
      ? {
          ...field.settings,
          matrixRows: field.settings.matrixRows ? [...field.settings.matrixRows] : undefined,
          matrixColumns: field.settings.matrixColumns ? [...field.settings.matrixColumns] : undefined
        }
      : undefined
  };
}

function instantiateTemplate(template: TemplateSchema): FormSchema {
  return {
    id: `form-${crypto.randomUUID()}`,
    name: template.name,
    title: template.title,
    description: template.description,
    theme: { ...template.theme },
    updatedAt: new Date().toISOString(),
    fields: template.fields.map(cloneField)
  };
}

function TemplatePreview({ template }: { template: TemplateSchema }) {
  const previewFields = template.fields.filter((field) => !["section", "divider", "hidden"].includes(field.type)).slice(0, 4);

  return (
    <div className="mt-5 border-t border-[#e8edf3] pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">Preview flow</p>
      <div className="space-y-2.5">
        {previewFields.map((field) => (
          <div key={field.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#20242b]">{field.label}</p>
              <p className="text-xs text-[#7b8492]">{fieldTypeLabels[field.type]}</p>
            </div>
            <span className="h-2 w-16 shrink-0 rounded-full bg-[#d8e0ea]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const replaceForm = useFormStore((state) => state.replaceForm);

  const handleUseTemplate = (template: TemplateSchema) => {
    replaceForm(instantiateTemplate(template));
    router.push("/builder");
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#f6f7f9] px-4 py-6 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-white px-3 py-1 text-xs font-semibold text-[#465366] shadow-sm">
              <Handshake size={14} />
              Built around real team workflows
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-[#111418] sm:text-4xl">
              Start with a form that already understands the job.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
              Pick a template shaped around the moment: hiring a candidate, qualifying a lead, hosting an event, or learning from customers. Each one opens in the builder ready to edit.
            </p>
          </div>
          <div className="grid gap-3 rounded-3xl border border-[#d8e0ea] bg-white p-4 shadow-sm sm:grid-cols-3">
            {[
              ["Advanced fields", "Ratings, files, payments"],
              ["Editable schema", "Every field is reusable"],
              ["Local workflow", "Saved in your browser"]
            ].map(([title, copy]) => (
              <div key={title}>
                <p className="text-sm font-semibold text-[#111418]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#667085]">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-6 grid max-w-7xl gap-4 lg:grid-cols-2">
          {templates.map((template, index) => {
            const Icon = categoryIcons[template.category as keyof typeof categoryIcons] ?? BadgeCheck;
            const advancedCount = template.fields.filter((field) =>
              ["rating", "signature", "daterange", "slider", "richtext", "matrix", "hidden", "payment"].includes(field.type)
            ).length;

            return (
              <article
                key={template.id}
                className={cn(
                  "group overflow-hidden rounded-3xl border border-[#d8e0ea] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#c5d0dc] hover:shadow-[0_22px_60px_rgba(17,24,39,0.11)]",
                  index === 0 && "lg:col-span-2"
                )}
              >
                <div className="grid min-h-full lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                  <div className={cn("flex flex-col justify-between gap-8 p-5 text-white sm:p-6", `bg-gradient-to-br ${template.gradient}`)}>
                    <div>
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/18">
                          <Icon size={20} />
                        </div>
                        <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold text-white/82 ring-1 ring-white/16">
                          {template.badge}
                        </span>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{template.category}</p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight">{template.name}</h2>
                      <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{template.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.highlights.map((highlight) => (
                        <span key={highlight} className="rounded-full bg-white/13 px-3 py-1 text-xs font-semibold text-white/78 ring-1 ring-white/14">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-5 sm:p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-xs font-semibold text-[#3157d5]">
                          {template.fields.length} fields
                        </span>
                        <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-semibold text-[#0f766e]">
                          {advancedCount} advanced
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-[#111418]">{template.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#667085]">{template.description}</p>
                      <TemplatePreview template={template} />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2f7] pt-4">
                      <p className="text-xs leading-5 text-[#7b8492]">Best starting point for {template.category.toLowerCase()} teams.</p>
                      <Button variant="secondary" onClick={() => handleUseTemplate(template)}>
                        Use template
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </AppShell>
  );
}
