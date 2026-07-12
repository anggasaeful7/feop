import type { Metadata } from "next";
import { BrandPanel } from "./components/brand-panel";
import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Sign In — IPL Sistem",
  description:
    "Sign in to the IPL Sistem cluster dashboard for community managers and financial administrators.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row flex-1 bg-auth-panel">
      <div className="hidden lg:block lg:w-1/2">
        <BrandPanel />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <header className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
              Sign In
            </h1>
            <p className="mt-3 text-base text-zinc-600">
              Welcome back! Please enter your credentials to access your cluster
              dashboard.
            </p>
          </header>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
