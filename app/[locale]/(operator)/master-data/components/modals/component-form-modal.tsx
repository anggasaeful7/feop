"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import type { BillingComponent } from "@/types/billing-dummy";

export function ComponentFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: BillingComponent;
  onClose: () => void;
}) {
  const [form, setForm] = useState(
    initial || { name: "", price: "", description: "", isPaid: true }
  );

  return (
    <Modal
      open
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-2xl font-bold italic">{title}</span>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 not-italic">
            Komponen Berbayar
            <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${form.isPaid ? 'bg-brand-700' : 'bg-zinc-300'}`} onClick={() => setForm({ ...form, isPaid: !form.isPaid })}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${form.isPaid ? 'left-[22px]' : 'left-0.5'}`}></div>
            </div>
          </div>
        </div>
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" onClick={onClose} className="rounded-full px-6">
            ✕ Batal
          </Button>
          <Button onClick={onClose} className="rounded-full px-6">
            ✓ {initial ? "Simpan Perubahan" : "Tambahkan Komponen"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 mt-2">
        <Field label="Nama">
          <input
            className={`${inputClass} rounded-lg italic`}
            placeholder="Nama Komponen"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Harga">
          <input
            type="number"
            className={`${inputClass} rounded-lg italic`}
            placeholder="Harga"
            value={form.price ?? ""}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            disabled={!form.isPaid}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Harga" hint=" ">
            <textarea
              className={`${inputClass} h-24 py-2 rounded-lg italic resize-none`}
              placeholder="Harga"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
