"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DataTable } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useGeneralFacilitiesByUnit } from "@/hooks/api/use-general-facility";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { UnitWithGeneralFacilities } from "@/types";
import { Badge } from "@/components/ui/badge";

export function FasilitasPenghuniList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching, error } = useGeneralFacilitiesByUnit({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const units = data?.items || [];
  const total = data?.total || 0;

  const columns: ColumnDef<UnitWithGeneralFacilities>[] = useMemo(() => [
    {
      header: "No",
      id: "index",
      cell: ({ row }) => (page - 1) * perPage + row.index + 1,
    },
    {
      accessorKey: "unit_code",
      header: "Kode Unit",
      cell: ({ row }) => <div className="font-bold text-zinc-900">{row.original.unit_code}</div>,
    },
    {
      accessorKey: "unit_block",
      header: "Blok",
    },
    {
      accessorKey: "owner_name",
      header: "Pemilik",
      cell: ({ row }) => row.original.owner_name || "-",
    },
    {
      accessorKey: "resident_name",
      header: "Penghuni",
      cell: ({ row }) => row.original.resident_name || "-",
    },
    {
      accessorKey: "bill_payer",
      header: "Pembayar",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.bill_payer || "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "Fasilitas",
      cell: ({ row }) => {
        const unit = row.original;
        const isExpanded = expandedUnits.has(unit.unit_id);
        const count = unit.general_facilities?.length || 0;
        return (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs text-brand-900 font-bold hover:underline cursor-pointer">
              {isExpanded ? (
                <>
                  Tutup <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Lihat ({count}) <ChevronDown size={14} />
                </>
              )}
            </span>
          </div>
        );
      },
    },
  ], [page, perPage, expandedUnits]);

  const renderRowDetails = (unit: UnitWithGeneralFacilities) => {
    const facilities = unit.general_facilities || [];

    return (
      <div className="flex flex-col gap-4 rounded-xl border border-[#E4DDCB] bg-white p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Daftar Fasilitas</h4>
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-2 w-12">No</th>
                <th className="px-4 py-2">Nama Fasilitas</th>
                <th className="px-4 py-2 w-32">Status</th>
                <th className="px-4 py-2 w-48">Diassign Oleh</th>
                <th className="px-4 py-2 w-48">Tanggal Assign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {facilities.map((fac, idx) => (
                <tr key={fac.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-800">{fac.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={fac.is_active ? "success" : "neutral"}>
                      {fac.is_active ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{fac.assigned_by || "-"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {fac.assigned_at ? new Date(fac.assigned_at).toLocaleDateString("id-ID") : "-"}
                  </td>
                </tr>
              ))}
              {facilities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-400 italic">
                    Tidak ada fasilitas yang di-assign ke unit ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Unit & Fasilitas"
        data={units}
        columns={columns}
        isLoading={isLoading || isFetching}
        search={search}
        onSearchChange={setSearch}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        expandableRowKey={(row) => row.unit_id}
        expandedRowKeys={expandedUnits}
        onExpandedRowKeysChange={setExpandedUnits}
        renderRowDetails={renderRowDetails}
      />
    </div>
  );
}
