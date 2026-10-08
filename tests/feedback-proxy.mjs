import assert from "node:assert/strict";
import { POST } from "../src/app/api/feedback/analyze/route.ts";

const key = "test-server-key-" + "x".repeat(32);
process.env.FORMCRAFT_API_KEY = key;
process.env.FEEDBACK_API_URL = "https://api.example";
process.env.NODE_ENV = "production";
const payload = { items: [{ id: "a", text: "excellent" }] };
const request = (body = JSON.stringify(payload), headers = {}) => new Request("https://forms.example/api/feedback/analyze", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: "https://forms.example", ...headers }, body,
});
let calls = 0;
globalThis.fetch = async (url, options) => {
  calls++;
  assert.equal(url.toString(), "https://api.example/analyze");
  assert.equal(options.headers["X-FormCraft-Key"], key);
  assert.equal(options.redirect, "error");
  return Response.json({ model_version: "release1", results: [{ id: "a", sentiment: "positive" }] });
};
assert.equal((await POST(request())).status, 200);
assert.equal((await POST(request("{}", { Origin: "https://evil.example" }))).status, 403);
assert.equal((await POST(request("{}", { "sec-fetch-site": "cross-site" }))).status, 403);
assert.equal((await POST(request("{}", { "Content-Type": "text/plain" }))).status, 415);
assert.equal((await POST(request("not-json"))).status, 400);
assert.equal((await POST(request(JSON.stringify({ items: [payload.items[0], payload.items[0]] })))).status, 400);
assert.equal((await POST(request("x".repeat(512 * 1024 + 1)))).status, 413);
assert.equal(calls, 1, "Invalid requests never reach the Python service");
delete process.env.FORMCRAFT_API_KEY;
assert.equal((await POST(request())).status, 503);
process.env.FORMCRAFT_API_KEY = key;
globalThis.fetch = async () => Response.json({ detail: "private backend message" }, { status: 401 });
const denied = await POST(request());
assert.equal(denied.status, 503);
assert.ok(!(await denied.text()).includes("private backend message"));
globalThis.fetch = async () => Response.json({}, { status: 429 });
assert.equal((await POST(request())).status, 429);
globalThis.fetch = async () => Response.json({ model_version: "release1", results: [] });
assert.equal((await POST(request())).status, 502);
globalThis.fetch = async () => { throw new Error("secret detail"); };
assert.equal((await POST(request())).status, 503);
console.log("PASS: proxy validation, size limit, same-origin guard, server key, response checks and sanitized errors.");
