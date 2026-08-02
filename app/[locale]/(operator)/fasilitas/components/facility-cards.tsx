"use client";

import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { idrShort } from "@/lib/format";
import { useFacilities } from "@/hooks/api/use-facility";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import type { Facility } from "@/types/facility";

export function FacilityCards({ onEdit }: { onEdit?: (f: Facility) => void }) {
  const { data, isLoading } = useFacilities();
  const { data: permissions } = usePermissions();
  const canUpdate = hasPermission(permissions, "facilities", "update");
  const facilities = data?.items;

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading && (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 rounded-2xl border border-zinc-200/70 bg-white p-6 text-center text-sm text-zinc-500">
          Memuat fasilitas…
        </div>
      )}
      {!isLoading && facilities?.length === 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
          Belum ada fasilitas. Klik “Tambah Fasilitas”.
        </div>
      )}
      {facilities?.map((f) => (
        <button
          key={f.id}
          onClick={canUpdate && onEdit ? () => onEdit(f) : undefined}
          className={`rounded-2xl border border-zinc-200/70 bg-white p-4 text-left transition ${
            canUpdate ? "hover:border-zinc-300 hover:shadow-sm" : "cursor-default"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cream-100 text-zinc-700">
              <Building2 size={20} />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900">{f.name}</span>
                {!f.is_active && <Badge tone="neutral">nonaktif</Badge>}
              </div>
              <div className="text-xs italic text-zinc-500">
                {f.bookings_mtd}× bulan ini ·{" "}
                {f.pricing_mode === "monthly" ? "membership" : "per sesi"}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-bold text-zinc-900">{idrShort(f.revenue_mtd)}</div>
            {f.pending_count > 0 && <Badge tone="warning">{f.pending_count} pending</Badge>}
          </div>
        </button>
      ))}
    </div>
  );
}
