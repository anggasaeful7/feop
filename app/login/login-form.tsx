"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiError = {
  error: { code: string; message: string; details?: Record<string, unknown> };
};

type LoginSuccess = {
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      full_name: string;
      role: string;
      workspace_id?: string;
    };
  };
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        setErrorMsg(
          body?.error?.message ?? "Login failed. Please check your credentials.",
        );
        return;
      }

      const body = (await res.json()) as LoginSuccess;
      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem("ipl_access_token", body.data.access_token);
      storage.setItem("ipl_user", JSON.stringify(body.data.user));
      router.push("/dashboard");
    } catch {
      setErrorMsg("Cannot reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-zinc-900"
        >
          Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
            <User size={20} aria-hidden="true" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-(--brand)/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-zinc-900"
        >
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
            <Lock size={20} aria-hidden="true" />
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-12 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-(--brand)/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-3 flex items-center px-2 text-zinc-400 hover:text-zinc-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-zinc-600 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-brand"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-xl bg-brand text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        New to IPL Sistem?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand hover:underline"
        >
          Create an Account
        </Link>
      </p>
    </form>
  );
}

