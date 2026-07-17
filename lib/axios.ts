import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { env } from "./env";
import { readToken, clearAuth } from "./auth-storage";
import type { ApiEnvelope, ApiErrorBody } from "@/types";

export const API_URL = typeof window !== "undefined" ? "/api" : `${env.apiUrl.replace(/\/$/, '')}/api/v1`;

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

// Create an Axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor to attach the token
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("ipl_access_token")?.value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const apiBaseUrl = cookieStore.get("ipl_api_base_url")?.value;
      const isAuthRoute = config.url?.startsWith("/auth/") || config.url?.startsWith("auth/");
      if (apiBaseUrl && !isAuthRoute) {
        config.baseURL = `${apiBaseUrl.replace(/\/$/, "")}/api/v1`;
      }
    } catch {
      // ignore error if cookies cannot be read
    }
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearAuth();
      }
    }
    return Promise.reject(error);
  }
);

// Generic api function replacing the old fetch-based one
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      url: path,
      method: init?.method || "GET",
      headers: init?.headers as AxiosRequestConfig["headers"],
    };

    if (init?.body) {
      if (typeof init.body === "string") {
        config.data = JSON.parse(init.body);
      } else {
        config.data = init.body;
      }
    }

    const res: AxiosResponse<ApiEnvelope<T> | ApiErrorBody> = await axiosInstance.request(config);

    if (res.status === 204) return undefined as T;

    const body = res.data;
    if (body && "data" in body) return body.data as T;

    return undefined as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorBody>;
      const status = axiosError.response?.status || 500;
      const body = axiosError.response?.data;

      if (body && "error" in body) {
        throw new ApiError(status, body.error);
      }

      throw new ApiError(status, {
        code: "unknown",
        message: axiosError.message || `Request failed (${status})`,
      });
    }
    throw error;
  }
}

export async function downloadCSV(path: string, suggestedName: string) {
  try {
    const res = await axiosInstance.get(path, {
      responseType: "blob",
    });

    const blob = new Blob([res.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      // Blob errors might need parsing back to text if they are JSON error responses
      let errorBody: ApiErrorBody | null = null;
      try {
        const text = await (error.response.data as Blob).text();
        errorBody = JSON.parse(text);
      } catch {
        // ignore
      }
      if (errorBody && "error" in errorBody) {
        throw new ApiError(error.response.status, errorBody.error);
      }
    }
    throw new ApiError(500, { code: "unknown", message: "Download failed" });
  }
}

export async function uploadCSV<T>(path: string, file: File): Promise<T> {
  try {
    const fd = new FormData();
    fd.append("file", file);

    const res = await axiosInstance.post<ApiEnvelope<T> | ApiErrorBody>(path, fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const body = res.data;
    if (body && "data" in body) return body.data as T;

    throw new ApiError(res.status, {
      code: "unknown",
      message: "missing response body",
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorBody>;
      const status = axiosError.response?.status || 500;
      const body = axiosError.response?.data;

      if (body && "error" in body) {
        throw new ApiError(status, body.error);
      }

      throw new ApiError(status, {
        code: "unknown",
        message: axiosError.message || `Upload failed (${status})`,
      });
    }
    throw error;
  }
}
