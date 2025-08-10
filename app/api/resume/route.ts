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
    // @ts-expect-error Node streaming option
    ...(streamBody ? { duplex: "half" } : {}),
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => responseHeaders.set(key, value));

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}


