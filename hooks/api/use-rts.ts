import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { RT } from "@/types";

export const rtsQK = {
  all: ["rts"] as const,
};

export async function getMyRts(): Promise<RT[]> {
  const res = await api<Record<string, unknown> | (string | RT)[]>("/me/rts");
  if (!res) return [];
  
  // Extract array from possible response envelopes
  let array: (string | RT)[] = [];
  if (Array.isArray(res)) {
    array = res;
  } else if (typeof res === "object" && res !== null) {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj.rts)) {
      array = obj.rts as (string | RT)[];
    } else if (Array.isArray(obj.items)) {
      array = obj.items as (string | RT)[];
    } else {
      // Find the first property that is an array
      const found = Object.values(obj).find(Array.isArray);
      if (found) {
        array = found as (string | RT)[];
      }
    }
  }
  
  // Normalize elements to RT objects
  return array.map((item) => {
    if (typeof item === "string") {
      return {
        id: item,
        code: item,
        name: `RT ${item}`,
        workspace_id: "",
        rw_id: "",
        is_active: true,
        created_at: "",
        updated_at: "",
      };
    }
    const r = item as Partial<RT>;
    return {
      id: r.id || r.code || "",
      code: r.code || r.name || "",
      name: r.name || `RT ${r.code || ""}`,
      workspace_id: r.workspace_id || "",
      rw_id: r.rw_id || "",
      is_active: r.is_active ?? true,
      created_at: r.created_at || "",
      updated_at: r.updated_at || "",
    };
  });
}

export function useMyRts() {
  return useQuery({
    queryKey: rtsQK.all,
    queryFn: getMyRts,
  });
}
