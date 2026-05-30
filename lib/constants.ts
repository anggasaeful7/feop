import type { UnitStatus, BillPayer } from "@/types/master-data";

export const UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  occupied: "Terhuni",
  vacant: "Kosong",
  maintenance: "Perbaikan",
};

export const UNIT_STATUS_TONE: Record<UnitStatus, "success" | "neutral" | "warning"> = {
  occupied: "success",
  vacant: "neutral",
  maintenance: "warning",
};

export const BILL_PAYER_LABEL: Record<BillPayer, string> = {
  owner: "Pemilik",
  resident: "Penghuni",
};

export const COMPLAINT_STATUS_LABEL: Record<string, string> = {
  open: "Baru",
  in_progress: "Diproses",
  resolved: "Selesai",
  rejected: "Ditolak",
  closed: "Ditutup",
};

export const COMPLAINT_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral" | "running"> = {
  open: "info",
  in_progress: "warning",
  resolved: "success",
  rejected: "danger",
  closed: "neutral",
};

export const COMPLAINT_URGENCY_LABEL: Record<string, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
};

export const COMPLAINT_URGENCY_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral" | "running"> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};
