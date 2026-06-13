"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormField, FormSchema, FormTheme, FormVersion, LogicRule, PublishedForm, Submission } from "@/types/form";
import { defaultForm } from "@/lib/templates";
import { slugify } from "@/lib/utils";

type FormStore = {
  form: FormSchema;
  selectedFieldId: string | null;
  selectedFieldIds: string[];
  submissions: Submission[];
  versions: FormVersion[];
  publishedForm: PublishedForm;
  setSelectedField: (id: string | null) => void;
  toggleFieldSelection: (id: string) => void;
  clearSelection: () => void;
  setFormMeta: (updates: Partial<Pick<FormSchema, "name" | "title" | "description">>) => void;
  setTheme: (theme: Partial<FormTheme>) => void;
  addLogicRule: () => void;
  updateLogicRule: (id: string, updates: Partial<LogicRule>) => void;
  deleteLogicRule: (id: string) => void;
  addField: (field: FormField, index?: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  duplicateField: (id: string) => void;
  duplicateSelectedFields: () => void;
  deleteField: (id: string) => void;
  deleteSelectedFields: () => void;
  deleteForm: () => void;
  updateSelectedFields: (updates: Partial<FormField>) => void;
  reorderFields: (from: number, to: number) => void;
  replaceForm: (form: FormSchema) => void;
  saveVersion: (name?: string, note?: string) => void;
  restoreVersion: (id: string) => void;
  duplicateVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  publishForm: () => void;
  unpublishForm: () => void;
  updatePublishSlug: (slug: string) => void;
  updatePublishDestinations: (destinations: PublishedForm["destinations"]) => void;
  addSubmission: (values: Record<string, unknown>) => void;
  clearSubmissions: () => void;
};

const stamp = (form: FormSchema): FormSchema => ({ ...form, updatedAt: new Date().toISOString() });

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      form: defaultForm,
      selectedFieldId: null,
      selectedFieldIds: [],
      submissions: [],
      versions: [],
      publishedForm: {
        published: false,
        slug: slugify(defaultForm.name),
        destinations: ["inbox"]
      },
      setSelectedField: (id) => set({ selectedFieldId: id, selectedFieldIds: id ? [id] : [] }),
      toggleFieldSelection: (id) =>
        set((state) => {
          const selected = state.selectedFieldIds.includes(id)
            ? state.selectedFieldIds.filter((fieldId) => fieldId !== id)
            : [...state.selectedFieldIds, id];
          return { selectedFieldIds: selected, selectedFieldId: selected.at(-1) ?? null };
        }),
      clearSelection: () => set({ selectedFieldId: null, selectedFieldIds: [] }),
      setFormMeta: (updates) =>
        set((state) => ({
          form: stamp({ ...state.form, ...updates })
        })),
      setTheme: (theme) =>
        set((state) => ({
          form: stamp({ ...state.form, theme: { ...state.form.theme, ...theme } })
        })),
      addLogicRule: () =>
        set((state) => {
          const fields = state.form.fields.filter((field) => !["section", "divider", "hidden", "formula"].includes(field.type));
          const sourceField = fields[0];
          const targetField = fields.find((field) => field.id !== sourceField?.id);
          if (!sourceField || !targetField) return state;
          const rule: LogicRule = {
            id: `logic-${crypto.randomUUID()}`,
            name: `Rule ${(state.form.logicRules?.length ?? 0) + 1}`,
            enabled: true,
            sourceFieldId: sourceField.id,
            operator: "equals",
            value: sourceField.options?.[0] ?? "",
            action: "show",
            targetFieldIds: [targetField.id]
          };
          return { form: stamp({ ...state.form, logicRules: [...(state.form.logicRules ?? []), rule] }) };
        }),
      updateLogicRule: (id, updates) =>
        set((state) => ({
          form: stamp({
            ...state.form,
            logicRules: (state.form.logicRules ?? []).map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
          })
        })),
      deleteLogicRule: (id) =>
        set((state) => ({
          form: stamp({ ...state.form, logicRules: (state.form.logicRules ?? []).filter((rule) => rule.id !== id) })
        })),
      addField: (field, index) =>
        set((state) => {
          const fields = [...state.form.fields];
          if (typeof index === "number") fields.splice(index, 0, field);
          else fields.push(field);
          return { form: stamp({ ...state.form, fields }), selectedFieldId: field.id, selectedFieldIds: [field.id] };
        }),
      updateField: (id, updates) =>
        set((state) => ({
          form: stamp({
            ...state.form,
            fields: state.form.fields.map((field) => (field.id === id ? { ...field, ...updates } : field))
          })
        })),
      duplicateField: (id) =>
        set((state) => {
          const index = state.form.fields.findIndex((field) => field.id === id);
          if (index === -1) return state;
          const copy = {
            ...state.form.fields[index],
            id: `${state.form.fields[index].type}-${crypto.randomUUID()}`,
            label: `${state.form.fields[index].label} copy`
          };
          const fields = [...state.form.fields];
          fields.splice(index + 1, 0, copy);
          return { form: stamp({ ...state.form, fields }), selectedFieldId: copy.id, selectedFieldIds: [copy.id] };
        }),
      duplicateSelectedFields: () =>
        set((state) => {
          const selected = new Set(state.selectedFieldIds);
          if (!selected.size) return state;
          const copiedIds: string[] = [];
          const fields = state.form.fields.flatMap((field) => {
            if (!selected.has(field.id)) return [field];
            const copy = {
              ...field,
              id: `${field.type}-${crypto.randomUUID()}`,
              label: `${field.label} copy`
            };
            copiedIds.push(copy.id);
            return [field, copy];
          });
          return { form: stamp({ ...state.form, fields }), selectedFieldId: copiedIds.at(-1) ?? null, selectedFieldIds: copiedIds };
        }),
      deleteField: (id) =>
        set((state) => {
          const selectedFieldIds = state.selectedFieldIds.filter((fieldId) => fieldId !== id);
          return {
            form: stamp({
              ...state.form,
              fields: state.form.fields.filter((field) => field.id !== id),
              logicRules: (state.form.logicRules ?? [])
                .map((rule) => ({
                  ...rule,
                  targetFieldIds: rule.targetFieldIds.filter((targetId) => targetId !== id)
                }))
                .filter((rule) => rule.sourceFieldId !== id && rule.targetFieldIds.length)
            }),
            selectedFieldId: state.selectedFieldId === id ? selectedFieldIds.at(-1) ?? null : state.selectedFieldId,
            selectedFieldIds
          };
        }),
      deleteSelectedFields: () =>
        set((state) => {
          const selected = new Set(state.selectedFieldIds);
          if (!selected.size) return state;
          return {
            form: stamp({
              ...state.form,
              fields: state.form.fields.filter((field) => !selected.has(field.id)),
              logicRules: (state.form.logicRules ?? [])
                .map((rule) => ({
                  ...rule,
                  targetFieldIds: rule.targetFieldIds.filter((targetId) => !selected.has(targetId))
                }))
                .filter((rule) => !selected.has(rule.sourceFieldId) && rule.targetFieldIds.length)
            }),
            selectedFieldId: null,
            selectedFieldIds: []
          };
        }),
      deleteForm: () =>
        set((state) => ({
          form: stamp({ ...state.form, fields: [], logicRules: [] }),
          selectedFieldId: null,
          selectedFieldIds: [],
          submissions: []
        })),
      updateSelectedFields: (updates) =>
        set((state) => {
          const selected = new Set(state.selectedFieldIds);
          if (!selected.size) return state;
          return {
            form: stamp({
              ...state.form,
              fields: state.form.fields.map((field) => (selected.has(field.id) ? { ...field, ...updates } : field))
            })
          };
        }),
      reorderFields: (from, to) =>
        set((state) => {
          const fields = [...state.form.fields];
          const [moved] = fields.splice(from, 1);
          fields.splice(to, 0, moved);
          return { form: stamp({ ...state.form, fields }) };
        }),
      replaceForm: (form) =>
        set({
          form: stamp({
            ...form,
            id: form.id || `form-${crypto.randomUUID()}`
          }),
          selectedFieldId: null,
          selectedFieldIds: []
        }),
      saveVersion: (name, note) =>
        set((state) => {
          const createdAt = new Date().toISOString();
          const version: FormVersion = {
            id: `version-${crypto.randomUUID()}`,
            name: name?.trim() || `${state.form.name || state.form.title} snapshot`,
            note: note?.trim() || undefined,
            createdAt,
            form: {
              ...state.form,
              fields: state.form.fields.map((field) => ({ ...field, settings: field.settings ? { ...field.settings } : undefined, validation: field.validation ? { ...field.validation } : undefined, options: field.options ? [...field.options] : undefined })),
              theme: { ...state.form.theme },
              logicRules: state.form.logicRules?.map((rule) => ({ ...rule, targetFieldIds: [...rule.targetFieldIds] })),
              updatedAt: createdAt
            }
          };
          return { versions: [version, ...state.versions].slice(0, 20) };
        }),
      restoreVersion: (id) =>
        set((state) => {
          const version = state.versions.find((item) => item.id === id);
          if (!version) return state;
          return {
            form: stamp({
              ...version.form,
              id: state.form.id
            }),
            selectedFieldId: null,
            selectedFieldIds: []
          };
        }),
      duplicateVersion: (id) =>
        set((state) => {
          const version = state.versions.find((item) => item.id === id);
          if (!version) return state;
          const createdAt = new Date().toISOString();
          return {
            versions: [
              {
                ...version,
                id: `version-${crypto.randomUUID()}`,
                name: `${version.name} copy`,
                createdAt,
                form: { ...version.form, id: `form-${crypto.randomUUID()}`, updatedAt: createdAt }
              },
              ...state.versions
            ].slice(0, 20)
          };
        }),
      deleteVersion: (id) =>
        set((state) => ({
          versions: state.versions.filter((version) => version.id !== id)
        })),
      publishForm: () =>
        set((state) => {
          const publishedAt = new Date().toISOString();
          return {
            publishedForm: {
              ...state.publishedForm,
              published: true,
              slug: state.publishedForm.slug || slugify(state.form.name || state.form.title),
              publishedAt,
              form: {
                ...state.form,
                fields: state.form.fields.map((field) => ({ ...field, settings: field.settings ? { ...field.settings } : undefined, validation: field.validation ? { ...field.validation } : undefined, options: field.options ? [...field.options] : undefined })),
                theme: { ...state.form.theme },
                logicRules: state.form.logicRules?.map((rule) => ({ ...rule, targetFieldIds: [...rule.targetFieldIds] })),
                updatedAt: publishedAt
              }
            }
          };
        }),
      unpublishForm: () =>
        set((state) => ({
          publishedForm: {
            ...state.publishedForm,
            published: false
          }
        })),
      updatePublishSlug: (slug) =>
        set((state) => ({
          publishedForm: {
            ...state.publishedForm,
            slug: slugify(slug)
          }
        })),
      updatePublishDestinations: (destinations) =>
        set((state) => ({
          publishedForm: {
            ...state.publishedForm,
            destinations
          }
        })),
      addSubmission: (values) =>
        set((state) => ({
          submissions: [
            {
              id: `sub-${crypto.randomUUID()}`,
              formId: get().form.id,
              submittedAt: new Date().toISOString(),
              values
            },
            ...state.submissions
          ]
        })),
      clearSubmissions: () => set({ submissions: [] })
    }),
    {
      name: "formcraft-workspace",
      partialize: (state) => ({
        form: state.form,
        submissions: state.submissions,
        versions: state.versions,
        publishedForm: state.publishedForm
      })
    }
  )
);
