"use client";

import Image from "next/image";

import { useState } from "react";
import { Plus, Trash2, Edit2, User } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useFamilyMembers, useDeleteFamilyMember, useFamilyMemberPictureUrl } from "@/hooks/api/use-family-member";
import type { Person, FamilyMember } from "@/types/master-data";
import { FamilyMemberFormModal } from "./family-member-form-modal";
import { Skeleton } from "@/components/ui/skeleton";

function FamilyMemberCard({
  person,
  member,
  onEdit,
}: {
  person: Person;
  member: FamilyMember;
  onEdit: (m: FamilyMember) => void;
}) {
  const { data: pictureData, isLoading: isLoadingPicture } = useFamilyMemberPictureUrl(person.id, member.id, member.has_picture);
  const deleteMut = useDeleteFamilyMember(person.id);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-purple-200 hover:shadow-md transition">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
        {member.has_picture ? (
          isLoadingPicture ? (
            <Skeleton className="h-full w-full" />
          ) : pictureData?.url ? (
            <Image src={pictureData.url} alt={member.name} fill unoptimized className="object-cover" />
          ) : (
            <User className="text-zinc-400" size={24} />
          )
        ) : (
          <User className="text-zinc-400" size={24} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-zinc-900 truncate">{member.name}</h4>
        <p className="text-xs text-purple-600 font-medium">{member.relationship}</p>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span className="truncate">NIK: {member.nik_no_kk || "-"}</span>
          <span>•</span>
          <span className="truncate">{member.gender === "laki_laki" ? "Laki-laki" : member.gender === "perempuan" ? "Perempuan" : member.gender}</span>
          <span>•</span>
          <span className="truncate">{member.contact || "-"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 sm:flex-row shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg"
          onClick={() => onEdit(member)}
        >
          <Edit2 size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          onClick={() => {
            if (confirm(`Hapus ${member.name} dari anggota keluarga?`)) {
              deleteMut.mutate(member.id);
            }
          }}
          disabled={deleteMut.isPending}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

export function FamilyMemberListModal({
  person,
  onClose,
}: {
  person: Person;
  onClose: () => void;
}) {
  const { data, isPending } = useFamilyMembers(person.id);
  const items = data?.items || [];

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);

  return (
    <>
      <Modal
        open={!creating && !editing}
        title={
          <div className="flex flex-col">
            <span className="text-xl font-bold">Anggota Keluarga</span>
            <span className="text-sm font-normal text-zinc-500">{person.full_name}</span>
          </div>
        }
        onClose={onClose}
        className="max-w-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">Daftar anggota keluarga yang terdaftar untuk warga ini.</p>
          <Button size="sm" onClick={() => setCreating(true)} className="rounded-xl">
            <Plus size={16} className="mr-1" /> Tambah
          </Button>
        </div>

        {isPending ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-zinc-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50">
            <User size={40} className="text-zinc-300 mb-2" />
            <p className="text-sm font-medium text-zinc-600">Belum ada anggota keluarga</p>
            <p className="text-xs text-zinc-400 mt-1">Klik tombol tambah untuk mendaftarkan anggota keluarga baru.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {items.map((member) => (
              <FamilyMemberCard
                key={member.id}
                person={person}
                member={member}
                onEdit={setEditing}
              />
            ))}
          </div>
        )}
      </Modal>

      {creating && (
        <FamilyMemberFormModal
          person={person}
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <FamilyMemberFormModal
          person={person}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
