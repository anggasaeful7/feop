"use client";

import { useState } from "react";
import { Modal, Field, Button } from "@/components/ui";
import type { LetterRequest } from "@/types/letter-request";
import { useRejectLetterRequest } from "@/hooks/api/use-letter-request";
import { Loader2 } from "lucide-react";

export function RejectModal({
  request,
  onClose,
  onBack,
}: {
  request: LetterRequest;
  onClose: () => void;
  onBack: () => void;
}) {
  const [reason, setReason] = useState("");
  const { mutate, isPending } = useRejectLetterRequest(request.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    mutate(
      { reason: reason.trim() },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal open title="Tolak Pengajuan Surat" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-100">
          Anda akan menolak pengajuan surat <strong>{request.subject}</strong> dari <strong>{request.resident_name}</strong>.
        </div>

        <Field label="Alasan Penolakan" hint="Wajib diisi">
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tuliskan alasan penolakan..."
            className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand focus:ring-2 focus:ring-(--brand)/20"
          />
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" variant="danger" disabled={!reason.trim() || isPending}>
            {isPending ? <Loader2 size={16} className="animate-spin" /> : "Tolak Surat"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
