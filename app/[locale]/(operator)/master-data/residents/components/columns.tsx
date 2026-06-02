import { ColumnDef } from "@tanstack/react-table";
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
    header: "Unit Milik",
    id: "owned_units",
    cell: ({ row }) => {
      const p = row.original;
      const owned = p.owned_units || [];
      return (
        <div className="text-zinc-700">
          {owned.length === 0 ? (
            <span className="italic text-zinc-400">-</span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {owned.map((u) => (
                <span
                  key={u.id}
                  className="rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-xs font-medium text-sky-700"
                >
                  {u.code}
                </span>
              ))}
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "Unit Huni",
    id: "resided_units",
    cell: ({ row }) => {
      const p = row.original;
      const resided = p.resided_in_units || [];
      return (
        <div className="text-zinc-700">
          {resided.length === 0 ? (
            <span className="italic text-zinc-400">-</span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {resided.map((u) => (
                <span
                  key={u.id}
                  className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700"
                >
                  {u.code}
                </span>
              ))}
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "Anggota Keluarga",
    id: "family_members",
    cell: ({ row }) => {
      const p = row.original;
      const family = p.family_members || [];
      return (
        <div className="text-zinc-700 max-w-[200px]">
          {family.length === 0 ? (
            <span className="italic text-zinc-400">-</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {family.map((f, idx) => (
                <span
                  key={f.id || idx}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-medium text-purple-700"
                  title={`${f.name} (${f.relationship})`}
                >
                  <span className="font-semibold">{f.relationship}:</span> {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
];
