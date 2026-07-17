import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import type { ApiEnvelope, LoginResponse } from "@/types";

const SUPERADMIN_ROLE = "superadmin";

type ClientErrorBody = { error: { code: string; message: string } };

function clientError(
  status: number,
  code: string,
  message: string
): NextResponse<ClientErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let payload: { username?: unknown; password?: unknown };
  let rawBody: string;
  try {
    rawBody = await request.text();
    payload = JSON.parse(rawBody);
  } catch {
    return clientError(400, "invalid_body", "Badan permintaan harus berupa JSON.");
  }

  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";

  if (!username || !password) {
    return clientError(
      400,
      "validation_error",
      "Email dan password wajib diisi."
    );
  }
  if (password.length < 8) {
    return clientError(
      400,
      "validation_error",
      "password minimal 8 karakter."
    );
  }

  const base = env.apiUrl.endsWith("/") ? env.apiUrl.slice(0, -1) : env.apiUrl;
  const targetUrl = `${base}/api/v1/auth/login`;

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: rawBody,
      cache: "no-store",
    });
  } catch (err) {
    console.error("[LOGIN ROUTE] fetch error:", err);
    return clientError(
      502,
      "upstream_unreachable",
      "Layanan autentikasi tidak dapat dijangkau. Silakan coba lagi."
    );
  }

  let body: ApiEnvelope<LoginResponse> | null = null;
  try {
    body = (await upstream.json()) as ApiEnvelope<LoginResponse>;
  } catch {
    return clientError(
      502,
      "upstream_invalid",
      "Layanan autentikasi mengembalikan respons yang tidak valid."
    );
  }

  if (!upstream.ok || !body?.data) {
    const code = body?.error?.code ?? "auth_failed";
    const message =
      body?.error?.message ??
      (upstream.status === 401
        ? "Email atau password salah."
        : "Gagal masuk. Silakan coba lagi.");
    return clientError(upstream.status === 401 ? 401 : upstream.status, code, message);
  }

  const { user } = body.data;

  if (user.role === SUPERADMIN_ROLE) {
    return clientError(
      403,
      "forbidden_role",
      "Portal ini tidak tersedia untuk superadministrator."
    );
  }
  if (!user.is_active) {
    return clientError(
      403,
      "account_inactive",
      "Akun Anda telah dinonaktifkan. Hubungi administrator."
    );
  }

  return NextResponse.json({ data: body.data });
}
