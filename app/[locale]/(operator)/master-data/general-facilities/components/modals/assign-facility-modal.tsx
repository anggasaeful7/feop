"use client";

import { useState, useMemo } from "react";
import { Button, DataTable } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { useGeneralFacilities, useAssignGeneralFacility } from "@/hooks/api/use-general-facility";
import { useUnits } from "@/hooks/api/use-unit";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useConfirmStore } from "@/store/use-confirm-store";
import type { GeneralFacility } from "@/types";
import type { Unit } from "@/types/master-data";

export function AssignGeneralFacilityModal({ onClose }: { onClose: () => void }) {
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set());
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [searchUnit, setSearchUnit] = useState("");
  const debouncedSearchUnit = useDebounce(searchUnit, 500);
  const [searchFacility, setSearchFacility] = useState("");
  const debouncedSearchFacility = useDebounce(searchFacility, 500);

  const [facilitiesPage, setFacilitiesPage] = useState(1);
  const [unitsPage, setUnitsPage] = useState(1);

  const { data: facilitiesData, isFetching: isFetchingFacilities } = useGeneralFacilities({ search: debouncedSearchFacility, per_page: 10, page: facilitiesPage });
  const { data: unitsData, isFetching: isFetchingUnits } = useUnits({ search: debouncedSearchUnit, per_page: 10, page: unitsPage, exclude_vacant: true });
  
  const assignMutation = useAssignGeneralFacility();
  const { confirm } = useConfirmStore();

  const facilities = useMemo(() => facilitiesData?.items || [], [facilitiesData?.items]);
  const units = useMemo(() => unitsData?.items || [], [unitsData?.items]);

  const handleSave = () => {
    confirm({
      title: "Assign Fasilitas",
      message: `Anda akan memberikan akses ${selectedFacilities.size} fasilitas ke ${selectedUnits.size} unit.\n\nApakah Anda yakin ingin menyimpan pengaturan ini?`,
      confirmLabel: "Assign",
      onConfirm: () => {
        assignMutation.mutate(
          {
            general_facility_ids: Array.from(selectedFacilities),
            unit_ids: Array.from(selectedUnits),
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

  const toggleFacility = (id: string) => {
    const next = new Set(selectedFacilities);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedFacilities(next);
  };

  const toggleUnit = (id: string) => {
    const next = new Set(selectedUnits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUnits(next);
  };

  const facilitiesColumns: ColumnDef<GeneralFacility>[] = useMemo(() => {
    const isAllPageSelected = facilities.length > 0 && facilities.every(f => selectedFacilities.has(f.id));
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
              const next = new Set(selectedFacilities);
              if (isAllPageSelected) {
                facilities.forEach(f => next.delete(f.id));
              } else {
                facilities.forEach(f => next.add(f.id));
              }
              setSelectedFacilities(next);
            }}
          >
            {isAllPageSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
        ),
        cell: ({ row }) => {
          const isSelected = selectedFacilities.has(row.original.id);
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
        header: "Nama Fasilitas",
        cell: ({ row }) => <span className="font-bold">{row.original.name}</span>,
      },
    ];
  }, [facilities, selectedFacilities]);

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
          <div className="text-xl font-bold italic">Assign Fasilitas ke Unit</div>
          <div className="text-xs text-zinc-400 italic font-normal mt-1">Berikan akses fasilitas ke beberapa unit sekaligus</div>
        </div>
      }
      onClose={onClose}
      className="max-w-4xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 flex flex-col gap-1 font-bold">
            <div>{selectedUnits.size} dari {unitsData?.total || 0} Unit dipilih</div>
            <div>{selectedFacilities.size} dari {facilitiesData?.total || 0} Fasilitas dipilih</div>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button variant="danger" onClick={onClose} className="w-full sm:w-auto rounded-full px-6" disabled={assignMutation.isPending}>
              ✕ Batal
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto rounded-full px-6" disabled={assignMutation.isPending || selectedFacilities.size === 0 || selectedUnits.size === 0}>
              {assignMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "✓ "} Assign Fasilitas
            </Button>
          </div>
        </div>
      }
    >
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
            onRowClick={(row) => toggleUnit(row.id)}
            size="sm"
            page={unitsPage}
            perPage={10}
            onPageChange={setUnitsPage}
            isLoading={isFetchingUnits}
          />
        </div>

        {/* Right Table: Fasilitas */}
        <div className="flex flex-col h-full overflow-hidden [&_.overflow-x-auto]:max-h-[300px]">
          <DataTable
            title="Fasilitas"
            data={facilities}
            columns={facilitiesColumns}
            total={facilitiesData?.total || 0}
            search={searchFacility}
            onSearchChange={(val) => {
              setSearchFacility(val);
              setFacilitiesPage(1);
            }}
            onRowClick={(row) => toggleFacility(row.id)}
            size="sm"
            page={facilitiesPage}
            perPage={10}
            onPageChange={setFacilitiesPage}
            isLoading={isFetchingFacilities}
          />
        </div>
      </div>
    </Modal>
  );
}
