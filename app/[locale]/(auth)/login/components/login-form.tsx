"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Building2, ArrowLeft, ChevronRight } from "lucide-react";
import { api, ApiError } from "@/lib/axios";
import { writeAuth } from "@/lib/auth-storage";
import type { LoginResponse } from "@/types";
import { getMyPermissions } from "@/hooks/api/use-permissions";
import { usePermissionsStore } from "@/store/use-permissions-store";
import { useQueryClient } from "@tanstack/react-query";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [workspaceSelection, setWorkspaceSelection] = useState<LoginResponse | null>(null);

  useEffect(() => {
    // Clear permissions store when the login page mounts.
    // This avoids clearing it prematurely before/during the redirect transition,
    // which prevents the sidebar layout from flashing empty.
    usePermissionsStore.getState().clearPermissions();

    // Clear React Query cache so that any cached data from previous user accounts
    // is deleted, forcing new fetches on dashboard.
    queryClient.clear();
  }, [queryClient]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const out = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ type: "website", username: email, password }),
      });

      if (out.requires_workspace_selection && out.workspaces && out.workspaces.length > 0) {
        setWorkspaceSelection(out);
        setSubmitting(false);
        return;
      }

      writeAuth(out.access_token, out.user, out.api_base_url || "", remember);

      // Fetch permissions right after login and save to Zustand
      try {
        const perms = await getMyPermissions();
        usePermissionsStore.getState().setPermissions(perms);
      } catch (err) {
        console.error("Failed to fetch permissions on login", err);
      }

      router.push("/dashboard");
    } catch (e) {
      if (e instanceof ApiError) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("Cannot reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSelectWorkspace(workspaceId: string) {
    if (!workspaceSelection) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const out = await api<LoginResponse>("/auth/select-workspace", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${workspaceSelection.access_token}`,
        },
        body: JSON.stringify({ workspace_id: workspaceId }),
      });

      if (out.api_base_url) {
        writeAuth(out.access_token, out.user, out.api_base_url, remember);

        try {
          const perms = await getMyPermissions();
          usePermissionsStore.getState().setPermissions(perms);
        } catch (err) {
          console.error("Failed to fetch permissions on login", err);
        }

        router.push("/dashboard");
      } else {
        setErrorMsg("Invalid response from server. Missing api_base_url.");
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("Cannot reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (workspaceSelection) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setWorkspaceSelection(null)}
            className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to login
          </button>
          <h2 className="text-xl font-semibold text-zinc-900">Select Workspace</h2>
          <p className="text-sm text-zinc-500">
            Please choose a workspace to continue.
          </p>
        </div>

        <div className="space-y-3">
          {workspaceSelection.workspaces?.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelectWorkspace(ws.id)}
              disabled={submitting}
              className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-brand hover:ring-1 hover:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">{ws.display_name}</div>
                  <div className="text-xs text-zinc-500">{ws.slug}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-brand" />
            </button>
          ))}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMsg}
          </div>
        )}
      </div>
    );
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
