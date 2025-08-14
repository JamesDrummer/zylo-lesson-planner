export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prefer a full start webhook URL if provided, otherwise fallback to a sensible default
const START_WEBHOOK_URL =
  process.env.N8N_START_WEBHOOK_URL;
  
export async function POST(request: Request) {
  const targetUrl = START_WEBHOOK_URL;

  const contentType = request.headers.get("content-type") || "application/json";
  const authorization = request.headers.get("authorization");
  const headers = new Headers();
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);

  const body = await request.text();

  type NodeLikeError = Error & {
    code?: string | number;
    errno?: string | number;
    syscall?: string;
    address?: string;
    port?: number;
    cause?: unknown;
  };

  function serializeError(err: unknown) {
    const e = err as NodeLikeError;
    const cause = (e && typeof e === "object" && "cause" in e ? (e as { cause?: unknown }).cause : undefined) as
      | (Error & { code?: string | number; errno?: string | number; syscall?: string; address?: string; port?: number })
      | undefined;
    return {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
      code: e?.code ?? (cause && (cause as { code?: unknown }).code),
      errno: e?.errno ?? (cause && (cause as { errno?: unknown }).errno),
      syscall: e?.syscall ?? (cause && (cause as { syscall?: unknown }).syscall),
      address: e?.address ?? (cause && (cause as { address?: unknown }).address),
      port: e?.port ?? (cause && (cause as { port?: unknown }).port),
    };
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
      redirect: "manual",
    });
  } catch (err) {
    console.error("[/api/start] upstream fetch error", {
      url: targetUrl,
      runtime,
      node: process.version,
      error: serializeError(err),
    });
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

  if (!upstreamResponse.ok) {
    let errorBody = "";
    try {
      errorBody = await upstreamResponse.text();
    } catch {
      errorBody = "";
    }
    console.warn("[/api/start] upstream non-2xx response", {
      url: targetUrl,
      status: upstreamResponse.status,
      bodyPreview: errorBody.slice(0, 2000),
    });
    return new Response(errorBody, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}


