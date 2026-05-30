import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import { Person } from "@/types/master-data";

export const baseColumns: ColumnDef<Person>[] = [
  {
    header: "Nama",
    accessorKey: "full_name",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <>
          <div className="font-bold text-zinc-900">{p.full_name}</div>
          {p.id_card_no && (
            <div className="text-xs italic text-zinc-500">
              KTP {p.id_card_no}
            </div>
          )}
        </>
      );
    },
  },
  {
    header: "Kontak",
    id: "contact",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="text-zinc-700">
          <div>{p.phone ?? "-"}</div>
          <div className="text-xs text-zinc-500">{p.email ?? ""}</div>
        </div>
      );
    },
  },
  {
    header: "Unit",
    id: "units",
    cell: ({ row }) => {
      const p = row.original;
      const allRefsMap = new Map();
      p.owned_units?.forEach((u) => allRefsMap.set(u.id, { ...u, type: 'owner' }));
      p.resided_in_units?.forEach((u) => {
        if (allRefsMap.has(u.id)) {
          allRefsMap.set(u.id, { ...u, type: 'both' });
        } else {
          allRefsMap.set(u.id, { ...u, type: 'resident' });
        }
      });

      const allRefs = Array.from(allRefsMap.values());

      return (
        <div className="text-zinc-700">
          {allRefs.length === 0 ? (
            <span className="italic text-zinc-400">-</span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {allRefs.map((r) => (
                <span
                  key={r.id}
                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
                  title={r.type === 'both' ? 'Pemilik & Penghuni' : r.type === 'owner' ? 'Pemilik' : 'Penghuni'}
                >
                  {r.code}
                </span>
              ))}
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "Status",
    id: "status",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <span className="flex flex-wrap gap-1">
          {p.is_owner && <Badge tone="info">Pemilik</Badge>}
          {p.is_resident && <Badge tone="success">Penghuni</Badge>}
          {!p.is_owner && !p.is_resident && (
            <Badge tone="neutral">-</Badge>
          )}
        </span>
      );
    },
  },
];
