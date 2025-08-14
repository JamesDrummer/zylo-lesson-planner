export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const resumeUrl = url.searchParams.get("url");
  if (!resumeUrl) {
    return new Response(JSON.stringify({ error: "Missing 'url' query parameter" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  // Validate absolute URL
  try {
    const parsed = new URL(resumeUrl);
    if (!parsed.protocol || !parsed.host) throw new Error("Not absolute");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid resumeUrl; must be absolute" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const method = request.method;
  const contentType = request.headers.get("content-type") || undefined;
  const authorization = request.headers.get("authorization");

  const headers = new Headers();
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);

  const streamBody: ReadableStream<Uint8Array> | null | undefined =
    method !== "GET" && method !== "HEAD" ? request.body : undefined;

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
    upstreamResponse = await fetch(resumeUrl, {
      method: "POST",
      headers,
      body: streamBody ?? undefined,
      ...(streamBody ? { duplex: "half" } : {}),
      redirect: "manual",
    });
  } catch (err) {
    console.error("[/api/resume] upstream fetch error", {
      url: resumeUrl,
      runtime,
      node: process.version,
      error: serializeError(err),
    });
    return new Response(
      JSON.stringify({ error: "Upstream fetch failed", message: (err as Error).message }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      }
    );
  }

  // Copy headers but drop encodings/lengths to avoid double-decompression issues in browsers
  const responseHeaders = new Headers();
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
    console.warn("[/api/resume] upstream non-2xx response", {
      url: resumeUrl,
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


