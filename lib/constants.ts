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
