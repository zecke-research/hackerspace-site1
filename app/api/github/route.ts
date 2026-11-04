import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_BODY_BYTES = 128 * 1024;
const DELIVERY_TTL_MS = 60 * 60 * 1000;
const deliveries = new Map<string, number>();

async function readBody(request: Request): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("body_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}

type Payload = {
  action?: unknown;
  number?: unknown;
  repository?: { full_name?: unknown };
  pull_request?: {
    head?: { sha?: unknown; repo?: { full_name?: unknown } };
  };
};

export async function POST(request: Request) {
  const secret = process.env.WEBHOOK_SECRET ?? "";
  const repo = process.env.GITHUB_WEBHOOK_REPO ?? "";
  if (secret.length < 32 || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return Response.json({ error: "receiver_not_configured" }, { status: 503 });
  }
  if (
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return Response.json({ error: "use_application_json" }, { status: 415 });
  }
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  if (!/^sha256=[a-f\d]{64}$/i.test(signature)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }
  let raw: Buffer;
  try {
    raw = await readBody(request);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof RangeError ? "body_too_large" : "invalid_body",
      },
      { status: error instanceof RangeError ? 413 : 400 },
    );
  }
  const expected = createHmac("sha256", secret).update(raw).digest();
  const received = Buffer.from(signature.slice(7), "hex");
  if (!timingSafeEqual(expected, received)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }
  let payload: Payload;
  try {
    payload = JSON.parse(raw.toString("utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new TypeError("invalid_json_object");
    }
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const fullName = payload.repository?.full_name;
  if (
    typeof fullName !== "string" ||
    fullName.toLowerCase() !== repo.toLowerCase()
  ) {
    return Response.json({ error: "repository_not_allowed" }, { status: 403 });
  }
  const event = request.headers.get("x-github-event");
  if (event !== "ping" && event !== "pull_request") {
    return Response.json({ status: "ignored", reason: "event" });
  }
  const delivery = request.headers.get("x-github-delivery") ?? "";
  if (!/^[\w-]{1,100}$/.test(delivery)) {
    return Response.json({ error: "invalid_delivery_id" }, { status: 400 });
  }
  // Cache de una instancia. Un reinicio pierde este estado.
  const now = Date.now();
  for (const [id, expires] of deliveries) {
    if (expires <= now) deliveries.delete(id);
  }
  if (deliveries.has(delivery)) return Response.json({ status: "duplicate" });
  if (deliveries.size >= 1000) {
    const oldest = deliveries.keys().next().value;
    if (oldest !== undefined) deliveries.delete(oldest);
  }
  deliveries.set(delivery, now + DELIVERY_TTL_MS);
  // Se registra metadata acotada. Este receptor no invoca un modelo.
  console.info("github-webhook", {
    delivery,
    event,
    action:
      typeof payload.action === "string" ? payload.action.slice(0, 80) : null,
    repo: fullName,
    number: typeof payload.number === "number" ? payload.number : null,
  });
  return Response.json({ status: "received", event, delivery });
}
