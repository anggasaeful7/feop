"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileItem {
  id: string;
  name: string;
  size?: number;
}

interface FileSectionProps {
  title: string;
  files?: FileItem[];
  emptyMessage?: string;
  loadingId?: string | null;
  onView: (id: string) => void;
}

export function FileItemRow({
  name,
  size,
  loading,
  onView,
}: {
  name: string;
  size?: number;
  loading?: boolean;
  onView: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="text-blue-500 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 line-clamp-1">{name}</p>
          {size !== undefined && (
            <p className="text-xs text-zinc-500">{(size / 1024).toFixed(2)} KB</p>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onView} disabled={loading}>
        {loading ? "Memuat..." : "Lihat"}
      </Button>
    </div>
  );
}

export function FileSection({
  title,
  files,
  emptyMessage = "Tidak ada lampiran",
  loadingId,
  onView,
}: FileSectionProps) {
  return (
    <div className="pt-4 border-t border-zinc-100">
      <div className="text-xs font-semibold text-zinc-600 mb-2">{title.toUpperCase()}</div>
      {files && files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file) => (
            <FileItemRow
              key={file.id}
              name={file.name}
              size={file.size}
              loading={loadingId === file.id}
              onView={() => onView(file.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 italic">{emptyMessage}</p>
      )}
    </div>
  );
}
