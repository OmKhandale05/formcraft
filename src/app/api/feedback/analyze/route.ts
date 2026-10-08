import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  items: z.array(z.object({
    id: z.string().trim().min(1).max(200),
    text: z.string().trim().min(1).max(5000),
  })).min(1).max(100),
}).refine(({ items }) => new Set(items.map((item) => item.id)).size === items.length);
const responseSchema = z.object({
  model_version: z.string().min(1),
  results: z.array(z.object({ id: z.string(), sentiment: z.enum(["positive", "neutral", "negative"]) })),
});
const error = (message: string, status: number) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return error("Same-origin requests required", 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) return error("JSON required", 415);
  const key = process.env.FORMCRAFT_API_KEY;
  if ((process.env.VERCEL === "1" || process.env.NODE_ENV === "production") && (!key || key.length < 32)) {
    return error("Analysis service is not configured", 503);
  }
  const reader = request.body?.getReader();
  if (!reader) return error("Request body required", 400);
  let raw = "";
  let bytes = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 512 * 1024) {
        await reader.cancel();
        return error("Request is too large", 413);
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch {
    return error("Could not read request", 400);
  } finally {
    reader.releaseLock();
  }
  let payload: z.infer<typeof requestSchema>;
  try {
    payload = requestSchema.parse(JSON.parse(raw));
  } catch {
    return error("Invalid feedback batch", 400);
  }
  try {
    const base = new URL(process.env.FEEDBACK_API_URL || "http://localhost:8000");
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash || base.pathname !== "/") {
      return error("Analysis service is not configured", 503);
    }
    if (process.env.VERCEL === "1" && base.protocol !== "https:") return error("Analysis service is not configured", 503);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (key) headers["X-FormCraft-Key"] = key;
    const upstream = await fetch(new URL("/analyze", base), {
      method: "POST", headers, body: JSON.stringify(payload), cache: "no-store", redirect: "error",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(50_000)]),
    });
    if (!upstream.ok) {
      return error("Analysis service is unavailable", upstream.status === 429 ? 429 : 503);
    }
    const data = responseSchema.parse(await upstream.json());
    const ids = new Set(payload.items.map(({ id }) => id));
    if (data.results.length !== ids.size || new Set(data.results.map(({ id }) => id)).size !== ids.size || data.results.some(({ id }) => !ids.has(id))) {
      return error("Incomplete analysis response", 502);
    }
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return error("Analysis service is unavailable", 503);
  }
}
