import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { Person, PersonPayload } from "@/types/master-data";

export const PersonService = {
  getPersons: async (role?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append("per_page", "100");
    if (role) {
      searchParams.append("role", role);
    }
    return api<Paged<Person>>(`/api/v1/master/persons?${searchParams.toString()}`);
  },

  createPerson: async (payload: PersonPayload) => {
    return api<Person>("/api/v1/master/persons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePerson: async (id: string, payload: PersonPayload) => {
    return api<Person>(`/api/v1/master/persons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deletePerson: async (id: string) => {
    return api(`/api/v1/master/persons/${id}`, {
      method: "DELETE",
    });
  },
};
