"use client";

import { env } from "./env";
import { readToken } from "./auth-storage";
import type { ApiEnvelope, ApiErrorBody } from "./types";

export const API_URL = env.apiUrl;

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.code = body.code;
    this.status = status;
    this.details = body.details;
  }
}

export function authHeaders(): Record<string, string> {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  if (body && "error" in body) return new ApiError(res.status, body.error);
  return new ApiError(res.status, {
    code: "unknown",
    message: `Request failed (${res.status})`,
  });
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const body = (await res.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorBody
    | null;

  if (!res.ok) {
    if (body && "error" in body) throw new ApiError(res.status, body.error);
    throw new ApiError(res.status, {
      code: "unknown",
      message: `Request failed (${res.status})`,
    });
  }

  if (body && "data" in body) return body.data;
  return undefined as T;
}

export async function downloadCSV(path: string, suggestedName: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw await parseError(res);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function uploadCSV<T>(path: string, file: File): Promise<T> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    body: fd,
  });

  const body = (await res.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorBody
    | null;

  if (!res.ok) {
    if (body && "error" in body) throw new ApiError(res.status, body.error);
    throw new ApiError(res.status, {
      code: "unknown",
      message: `Upload failed (${res.status})`,
    });
  }

  if (body && "data" in body) return body.data;
  throw new ApiError(res.status, {
    code: "unknown",
    message: "missing response body",
  });
}
