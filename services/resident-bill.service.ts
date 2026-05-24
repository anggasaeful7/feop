import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type {
  ResidentBill,
  ResidentBillQueryParams,
  ResidentBillCreatePayload,
} from "@/types/billing";

const BASE_URL = "/api/v1/resident-bills";

export async function getResidentBills(params?: ResidentBillQueryParams) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.kind) qs.set("kind", params.kind);
  if (params?.unit_id) qs.set("unit_id", params.unit_id);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", params.page.toString());
  if (params?.per_page) qs.set("per_page", params.per_page.toString());

  const query = qs.toString();
  return api<Paged<ResidentBill>>(`${BASE_URL}${query ? `?${query}` : ""}`);
}

export async function getResidentBill(id: string) {
  return api<ResidentBill>(`${BASE_URL}/${id}`);
}

export async function createResidentBill(payload: ResidentBillCreatePayload) {
  return api<ResidentBill>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteResidentBill(id: string) {
  return api<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function approveResidentBill({
  id,
  payload,
}: {
  id: string;
  payload?: { paid_at?: string; notes?: string };
}) {
  return api<ResidentBill>(`${BASE_URL}/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify(payload || {}),
  });
}

export async function rejectResidentBill({
  id,
  reason,
}: {
  id: string;
  reason: string;
}) {
  return api<ResidentBill>(`${BASE_URL}/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
