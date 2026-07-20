import { api } from "@/lib/axios";

export interface ChangePasswordPayload {
  password: string;
  confPassword: string;
}

export const UserService = {
  changePassword: async (id: string, payload: ChangePasswordPayload) => {
    return api(`/users/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
