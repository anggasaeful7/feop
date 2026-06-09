import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { Person, PersonPayload, PersonQueryParams } from "@/types/master-data";

export const PersonService = {
  getPersons: async (params?: PersonQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const path = `/master/persons${query ? `?${query}` : ""}`;
    return api<Paged<Person>>(path);
  },

  createPerson: async (payload: PersonPayload) => {
    return api<Person>("/master/persons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePerson: async (id: string, payload: PersonPayload) => {
    return api<Person>(`/master/persons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deletePerson: async (id: string) => {
    return api(`/master/persons/${id}`, {
      method: "DELETE",
    });
  },
};
