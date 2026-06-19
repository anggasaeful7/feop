import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPermissionsData } from "@/types/permissions";

interface PermissionsState {
  permissions: UserPermissionsData | null;
  setPermissions: (permissions: UserPermissionsData | null) => void;
  clearPermissions: () => void;
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set) => ({
      permissions: null,
      setPermissions: (permissions) => set({ permissions }),
      clearPermissions: () => set({ permissions: null }),
    }),
    {
      name: "ipl-permissions-store",
    }
  )
);
