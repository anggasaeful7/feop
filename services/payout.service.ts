import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { PayoutLog, PayoutLogQueryParams } from "@/types/payout";

export async function getPayoutLogs(params?: PayoutLogQueryParams): Promise<Paged<PayoutLog>> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", params.page.toString());
  if (params?.per_page) qs.set("per_page", params.per_page.toString());

  const query = qs.toString();
  const path = `/payout-logs${query ? `?${query}` : ""}`;
  const raw = await api<{
    data: PayoutLog[];
    total: number;
    page: number;
    per_page: number;
  }>(path);

  return {
    items: raw.data,
    total: raw.total,
    page: raw.page,
    per_page: raw.per_page,
  };
}
