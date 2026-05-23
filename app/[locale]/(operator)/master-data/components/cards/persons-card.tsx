"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import {
  usePersons,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
} from "@/hooks/api/use-person";
import type { Person, PersonPayload } from "@/types/master-data";
import { CSVTools } from "../csv-import";
import { PersonFormModal } from "../modals/person-form-modal";

const emptyForm: PersonPayload = {
  full_name: "",
  phone: "",
  email: "",
  id_card_no: "",
  notes: "",
};

const ROLE_LABEL: Record<"owner" | "resident", string> = {
  owner: "Pemilik",
  resident: "Penghuni",
};

export function PersonsCard({ role }: { role: "owner" | "resident" }) {
  const { data, error, isPending, refetch } = usePersons(role);
  const items = data?.items || [];

  const [editing, setEditing] = useState<Person | null>(null);
  const [creating, setCreating] = useState(false);

  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson(editing?.id || "");
  const deletePerson = useDeletePerson();

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-900">
            Daftar {ROLE_LABEL[role]}
          </h3>
          <p className="text-xs italic text-zinc-500">
            {role === "owner"
              ? "Pemilik unit di cluster (bisa juga sebagai penghuni)."
              : "Penghuni yang menempati unit (pemilik atau penyewa)."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CSVTools
            resourceLabel="Warga"
            templatePath="/api/v1/master/persons/csv-template"
            importPath="/api/v1/master/persons/import"
            templateFilename="persons-template.csv"
            onAfterImport={() => { refetch(); }}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} /> Tambah Warga
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <th className="px-2 py-3 text-left">Nama</th>
            <th className="px-2 py-3 text-left">Kontak</th>
            <th className="px-2 py-3 text-left">
              {role === "owner" ? "Unit yang Dimiliki" : "Unit Hunian"}
            </th>
            <th className="px-2 py-3 text-left">Status</th>
            <th className="px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {isPending && (
            <tr>
              <td colSpan={5} className="px-2 py-6 text-center text-zinc-400">
                Memuat…
              </td>
            </tr>
          )}
          {!isPending && items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-2 py-6 text-center text-zinc-400">
                Belum ada {ROLE_LABEL[role].toLowerCase()}.
              </td>
            </tr>
          )}
          {items.map((p) => {
            const refs = role === "owner" ? p.owned_units : p.resided_in_units;
            return (
              <tr key={p.id} className="border-t border-zinc-200/70">
                <td className="px-2 py-4">
                  <div className="font-bold text-zinc-900">{p.full_name}</div>
                  {p.id_card_no && (
                    <div className="text-xs italic text-zinc-500">
                      KTP {p.id_card_no}
                    </div>
                  )}
                </td>
                <td className="px-2 py-4 text-zinc-700">
                  <div>{p.phone ?? "-"}</div>
                  <div className="text-xs text-zinc-500">{p.email ?? ""}</div>
                </td>
                <td className="px-2 py-4 text-zinc-700">
                  {refs.length === 0 ? (
                    <span className="italic text-zinc-400">-</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {refs.map((r) => (
                        <span
                          key={r.id}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
                        >
                          {r.code}
                        </span>
                      ))}
                    </span>
                  )}
                </td>
                <td className="px-2 py-4">
                  <span className="flex flex-wrap gap-1">
                    {p.is_owner && <Badge tone="info">Pemilik</Badge>}
                    {p.is_resident && <Badge tone="success">Penghuni</Badge>}
                    {!p.is_owner && !p.is_resident && (
                      <Badge tone="neutral">-</Badge>
                    )}
                  </span>
                </td>
                <td className="px-2 py-4 text-right">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {creating && (
        <PersonFormModal
          title="Tambah Warga"
          initial={emptyForm}
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            await createPerson.mutateAsync(payload);
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <PersonFormModal
          title={`Edit ${editing.full_name}`}
          initial={{
            full_name: editing.full_name,
            phone: editing.phone ?? "",
            email: editing.email ?? "",
            id_card_no: editing.id_card_no ?? "",
            notes: editing.notes ?? "",
          }}
          onClose={() => setEditing(null)}
          onDelete={async () => {
            if (!confirm(`Hapus ${editing.full_name}?`)) return;
            await deletePerson.mutateAsync(editing.id);
            setEditing(null);
          }}
          onSubmit={async (payload) => {
            await updatePerson.mutateAsync(payload);
            setEditing(null);
          }}
        />
      )}
    </Card>
  );
}

