"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Download,
  MessageCircle,
} from "lucide-react";
import { Badge, Button, PageHeader, DataTable } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useResidentBills } from "@/hooks/api/use-resident-bill";
import { useUnits } from "@/hooks/api/use-unit";
import { useDebounce } from "@/hooks/use-debounce";
import { idr } from "@/lib/format";
import { ResidentBill } from "@/types/billing";
import { toast } from "sonner";

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "paid", label: "Lunas" },
  { key: "pending_verification", label: "Pending" },
  { key: "unpaid", label: "Lewat" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

export default function BillingPenghuniPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Load all units to map unit_id -> unit details (code, resident_name, etc.)
  const { data: unitsData } = useUnits({ per_page: 500 });
  const unitsMap = useMemo(() => {
    const map = new Map<string, { code: string; residentName: string }>();
    if (unitsData?.items) {
      unitsData.items.forEach((u) => {
        map.set(u.id, {
          code: u.code,
          residentName: u.resident_name || u.owner_name || "—",
        });
      });
    }
    return map;
  }, [unitsData]);

  // Load resident bills
  const { data: billsData, isLoading, error } = useResidentBills({
    status: activeTab === "all" ? undefined : activeTab,
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const bills = billsData?.items || [];
  const total = billsData?.total || 0;

  const handleSendReminderMassal = () => {
    toast.success("Reminder massal berhasil dikirim ke WhatsApp penghuni!");
  };

  const handleTagih = (unitCode: string, title: string, amount: number) => {
    toast.success(`Reminder tagihan ${title} sebesar ${idr(amount)} dikirim ke Unit ${unitCode}`);
  };

  // Columns definition for DataTable
  const columns: ColumnDef<ResidentBill>[] = useMemo(() => [
    {
      header: "No",
      id: "index",
      cell: ({ row }) => (page - 1) * perPage + row.index + 1,
    },
    {
      header: "Unit",
      id: "unit",
      cell: ({ row }) => {
        const bill = row.original;
        const unitInfo = bill.unit_id ? unitsMap.get(bill.unit_id) : undefined;
        return <span className="font-mono text-sm font-semibold text-zinc-900">{unitInfo?.code || "—"}</span>;
      },
    },
    {
      header: "Penghuni",
      id: "resident",
      cell: ({ row }) => {
        const bill = row.original;
        const unitInfo = bill.unit_id ? unitsMap.get(bill.unit_id) : undefined;
        return <span className="font-medium text-zinc-800">{unitInfo?.residentName || "—"}</span>;
      },
    },
    {
      header: "Judul Tagihan",
      accessorKey: "title",
      cell: ({ row }) => <span className="text-zinc-700 font-semibold">{row.original.title}</span>,
    },
    {
      header: "Tagihan",
      accessorKey: "total_amount",
      cell: ({ row }) => <span className="font-bold text-zinc-900">{idr(row.original.total_amount)}</span>,
    },
    {
      header: "Jenis",
      accessorKey: "kind",
      cell: ({ row }) => (
        <span className="text-xs font-semibold capitalize text-[#8A9582] italic">
          {row.original.kind === "monthly" ? "Bulanan" : "Spesifik"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <Badge
            tone={
              bill.status === "paid"
                ? "success"
                : bill.status === "pending_verification"
                  ? "warning"
                  : bill.status === "rejected"
                    ? "danger"
                    : "warning"
            }
          >
            {bill.status === "paid"
              ? "Lunas"
              : bill.status === "pending_verification"
                ? "Verifikasi"
                : bill.status === "rejected"
                  ? "Ditolak"
                  : "Belum"}
          </Badge>
        );
      },
    },
    {
      header: "Terakhir Bayar / Jatuh Tempo",
      id: "period",
      cell: ({ row }) => {
        const bill = row.original;
        const isDanger = bill.status === "unpaid" && bill.due_at && new Date(bill.due_at) < new Date();
        if (bill.status === "paid" && bill.paid_at) {
          return (
            <span className="text-xs text-emerald-700 font-medium italic">
              Lunas: {new Date(bill.paid_at).toLocaleDateString("id-ID")}
            </span>
          );
        }
        return bill.due_at ? (
          <span className={`text-xs ${isDanger ? "text-rose-700 font-semibold" : "text-zinc-500"}`}>
            Jatuh Tempo: {new Date(bill.due_at).toLocaleDateString("id-ID")}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const bill = row.original;
        const unitInfo = bill.unit_id ? unitsMap.get(bill.unit_id) : undefined;
        const unitCode = unitInfo?.code || "—";

        if (bill.status === "unpaid") {
          return (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleTagih(unitCode, bill.title, bill.total_amount)}
            >
              <MessageCircle size={14} className="mr-1" /> Tagih
            </Button>
          );
        }

        if (bill.status === "pending_verification") {
          return (
            <Link href={`/penghuni/${bill.unit_id}/verifikasi?bill_id=${bill.id}`}>
              <Button variant="warning" size="sm">
                Verifikasi
              </Button>
            </Link>
          );
        }

        return (
          <Link href={`/penghuni/${bill.unit_id}/verifikasi?bill_id=${bill.id}`} className="text-xs text-zinc-600 hover:underline hover:text-zinc-900 font-semibold italic">
            Detail →
          </Link>
        );
      },
    },
  ], [page, unitsMap]);

  return (
    <>
      <PageHeader
        eyebrow="Admin · Kelola Tagihan"
        title="Billing Penghuni"
        subtitle="Status pembayaran per unit · Verifikasi bukti transfer"
        actions={
          <Button onClick={handleSendReminderMassal} disabled={isLoading || total === 0} className="font-bold italic">
            Kirim Reminder Massal
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data tagihan"}
        </div>
      )}

      <DataTable
        data={bills}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Cari tagihan…"
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        emptyMessage="Tidak ada data tagihan ditemukan."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`h-9 rounded-full px-4 text-xs font-semibold transition ${activeTab === tab.key
                  ? tab.key === "unpaid"
                    ? "bg-rose-700 text-white"
                    : "bg-brand-900 text-white"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
            <a href="/api/v1/resident-bills/export.xlsx" download>
              <Button variant="secondary" size="sm" className="font-bold italic">
                <Download size={14} className="mr-1" /> CSV / Excel
              </Button>
            </a>
          </div>
        }
      />
    </>
  );
}
