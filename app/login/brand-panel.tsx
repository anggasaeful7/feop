export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-[var(--brand)] p-12 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 30% 35%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 60%), linear-gradient(135deg, #0F4438 0%, #093028 50%, #051C16 100%)",
        }}
      />

      <div className="relative h-full flex items-center justify-center">
        <CylinderArt />
      </div>

      <div className="relative">
        <h2 className="text-5xl font-semibold tracking-tight">IPL Sistem</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-white/70">
          Empowering community managers and financial administrators with
          transparent, reliable, and efficient tools.
        </p>
      </div>
    </div>
  );
}

function CylinderArt() {
  return (
    <div className="relative h-[420px] w-[420px]">
      <div
        className="absolute inset-x-6 bottom-10 top-24 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #1B5C4D 0%, #0E3F33 60%, #062019 100%)",
          boxShadow:
            "inset 0 -40px 80px rgba(0,0,0,0.55), inset 0 30px 60px rgba(255,255,255,0.06)",
        }}
      />
      <div
        className="absolute left-6 right-6 top-10 h-40 rounded-[50%]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 35%, #2E8775 0%, #14564A 55%, #0B3A30 100%)",
          boxShadow:
            "inset 0 8px 24px rgba(255,255,255,0.18), inset 0 -16px 40px rgba(0,0,0,0.45)",
        }}
      />
      <div
        className="absolute left-1/2 top-[88px] h-28 w-44 -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 40%, #4FB39B 0%, #1F6B5A 50%, #0A372D 100%)",
          boxShadow:
            "inset 0 6px 16px rgba(255,255,255,0.25), inset 0 -10px 24px rgba(0,0,0,0.55)",
        }}
      />
      <div
        className="absolute left-1/2 top-[126px] h-12 w-12 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, #061712 0%, #020908 100%)",
          boxShadow: "0 0 20px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}
