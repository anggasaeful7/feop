// Centralized, typed access to NEXT_PUBLIC_* env vars.
//
// Why: scattering `process.env.NEXT_PUBLIC_*` literals across the codebase
// makes typos silent and defaults inconsistent. Reading them here once gives
// every caller the same fallback and a single place to add validation.
//
// Inlining rule: Next.js inlines `process.env.NEXT_PUBLIC_*` at build time
// only when referenced literally. The static accesses below preserve that.

function read(name: string, value: string | undefined, fallback: string): string {
  const v = value?.trim();
  return v && v.length > 0 ? v : fallback;
}

export const env = {
  apiUrl: read("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL, "http://localhost:8080"),
  appName: read("NEXT_PUBLIC_APP_NAME", process.env.NEXT_PUBLIC_APP_NAME, "IPL Sistem"),
  appEnv: read("NEXT_PUBLIC_APP_ENV", process.env.NEXT_PUBLIC_APP_ENV, "development"),
} as const;
