import type { Metadata } from "next";
import { BrandPanel } from "../login/components/brand-panel";
import { ForgotPasswordForm } from "./components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — IPL Sistem",
  description:
    "Reset your password to regain access to the IPL Sistem cluster dashboard.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row flex-1 bg-auth-panel">
      <div className="hidden lg:block lg:w-1/2">
        <BrandPanel />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <header className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
              Forgot Password
            </h1>
            <p className="mt-3 text-base text-zinc-600">
              Enter your email address and we&apos;ll send you a one-time password to
              reset your password.
            </p>
          </header>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
