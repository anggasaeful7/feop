import type { BillingComponent, UnitDummy } from "@/types/billing-dummy";

export const dummyComponents: BillingComponent[] = [
  { id: "1", name: "Keamanan", description: "Patroli Keamanan", price: 50000, isPaid: true },
  { id: "2", name: "Pemeliharaan Jalan", description: "Pemeliharaan jalan utama", price: 20000, isPaid: true },
  { id: "3", name: "Pembersihan", description: "Jasa kebersihan", price: 20000, isPaid: true },
  { id: "4", name: "Sanitasi", description: "Sistem pembuangan limbah", price: 50000, isPaid: true },
  { id: "5", name: "Akses Masuk", description: "Akses masuk portal", price: null, isPaid: false },
];

export const dummyUnits: UnitDummy[] = [
  { id: "1", code: "A-12", residentName: "Pak Budi S.", activeComponents: "Keamanan, Sanitasi" },
  { id: "2", code: "B-34", residentName: "Ibu Siti A.", activeComponents: "Keamanan, Akses Masuk" },
  { id: "3", code: "C-56", residentName: "Tuan Joko P.", activeComponents: "Keamanan" },
  { id: "4", code: "C-57", residentName: "Maya Sari", activeComponents: "Keamanan" },
  { id: "5", code: "C-58", residentName: "Ravi Kumar", activeComponents: "Keamanan" },
];
