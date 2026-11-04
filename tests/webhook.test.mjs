import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { POST } from "../app/api/github/route.ts";
import { GET } from "../app/api/health/route.ts";
import { lugaresLibres } from "../app/capacidad.ts";

const secret = "a".repeat(64);
process.env.WEBHOOK_SECRET = secret;
process.env.GITHUB_WEBHOOK_REPO = "owner/workshop";
const payload = {
  repository: { full_name: "owner/workshop" },
  action: "opened",
  number: 1,
};
const body = JSON.stringify(payload);
const sign = (b) =>
  `sha256=${createHmac("sha256", secret).update(b).digest("hex")}`;
const request = (b = body, extra = {}) =>
  new Request("http://localhost/api/github", {
    method: "POST",
    body: b,
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": sign(b),
      "x-github-event": "pull_request",
      "x-github-delivery": randomUUID(),
      ...extra,
    },
  });
let checks = 0;
async function status(req, expected) {
  const r = await POST(req);
  assert.equal(r.status, expected);
  checks++;
  return r;
}
await status(request(), 200);
await status(request(body, { "x-hub-signature-256": "" }), 401);
await status(request(body, { "x-hub-signature-256": "sha256=abc" }), 401);
await status(request(body, { "content-type": "text/plain" }), 415);
await status(request(`${body} `, { "x-hub-signature-256": sign(body) }), 401);
await status(
  request(JSON.stringify({ repository: { full_name: "other/repo" } })),
  403,
);
await status(request("{broken"), 400);
await status(request("null"), 400);
await status(request("[]"), 400);
await status(request("x".repeat(128 * 1024 + 1)), 413);
await status(request(body, { "x-github-delivery": "bad\tvalue" }), 400);
const dup = randomUUID();
await status(request(body, { "x-github-delivery": dup }), 200);
const d = await status(request(body, { "x-github-delivery": dup }), 200);
assert.equal((await d.json()).status, "duplicate");
checks++;
const ignored = await status(request(body, { "x-github-event": "push" }), 200);
assert.equal((await ignored.json()).status, "ignored");
checks++;
await status(
  request(JSON.stringify({ repository: { full_name: "OWNER/WORKSHOP" } })),
  200,
);
const unicode = JSON.stringify({ ...payload, title: "Ñandú y café" });
await status(request(unicode), 200);
delete process.env.WEBHOOK_SECRET;
await status(request(), 503);
process.env.WEBHOOK_SECRET = secret;
delete process.env.GITHUB_WEBHOOK_REPO;
await status(request(), 503);
process.env.GITHUB_WEBHOOK_REPO = "owner/workshop";
assert.deepEqual(await GET().json(), { status: "ok", service: "nodoserrano" });
checks++;
assert.equal(lugaresLibres(20, 5), 15);
checks++;
assert.equal(lugaresLibres(20, 20), 0);
checks++;
console.log(
  JSON.stringify({
    checks,
    result: "passed",
    scope:
      "Route Handler unit tests; no Next server, Docker or external integrations",
  }),
);
