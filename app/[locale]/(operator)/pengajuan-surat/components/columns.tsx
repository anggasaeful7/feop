import { ColumnDef } from "@tanstack/react-table";
import { Badge, Button } from "@/components/ui";
import { Check, Eye, X } from "lucide-react";
import type { LetterRequest } from "@/types/letter-request";
import { formatDate } from "@/lib/format";

export const getColumns = (
  onAction: (request: LetterRequest, action: "detail" | "approve" | "reject") => void
): ColumnDef<LetterRequest>[] => [
  {
    header: "Tanggal",
    accessorKey: "created_at",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    header: "Unit / Pemohon",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.unit_code}</div>
        <div className="text-zinc-500">{row.original.resident_name}</div>
      </div>
    ),
  },
  {
    header: "Subjek",
    accessorKey: "subject",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "approved") {
        return <Badge tone="success">Disetujui</Badge>;
      }
      if (status === "rejected") {
        return <Badge tone="danger">Ditolak</Badge>;
      }
      return <Badge tone="warning">Menunggu</Badge>;
    },
  },
  {
    header: "Aksi",
    id: "actions",
    cell: ({ row }) => {
      const req = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onAction(req, "detail")} title="Detail">
            <Eye size={16} />
          </Button>
          {req.status === "pending" && (
            <>
              <Button variant="secondary" size="sm" onClick={() => onAction(req, "reject")} title="Tolak">
                <X size={16} className="text-rose-600" />
              </Button>
              <Button size="sm" onClick={() => onAction(req, "approve")} title="Setujui">
                <Check size={16} />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
