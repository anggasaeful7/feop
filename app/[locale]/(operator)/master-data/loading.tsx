import { Loader2 } from "lucide-react";

export default function MasterDataLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] space-y-5 rounded-2xl border border-[#E4DDCB] bg-[#FFFDF7] p-8 shadow-sm">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-[#E4DDCB]/40" />
        <Loader2 className="absolute w-14 h-14 animate-spin text-brand stroke-[1.5]" />
      </div>
      <div className="flex flex-col items-center space-y-1 text-center">
        <p className="text-base font-bold italic text-brand">
          Memuat Data
        </p>
        <p className="text-xs text-[#8A9582] font-medium italic">
          Harap tunggu sebentar...
        </p>
      </div>
    </div>
  );
}

