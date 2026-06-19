import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface RT {
  id?: string;
  name?: string;
  code?: string;
}

export const rtsQK = {
  all: ["rts"] as const,
};

export async function getMyRts(): Promise<(string | RT)[]> {
  return api<(string | RT)[]>("/me/rts");
}

export function useMyRts() {
  return useQuery({
    queryKey: rtsQK.all,
    queryFn: getMyRts,
  });
}
