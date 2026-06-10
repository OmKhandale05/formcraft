"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { FormRenderer } from "@/components/form-renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";

export default function PreviewPage() {
  const form = useFormStore((state) => state.form);
  const addSubmission = useFormStore((state) => state.addSubmission);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <AppShell>
      <main className="min-h-screen p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#15161a]">Preview</h1>
            <p className="mt-1 text-sm text-[#68707d]">Render the current JSON schema as an accessible, validated form.</p>
          </div>
          <div className="ml-auto flex rounded-lg border border-[#dce1e8] bg-white p-1">
            <Button type="button" variant={device === "desktop" ? "primary" : "ghost"} size="sm" onClick={() => setDevice("desktop")}>
              <Monitor size={16} />
              Desktop
            </Button>
            <Button type="button" variant={device === "mobile" ? "primary" : "ghost"} size="sm" onClick={() => setDevice("mobile")}>
              <Smartphone size={16} />
              Mobile
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-[#dce1e8] bg-[#eef2f7] p-3 sm:p-8">
          <div className={cn("mx-auto transition-all", device === "mobile" ? "max-w-[390px]" : "max-w-3xl")}>
            <FormRenderer form={form} onSubmit={addSubmission} />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
