"use client";

import { useState } from "react";
import { Modal, Field, Button } from "@/components/ui";
import type { RenovationPermit } from "@/types/renovation-permit";
import { useApproveRenovationPermit } from "@/hooks/api/use-renovation-permit";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApproveModalProps {
  permit: RenovationPermit;
  onClose: () => void;
  onBack: () => void;
}

export function ApproveModal({ permit, onClose, onBack }: ApproveModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const { mutate: approve, isPending } = useApproveRenovationPermit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || fileError) return;

    approve(
      { id: permit.id, file },
      {
        onSuccess: () => {
          toast.success("Izin renovasi berhasil disetujui");
          onClose();
        },
        onError: () => {
          toast.error("Gagal menyetujui izin renovasi");
        },
      }
    );
  };

  return (
    <Modal open title="Setujui Izin Renovasi" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-100">
          Anda akan menyetujui izin renovasi untuk <strong>{permit.resident_name}</strong> (Unit: {permit.unit_code}).
        </div>

        <Field label="Surat Izin (PDF)" hint="Maksimal 5MB">
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
            required
          />
          {fileError && <p className="text-[0.8rem] font-medium text-destructive mt-1">{fileError}</p>}
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" disabled={!file || !!fileError || isPending}>
            {isPending ? <Loader2 size={16} className="animate-spin" /> : "Setujui & Upload"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

