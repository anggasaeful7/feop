"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { idr } from "@/lib/format";
import { ResidentBillByUnitItem } from "@/types/billing";

interface BillingDetailsProps {
  unit: ResidentBillByUnitItem;
  year: number;
  handleTagih: (unitCode: string, title: string, amount: number) => void;
}

export function BillingDetails({ unit, year, handleTagih }: BillingDetailsProps) {
  const hasDebt = unit.bills_debt && unit.bills_debt.length > 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#E4DDCB] bg-white p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">

      {/* Section 1: Previous Years Arrears (Tunggakan) */}
      {hasDebt && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
            <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">Tunggakan Tahun Sebelumnya</h4>
          </div>
          <div className="rounded-lg border border-rose-100 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-rose-50/50 text-rose-800 font-semibold border-b border-rose-100 uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-2 w-12">No</th>
                  <th className="px-4 py-2">Judul Tagihan</th>
                  <th className="px-4 py-2 w-24">Jenis</th>
                  <th className="px-4 py-2 w-32">Nominal</th>
                  <th className="px-4 py-2 w-28">Pembayar</th>
                  <th className="px-4 py-2 w-28">Status</th>
                  <th className="px-4 py-2 w-44">Keterangan</th>
                  <th className="px-4 py-2 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {unit.bills_debt!.map((bill, bIdx) => {
                  return (
                    <tr key={bill.id} className="bg-rose-50/10 hover:bg-rose-50/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-rose-400">
                        {bIdx + 1}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-zinc-800">
                        {bill.title}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-bold capitalize text-[#8A9582] italic">
                          {bill.kind === "monthly" ? "Bulanan" : "Spesifik"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-rose-700">
                        {idr(bill.total_amount)}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-700">
                        {bill.bill_payer_name || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone="danger">
                          Tunggakan
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500">
                        {bill.due_at ? (
                          <span className="text-[11px] text-rose-700 font-semibold">
                            Jatuh Tempo: {new Date(bill.due_at).toLocaleDateString("id-ID")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {bill.status === "unpaid" && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="h-7 text-[11px] px-2.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagih(unit.unit_code, bill.title, bill.total_amount);
                            }}
                          >
                            <MessageCircle size={12} className="mr-1" /> Tagih
                          </Button>
                        )}
                        {bill.status === "pending_verification" && (
                          <Link href={`/penghuni/${unit.unit_id}/verifikasi?bill_id=${bill.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="warning" size="sm" className="h-7 text-[11px] px-2.5">
                              Verifikasi
                            </Button>
                          </Link>
                        )}
                        {bill.status !== "unpaid" && bill.status !== "pending_verification" && (
                          <Link href={`/penghuni/${unit.unit_id}/verifikasi?bill_id=${bill.id}`} className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold italic" onClick={(e) => e.stopPropagation()}>
                            Detail →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 2: Current Year Bills */}
      <div>
        {hasDebt && (
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-1">Tagihan Tahun {year}</h4>
        )}
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-2 w-12">No</th>
                <th className="px-4 py-2">Judul Tagihan</th>
                <th className="px-4 py-2 w-24">Jenis</th>
                <th className="px-4 py-2 w-32">Nominal</th>
                <th className="px-4 py-2 w-28">Pembayar</th>
                <th className="px-4 py-2 w-28">Status</th>
                <th className="px-4 py-2 w-44">Keterangan</th>
                <th className="px-4 py-2 text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {unit.bills.map((bill, bIdx) => {
                const isDanger = bill.status === "unpaid" && bill.due_at && new Date(bill.due_at) < new Date();

                return (
                  <tr key={bill.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      {bIdx + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-800">
                      {bill.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold capitalize text-[#8A9582] italic">
                        {bill.kind === "monthly" ? "Bulanan" : "Spesifik"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-900">
                      {idr(bill.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {bill.bill_payer_name || "—"}
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {bill.status === "paid" && bill.paid_at ? (
                        <span className="text-xs text-emerald-700 font-medium italic">
                          Lunas: {new Date(bill.paid_at).toLocaleDateString("id-ID")}
                        </span>
                      ) : bill.due_at ? (
                        <span className={`text-[11px] ${isDanger ? "text-rose-700 font-semibold" : "text-zinc-500"}`}>
                          Jatuh Tempo: {new Date(bill.due_at).toLocaleDateString("id-ID")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {bill.status === "unpaid" && (
                        <Button
                          variant="danger"
                          size="sm"
                          className="h-7 text-[11px] px-2.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTagih(unit.unit_code, bill.title, bill.total_amount);
                          }}
                        >
                          <MessageCircle size={12} className="mr-1" /> Tagih
                        </Button>
                      )}

                      {bill.status === "pending_verification" && (
                        <Link href={`/penghuni/${unit.unit_id}/verifikasi?bill_id=${bill.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="warning" size="sm" className="h-7 text-[11px] px-2.5">
                            Verifikasi
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
              {unit.bills.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-zinc-400 italic">
                    Tidak ada data tagihan untuk unit ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
