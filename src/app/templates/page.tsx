"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Layers, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { templates, type TemplateSchema } from "@/lib/templates";
import { useFormStore } from "@/store/form-store";
import type { FormField, FormSchema } from "@/types/form";

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

export default function TemplatesPage() {
  const router = useRouter();
  const replaceForm = useFormStore((state) => state.replaceForm);

  const handleUseTemplate = (template: TemplateSchema) => {
    replaceForm(instantiateTemplate(template));
    router.push("/builder");
  };

  return (
    <AppShell>
      <main className="min-h-screen overflow-hidden p-4 sm:p-6">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-[#d8e0ea] bg-[#111418] p-5 text-white shadow-[0_24px_70px_rgba(17,24,39,0.18)] sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,255,99,0.2),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(91,141,239,0.28),transparent_30%)]" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/76">
                <Sparkles size={14} />
                Conversion-ready schemas
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Templates</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                Modern form blueprints with advanced fields, multi-step structure, validation, metadata capture and polished preview behavior.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-semibold">{templates.length}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Templates</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{templates.reduce((total, template) => total + template.fields.length, 0)}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Fields</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">2</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Steps</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const stepCount = new Set(template.fields.map((field) => field.step ?? 1)).size;
            const advancedCount = template.fields.filter((field) =>
              ["rating", "signature", "daterange", "slider", "richtext", "matrix", "hidden", "payment"].includes(field.type)
            ).length;

            return (
              <article key={template.id} className="card-hover group overflow-hidden rounded-3xl border border-[#d8e0ea] bg-white/92 shadow-sm">
                <div className={`h-2 bg-gradient-to-r ${template.gradient}`} />
                <div className="p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${template.gradient} text-white shadow-lg`}>
                      <Layers size={20} />
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-[#f1f4f8] px-3 py-1 text-xs font-semibold text-[#4b5563]">{template.category}</span>
                      <p className="mt-2 text-xs font-medium text-[#98a2b3]">{template.badge}</p>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-[#15161a]">{template.name}</h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-[#667085]">{template.summary}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.highlights.map((highlight) => (
                      <span key={highlight} className="inline-flex items-center gap-1 rounded-full border border-[#d8e0ea] bg-[#fbfcfe] px-2.5 py-1 text-xs font-semibold text-[#465366]">
                        <BadgeCheck size={12} />
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-[#eef2f7] bg-[#f8fafc] p-3">
                    <div>
                      <p className="text-base font-semibold text-[#111418]">{template.fields.length}</p>
                      <p className="text-[11px] text-[#667085]">fields</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#111418]">{stepCount}</p>
                      <p className="text-[11px] text-[#667085]">steps</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#111418]">{advancedCount}</p>
                      <p className="text-[11px] text-[#667085]">advanced</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#eef2f7] pt-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">Ready to edit</span>
                    <Button variant="secondary" onClick={() => handleUseTemplate(template)}>
                      Use template
                      <ArrowRight size={16} />
                    </Button>
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
