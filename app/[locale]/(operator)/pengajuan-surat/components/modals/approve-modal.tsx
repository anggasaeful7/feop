"use client";

import { useState } from "react";
import { Modal, Field, Button } from "@/components/ui";
import type { LetterRequest } from "@/types/letter-request";
import { useApproveLetterRequest } from "@/hooks/api/use-letter-request";
import { Loader2 } from "lucide-react";

export function ApproveModal({
  request,
  onClose,
  onBack,
}: {
  request: LetterRequest;
  onClose: () => void;
  onBack: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const { mutate, isPending } = useApproveLetterRequest(request.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append("result_file", file);

    mutate(fd, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal open title="Setujui Pengajuan Surat" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-100">
          Anda akan menyetujui pengajuan surat <strong>{request.subject}</strong> dari <strong>{request.resident_name}</strong>.
        </div>

        <Field label="Upload Surat Jadi (PDF)" hint="Maksimal 25MB">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-brand file:text-brand-900
              hover:file:bg-brand-100 mt-2"
            required
          />
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" disabled={!file || isPending}>
            {isPending ? <Loader2 size={16} className="animate-spin" /> : "Setujui & Upload"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
