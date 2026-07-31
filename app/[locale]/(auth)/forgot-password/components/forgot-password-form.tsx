"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/axios";
import {
  requestOtpSchema,
  resetPasswordSchema,
} from "@/lib/validations/forgot-password";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleRequestOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = requestOtpSchema.safeParse({ email });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api<{ message: string }>("/auth/forgot-password/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      toast.success(res.message, {
        description: "Mohon cek spam jika tidak ada di inbox.",
        duration: 8000,
      });
      setStep("reset");
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

  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = resetPasswordSchema.safeParse({ otp, password, confirmPassword });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api<{ message: string }>("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify({ email, otp, password, confirm_password: confirmPassword }),
      });

      toast.success(res.message);
      router.push("/login");
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

  if (step === "reset") {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setErrorMsg(null);
            }}
            className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
          <h2 className="text-xl font-semibold text-zinc-900">Reset Password</h2>
          <p className="text-sm text-zinc-500">
            Enter the OTP sent to <span className="font-medium text-zinc-700">{email}</span> and
            your new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="w-full space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-semibold text-zinc-900">
              OTP Code
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
                <KeyRound size={20} aria-hidden="true" />
              </span>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-(--brand)/20 tracking-widest text-center font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-900">
              New Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
                <Lock size={20} aria-hidden="true" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-900">
              Confirm Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
                <Lock size={20} aria-hidden="true" />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-12 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-(--brand)/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 flex items-center px-2 text-zinc-400 hover:text-zinc-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="w-full space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-zinc-900">
          Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
            <Mail size={20} aria-hidden="true" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-(--brand)/20"
          />
        </div>
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
        {submitting ? "Sending OTP..." : "Send OTP"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
