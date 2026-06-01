import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type {
  SpecificBilling,
  SpecificBillingPayload,
  SpecificBillingQueryParams,
  BulkIssueSpecificBillingPayload,
} from "@/types/specific-billing";

const BASE_URL = "/api/v1/master/specific-billings";

export async function getSpecificBillings(params?: SpecificBillingQueryParams) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", params.page.toString());
  if (params?.per_page) qs.set("per_page", params.per_page.toString());

  return api<Paged<SpecificBilling>>(`${BASE_URL}?${qs.toString()}`);
}

export async function getSpecificBilling(id: string) {
  return api<SpecificBilling>(`${BASE_URL}/${id}`);
}

export async function createSpecificBilling(payload: SpecificBillingPayload) {
  return api<SpecificBilling>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSpecificBilling({ id, payload }: { id: string; payload: SpecificBillingPayload }) {
  return api<SpecificBilling>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleSpecificBillingActive(id: string) {
  return api<SpecificBilling>(`${BASE_URL}/${id}/active`, {
    method: "PATCH",
  });
}

export async function deleteSpecificBilling(id: string) {
  return api<{ id: string }>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function issueSpecificBilling(payload: BulkIssueSpecificBillingPayload) {
  return api(`${BASE_URL}/issue`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

