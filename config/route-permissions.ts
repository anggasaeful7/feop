import type { ResourcePermissionsMap } from "@/types/permissions";

export type RoutePermission = {
  path: string;
  requiredResource?: keyof ResourcePermissionsMap;
  requiredRole?: string;
  exact?: boolean;
};

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: "/dashboard", exact: false },
  { path: "/penghuni", requiredResource: "resident_bills" },
  { path: "/fasilitas-penghuni", requiredResource: "specific_billings" },
  { path: "/laporan", requiredResource: "financial_reports" },
  { path: "/laporan-masalah", requiredResource: "complaints" },
  { path: "/laporan-tamu", requiredResource: "guest_reports" },
  { path: "/pengajuan-surat", requiredResource: "letter_requests" },
  { path: "/izin-renovasi", requiredResource: "renovation_permits" },
  { path: "/fasilitas", requiredResource: "facility_bookings" },
  { path: "/jadwal/keamanan", requiredResource: "schedules" },
  { path: "/jadwal/kebersihan", requiredResource: "schedules" },
  { path: "/master-data/penghuni/emergency-contacts", requiredResource: "workspace_contacts" },
  { path: "/master-data/penghuni", requiredResource: "units" }, // Catch-all for other penghuni sub-pages like units
  { path: "/master-data/petugas", requiredRole: "admin_workspace" },
  { path: "/platform-billing", requiredResource: "platform_billing" },
  { path: "/notifikasi", requiredResource: "notifications" },
  { path: "/pengaturan", requiredRole: "admin_workspace" },
];
