import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.FORMCRAFT_TEST_URL || "http://localhost:3000";
const browser = await chromium.launch({ headless: true, channel: "chromium" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
if (process.env.FORMCRAFT_TEST_VERCEL_BYPASS) {
  const host = new URL(base).host;
  await page.route((url) => url.host === host, (route) => route.continue({ headers: { ...route.request().headers(), "x-vercel-protection-bypass": process.env.FORMCRAFT_TEST_VERCEL_BYPASS } }));
}
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const stamp = "2026-10-06T09:00:00.000Z";
const form = {
  id: "feedback-test", name: "Feedback", title: "Customer feedback", description: "Tell us about your experience.",
  updatedAt: stamp, theme: { accentColor: "#3157d5", radius: "rounded", mode: "light" },
  fields: [{ id: "message", type: "textarea", label: "Your feedback" }, { id: "name", type: "text", label: "Name" }],
};
const submissions = [
  { id: "positive-1", text: "I love this excellent product, it is amazing and wonderful!" },
  { id: "negative-1", text: "I hate this terrible product. It is awful and broken." },
  { id: "neutral-1", text: "The meeting is scheduled for Monday at 10am." },
  { id: "mixed-1", text: "this is excellent but payemnt not done" },
  { id: "survey-complaint", text: "The survey is far too long and the questions are confusing." },
  { id: "survey-fact", text: "The survey contains 20 questions." },
  { id: "blank-1", text: "   " },
].map(({ id, text }) => ({ id, formId: form.id, submittedAt: stamp, values: { message: text, name: "Alex" } }));

try {
  await page.addInitScript(({ form, submissions }) => {
    if (!localStorage.getItem("formcraft-workspace")) localStorage.setItem("formcraft-workspace", JSON.stringify({ state: { form, submissions, versions: [] }, version: 0 }));
  }, { form, submissions });
  await page.goto(`${base}/submissions`);
  const panel = page.getByRole("region", { name: "Feedback analysis" });
  const analyze = panel.getByRole("button", { name: "Analyze feedback" });
  await analyze.waitFor();
  await analyze.click();
  await page.getByRole("status").filter({ hasText: "Analyzed 6 answers" }).waitFor();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("formcraft-feedback-analysis-v1")));
  assert.equal(Object.keys(stored).length, 6, "Blank answers are skipped");
  assert.equal(stored[JSON.stringify([form.id, "message", "positive-1"])].sentiment, "positive");
  assert.equal(stored[JSON.stringify([form.id, "message", "negative-1"])].sentiment, "negative");
  assert.equal(stored[JSON.stringify([form.id, "message", "mixed-1"])].sentiment, "negative", "Unresolved payment outweighs praise");
  assert.equal(stored[JSON.stringify([form.id, "message", "survey-complaint"])].sentiment, "negative", "General survey complaint is negative");
  assert.equal(stored[JSON.stringify([form.id, "message", "survey-fact"])].sentiment, "neutral", "A factual question count is neutral");
  assert.equal(await page.locator("tbody tr").count(), 7);
  await panel.getByRole("button", { name: "Sentiment filter" }).click();
  await panel.getByRole("option", { name: "Negative", exact: true }).click();
  assert.equal(await page.locator("tbody tr").count(), 3);
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  await page.getByText("Predicted sentiment", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Close drawer" }).click();
  await page.reload();
  await panel.getByText("6 / 6 analyzed", { exact: true }).waitFor();
  await panel.getByRole("button", { name: "Feedback field" }).click();
  await panel.getByRole("option", { name: "Name", exact: true }).click();
  await panel.getByText("0 / 7 analyzed", { exact: true }).waitFor();
  await panel.getByRole("button", { name: "Feedback field" }).click();
  await panel.getByRole("option", { name: "Your feedback", exact: true }).click();
  await page.route("**/analyze", (route) => route.abort());
  await analyze.click();
  await page.getByRole("alert").filter({ hasText: "Feedback analysis is unavailable" }).waitFor();
  await page.unroute("**/analyze");
  await page.reload();
  await panel.getByText("6 / 6 analyzed", { exact: true }).waitFor();
  await mkdir("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/feedback-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/feedback-mobile.png", fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Mobile page must not overflow horizontally");
  await page.getByRole("button", { name: "Clear local submissions" }).click();
  assert.equal(await page.evaluate(() => localStorage.getItem("formcraft-feedback-analysis-v1")), null);
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log("PASS: live predictions, blank handling, filters, detail drawer, persistence, field isolation, service failure, mobile layout and cache cleanup.");
} finally {
  await browser.close();
}
