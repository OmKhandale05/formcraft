"use client";

import { Download, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadFile, formatTimestamp, toCsv } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { Submission } from "@/types/form";

export default function SubmissionsPage() {
  const submissions = useFormStore((state) => state.submissions);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);
  const rows = useMemo(
    () =>
      submissions.filter((submission) =>
        JSON.stringify(submission.values).toLowerCase().includes(query.toLowerCase())
      ),
    [query, submissions]
  );

  return (
    <AppShell>
      <main className="min-h-screen p-4 sm:p-6">
        <div className="soft-panel mb-5 flex flex-wrap items-center gap-3 rounded-2xl p-5">
          <div>
            <h1 className="text-xl font-semibold text-[#111418]">Submissions</h1>
            <p className="mt-1 text-sm text-[#667085]">Review locally stored mock submissions from the preview form.</p>
          </div>
          <Button className="ml-auto" variant="secondary" onClick={() => downloadFile("formcraft-submissions.csv", toCsv(submissions.map((item) => ({ id: item.id, submittedAt: item.submittedAt, ...item.values }))), "text/csv")}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#d8e0ea] bg-white/88 shadow-[0_18px_50px_rgba(17,24,39,0.08)]">
          <div className="flex items-center gap-2 border-b border-[#e7ebf0] bg-white/80 p-4">
            <Search size={18} className="text-[#667085]" />
            <Input placeholder="Search responses..." value={query} onChange={(event) => setQuery(event.target.value)} className="border-transparent shadow-none" />
          </div>
          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <h2 className="text-lg font-semibold text-[#1f2937]">No submissions yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
                Submit the preview form to populate this dashboard with searchable responses and CSV export.
              </p>
            </div>
          ) : (
            <div className="formcraft-scrollbar overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#f6f8fb] text-xs uppercase tracking-[0.12em] text-[#667085]">
                  <tr>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Response summary</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf0]">
                  {rows.map((submission) => (
                    <tr key={submission.id} className="hover:bg-[#fbfcfe]">
                      <td className="px-4 py-4 text-[#4b5563]">{formatTimestamp(submission.submittedAt)}</td>
                      <td className="px-4 py-4 text-[#1f2937]">{Object.entries(submission.values).slice(0, 3).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join(" · ")}</td>
                      <td className="px-4 py-4 text-right">
                        <Button size="sm" onClick={() => setSelected(submission)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/24 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <aside className="ml-auto h-full w-full max-w-md border-l border-[#d8e0ea] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Submission detail</h2>
                  <p className="text-sm text-[#667085]">{formatTimestamp(selected.submittedAt)}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelected(null)} aria-label="Close drawer">
                  <X size={18} />
                </Button>
              </div>
              <div className="space-y-3">
                {Object.entries(selected.values).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-[#e1e6ee] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#68707d]">{key}</p>
                    <p className="mt-1 text-sm text-[#1f2937]">{Array.isArray(value) ? value.join(", ") : String(value || "—")}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>
    </AppShell>
  );
}
