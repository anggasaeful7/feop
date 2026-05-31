"use client";

import { useState } from "react";
import { Modal, Field, Button } from "@/components/ui";
import type { RenovationPermit } from "@/types/renovation-permit";
import { useRejectRenovationPermit } from "@/hooks/api/use-renovation-permit";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RejectModalProps {
  permit: RenovationPermit;
  onClose: () => void;
  onBack: () => void;
}

export function RejectModal({ permit, onClose, onBack }: RejectModalProps) {
  const [reason, setReason] = useState("");
  const { mutate: reject, isPending } = useRejectRenovationPermit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    reject(
      { id: permit.id, payload: { reason } },
      {
        onSuccess: () => {
          toast.success("Izin renovasi ditolak");
          onClose();
        },
        onError: () => {
          toast.error("Gagal menolak izin renovasi");
        },
      }
    );
  };

  return (
    <Modal open title="Tolak Izin Renovasi" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-100">
          Anda akan menolak izin renovasi untuk <strong>{permit.resident_name}</strong> (Unit: {permit.unit_code}).
        </div>

        <Field label="Alasan Penolakan">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Dokumen tidak lengkap, dll."
            className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus:border-brand focus:outline-none"
            rows={4}
            required
          />
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" variant="danger" disabled={!reason.trim() || isPending}>
            {isPending ? <Loader2 size={16} className="animate-spin" /> : "Tolak Izin"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

