"use client";

import { useState, useMemo } from "react";
import { Button, DataTable } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useIssueSpecificBilling, useSpecificBillings } from "@/hooks/api/use-specific-billing";
import { useUnits } from "@/hooks/api/use-unit";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useConfirmStore } from "@/store/use-confirm-store";
import type { SpecificBilling } from "@/types/specific-billing";
import type { Unit } from "@/types/master-data";

type Props = {
  onClose: () => void;
};

export function IssueSpecificBillingModal({ onClose }: Props) {
  const [selectedBillings, setSelectedBillings] = useState<Set<string>>(new Set());
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [searchUnit, setSearchUnit] = useState("");
  const debouncedSearchUnit = useDebounce(searchUnit, 500);

  const [billingsPage, setBillingsPage] = useState(1);
  const [unitsPage, setUnitsPage] = useState(1);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: billingsData, isFetching: isFetchingBillings } = useSpecificBillings({
    per_page: 10,
    page: billingsPage,
  });

  const { data: unitsData, isFetching: isFetchingUnits } = useUnits({
    search: debouncedSearchUnit,
    per_page: 10,
    page: unitsPage,
    exclude_vacant: true,
  });

  const issueMutation = useIssueSpecificBilling();
  const { confirm } = useConfirmStore();

  const billings = useMemo(() => billingsData?.items || [], [billingsData?.items]);
  const units = useMemo(() => unitsData?.items || [], [unitsData?.items]);

  const handleSave = () => {
    const monthName = new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long" });

    confirm({
      title: "Generate Tagihan Spesifik",
      message: `Anda akan membuat ${selectedBillings.size} jenis tagihan untuk ${selectedUnits.size} unit pada periode ${monthName} ${year}.\n\nApakah Anda yakin?`,
      confirmLabel: "Generate",
      onConfirm: () => {
        issueMutation.mutate(
          {
            specific_billing_ids: Array.from(selectedBillings),
            unit_ids: Array.from(selectedUnits),
            month,
            year,
          },
          {
            onSuccess: () => {
              onClose();
            },
          }
        );
      }
    });
  };

  const toggleBilling = (id: string) => {
    const next = new Set(selectedBillings);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBillings(next);
  };

  const toggleUnit = (id: string) => {
    const next = new Set(selectedUnits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUnits(next);
  };

  const billingsColumns: ColumnDef<SpecificBilling>[] = useMemo(() => {
    const isAllPageSelected = billings.length > 0 && billings.every(b => selectedBillings.has(b.id));
    return [
      {
        id: "select",
        header: () => (
          <div
            className={`w-4 h-4 rounded flex items-center justify-center text-white cursor-pointer ${isAllPageSelected
              ? 'bg-brand-700'
              : 'border border-zinc-400 bg-white'
              }`}
            onClick={() => {
              const next = new Set(selectedBillings);
              if (isAllPageSelected) {
                billings.forEach(b => next.delete(b.id));
              } else {
                billings.forEach(b => next.add(b.id));
              }
              setSelectedBillings(next);
            }}
          >
            {isAllPageSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
        ),
        cell: ({ row }) => {
          const isSelected = selectedBillings.has(row.original.id);
          return (
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white ${isSelected ? 'bg-brand-700' : 'border border-zinc-300 bg-white'
                }`}
            >
              {isSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Nama Tagihan",
        cell: ({ row }) => <span className="font-bold">{row.original.title}</span>,
      },
      {
        accessorKey: "amount",
        header: "Nominal",
        cell: ({ row }) => (
          <span className="text-zinc-600">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(row.original.amount)}
          </span>
        ),
      }
    ];
  }, [billings, selectedBillings]);

  const unitsColumns: ColumnDef<Unit>[] = useMemo(() => {
    const isAllPageSelected = units.length > 0 && units.every(u => selectedUnits.has(u.id));
    return [
      {
        id: "select",
        header: () => (
          <div className="w-6 flex justify-center">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white cursor-pointer ${isAllPageSelected
                ? 'bg-brand-700'
                : 'border border-zinc-400 bg-white'
                }`}
              onClick={() => {
                const next = new Set(selectedUnits);
                if (isAllPageSelected) {
                  units.forEach(u => next.delete(u.id));
                } else {
                  units.forEach(u => next.add(u.id));
                }
                setSelectedUnits(next);
              }}
            >
              {isAllPageSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const isSelected = selectedUnits.has(row.original.id);
          return (
            <div className="w-6 flex justify-center">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center text-white ${isSelected ? 'bg-brand-700' : 'border border-zinc-300 bg-white'
                  }`}
              >
                {isSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "code",
        header: () => <div className="w-16">Unit</div>,
        cell: ({ row }) => <div className="w-16 font-bold truncate">{row.original.code}</div>,
      },
      {
        id: "penghuni",
        header: () => <div className="w-28">Penghuni</div>,
        cell: ({ row }) => (
          <div className="w-28 text-zinc-500 truncate" title={row.original.resident_name || row.original.owner_name || ""}>
            {row.original.resident_name || row.original.owner_name || "-"}
          </div>
        ),
      },
    ];
  }, [units, selectedUnits]);

  return (
    <Modal
      open
      title={
        <div>
          <div className="text-xl font-bold italic">Generate Tagihan Spesifik</div>
          <div className="text-xs text-zinc-400 italic font-normal mt-1">Buat tagihan spesifik untuk beberapa unit sekaligus</div>
        </div>
      }
      onClose={onClose}
      className="max-w-4xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex flex-col gap-1 font-bold">
            <div>{selectedBillings.size} dari {billingsData?.total || 0} Tagihan dipilih</div>
            <div>{selectedUnits.size} dari {unitsData?.total || 0} Unit dipilih</div>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={onClose} className="rounded-full px-6" disabled={issueMutation.isPending}>
              ✕ Batal
            </Button>
            <Button onClick={handleSave} className="rounded-full px-6" disabled={issueMutation.isPending || selectedBillings.size === 0 || selectedUnits.size === 0}>
              {issueMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "✓ "} Generate Tagihan
            </Button>
          </div>
        </div>
      }
    >
      {/* Month & Year Selectors */}
      <div className="flex gap-4 mb-4 border-b border-zinc-100 pb-4">
        <div className="w-1/2">
          <label className="text-xs font-semibold text-zinc-500 block mb-1">Bulan (1-12)</label>
          <Input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
            className="rounded-xl italic bg-transparent"
          />
        </div>
        <div className="w-1/2">
          <label className="text-xs font-semibold text-zinc-500 block mb-1">Tahun</label>
          <Input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
            className="rounded-xl italic bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 h-[450px]">
        {/* Left Table: Unit */}
        <div className="flex flex-col h-full overflow-hidden [&_.overflow-x-auto]:max-h-[300px]">
          <DataTable
            title="Unit"
            data={units}
            columns={unitsColumns}
            total={unitsData?.total || 0}
            search={searchUnit}
            onSearchChange={(val) => {
              setSearchUnit(val);
              setUnitsPage(1);
            }}
            searchPlaceholder="Search"
            onRowClick={(row) => toggleUnit(row.id)}
            size="sm"
            page={unitsPage}
            perPage={10}
            onPageChange={setUnitsPage}
            isLoading={isFetchingUnits}
          />
        </div>

        {/* Right Table: Tagihan Spesifik */}
        <div className="flex flex-col h-full overflow-hidden [&_.overflow-x-auto]:max-h-[300px]">
          <DataTable
            title="Daftar Tagihan Spesifik"
            data={billings}
            columns={billingsColumns}
            total={billingsData?.total || 0}
            onRowClick={(row) => toggleBilling(row.id)}
            size="sm"
            page={billingsPage}
            perPage={10}
            onPageChange={setBillingsPage}
            isLoading={isFetchingBillings}
          />
        </div>
      </div>
    </Modal>
  );
}
