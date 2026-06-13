"use client";

import Link from "next/link";
import { ArrowLeft, EyeOff, Globe2 } from "lucide-react";
import { use } from "react";
import { FormRenderer } from "@/components/form-renderer";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/store/form-store";

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const publishedForm = useFormStore((state) => state.publishedForm);
  const addSubmission = useFormStore((state) => state.addSubmission);
  const form = publishedForm.published && publishedForm.slug === slug ? publishedForm.form : null;

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-8">
      <div className="mx-auto mb-5 flex max-w-4xl items-center justify-between gap-3">
        <Link href="/settings" className="inline-flex items-center gap-2 rounded-xl border border-[#d8e0ea] bg-white/86 px-3 py-2 text-sm font-semibold text-[#334155] shadow-sm transition hover:bg-white">
          <ArrowLeft size={16} />
          Back to FormCraft
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-white/86 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">
          <Globe2 size={14} />
          Public form
        </span>
      </div>

      {form ? (
        <div className="mx-auto max-w-4xl">
          <FormRenderer form={form} onSubmit={addSubmission} />
        </div>
      ) : (
        <section className="mx-auto max-w-xl rounded-3xl border border-[#d8e0ea] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#c77700]">
            <EyeOff size={22} />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-[#111418]">This form is not published</h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Publish the form from Settings to create a shareable public preview for this slug.
          </p>
          <Button type="button" variant="primary" className="mt-5" onClick={() => window.location.assign("/settings")}>
            Open publish settings
          </Button>
        </section>
      )}
    </main>
  );
}
