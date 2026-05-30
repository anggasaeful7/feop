"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { UnitsCard } from "./components/cards/units-card";
import { PersonsCard } from "./components/cards/persons-card";
import { UnitTypesCard } from "./components/cards/unit-types-card";
import { BillComponentsCard } from "./components/cards/bill-components-card";
import { EmergencyContactsCard } from "./components/cards/emergency-contacts-card";

const TABS = ["Unit", "Pemilik", "Penghuni", "Tipe Unit", "Komponen Tagihan", "Kontak Darurat"] as const;
type Tab = (typeof TABS)[number];

export default function MasterDataPage() {
  const [tab, setTab] = useState<Tab>("Unit");

  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfigurasi"
        title="Master Data"
        subtitle="Layanan dasar dan fasilitas"
      />

      <div className="mb-4 flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-10 rounded-full px-5 text-sm font-medium transition ${tab === t
              ? "bg-brand-900 text-white"
              : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Unit" && <UnitsCard />}
      {tab === "Pemilik" && <PersonsCard role="owner" />}
      {tab === "Penghuni" && <PersonsCard role="resident" />}
      {tab === "Tipe Unit" && <UnitTypesCard />}
      {tab === "Komponen Tagihan" && <BillComponentsCard />}
      {tab === "Kontak Darurat" && <EmergencyContactsCard />}
    </>
  );
}
