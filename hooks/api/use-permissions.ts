import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { usePermissionsStore } from "@/store/use-permissions-store";
import { readToken } from "@/lib/auth-storage";
import type { UserPermissionsData, ResourcePermissionsMap } from "@/types/permissions";

export const permissionsQK = {
  all: ["permissions"] as const,
  me: () => [...permissionsQK.all, "me"] as const,
};

export async function getMyPermissions(): Promise<UserPermissionsData> {
  return api<UserPermissionsData>("/me/permissions");
}

export function usePermissions() {
  const permissions = usePermissionsStore((state) => state.permissions);
  const setPermissions = usePermissionsStore((state) => state.setPermissions);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Avoid synchronous setState in effect to prevent lint warnings
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fallback: If store is empty (e.g. legacy session), fetch it once.
  useEffect(() => {
    const token = readToken();
    if (token && isHydrated && !permissions && !isLoading && !hasFetched) {
      let isMounted = true;
      const fetchPermissions = async () => {
        setIsLoading(true);
        try {
          const data = await getMyPermissions();
          if (isMounted) setPermissions(data);
        } catch (e) {
          console.error("Failed to fetch fallback permissions", e);
        } finally {
          if (isMounted) {
            setIsLoading(false);
            setHasFetched(true);
          }
        }
      };
      fetchPermissions();
      return () => { isMounted = false; };
    }
  }, [isHydrated, permissions, isLoading, hasFetched, setPermissions]);

  return {
    data: isHydrated ? permissions : null,
    isLoading: !isHydrated || isLoading,
  };
}

/**
 * Helper function to check if the current user has a specific permission for a resource.
 */
export function hasPermission(
  permissionsData: UserPermissionsData | undefined | null,
  resource: keyof ResourcePermissionsMap,
  action: keyof NonNullable<ResourcePermissionsMap[keyof ResourcePermissionsMap]> = "read"
): boolean {
  if (!permissionsData) return false;
  
  // Example: admin_workspace could have implicit full access,
  // but let's rely on the explicit resources map.
  const resourcePermissions = permissionsData.resources[resource];
  if (!resourcePermissions) return false;

  return !!resourcePermissions[action as keyof typeof resourcePermissions];
}
