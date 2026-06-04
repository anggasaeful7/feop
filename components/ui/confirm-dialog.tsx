"use client";

import { useConfirmStore } from "@/store/use-confirm-store";
import { Modal, ModalFormFooter } from "./modal";
import { AlertCircle } from "lucide-react";

export function ConfirmDialog() {
  const { isOpen, options, isLoading, close, setLoading } = useConfirmStore();

  if (!isOpen || !options) return null;

  const handleConfirm = async () => {
    try {
      const result = options.onConfirm();
      if (result instanceof Promise) {
        setLoading(true);
        await result;
      }
      close();
    } catch (error) {
      setLoading(false);
      // Let the caller handle toast errors if needed, or we just close.
      // Usually, if the caller wants to keep it open on error, they shouldn't throw to the confirm dialog.
    }
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    close();
  };

  return (
    <Modal
      open={isOpen}
      title={
        <div className="flex items-center gap-2">
          {options.isDestructive && <AlertCircle className="text-rose-600 h-5 w-5" />}
          <span className="text-lg font-bold text-zinc-900">
            {options.title || "Konfirmasi"}
          </span>
        </div>
      }
      onClose={handleCancel}
      className="max-w-md"
      footer={
        <ModalFormFooter
          isPending={isLoading}
          onClose={handleCancel}
          onSubmit={handleConfirm}
          submitLabel={options.confirmLabel || "Ya, Lanjutkan"}
          cancelLabel={options.cancelLabel || "Batal"}
          submitVariant={options.isDestructive ? "danger" : "primary"}
          cancelVariant="secondary"
        />
      }
    >
      <div className="text-sm text-zinc-600 mt-2">
        {options.message}
      </div>
    </Modal>
  );
}
