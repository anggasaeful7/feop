"use client";

import { useState } from "react";
import { Modal, Field, Button } from "@/components/ui";
import type { LetterRequest } from "@/types/letter-request";
import { useApproveLetterRequest } from "@/hooks/api/use-letter-request";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApproveModalProps {
  request: LetterRequest;
  onClose: () => void;
  onBack: () => void;
}

export function ApproveModal({ request, onClose, onBack }: ApproveModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const { mutate, isPending } = useApproveLetterRequest(request.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileError) return;

    mutate(file, {
      onSuccess: () => {
        toast.success("Pengajuan surat berhasil disetujui");
        onClose();
      },
      onError: () => {
        toast.error("Gagal menyetujui pengajuan surat");
      },
    });
  };

  return (
    <Modal open title="Setujui Pengajuan Surat" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-100">
          Anda akan menyetujui pengajuan surat <strong>{request.subject}</strong> dari <strong>{request.resident_name}</strong>.
        </div>

        <Field label="Upload Surat Jadi (PDF)" hint="Maksimal 5MB (Opsional)">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                if (selectedFile.size > 5 * 1024 * 1024) {
                  setFileError("Ukuran file maksimal 5MB");
                  setFile(null);
                } else {
                  setFileError("");
                  setFile(selectedFile);
                }
              } else {
                setFile(null);
                setFileError("");
              }
            }}
            className="block w-full text-sm text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm
              file:bg-brand file:text-zinc-100
              hover:file:bg-brand-100 mt-2"
          />
          {fileError && <p className="text-[0.8rem] font-medium text-destructive mt-1">{fileError}</p>}
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" disabled={!!fileError || isPending}>
            {isPending ? <Loader2 size={16} className="animate-spin" /> : file ? "Setujui & Upload" : "Setujui"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
