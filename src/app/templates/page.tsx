"use client";

import { ArrowRight, Layers } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { templates } from "@/lib/templates";
import { useFormStore } from "@/store/form-store";

export default function TemplatesPage() {
  const replaceForm = useFormStore((state) => state.replaceForm);

  return (
    <AppShell>
      <main className="min-h-screen p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#15161a]">Templates</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#68707d]">
            Product-ready starter schemas for common startup workflows. Use one, then customize it in the builder.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article key={template.id} className="rounded-xl border border-[#dce1e8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg text-white" style={{ background: template.theme.accentColor }}>
                  <Layers size={20} />
                </div>
                <span className="rounded-full bg-[#f1f4f8] px-3 py-1 text-xs font-medium text-[#4b5563]">{template.category}</span>
              </div>
              <h2 className="text-lg font-semibold text-[#15161a]">{template.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[#68707d]">{template.summary}</p>
              <div className="mt-5 flex items-center justify-between border-t border-[#eef2f7] pt-4">
                <span className="text-sm text-[#68707d]">{template.fields.length} fields</span>
                <Button
                  variant="secondary"
                  onClick={() =>
                    replaceForm({
                      ...template,
                      id: `form-${crypto.randomUUID()}`,
                      name: template.name,
                      fields: template.fields.map((field) => ({ ...field, id: `${field.id}-${crypto.randomUUID()}` }))
                    })
                  }
                >
                  Use template
                  <ArrowRight size={16} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
