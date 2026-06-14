"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CopyPlus,
  Eye,
  Handshake,
  LayoutGrid,
  MessageSquareText,
  Paintbrush,
  Search,
  SearchCheck,
  Sparkles,
  UsersRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { FormRenderer } from "@/components/form-renderer";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { templates, type TemplateSchema } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { FieldType, FormField, FormSchema } from "@/types/form";

const customTemplateStorageKey = "formcraft-custom-templates";

const categoryIcons = {
  All: LayoutGrid,
  Support: MessageSquareText,
  Hiring: UsersRound,
  Events: CalendarDays,
  Product: SearchCheck,
  Sales: BriefcaseBusiness,
  Custom: CopyPlus
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

type GalleryTemplate = TemplateSchema & {
  isCustom?: boolean;
};

type TemplateMode = "keep" | "single";

type TemplateDraft = {
  accentColor: string;
  mode: TemplateMode;
  name: string;
  templateId: string;
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
          matrixColumns: field.settings.matrixColumns ? [...field.settings.matrixColumns] : undefined,
          matrixHiddenRows: field.settings.matrixHiddenRows ? [...field.settings.matrixHiddenRows] : undefined,
          matrixDropdownOptions: field.settings.matrixDropdownOptions ? [...field.settings.matrixDropdownOptions] : undefined,
          matrixColumnDescriptions: field.settings.matrixColumnDescriptions ? { ...field.settings.matrixColumnDescriptions } : undefined,
          matrixColumnWidths: field.settings.matrixColumnWidths ? { ...field.settings.matrixColumnWidths } : undefined
        }
      : undefined
  };
}

function cloneFormFields(fields: FormField[]) {
  return fields.map(cloneField);
}

function instantiateTemplate(template: TemplateSchema, custom: { name: string; accentColor: string; mode: TemplateMode }): FormSchema {
  const fields = cloneFormFields(template.fields).map((field) => (custom.mode === "single" ? { ...field, step: 1 } : field));
  return {
    id: `form-${crypto.randomUUID()}`,
    name: custom.name || template.name,
    title: custom.name || template.title,
    description: template.description,
    theme: { ...template.theme, accentColor: custom.accentColor },
    updatedAt: new Date().toISOString(),
    fields,
    logicRules: template.logicRules?.map((rule) => ({ ...rule, id: `logic-${crypto.randomUUID()}`, targetFieldIds: [...rule.targetFieldIds] }))
  };
}

function templateStats(template: TemplateSchema) {
  const inputFields = template.fields.filter((field) => !["section", "divider", "hidden"].includes(field.type));
  const advancedFields = template.fields.filter((field) => ["rating", "signature", "daterange", "slider", "richtext", "matrix", "hidden", "payment", "formula"].includes(field.type));
  const steps = new Set(template.fields.map((field) => field.step ?? 1)).size;
  const required = inputFields.filter((field) => field.required).length;
  const health = Math.min(98, Math.round(72 + Math.min(advancedFields.length * 3, 12) + Math.min(steps * 3, 8) + (template.description ? 4 : 0) - Math.max(required - 6, 0) * 2));
  const completionMinutes = Math.max(2, Math.ceil(inputFields.length * 0.45));
  return { advancedFields, completionMinutes, health, inputFields, required, steps };
}

function templateTags(template: TemplateSchema) {
  const stats = templateStats(template);
  return [
    stats.steps > 1 ? "Multi-step" : "Single-step",
    stats.advancedFields.length ? "Advanced fields" : "Simple",
    template.fields.some((field) => field.type === "payment") ? "Payment-ready" : null,
    template.fields.some((field) => field.type === "matrix") ? "Research-ready" : null,
    template.logicRules?.length ? "Logic included" : null,
    stats.health >= 90 ? "High health" : null
  ].filter(Boolean) as string[];
}

function previewFields(template: TemplateSchema) {
  return template.fields.filter((field) => !["section", "divider", "hidden"].includes(field.type)).slice(0, 6);
}

function buildCustomTemplate(form: FormSchema, summary: string): GalleryTemplate {
  return {
    ...form,
    id: `custom-${crypto.randomUUID()}`,
    name: form.name || form.title || "Custom template",
    title: form.title || form.name || "Custom template",
    description: form.description || "Saved from your current FormCraft workspace.",
    category: "Custom",
    badge: "My template",
    summary: summary || "Saved from your current builder workspace.",
    gradient: "from-[#111418] via-[#3157d5] to-[#0f766e]",
    highlights: ["Saved locally", `${form.fields.length} fields`, "Reusable"],
    isCustom: true,
    updatedAt: new Date().toISOString(),
    theme: { ...form.theme },
    fields: cloneFormFields(form.fields)
  };
}

function TemplateMetrics({ template }: { template: TemplateSchema }) {
  const stats = templateStats(template);
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        [`${stats.inputFields.length}`, "fields"],
        [`${stats.completionMinutes}m`, "estimate"],
        [`${stats.health}`, "health"]
      ].map(([value, label]) => (
        <div key={label} className="rounded-xl border border-[#e2e8f0] bg-white/78 p-3">
          <p className="text-base font-bold text-[#111418]">{value}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a94a6]">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const form = useFormStore((state) => state.form);
  const replaceForm = useFormStore((state) => state.replaceForm);
  const [customTemplates, setCustomTemplates] = useState<GalleryTemplate[]>([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft | null>(null);
  const [customSummary, setCustomSummary] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(customTemplateStorageKey) || "[]") as GalleryTemplate[];
        setCustomTemplates(saved);
      } catch {
        setCustomTemplates([]);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const allTemplates = useMemo<GalleryTemplate[]>(() => [...templates, ...customTemplates], [customTemplates]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(allTemplates.map((template) => template.category)))], [allTemplates]);
  const selectedTemplate = allTemplates.find((template) => template.id === selectedTemplateId) ?? allTemplates[0];
  const selectedStats = selectedTemplate ? templateStats(selectedTemplate) : null;
  const draftName = templateDraft?.templateId === selectedTemplate?.id ? templateDraft.name : (selectedTemplate?.name ?? "");
  const draftAccentColor = templateDraft?.templateId === selectedTemplate?.id ? templateDraft.accentColor : (selectedTemplate?.theme.accentColor ?? "#2563eb");
  const draftMode = templateDraft?.templateId === selectedTemplate?.id ? templateDraft.mode : "keep";
  const previewTemplate = useMemo<TemplateSchema | null>(() => {
    if (!selectedTemplate) return null;
    return {
      ...selectedTemplate,
      name: draftName || selectedTemplate.name,
      title: draftName || selectedTemplate.title,
      theme: { ...selectedTemplate.theme, accentColor: draftAccentColor },
      fields: selectedTemplate.fields.map((field) => (draftMode === "single" ? { ...field, step: 1 } : field))
    };
  }, [draftAccentColor, draftMode, draftName, selectedTemplate]);

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesCategory = category === "All" || template.category === category;
    const searchable = `${template.name} ${template.title} ${template.description} ${template.summary} ${template.category} ${template.highlights.join(" ")}`.toLowerCase();
    return matchesCategory && searchable.includes(query.toLowerCase().trim());
  });

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    const nextTemplate = allTemplates.find((template) => nextCategory === "All" || template.category === nextCategory);
    if (nextTemplate) setSelectedTemplateId(nextTemplate.id);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    replaceForm(instantiateTemplate(selectedTemplate, { accentColor: draftAccentColor, mode: draftMode, name: draftName }));
    router.push("/builder");
  };

  const updateTemplateDraft = (patch: Partial<Omit<TemplateDraft, "templateId">>) => {
    if (!selectedTemplate) return;
    setTemplateDraft((current) => ({
      accentColor: current?.templateId === selectedTemplate.id ? current.accentColor : selectedTemplate.theme.accentColor,
      mode: current?.templateId === selectedTemplate.id ? current.mode : "keep",
      name: current?.templateId === selectedTemplate.id ? current.name : selectedTemplate.name,
      templateId: selectedTemplate.id,
      ...patch
    }));
  };

  const saveCurrentAsTemplate = () => {
    const nextTemplate = buildCustomTemplate(form, customSummary);
    const next = [nextTemplate, ...customTemplates].slice(0, 12);
    setCustomTemplates(next);
    window.localStorage.setItem(customTemplateStorageKey, JSON.stringify(next));
    setSelectedTemplateId(nextTemplate.id);
    setCategory("Custom");
    setCustomSummary("");
  };

  const deleteCustomTemplate = (id: string) => {
    const next = customTemplates.filter((template) => template.id !== id);
    setCustomTemplates(next);
    window.localStorage.setItem(customTemplateStorageKey, JSON.stringify(next));
    if (selectedTemplateId === id) setSelectedTemplateId(templates[0]?.id ?? "");
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#f6f7f9] px-4 py-6 sm:px-6">
        <section className="mx-auto max-w-7xl">
          <div className="grid gap-5 rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#465366]">
                <Handshake size={14} />
                Template gallery
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#111418] sm:text-4xl">
                Start with a template, then tune it before it enters the builder.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">
                Browse by workflow, inspect the schema, preview the form, customize key settings, and save your own reusable templates locally.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d8e0ea] bg-[#fbfcfe] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                <Sparkles size={16} />
                Recommendation
              </p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                For portfolio demos, use templates with advanced fields and multi-step flows. They show schema design, UI states, and product thinking faster.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-6 grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="min-w-0">
            <div className="sticky top-0 z-10 mb-4 rounded-2xl border border-[#d8e0ea] bg-white/90 p-3 shadow-sm backdrop-blur">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" size={16} />
                  <Input className="pl-9" placeholder="Search templates, fields or use cases" value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
                <Select value={category} onChange={(event) => handleCategoryChange(event.target.value)}>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="formcraft-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                {categories.map((item) => {
                  const Icon = categoryIcons[item as keyof typeof categoryIcons] ?? BadgeCheck;
                  const active = category === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
                        active ? "border-[#111418] bg-[#111418] text-white" : "border-[#d8e0ea] bg-white text-[#465366] hover:border-[#bfcadc]"
                      )}
                      onClick={() => handleCategoryChange(item)}
                    >
                      <Icon size={14} />
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 2xl:grid-cols-2">
              {filteredTemplates.map((template) => {
                const Icon = categoryIcons[template.category as keyof typeof categoryIcons] ?? BadgeCheck;
                const selected = selectedTemplate?.id === template.id;
                return (
                  <article
                    key={template.id}
                    className={cn(
                      "overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(17,24,39,0.11)]",
                      selected ? "border-[#3157d5] ring-4 ring-[#3157d5]/10" : "border-[#d8e0ea] hover:border-[#c5d0dc]"
                    )}
                  >
                    <button type="button" className="block w-full text-left" onClick={() => setSelectedTemplateId(template.id)}>
                      <div className={cn("p-5 text-white", `bg-gradient-to-br ${template.gradient}`)}>
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/18">
                            <Icon size={20} />
                          </div>
                          <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold text-white/82 ring-1 ring-white/16">
                            {template.badge}
                          </span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{template.category}</p>
                        <h2 className="mt-3 text-xl font-semibold tracking-tight">{template.name}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/72">{template.summary}</p>
                      </div>
                      <div className="p-5">
                        <div className="mb-4 flex flex-wrap gap-2">
                          {templateTags(template).slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold text-[#465366]">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <TemplateMetrics template={template} />
                        <div className="mt-5 border-t border-[#eef2f7] pt-4">
                          <p className="text-sm font-semibold text-[#111418]">{template.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#667085]">{template.description}</p>
                        </div>
                      </div>
                    </button>
                    {template.isCustom && (
                      <div className="border-t border-[#eef2f7] px-5 py-3">
                        <Button type="button" size="sm" variant="danger" onClick={() => deleteCustomTemplate(template.id)}>
                          <X size={14} />
                          Delete custom
                        </Button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {!filteredTemplates.length && (
              <div className="rounded-3xl border border-dashed border-[#bfcadc] bg-white p-8 text-center">
                <SearchCheck className="mx-auto text-[#98a2b3]" size={28} />
                <p className="mt-3 text-sm font-semibold text-[#111418]">No templates found</p>
                <p className="mt-1 text-sm text-[#667085]">Try another category or search term.</p>
              </div>
            )}
          </div>

          <aside className="min-w-0">
            <div className="sticky top-6 space-y-4">
              {selectedTemplate && selectedStats && previewTemplate && (
                <div className="overflow-hidden rounded-3xl border border-[#d8e0ea] bg-white shadow-sm">
                  <div className="border-b border-[#eef2f7] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98a2b3]">Template preview</p>
                        <h2 className="mt-2 text-xl font-semibold text-[#111418]">{previewTemplate.name}</h2>
                        <p className="mt-2 text-sm leading-6 text-[#667085]">{previewTemplate.description}</p>
                      </div>
                      <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-bold text-[#0f766e]">{selectedStats.health} health</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {templateTags(previewTemplate).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold text-[#465366]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="formcraft-scrollbar max-h-[360px] overflow-y-auto p-4">
                    <FormRenderer form={previewTemplate} compact />
                  </div>

                  <div className="border-t border-[#eef2f7] p-5">
                    <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#111418]">
                      <Eye size={16} />
                      Schema at a glance
                    </p>
                    <div className="space-y-2">
                      {previewFields(previewTemplate).map((field) => (
                        <div key={field.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e5e9ef] bg-[#fbfcfe] px-3 py-2">
                          <span className="min-w-0 truncate text-sm font-semibold text-[#20242b]">{field.label}</span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#667085] ring-1 ring-[#d8e0ea]">
                            {fieldTypeLabels[field.type]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate && (
                <div className="rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-sm">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                    <Paintbrush size={16} />
                    Customize before use
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="template-name">Form name</Label>
                      <Input id="template-name" className="mt-2" value={draftName} onChange={(event) => updateTemplateDraft({ name: event.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="template-color">Accent color</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Input id="template-color" type="color" className="h-10 w-14 p-1" value={draftAccentColor} onChange={(event) => updateTemplateDraft({ accentColor: event.target.value })} />
                        <Input value={draftAccentColor} onChange={(event) => updateTemplateDraft({ accentColor: event.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="template-mode">Step mode</Label>
                      <Select id="template-mode" className="mt-2" value={draftMode} onChange={(event) => updateTemplateDraft({ mode: event.target.value as TemplateMode })}>
                        <option value="keep">Keep template steps</option>
                        <option value="single">Convert to single step</option>
                      </Select>
                    </div>
                    <Button type="button" variant="primary" className="w-full" onClick={handleUseTemplate}>
                      Use template
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-sm">
                <p className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                  <CopyPlus size={16} />
                  Save current form as template
                </p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">Turn the form currently in Builder into a reusable local template.</p>
                <Textarea
                  className="mt-3 min-h-20"
                  placeholder="Add a short use case note for this custom template"
                  value={customSummary}
                  onChange={(event) => setCustomSummary(event.target.value)}
                />
                <Button type="button" variant="secondary" className="mt-3 w-full" onClick={saveCurrentAsTemplate}>
                  <CheckCircle2 size={16} />
                  Save as custom template
                </Button>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-[#667085]">
                  <Clock3 size={13} />
                  Stored locally in this browser.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
