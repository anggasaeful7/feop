"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "../ui";
import { api, ApiError } from "../api";
import type { Person, PersonPayload } from "./types";
import { Field, Modal, inputClass } from "./modal";
import { useList } from "./use-resource";
import { CSVTools } from "./csv-import";

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
  const path = `/api/v1/master/persons?role=${role}&per_page=100`;
  const { items, error, reload, setError } = useList<Person>(path);

  const [editing, setEditing] = useState<Person | null>(null);
  const [creating, setCreating] = useState(false);

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
            onAfterImport={reload}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} /> Tambah Warga
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
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
          {items === null && (
            <tr>
              <td colSpan={5} className="px-2 py-6 text-center text-zinc-400">
                Memuat…
              </td>
            </tr>
          )}
          {items !== null && items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-2 py-6 text-center text-zinc-400">
                Belum ada {ROLE_LABEL[role].toLowerCase()}.
              </td>
            </tr>
          )}
          {items?.map((p) => {
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
            await api<Person>("/api/v1/master/persons", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setCreating(false);
            await reload();
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
            try {
              await api(`/api/v1/master/persons/${editing.id}`, {
                method: "DELETE",
              });
              setEditing(null);
              await reload();
            } catch (e) {
              setError(e instanceof ApiError ? e.message : "Gagal hapus");
            }
          }}
          onSubmit={async (payload) => {
            await api<Person>(`/api/v1/master/persons/${editing.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });
            setEditing(null);
            await reload();
          }}
        />
      )}
    </Card>
  );
}

function PersonFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  title: string;
  initial: PersonPayload;
  onClose: () => void;
  onSubmit: (p: PersonPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<PersonPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PersonPayload>(k: K, v: PersonPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: PersonPayload = {
        full_name: form.full_name,
        phone: emptyToNull(form.phone),
        email: emptyToNull(form.email),
        id_card_no: emptyToNull(form.id_card_no),
        notes: emptyToNull(form.notes),
      };
      await onSubmit(payload);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          {onDelete && (
            <Button
              variant="danger"
              onClick={async () => {
                setSubmitting(true);
                try {
                  await onDelete();
                } catch (e) {
                  setError(e instanceof ApiError ? e.message : "Gagal hapus");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
            >
              <Trash2 size={14} /> Hapus
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Lengkap">
          <input
            className={inputClass}
            placeholder="Budi Santoso"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </Field>
        <Field label="No. KTP">
          <input
            className={inputClass}
            placeholder="3201xxxxxxxxx"
            value={form.id_card_no ?? ""}
            onChange={(e) => set("id_card_no", e.target.value)}
          />
        </Field>
        <Field label="Telepon">
          <input
            className={inputClass}
            placeholder="+628xxxxxxxxxx"
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            placeholder="warga@example.com"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Catatan">
            <textarea
              className={`${inputClass} h-20 py-2`}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
    </Modal>
  );
}

function emptyToNull(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.trim();
  return t === "" ? null : t;
}
