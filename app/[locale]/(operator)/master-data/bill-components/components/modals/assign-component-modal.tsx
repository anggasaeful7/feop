"use client";

import { useState, useMemo } from "react";
import { Button, DataTable } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { useBillComponents, useAssignBillComponents } from "@/hooks/api/use-bill-component";
import { useUnits } from "@/hooks/api/use-unit";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import type { BillComponent, Unit } from "@/types/master-data";

export function AssignComponentModal({ onClose }: { onClose: () => void }) {
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [searchUnit, setSearchUnit] = useState("");
  const debouncedSearchUnit = useDebounce(searchUnit, 500);

  const [componentsPage, setComponentsPage] = useState(1);
  const [unitsPage, setUnitsPage] = useState(1);

  const { data: componentsData, isFetching: isFetchingComponents } = useBillComponents({ per_page: 10, page: componentsPage });
  const { data: unitsData, isFetching: isFetchingUnits } = useUnits({ search: debouncedSearchUnit, per_page: 10, page: unitsPage });
  const assignMutation = useAssignBillComponents();

  const components = useMemo(() => componentsData?.items || [], [componentsData?.items]);
  const units = useMemo(() => unitsData?.items || [], [unitsData?.items]);

  const handleSave = () => {
    assignMutation.mutate(
      {
        component_ids: Array.from(selectedComponents),
        unit_ids: Array.from(selectedUnits),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const toggleComponent = (id: string) => {
    const next = new Set(selectedComponents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedComponents(next);
  };

  const toggleUnit = (id: string) => {
    const next = new Set(selectedUnits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUnits(next);
  };

  const componentsColumns: ColumnDef<BillComponent>[] = useMemo(() => {
    const isAllPageSelected = components.length > 0 && components.every(c => selectedComponents.has(c.id));
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
              const next = new Set(selectedComponents);
              if (isAllPageSelected) {
                components.forEach(c => next.delete(c.id));
              } else {
                components.forEach(c => next.add(c.id));
              }
              setSelectedComponents(next);
            }}
          >
            {isAllPageSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
        ),
        cell: ({ row }) => {
          const isSelected = selectedComponents.has(row.original.id);
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
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => <span className="font-bold">{row.original.name}</span>,
      },
      {
        accessorKey: "description",
        header: "Desc",
        cell: ({ row }) => <span className="text-zinc-500">{row.original.description || "-"}</span>,
      }
    ];
  }, [components, selectedComponents]);

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
      {
        id: "komponen",
        header: "Komponen Aktif",
        cell: ({ row }) => {
          const comps = row.original.active_components || [];
          if (comps.length === 0) return <span className="text-zinc-500">-</span>;
          const names = comps.map(c => c.name).join(", ");
          return (
            <span className="text-zinc-500 whitespace-nowrap">
              {names}
            </span>
          );
        }
      }
    ];
  }, [units, selectedUnits]);

  return (
    <Modal
      open
      title={
        <div>
          <div className="text-xl font-bold italic">Asign Komponen ke Unit</div>
          <div className="text-xs text-zinc-400 italic font-normal mt-1">Perbaharui Asign Komponen ke Unit</div>
        </div>
      }
      onClose={onClose}
      className="max-w-4xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex flex-col gap-1 font-bold">
            <div>{selectedComponents.size} dari {componentsData?.total || 0} Komponen dipilih</div>
            <div>{selectedUnits.size} dari {unitsData?.total || 0} Unit dipilih</div>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={onClose} className="rounded-full px-6" disabled={assignMutation.isPending}>
              ✕ Batal
            </Button>
            <Button onClick={handleSave} className="rounded-full px-6" disabled={assignMutation.isPending || selectedComponents.size === 0 || selectedUnits.size === 0}>
              {assignMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "✓ "} Simpan Perubahan
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 h-[450px]">
        {/* Left Table: Komponen Tagihan */}
        <div className="flex flex-col h-full overflow-hidden [&_.overflow-x-auto]:max-h-[300px]">
          <DataTable
            title="Komponen Tagihan"
            data={components}
            columns={componentsColumns}
            total={componentsData?.total || 0}
            onRowClick={(row) => toggleComponent(row.id)}
            size="sm"
            page={componentsPage}
            perPage={10}
            onPageChange={setComponentsPage}
            isLoading={isFetchingComponents}
          />
        </div>

        {/* Right Table: Unit */}
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
      </div>
    </Modal>
  );
}
