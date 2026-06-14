"use client";

import {
  Archive,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clipboard,
  Clock3,
  Download,
  Eye,
  FileJson,
  Filter,
  Flag,
  Inbox,
  PenLine,
  Search,
  Sparkles,
  Star,
  Table2,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { downloadFile, formatTimestamp, toCsv } from "@/lib/utils";
import { useFormStore } from "@/store/form-store";
import type { FieldType, FormField, Submission } from "@/types/form";

type SubmissionStatus = "new" | "reviewed" | "archived";
type SavedView = "all" | "new" | "flagged" | "reviewed" | "archived";
type DateFilter = "all" | "today" | "7d" | "30d";
type SortMode = "newest" | "oldest" | "filled";

type SubmissionMeta = {
  flagged?: boolean;
  note?: string;
  status?: SubmissionStatus;
};

type AnswerMeta = {
  label: string;
  type: FieldType | "currency" | "unknown";
};

const metaStorageKey = "formcraft-submission-ops";

const views: Array<{ id: SavedView; label: string }> = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "flagged", label: "Flagged" },
  { id: "reviewed", label: "Reviewed" },
  { id: "archived", label: "Archived" }
];

function valueToText(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function isFilledValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.values(value).some(isFilledValue);
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function filledCount(submission: Submission) {
  return Object.values(submission.values).filter(isFilledValue).length;
}

function completionPercent(submission: Submission) {
  const answerCount = Object.keys(submission.values).length;
  return answerCount ? Math.round((filledCount(submission) / answerCount) * 100) : 0;
}

function answerMetaFor(fields: FormField[]) {
  return fields.reduce<Record<string, AnswerMeta>>((lookup, field) => {
    lookup[field.id] = { label: field.label, type: field.type };
    if (field.type === "payment") lookup[`${field.id}_currency`] = { label: `${field.label} currency`, type: "currency" };
    return lookup;
  }, {});
}

function statusFor(meta?: SubmissionMeta): SubmissionStatus {
  return meta?.status ?? "new";
}

function withinDateFilter(submission: Submission, filter: DateFilter) {
  if (filter === "all") return true;
  const submittedAt = new Date(submission.submittedAt).getTime();
  if (Number.isNaN(submittedAt)) return false;
  const now = Date.now();
  if (filter === "today") return new Date(submission.submittedAt).toDateString() === new Date().toDateString();
  const days = filter === "7d" ? 7 : 30;
  return now - submittedAt <= days * 24 * 60 * 60 * 1000;
}

function submissionTypeFor(submission: Submission, answerMeta: Record<string, AnswerMeta>, formTitle: string) {
  const fieldText = Object.entries(submission.values)
    .map(([key, value]) => `${answerMeta[key]?.label ?? key} ${valueToText(value)}`)
    .join(" ")
    .toLowerCase();
  const text = `${formTitle} ${fieldText}`.toLowerCase();

  if (/(candidate|resume|cv|portfolio|job|role|experience|availability|apply|application)/.test(text)) {
    return { label: "Candidate", reason: "Hiring or application response", tone: "bg-[#f5f3ff] text-[#6d28d9]" };
  }
  if (/(event|ticket|attendee|seat|dietary|workshop|registration|guest)/.test(text)) {
    return { label: "Event", reason: "Registration or attendee response", tone: "bg-[#fff7ed] text-[#c2410c]" };
  }
  if (/(feedback|rating|survey|score|experience|satisfaction|improve|matrix)/.test(text)) {
    return { label: "Feedback", reason: "Survey or product insight", tone: "bg-[#eef8f5] text-[#0f766e]" };
  }
  if (/(lead|demo|budget|company|team size|sales|purchase|pricing|intent)/.test(text)) {
    return { label: "Lead", reason: "Sales or qualification response", tone: "bg-[#edf2ff] text-[#3157d5]" };
  }
  if (/(contact|message|support|phone|email|inquiry|request)/.test(text)) {
    return { label: "Contact", reason: "General contact request", tone: "bg-[#f1f5f9] text-[#475569]" };
  }
  return { label: "Response", reason: "General form submission", tone: "bg-[#f1f5f9] text-[#475569]" };
}

function answerTypeLabel(type: AnswerMeta["type"]) {
  const labels: Record<AnswerMeta["type"], string> = {
    checkbox: "Multi-select",
    currency: "Currency",
    date: "Date",
    daterange: "Date range",
    divider: "Divider",
    dropdown: "Dropdown",
    email: "Email",
    file: "File upload",
    formula: "Formula result",
    hidden: "Hidden metadata",
    matrix: "Matrix/grid",
    number: "Number",
    payment: "Payment amount",
    phone: "Phone",
    radio: "Single choice",
    rating: "Rating",
    richtext: "Rich text",
    section: "Section",
    signature: "Signature",
    slider: "Slider",
    text: "Text",
    textarea: "Long answer",
    unknown: "Answer"
  };
  return labels[type];
}

function dataUrlToDownloadName(label: string) {
  return `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "signature"}.png`;
}

function AnswerValue({ label, type, value }: { label: string; type: AnswerMeta["type"]; value: unknown }) {
  const text = valueToText(value);

  if (!isFilledValue(value)) {
    return <p className="mt-2 text-sm text-[#98a2b3]">No answer provided</p>;
  }

  if (type === "signature" && typeof value === "string" && value.startsWith("data:image")) {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-[#d8e0ea] bg-[#fbfcfe]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt={`${label} signature`} className="max-h-48 w-full bg-white object-contain p-3" />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e7ebf0] px-3 py-2 text-xs text-[#667085]">
          <span className="inline-flex items-center gap-1.5">
            <PenLine size={13} />
            Signature image saved with this response
          </span>
          <a className="font-semibold text-[#3157d5]" href={value} download={dataUrlToDownloadName(label)}>
            Download PNG
          </a>
        </div>
      </div>
    );
  }

  if (type === "rating") {
    const rating = Number(value);
    const stars = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.round(rating))) : 0;
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 text-[#f59e0b]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={18} className={index < stars ? "fill-current" : "text-[#d8e0ea]"} />
          ))}
        </div>
        <span className="text-sm font-semibold text-[#1f2937]">{text}</span>
      </div>
    );
  }

  if (type === "daterange" && value && typeof value === "object") {
    const range = value as { start?: unknown; end?: unknown };
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e5e9ef] bg-[#fbfcfe] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a94a6]">Start</p>
          <p className="mt-1 text-sm font-semibold text-[#1f2937]">{String(range.start || "Not selected")}</p>
        </div>
        <div className="rounded-xl border border-[#e5e9ef] bg-[#fbfcfe] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a94a6]">End</p>
          <p className="mt-1 text-sm font-semibold text-[#1f2937]">{String(range.end || "Not selected")}</p>
        </div>
      </div>
    );
  }

  if (type === "matrix" && value && typeof value === "object") {
    const rows = Object.entries(value as Record<string, unknown>);
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-[#d8e0ea]">
        <div className="flex items-center gap-2 border-b border-[#e7ebf0] bg-[#f8fafc] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">
          <Table2 size={14} />
          Matrix answers
        </div>
        <div className="divide-y divide-[#eef2f7]">
          {rows.map(([row, rowValue]) => (
            <div key={row} className="grid gap-2 px-3 py-2 sm:grid-cols-[140px_minmax(0,1fr)]">
              <p className="text-sm font-semibold text-[#20242b]">{row}</p>
              <p className="break-words text-sm text-[#667085]">{valueToText(rowValue) || "No answer"}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((item) => (
          <span key={String(item)} className="rounded-full bg-[#eef3ff] px-2.5 py-1 text-xs font-semibold text-[#3157d5]">
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (type === "richtext") {
    return <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#1f2937]">{text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "No answer"}</p>;
  }

  return <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#1f2937]">{text || "No answer"}</p>;
}

function exportRows(submissions: Submission[], meta: Record<string, SubmissionMeta>) {
  return submissions.map((submission) => ({
    id: submission.id,
    status: statusFor(meta[submission.id]),
    flagged: meta[submission.id]?.flagged ? "yes" : "no",
    submittedAt: submission.submittedAt,
    note: meta[submission.id]?.note ?? "",
    ...submission.values
  }));
}

export default function SubmissionsPage() {
  const form = useFormStore((state) => state.form);
  const submissions = useFormStore((state) => state.submissions);
  const clearSubmissions = useFormStore((state) => state.clearSubmissions);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [meta, setMeta] = useState<Record<string, SubmissionMeta>>({});
  const [view, setView] = useState<SavedView>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [copied, setCopied] = useState(false);
  const answerMeta = useMemo(() => answerMetaFor(form.fields), [form.fields]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setMeta(JSON.parse(window.localStorage.getItem(metaStorageKey) || "{}") as Record<string, SubmissionMeta>);
      } catch {
        setMeta({});
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const persistMeta = (next: Record<string, SubmissionMeta>) => {
    setMeta(next);
    window.localStorage.setItem(metaStorageKey, JSON.stringify(next));
  };

  const updateMeta = (id: string, patch: SubmissionMeta) => {
    persistMeta({ ...meta, [id]: { ...meta[id], ...patch } });
  };

  const updateMany = (ids: string[], patch: SubmissionMeta) => {
    const next = { ...meta };
    ids.forEach((id) => {
      next[id] = { ...next[id], ...patch };
    });
    persistMeta(next);
  };

  const rows = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return submissions
      .filter((submission) => {
        const itemMeta = meta[submission.id];
        const status = statusFor(itemMeta);
        const matchesView =
          view === "all" ||
          (view === "flagged" && itemMeta?.flagged) ||
          (view !== "flagged" && status === view);
        const matchesDate = withinDateFilter(submission, dateFilter);
        const submissionType = submissionTypeFor(submission, answerMeta, form.title);
        const searchable = `${submission.id} ${submission.submittedAt} ${status} ${itemMeta?.note ?? ""} ${Object.entries(submission.values)
          .map(([key, value]) => `${answerMeta[key]?.label ?? key} ${valueToText(value)}`)
          .join(" ")} ${submissionType.label} ${submissionType.reason}`.toLowerCase();
        return matchesView && matchesDate && searchable.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortMode === "filled") return filledCount(b) - filledCount(a);
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return sortMode === "oldest" ? dateA - dateB : dateB - dateA;
      });
  }, [answerMeta, dateFilter, form.title, meta, query, sortMode, submissions, view]);

  const selectedRows = rows.filter((submission) => selectedIds.includes(submission.id));
  const newCount = submissions.filter((submission) => statusFor(meta[submission.id]) === "new").length;
  const reviewedCount = submissions.filter((submission) => statusFor(meta[submission.id]) === "reviewed").length;
  const flaggedCount = submissions.filter((submission) => meta[submission.id]?.flagged).length;
  const archivedCount = submissions.filter((submission) => statusFor(meta[submission.id]) === "archived").length;
  const todayCount = submissions.filter((submission) => withinDateFilter(submission, "today")).length;
  const latestSubmission = submissions[0]?.submittedAt ? formatTimestamp(submissions[0].submittedAt) : "No activity";
  const avgFilled = submissions.length ? Math.round(submissions.reduce((total, submission) => total + filledCount(submission), 0) / submissions.length) : 0;
  const avgCompletion = submissions.length ? Math.round(submissions.reduce((total, submission) => total + completionPercent(submission), 0) / submissions.length) : 0;
  const reviewProgress = submissions.length ? Math.round((reviewedCount / submissions.length) * 100) : 0;

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const exportCsv = (items: Submission[]) => downloadFile("formcraft-submissions.csv", toCsv(exportRows(items, meta)), "text/csv");
  const exportJson = (items: Submission[]) => downloadFile("formcraft-submissions.json", JSON.stringify(exportRows(items, meta), null, 2), "application/json");

  const copySelectedJson = async (submission: Submission) => {
    await navigator.clipboard.writeText(JSON.stringify({ ...submission, meta: meta[submission.id] ?? { status: "new" } }, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#f6f7f9] px-4 py-6 sm:px-6">
        <section className="mx-auto max-w-7xl">
          <div className="grid gap-5 rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#465366]">
                <Inbox size={14} />
                Response operations
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#111418] sm:text-4xl">Manage submissions like a real product team.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">
                Review responses, flag important leads, filter by workflow state, export clean data, and keep local notes beside every submission.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d8e0ea] bg-[#fbfcfe] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                <Sparkles size={16} />
                Smart summary
              </p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                {submissions.length
                  ? `${newCount} new, ${flaggedCount} flagged, ${reviewedCount} reviewed. Latest response: ${latestSubmission}.`
                  : "Submit the preview form once to populate this dashboard with local response data."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: BarChart3, label: "Total responses", value: submissions.length, tone: "bg-[#eef3ff] text-[#3157d5]" },
              { icon: Clock3, label: "Today", value: todayCount, tone: "bg-[#eef8f5] text-[#0f766e]" },
              { icon: Flag, label: "Flagged", value: flaggedCount, tone: "bg-[#fff7ed] text-[#c2410c]" },
              { icon: CheckCircle2, label: "Avg. filled fields", value: avgFilled, tone: "bg-[#f5f3ff] text-[#6d28d9]" }
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-[#d8e0ea] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#667085]">{metric.label}</p>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${metric.tone}`}>
                      <Icon size={17} />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111418]">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-6 grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="rounded-3xl border border-[#d8e0ea] bg-white shadow-sm">
              <div className="border-b border-[#eef2f7] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {views.map((item) => {
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`h-9 rounded-xl border px-3 text-sm font-semibold transition ${
                          active ? "border-[#111418] bg-[#111418] text-white" : "border-[#d8e0ea] bg-white text-[#465366] hover:border-[#bfcadc]"
                        }`}
                        onClick={() => {
                          setView(item.id);
                          setSelectedIds([]);
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" size={16} />
                    <Input className="pl-9" placeholder="Search responses, answers, notes or status" value={query} onChange={(event) => setQuery(event.target.value)} />
                  </div>
                  <Select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)}>
                    <option value="all">All dates</option>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </Select>
                  <Select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="filled">Most complete</option>
                  </Select>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-b border-[#eef2f7] bg-[#fbfcfe] px-4 py-3">
                  <p className="mr-auto text-sm font-semibold text-[#465366]">{selectedIds.length} selected</p>
                  <Button size="sm" variant="secondary" onClick={() => updateMany(selectedIds, { status: "reviewed" })}>
                    <BadgeCheck size={14} />
                    Mark reviewed
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => updateMany(selectedIds, { flagged: true })}>
                    <Flag size={14} />
                    Flag
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => updateMany(selectedIds, { status: "archived" })}>
                    <Archive size={14} />
                    Archive
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => exportCsv(selectedRows)}>
                    <Download size={14} />
                    Export selected
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                    Clear
                  </Button>
                </div>
              )}

              {rows.length === 0 ? (
                <div className="rounded-b-3xl p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#3157d5]">
                    <Filter size={22} />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-[#1f2937]">No matching submissions</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
                    Try another view, clear filters, or submit the preview form to generate local response data.
                  </p>
                </div>
              ) : (
                <div className="formcraft-scrollbar overflow-x-auto rounded-b-3xl">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-[#f6f8fb] text-xs uppercase tracking-[0.12em] text-[#667085]">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <input
                            aria-label="Select all visible submissions"
                            type="checkbox"
                            checked={rows.length > 0 && rows.every((submission) => selectedIds.includes(submission.id))}
                            onChange={(event) => setSelectedIds(event.target.checked ? rows.map((submission) => submission.id) : [])}
                          />
                        </th>
                        <th className="px-4 py-3">Submitted</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Submission type</th>
                        <th className="px-4 py-3">Completeness</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7ebf0]">
                      {rows.map((submission) => {
                        const itemMeta = meta[submission.id];
                        const status = statusFor(itemMeta);
                        const complete = completionPercent(submission);
                        const submissionType = submissionTypeFor(submission, answerMeta, form.title);
                        return (
                          <tr key={submission.id} className="hover:bg-[#fbfcfe]">
                            <td className="px-4 py-4">
                              <input
                                aria-label={`Select submission ${submission.id}`}
                                type="checkbox"
                                checked={selectedIds.includes(submission.id)}
                                onChange={() => toggleSelection(submission.id)}
                              />
                            </td>
                            <td className="px-4 py-4 text-[#4b5563]">
                              <p className="font-semibold text-[#20242b]">{formatTimestamp(submission.submittedAt)}</p>
                              <p className="mt-1 text-xs text-[#8a94a6]">{submission.id.slice(0, 12)}</p>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                    status === "reviewed"
                                      ? "bg-[#eef8f5] text-[#0f766e]"
                                      : status === "archived"
                                        ? "bg-[#f1f5f9] text-[#64748b]"
                                        : "bg-[#edf2ff] text-[#3157d5]"
                                  }`}
                                >
                                  {status}
                                </span>
                                {itemMeta?.flagged && <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-xs font-bold text-[#c2410c]">flagged</span>}
                              </div>
                            </td>
                            <td className="max-w-[280px] px-4 py-4 text-[#1f2937]">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${submissionType.tone}`}>{submissionType.label}</span>
                              <p className="mt-2 text-sm leading-5 text-[#667085]">{submissionType.reason}</p>
                              {itemMeta?.note && <p className="mt-2 text-xs font-medium text-[#667085]">Note: {itemMeta.note}</p>}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-[#edf1f6]">
                                  <div className="h-full rounded-full bg-[#3157d5]" style={{ width: `${complete}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-[#667085]">{complete}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button size="sm" onClick={() => setSelected(submission)}>
                                <Eye size={14} />
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <aside className="min-w-0 space-y-4">
            <div className="rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                <CheckCircle2 size={16} />
                Review queue
              </p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">Operational signals that help you decide what to review, follow up, or export next.</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a94a6]">Needs review</p>
                      <p className="mt-2 text-3xl font-semibold text-[#111418]">{newCount}</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2ff] text-[#3157d5]">
                      <Inbox size={17} />
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={() => {
                      setView("new");
                      setSelectedIds([]);
                    }}
                    disabled={!newCount}
                  >
                    Open new responses
                  </Button>
                </div>
                <div className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#667085]">Flagged follow-ups</p>
                    <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-xs font-bold text-[#c2410c]">{flaggedCount}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#667085]">Review progress</p>
                    <span className="text-sm font-bold text-[#111418]">{reviewProgress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf1f6]">
                    <div className="h-full rounded-full bg-[#0f766e]" style={{ width: `${reviewProgress}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#667085]">Avg. completion</p>
                    <span className="text-sm font-bold text-[#111418]">{avgCompletion}%</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a94a6]">Next best action</p>
                  <p className="mt-2 text-sm leading-6 text-[#111418]">
                    {newCount
                      ? `Review ${newCount} new ${newCount === 1 ? "response" : "responses"} before exporting.`
                      : flaggedCount
                        ? "Check flagged follow-ups before archiving the queue."
                        : submissions.length
                          ? "Everything is reviewed. Export the current view or archive old responses."
                          : "Submit a preview response to start testing the response workflow."}
                  </p>
                  <p className="mt-2 text-xs text-[#667085]">Latest: {latestSubmission}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                <Download size={16} />
                Export center
              </p>
              <div className="mt-4 grid gap-2">
                <Button variant="secondary" onClick={() => exportCsv(rows)}>
                  <Download size={16} />
                  Export current CSV
                </Button>
                <Button variant="secondary" onClick={() => exportJson(rows)}>
                  <FileJson size={16} />
                  Export current JSON
                </Button>
                <Button variant="danger" onClick={clearSubmissions} disabled={!submissions.length}>
                  <Trash2 size={16} />
                  Clear local submissions
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#667085]">Exports respect the active view, search, date filter, and sort order.</p>
            </div>

            <div className="rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-[#111418]">Workflow health</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">New</span>
                  <span className="font-semibold text-[#111418]">{newCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Reviewed</span>
                  <span className="font-semibold text-[#111418]">{reviewedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Archived</span>
                  <span className="font-semibold text-[#111418]">{archivedCount}</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {selected && (
          <div className="fixed inset-0 z-50 bg-black/24 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <aside className="formcraft-scrollbar ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-[#d8e0ea] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98a2b3]">Submitted response</p>
                  <h2 className="mt-2 text-xl font-semibold text-[#111418]">{form.title}</h2>
                  <p className="mt-1 text-sm text-[#667085]">Received {formatTimestamp(selected.submittedAt)}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelected(null)} aria-label="Close drawer">
                  <X size={18} />
                </Button>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Status", value: statusFor(meta[selected.id]) },
                  { label: "Answers", value: `${filledCount(selected)} filled` },
                  { label: "Flagged", value: meta[selected.id]?.flagged ? "Yes" : "No" }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#d8e0ea] bg-[#fbfcfe] p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a94a6]">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[#111418]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => updateMeta(selected.id, { status: "reviewed" })}>
                  <BadgeCheck size={16} />
                  Mark reviewed
                </Button>
                <Button variant="secondary" onClick={() => updateMeta(selected.id, { flagged: !meta[selected.id]?.flagged })}>
                  <Flag size={16} />
                  {meta[selected.id]?.flagged ? "Unflag" : "Flag"}
                </Button>
                <Button variant="secondary" onClick={() => updateMeta(selected.id, { status: "archived" })}>
                  <Archive size={16} />
                  Archive
                </Button>
                <Button variant="secondary" onClick={() => copySelectedJson(selected)}>
                  <Clipboard size={16} />
                  {copied ? "Copied" : "Copy JSON"}
                </Button>
              </div>

              <div className="mt-5 rounded-2xl border border-[#d8e0ea] bg-[#fbfcfe] p-4">
                <Label htmlFor="submission-note">Internal note</Label>
                <Textarea
                  id="submission-note"
                  className="mt-2 min-h-24 bg-white"
                  placeholder="Add review notes, follow-up context, or lead quality thoughts"
                  value={meta[selected.id]?.note ?? ""}
                  onChange={(event) => updateMeta(selected.id, { note: event.target.value })}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-[#d8e0ea] bg-[#fbfcfe] p-4">
                <p className="text-sm font-bold text-[#111418]">What you are seeing</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  These are the answers saved when the user submitted the preview form. Labels come from your current form fields, and special answers like signatures,
                  ratings, date ranges and matrix grids are shown in a readable format.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <p className="mb-3 text-sm font-bold text-[#111418]">Submitted answers</p>
                  <div className="space-y-3">
                    {Object.entries(selected.values).map(([key, value]) => {
                      const itemMeta = answerMeta[key] ?? { label: key, type: "unknown" as const };
                      return (
                        <div key={key} className="rounded-2xl border border-[#e1e6ee] bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-[#111418]">{itemMeta.label}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a94a6]">{answerTypeLabel(itemMeta.type)}</p>
                            </div>
                            <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold text-[#667085]">
                              {isFilledValue(value) ? "Answered" : "Empty"}
                            </span>
                          </div>
                          <AnswerValue label={itemMeta.label} type={itemMeta.type} value={value} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </AppShell>
  );
}
