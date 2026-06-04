import { create } from "zustand";
import type { ReactNode } from "react";

type ConfirmOptions = {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDestructive?: boolean;
};

type ConfirmState = {
  isOpen: boolean;
  options: ConfirmOptions | null;
  isLoading: boolean;
  confirm: (options: ConfirmOptions) => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
};

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  options: null,
  isLoading: false,
  confirm: (options) => set({ isOpen: true, options, isLoading: false }),
  close: () => set({ isOpen: false, options: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
