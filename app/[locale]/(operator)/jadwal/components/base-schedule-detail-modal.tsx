"use client";

import { Loader2, Calendar as CalendarIcon, Clock, Users, Tags, FileText, Pencil, Trash2 } from "lucide-react";
import { useCleaningSchedule, useSecuritySchedule } from "@/hooks/api/use-schedules";

import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { useOfficers } from "@/hooks/api/use-petugas";
import { useShifts } from "@/hooks/api/use-shift";
import type { BaseSchedule } from "@/types/schedules";
import { categoryColorMap } from "@/lib/utils";
import { parseLocalDate } from "@/lib/format";

const DAYS_OF_WEEK: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

export function BaseScheduleDetailModal({
  title,
  scheduleId,
  initialSchedule,
  division,
  onClose,
  onEdit,
  onDelete,
  isDeleting,
}: {
  title: string;
  scheduleId: string;
  initialSchedule?: BaseSchedule;
  division: "cleaning" | "security";
  onClose: () => void;
  onEdit?: (schedule: BaseSchedule) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  const { data: cleaningData, isLoading: isLoadingCleaning } = useCleaningSchedule(division === "cleaning" ? scheduleId : "");
  const { data: securityData, isLoading: isLoadingSecurity } = useSecuritySchedule(division === "security" ? scheduleId : "");

  const detailData = division === "cleaning" ? cleaningData : securityData;
  const isLoadingDetail = division === "cleaning" ? isLoadingCleaning : isLoadingSecurity;

  const schedule = detailData || initialSchedule;

  const { data: officersData, isLoading: isLoadingOfficers } = useOfficers({ division, per_page: 100 });
  const { data: shiftsData, isLoading: isLoadingShifts } = useShifts({ division, per_page: 100 });

  const officers = officersData?.items || [];
  const shifts = shiftsData?.items || [];

  // Gunakan data dari API detail jika ada, kalau tidak gunakan fallback pemetaan dari list API
  const shiftName = schedule?.shift_name || (schedule ? shifts.find((s) => s.id === schedule.shift_id)?.name : "-");
  const shiftTimeStart = schedule?.time_start || (schedule ? shifts.find((s) => s.id === schedule.shift_id)?.time_start.slice(0, 5) : "-");
  const shiftTimeEnd = schedule?.time_end || (schedule ? shifts.find((s) => s.id === schedule.shift_id)?.time_end.slice(0, 5) : "-");

  const assignedOfficers = schedule?.officers && schedule.officers.length > 0 
    ? schedule.officers 
    : schedule?.officer_ids
        ?.map((oId) => officers.find((o) => o.id === oId))
        .filter(Boolean) || [];

  const categoryLabel = schedule ? {
    once: "Sekali (Once)",
    daily: "Harian (Daily)",
    weekly: "Mingguan (Weekly)",
  }[schedule.category] || schedule.category : "";

  return (
    <Modal
      open
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-2xl font-bold italic">{title}</span>
        </div>
      }
      onClose={onClose}
      footer={
        <div className="flex w-full justify-between items-center">
          {onDelete ? (
            <Button variant="danger" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
              Hapus
            </Button>
          ) : (
            <div /> // placeholder for spacing
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            {onEdit && (
              <Button onClick={() => schedule && onEdit(schedule)}>
                <Pencil size={16} className="mr-2" />
                Edit Jadwal
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2">
        {isLoadingDetail && !schedule ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-sm text-zinc-500 mt-2">Memuat detail jadwal...</p>
          </div>
        ) : !schedule ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-sm text-zinc-500">Jadwal tidak ditemukan.</p>
          </div>
        ) : (
          <>
            {/* Aktivitas & Kategori */}
            <div>
              <h3 className="text-xl font-bold text-zinc-900 mb-1">{schedule.activity}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColorMap[schedule.category] || "bg-zinc-100 text-zinc-700"}`}>
                  {categoryLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tanggal */}
              <div className="flex gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="bg-white p-2 rounded-lg border border-zinc-200 shadow-sm h-fit">
                  <CalendarIcon size={20} className="text-brand" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase">Tanggal</p>
                  <p className="font-medium text-zinc-900">
                    {schedule.scheduled_date ? parseLocalDate(schedule.scheduled_date)?.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                  </p>
                </div>
              </div>

              {/* Shift */}
              <div className="flex gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="bg-white p-2 rounded-lg border border-zinc-200 shadow-sm h-fit">
                  <Clock size={20} className="text-sky-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase">Shift</p>
                  {isLoadingShifts && shiftName === "-" ? (
                    <p className="text-sm text-zinc-500 animate-pulse">Memuat...</p>
                  ) : shiftName !== "-" ? (
                    <div>
                      <p className="font-medium text-zinc-900">{shiftName}</p>
                      <p className="text-xs text-zinc-500">{shiftTimeStart} - {shiftTimeEnd}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">-</p>
                  )}
                </div>
              </div>
            </div>

            {/* Petugas */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-zinc-400" />
                <p className="text-sm font-semibold text-zinc-900">Petugas Ditugaskan</p>
              </div>
              {isLoadingOfficers ? (
                <p className="text-sm text-zinc-500 animate-pulse">Memuat petugas...</p>
              ) : assignedOfficers && assignedOfficers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {assignedOfficers.map((officer) => (
                    <div key={officer!.id} className="px-3 py-1.5 bg-brand/5 border border-brand/20 text-brand-dark rounded-lg text-sm font-medium">
                      {officer!.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-zinc-500">Tidak ada petugas yang ditugaskan</p>
              )}
            </div>

            {/* Pengecualian / Hari Libur */}
            {((schedule.days_off && schedule.days_off.length > 0) || (schedule.holiday_dates && schedule.holiday_dates.length > 0)) && (
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
                <div className="flex items-center gap-2 mb-3">
                  <Tags size={16} className="text-rose-500" />
                  <p className="text-sm font-semibold text-rose-900">Pengecualian / Libur</p>
                </div>
                <div className="space-y-3">
                  {schedule.days_off && schedule.days_off.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-rose-700/70 mb-1">Hari Libur Rutin:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {schedule.days_off.map((day) => (
                          <span key={day} className="px-2 py-0.5 bg-white border border-rose-200 text-rose-700 text-xs rounded-md shadow-sm">
                            {DAYS_OF_WEEK[day] || day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {schedule.holiday_dates && schedule.holiday_dates.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-rose-700/70 mb-1">Tanggal Libur Ekstra:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {schedule.holiday_dates.map((date) => (
                          <span key={date} className="px-2 py-0.5 bg-white border border-rose-200 text-rose-700 text-xs rounded-md shadow-sm">
                            {parseLocalDate(date)?.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Catatan */}
            {schedule.notes && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-zinc-400" />
                  <p className="text-sm font-semibold text-zinc-900">Catatan</p>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-700 italic">
                  {schedule.notes}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
