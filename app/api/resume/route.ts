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

  const upstreamResponse = await fetch(resumeUrl, {
    method: "POST",
    headers,
    body: streamBody ?? undefined,
    ...(streamBody ? { duplex: "half" } : {}),
    redirect: "manual",
  });

  // Copy headers but drop encodings/lengths to avoid double-decompression issues in browsers
  const responseHeaders = new Headers();
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


