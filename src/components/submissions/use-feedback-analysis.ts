"use client";

import { useEffect, useRef, useState } from "react";
import { analysisKey, analyzeBatch, feedbackText, savedAnalysisSchema, type SavedAnalysis } from "@/lib/sentiment";
import type { Submission } from "@/types/form";

const storageKey = "formcraft-feedback-analysis-v1";

export function useFeedbackAnalysis() {
  const [saved, setSaved] = useState<SavedAnalysis>({});
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const active = useRef<AbortController | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const result = savedAnalysisSchema.safeParse(JSON.parse(localStorage.getItem(storageKey) || "{}"));
        if (result.success) setSaved(result.data);
      } catch { /* A damaged cache does not block new analysis. */ }
      setReady(true);
    });
    return () => { cancelAnimationFrame(frame); active.current?.abort(); active.current = null; };
  }, []);

  const cancel = () => {
    active.current?.abort();
    active.current = null;
    setBusy(false);
    setError("");
    setNotice("");
  };

  const analyze = async (submissions: Submission[], fieldId: string) => {
    if (!ready || active.current) return;
    const eligible = submissions.filter((item) => feedbackText(item, fieldId));
    if (!eligible.length) return;
    if (eligible.some((item) => feedbackText(item, fieldId).length > 5000)) {
      setError("One or more answers exceed 5,000 characters. Choose a shorter feedback field.");
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setBusy(true); setError(""); setNotice(""); setProgress(0);
    const additions: SavedAnalysis = {};
    try {
      for (let offset = 0; offset < eligible.length; offset += 100) {
        const batch = eligible.slice(offset, offset + 100);
        const timeout = setTimeout(() => controller.abort(), 30000);
        let result;
        try {
          result = await analyzeBatch(batch.map((item) => ({ id: item.id, text: feedbackText(item, fieldId) })), controller.signal);
        } finally { clearTimeout(timeout); }
        if (controller.signal.aborted) return;
        result.results.forEach((prediction) => {
          const item = batch.find((submission) => submission.id === prediction.id)!;
          additions[analysisKey(item.formId, fieldId, item.id)] = {
            text: feedbackText(item, fieldId), sentiment: prediction.sentiment,
            modelVersion: result.model_version, analyzedAt: new Date().toISOString(),
          };
        });
        setProgress(Math.min(offset + 100, eligible.length));
      }
      if (controller.signal.aborted) return;
      const next = { ...saved, ...additions };
      setSaved(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        setNotice(`Analyzed ${eligible.length} ${eligible.length === 1 ? "answer" : "answers"}. Results saved on this device.`);
      } catch {
        setNotice("Analysis complete. Device storage is full; results are available until you leave this page.");
      }
    } catch (failure) {
      if (active.current === controller) setError(controller.signal.aborted ? "Analysis timed out. Please try again." : failure instanceof Error ? failure.message : "Analysis failed. Please try again.");
    } finally {
      if (active.current === controller) { active.current = null; setBusy(false); }
    }
  };

  const clear = () => {
    cancel();
    setSaved({});
    try { localStorage.removeItem(storageKey); } catch { /* The in-memory cache is still cleared. */ }
  };

  return { saved, ready, busy, progress, error, notice, analyze, cancel, clear };
}
