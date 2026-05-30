import { Pencil, Trash2, Loader2 } from "lucide-react";

export interface DataTableRowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  deleteConfirmMessage?: string;
  extraActions?: React.ReactNode;
}

export function DataTableRowActions({
  onEdit,
  onDelete,
  isDeleting,
  deleteConfirmMessage = "Apakah Anda yakin ingin menghapus data ini?",
  extraActions,
}: DataTableRowActionsProps) {
  return (
    <div className="flex justify-end gap-2 text-zinc-400">
      {extraActions}
      
      {onEdit && (
        <button
          onClick={onEdit}
          className="hover:text-zinc-700 transition"
          aria-label="Edit"
        >
          <Pencil size={16} />
        </button>
      )}
      
      {onDelete && (
        <button
          onClick={() => {
            if (confirm(deleteConfirmMessage)) {
              onDelete();
            }
          }}
          className="text-rose-400 hover:text-rose-600 transition"
          disabled={isDeleting}
          aria-label="Delete"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      )}
    </div>
  );
}
