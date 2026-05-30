"use client";

import { useState, useMemo } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Button, DataTable, Badge } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ContactModal } from "../modals/contact-modal";
import type { EmergencyContact } from "@/types/emergency-contact";
import {
  useEmergencyContacts,
  useCreateEmergencyContact,
  useUpdateEmergencyContact,
  useDeleteEmergencyContact,
} from "@/hooks/api/use-emergency-contacts";
import type { EmergencyContactFormValues } from "@/lib/validations/emergency-contact";

export function EmergencyContactsCard() {
  const { data: response, isLoading } = useEmergencyContacts();
  const contacts = response?.items || [];

  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [creating, setCreating] = useState(false);

  const createMutation = useCreateEmergencyContact();
  const updateMutation = useUpdateEmergencyContact(editing?.id || "");
  const deleteMutation = useDeleteEmergencyContact();

  const columns: ColumnDef<EmergencyContact>[] = useMemo(() => [
    {
      header: "Nama Kontak",
      accessorKey: "name",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-zinc-900">{row.original.name}</div>
          <div className="text-xs text-zinc-500 italic">{row.original.phone}</div>
        </div>
      ),
    },
    {
      header: "Peran",
      accessorKey: "role",
      cell: ({ row }) => <span className="font-medium text-zinc-700">{row.original.role}</span>,
    },
    {
      header: "Jam Operasional",
      accessorKey: "hours",
      cell: ({ row }) => <span className="text-zinc-600 italic">{row.original.hours}</span>,
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return isActive ? (
          <Badge tone="success">Aktif</Badge>
        ) : (
          <Badge tone="neutral">Tidak Aktif</Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-end gap-2 text-zinc-400">
            <button onClick={() => setEditing(c)} className="hover:text-zinc-700 transition">
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus kontak ${c.name}?`)) {
                  deleteMutation.mutate(c.id);
                }
              }}
              className="text-rose-400 hover:text-rose-600 transition"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && deleteMutation.variables === c.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        );
      },
    },
  ], [deleteMutation]);

  const handleSubmit = (formData: EmergencyContactFormValues) => {
    if (editing) {
      updateMutation.mutate(formData, {
        onSuccess: () => {
          setEditing(null);
        }
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setCreating(false);
        }
      });
    }
  };

  return (
    <>
      <DataTable
        title="Kontak Darurat"
        data={contacts}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Belum ada data kontak darurat."
        total={response?.total || 0}
        actions={
          <Button onClick={() => setCreating(true)} className="font-bold italic">
            <Plus size={16} className="mr-1" /> Tambah Kontak
          </Button>
        }
      />

      {(creating || editing) && (
        <ContactModal
          open={creating || !!editing}
          onOpenChange={(open) => {
            if (!open) {
              setCreating(false);
              setEditing(null);
            }
          }}
          initialData={editing}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
}
