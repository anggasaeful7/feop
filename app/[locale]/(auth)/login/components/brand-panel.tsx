import Image from "next/image";

export function BrandPanel() {
  return (
    <div className="relative flex min-h-screen w-1/2 flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 60%), linear-gradient(180deg, #0E3F33 0%, #062019 100%)",
        }}
      />

      <div className="relative flex items-center gap-3">
        <Image
          src="/logo-icon.png"
          alt="IPL Sistem"
          width={48}
          height={48}
          priority
          className="h-12 w-12 rounded-xl bg-white/95 p-1.5"
        />
        <span className="text-lg font-semibold tracking-tight">IPL Sistem</span>
      </div>

      <div className="relative">
        <Image
          src="/logo-full.png"
          alt="IPL Sistem"
          width={520}
          height={172}
          priority
          className="mb-8 h-auto w-72 rounded-2xl bg-white/95 px-5 py-4 shadow-lg"
        />
        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
          Kelola IPL workspace Anda dengan rapi.
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-white/70">
          Empowering community managers and financial administrators with
          transparent, reliable, and efficient tools.
        </p>
      </div>
    </div>
  );
}
