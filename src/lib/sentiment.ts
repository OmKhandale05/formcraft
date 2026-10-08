import { z } from "zod";
import type { Submission } from "@/types/form";

export const sentiments = ["positive", "neutral", "negative"] as const;
export type Sentiment = (typeof sentiments)[number];
export type SentimentFilter = Sentiment | "all" | "unanalyzed";

export const savedAnalysisSchema = z.record(z.string(), z.object({
  text: z.string(),
  sentiment: z.enum(sentiments),
  modelVersion: z.string(),
  analyzedAt: z.string(),
}));
export type SavedAnalysis = z.infer<typeof savedAnalysisSchema>;

const responseSchema = z.object({
  model_version: z.string().min(1),
  results: z.array(z.object({ id: z.string(), sentiment: z.enum(sentiments) })),
});

export function analysisKey(formId: string, fieldId: string, submissionId: string) {
  return JSON.stringify([formId, fieldId, submissionId]);
}

export function feedbackText(submission: Submission, fieldId: string) {
  const value = submission.values[fieldId];
  return typeof value === "string" ? value.trim() : "";
}

export function currentAnalysis(saved: SavedAnalysis, submission: Submission, fieldId: string) {
  const result = saved[analysisKey(submission.formId, fieldId, submission.id)];
  return result && result.text === feedbackText(submission, fieldId) ? result : undefined;
}

export async function analyzeBatch(items: { id: string; text: string }[], signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch("/api/feedback/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }), signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Feedback analysis is unavailable. Please try again when the analysis service is running.");
  }
  if (!response.ok) {
    if (response.status === 429) throw new Error("Too many analysis requests. Please wait a minute and try again.");
    if (response.status === 503) throw new Error("The analysis model is not ready yet. Please try again later.");
    throw new Error("Feedback could not be analyzed. Please try again.");
  }
  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success || parsed.data.results.length !== items.length || new Set(parsed.data.results.map((item) => item.id)).size !== items.length || parsed.data.results.some((item) => !items.some((input) => input.id === item.id))) {
    throw new Error("The analysis service returned an incomplete result. Please try again.");
  }
  return parsed.data;
}
