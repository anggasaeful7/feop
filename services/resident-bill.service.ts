import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type {
  ResidentBill,
  ResidentBillQueryParams,
  ResidentBillCreatePayload,
  ResidentBillByUnitQueryParams,
  ResidentBillByUnitItem,
  ResidentBillSummary,
} from "@/types/billing";

const BASE_URL = "/resident-bills";

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

export async function getResidentBillsByUnit(params?: ResidentBillByUnitQueryParams) {
  const qs = new URLSearchParams();
  if (params?.year) qs.set("year", params.year.toString());
  if (params?.status) qs.set("status", params.status);
  if (params?.kind) qs.set("kind", params.kind);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", params.page.toString());
  if (params?.per_page) qs.set("per_page", params.per_page.toString());
  if (params?.unit_id) qs.set("unit_id", params.unit_id);
  if (params?.unit) qs.set("unit", params.unit);
  if (params?.name) qs.set("name", params.name);
  if (params?.rt) qs.set("rt", params.rt);
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.is_late !== undefined) qs.set("is_late", params.is_late.toString());

  const query = qs.toString();
  return api<Paged<ResidentBillByUnitItem>>(`${BASE_URL}/by-unit${query ? `?${query}` : ""}`);
}

export async function getResidentBillSummary(params?: Omit<ResidentBillByUnitQueryParams, "page" | "per_page" | "sort">) {
  const qs = new URLSearchParams();
  if (params?.year) qs.set("year", params.year.toString());
  if (params?.status) qs.set("status", params.status);
  if (params?.kind) qs.set("kind", params.kind);
  if (params?.search) qs.set("search", params.search);
  if (params?.unit_id) qs.set("unit_id", params.unit_id);
  if (params?.unit) qs.set("unit", params.unit);
  if (params?.name) qs.set("name", params.name);
  if (params?.rt) qs.set("rt", params.rt);
  if (params?.is_late !== undefined) qs.set("is_late", params.is_late.toString());

  const query = qs.toString();
  return api<ResidentBillSummary>(`${BASE_URL}/summary${query ? `?${query}` : ""}`);
}

