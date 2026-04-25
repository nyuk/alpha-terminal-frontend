import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:33333";
  const { path } = await context.params;
  const url = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;

  const requestHeaders = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) requestHeaders.set("cookie", cookie);
  const contentType = request.headers.get("content-type");
  if (contentType) requestHeaders.set("content-type", contentType);
  const authorization = request.headers.get("authorization");
  if (authorization) requestHeaders.set("authorization", authorization);
  const accept = request.headers.get("accept");
  if (accept) requestHeaders.set("accept", accept);

  let body: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(url, {
      method: request.method,
      headers: requestHeaders,
      body: body,
      redirect: "manual",
    });
  } catch (err) {
    console.error("[proxy] fetch failed", { method: request.method, err });
    return new NextResponse(
      JSON.stringify({ error: "요청 처리 중 오류가 발생했습니다." }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  // 리다이렉트 응답은 브라우저에 직접 전달 (외부 도메인 리다이렉트 차단)
  if (backendResponse.status >= 300 && backendResponse.status < 400) {
    const location = backendResponse.headers.get("location");
    if (location) {
      // SSRF/Open Redirect 방지: 백엔드 도메인 또는 상대 경로만 허용
      const isAllowed = (() => {
        try {
          const parsed = new URL(location, BACKEND_URL);
          const backendOrigin = new URL(BACKEND_URL).origin;
          return parsed.origin === backendOrigin || parsed.origin === request.nextUrl.origin;
        } catch {
          return location.startsWith("/");
        }
      })();
      if (!isAllowed) {
        return new NextResponse(null, { status: 403 });
      }
      const redirectHeaders = new Headers();
      const setCookies = backendResponse.headers.getSetCookie();
      for (const c of setCookies) {
        redirectHeaders.append("set-cookie", c);
      }
      return NextResponse.redirect(location, {
        status: backendResponse.status,
        headers: redirectHeaders,
      });
    }
  }

  const responseHeaders = new Headers();
  const ct = backendResponse.headers.get("content-type");
  if (ct) responseHeaders.set("content-type", ct);

  const setCookies = backendResponse.headers.getSetCookie();
  for (const c of setCookies) {
    responseHeaders.append("set-cookie", c);
  }

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export const maxDuration = 60;

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
