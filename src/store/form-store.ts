"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormField, FormSchema, FormTheme, Submission } from "@/types/form";
import { defaultForm } from "@/lib/templates";

type FormStore = {
  form: FormSchema;
  selectedFieldId: string | null;
  submissions: Submission[];
  setSelectedField: (id: string | null) => void;
  setFormMeta: (updates: Partial<Pick<FormSchema, "name" | "title" | "description">>) => void;
  setTheme: (theme: Partial<FormTheme>) => void;
  addField: (field: FormField, index?: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  duplicateField: (id: string) => void;
  deleteField: (id: string) => void;
  reorderFields: (from: number, to: number) => void;
  replaceForm: (form: FormSchema) => void;
  addSubmission: (values: Record<string, unknown>) => void;
  clearSubmissions: () => void;
};

const stamp = (form: FormSchema): FormSchema => ({ ...form, updatedAt: new Date().toISOString() });

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      form: defaultForm,
      selectedFieldId: null,
      submissions: [],
      setSelectedField: (id) => set({ selectedFieldId: id }),
      setFormMeta: (updates) =>
        set((state) => ({
          form: stamp({ ...state.form, ...updates })
        })),
      setTheme: (theme) =>
        set((state) => ({
          form: stamp({ ...state.form, theme: { ...state.form.theme, ...theme } })
        })),
      addField: (field, index) =>
        set((state) => {
          const fields = [...state.form.fields];
          if (typeof index === "number") fields.splice(index, 0, field);
          else fields.push(field);
          return { form: stamp({ ...state.form, fields }), selectedFieldId: field.id };
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
          return { form: stamp({ ...state.form, fields }), selectedFieldId: copy.id };
        }),
      deleteField: (id) =>
        set((state) => ({
          form: stamp({ ...state.form, fields: state.form.fields.filter((field) => field.id !== id) }),
          selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId
        })),
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
          selectedFieldId: null
        }),
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
        submissions: state.submissions
      })
    }
  )
);
