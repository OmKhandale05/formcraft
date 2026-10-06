"use client";

import { BarChart3, Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { sentiments, type Sentiment, type SentimentFilter } from "@/lib/sentiment";
import type { FormField } from "@/types/form";

const tones: Record<Sentiment, string> = {
  positive: "bg-[#e9f7f0] text-[#176443]",
  neutral: "bg-[#eef2f6] text-[#475569]",
  negative: "bg-[#fff0ef] text-[#b42318]",
};

export function SentimentBadge({ sentiment }: { sentiment?: Sentiment }) {
  return <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold capitalize ${sentiment ? tones[sentiment] : "bg-[#f6f7f9] text-[#667085]"}`}>{sentiment || "Not analyzed"}</span>;
}

type Props = {
  fields: FormField[];
  fieldId: string;
  onFieldChange: (id: string) => void;
  filter: SentimentFilter;
  onFilterChange: (filter: SentimentFilter) => void;
  counts: Record<Sentiment, number>;
  eligible: number;
  busy: boolean;
  ready: boolean;
  progress: number;
  error: string;
  notice: string;
  onAnalyze: () => void;
};

export function FeedbackAnalysis(props: Props) {
  const analyzed = sentiments.reduce((sum, label) => sum + props.counts[label], 0);
  return (
    <section aria-label="Feedback analysis" className="mt-5 rounded-lg border border-[#d8e0ea] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-[#3157d5]" />
          <h2 className="text-sm font-semibold">Feedback analysis</h2>
          <span className="text-xs text-[#667085]">{analyzed} / {props.eligible} analyzed</span>
        </div>
        <span className="text-xs text-[#667085]">English feedback</span>
      </div>
      <div className="mt-4 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-semibold text-[#465366]">Feedback field</p>
          <Select aria-label="Feedback field" value={props.fieldId} disabled={props.busy || !props.fields.length} onChange={(event) => props.onFieldChange(event.target.value)}>
            {!props.fields.length && <option value="">No text fields available</option>}
            {props.fields.map((field) => <option key={field.id} value={field.id}>{field.label}</option>)}
          </Select>
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-semibold text-[#465366]">Sentiment filter</p>
          <Select aria-label="Sentiment filter" value={props.filter} onChange={(event) => props.onFilterChange(event.target.value as SentimentFilter)}>
            <option value="all">All sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="unanalyzed">Not analyzed</option>
          </Select>
        </div>
        <Button disabled={!props.ready || !props.eligible || props.busy} onClick={props.onAnalyze} className="h-10 whitespace-nowrap">
          {props.busy ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
          {props.busy ? `Analyzing ${props.progress}/${props.eligible}` : "Analyze feedback"}
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#eef2f7] pt-3">
        {sentiments.map((label) => <div key={label} className="flex items-center gap-2"><SentimentBadge sentiment={label} /><span className="text-sm font-semibold tabular-nums">{props.counts[label]}</span><span className="text-xs text-[#667085]">{analyzed ? Math.round(props.counts[label] / analyzed * 100) : 0}%</span></div>)}
      </div>
      {!props.eligible && <p className="mt-3 text-xs text-[#667085]">{props.fields.length ? "Submit an answer to this field in Preview to start analysis." : "Add a text or long-answer field to collect feedback."}</p>}
      {props.error && <p role="alert" className="mt-3 rounded-md bg-[#fff0ef] p-3 text-sm text-[#b42318]">{props.error}</p>}
      {props.notice && <p role="status" className="mt-3 text-xs text-[#176443]">{props.notice}</p>}
      <p className="mt-3 text-xs text-[#667085]">Predicted sentiment may be incorrect. Review the original answer before taking action.</p>
    </section>
  );
}
