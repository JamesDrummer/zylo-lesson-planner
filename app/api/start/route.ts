export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prefer a full start webhook URL if provided, otherwise fallback to a sensible default
const START_WEBHOOK_URL =
  process.env.N8N_START_WEBHOOK_URL ||
  "https://myn8n.brightonhovedrumlessons.uk/webhook-test/0d06665c-e090-4cec-bef3-40f2a9263f92";
  
export async function POST(request: Request) {
  const targetUrl = START_WEBHOOK_URL;

  const contentType = request.headers.get("content-type") || "application/json";
  const authorization = request.headers.get("authorization");
  const headers = new Headers();
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);

  const body = await request.text();

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
      redirect: "manual",
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Upstream fetch failed", message: (err as Error).message }),
      {
        status: 502,
        headers: { "content-type": "application/json", "x-upstream-url": targetUrl },
      }
    );
  }

  // Copy headers but drop encodings/lengths to avoid double-decompression issues in browsers
  const responseHeaders = new Headers();
  responseHeaders.set("x-upstream-url", targetUrl);
  responseHeaders.set("x-upstream-status", String(upstreamResponse.status));
  upstreamResponse.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "content-encoding" || k === "transfer-encoding" || k === "content-length") return;
    responseHeaders.set(key, value);
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}


