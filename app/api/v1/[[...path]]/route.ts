/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, params);
}

async function handleProxy(request: NextRequest, paramsPromise: Promise<{ path?: string[] }>) {
  const params = await paramsPromise;
  const pathSegments = params.path || [];

  const targetUrl = new URL(
    `/api/v1/${pathSegments.join("/")}`,
    "https://ipl-v2-dev-operator.nuratech.id"
  );

  // Forward original search/query parameters
  const { search } = new URL(request.url);
  targetUrl.search = search;

  const headers = new Headers(request.headers);

  // CRITICAL: delete Host/Origin/Referer headers to prevent Host validation errors and CORS blocks
  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");

  // Read request body for write methods
  let body: any = undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    try {
      body = await request.arrayBuffer();
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers(res.headers);
    // Remove encoding headers to avoid body parsing issues
    responseHeaders.delete("content-encoding");

    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: `Proxy error: ${error.message}` } },
      { status: 500 }
    );
  }
}
