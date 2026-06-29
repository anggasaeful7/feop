"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { useSecuritySchedules, useDeleteSecuritySchedule } from "@/hooks/api/use-schedules";
import type { SecuritySchedule } from "@/types/schedules";
import { SecurityScheduleFormModal } from "./security-schedule-modal";
import { BaseScheduleDetailModal } from "../../components/base-schedule-detail-modal";
import { CalendarView, type CalendarEvent } from "@/components/ui/calendar-view";
import { getMonthDateRange } from "@/lib/format";
import { useScheduleCalendarEvents } from "../../hooks/use-schedule-calendar";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function SecurityScheduleClient() {
  const { data: permissions } = usePermissions();
  const canCreate = hasPermission(permissions, "schedules", "create");
  const canUpdate = hasPermission(permissions, "schedules", "update");
  const canDelete = hasPermission(permissions, "schedules", "delete");

  const [currentDate, setCurrentDate] = useState(new Date());

  const { dateFrom, dateTo } = useMemo(() => getMonthDateRange(currentDate), [currentDate]);

  const { data, error, isLoading, isFetching } = useSecuritySchedules({
    date_from: dateFrom,
    date_to: dateTo,
    per_page: 200,
  });

  const loading = isLoading || isFetching;

  const [viewing, setViewing] = useState<SecuritySchedule | null>(null);
  const [editing, setEditing] = useState<SecuritySchedule | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteMut = useDeleteSecuritySchedule();

  const calendarEvents = useScheduleCalendarEvents(data?.items || [], "security");

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    if (!canCreate) return;
    setCreatingDate(dateStr);
    setCreating(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setViewing(event.raw as SecuritySchedule);
  };

  return (
    <>
      <PageHeader
        eyebrow="Jadwal · Keamanan"
        title="Jadwal Keamanan"
        subtitle="Atur dan pantau jadwal petugas keamanan"
        actions={
          canCreate ? (
            <Button onClick={() => {
              setCreatingDate(null);
              setCreating(true);
            }}>
              <Plus size={16} className="mr-2" /> Tambah Jadwal
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-4 mb-5 text-xs bg-white p-3 rounded-xl border border-zinc-200/60 shadow-sm w-fit">
        <span className="font-semibold text-zinc-400 uppercase tracking-wider">Kategori:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-sky-50 border border-sky-200"></span>
          <span className="text-zinc-600 font-medium">Sekali (Once)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-50 border border-emerald-200"></span>
          <span className="text-zinc-600 font-medium">Harian (Daily)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-purple-50 border border-purple-200"></span>
          <span className="text-zinc-600 font-medium">Mingguan (Weekly)</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error.message || "Gagal memuat jadwal"}
        </div>
      )}

      <div className="relative mb-6">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-10 transition-all duration-300">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full shadow-sm">
                Memuat Jadwal...
              </p>
            </div>
          </div>
        )}
        <CalendarView
          currentDate={currentDate}
          events={calendarEvents}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>

      {creating && (
        <SecurityScheduleFormModal
          title="Tambah Jadwal Keamanan"
          initialDate={creatingDate || undefined}
          onClose={() => {
            setCreating(false);
            setCreatingDate(null);
          }}
        />
      )}

      {viewing && (
        <BaseScheduleDetailModal
          title="Detail Jadwal Keamanan"
          scheduleId={viewing.id}
          initialSchedule={viewing}
          division="security"
          onClose={() => setViewing(null)}
          onEdit={canUpdate ? () => {
            setEditing(viewing);
            setViewing(null);
          } : undefined}
          onDelete={canDelete ? () => {
             if (confirm("Yakin hapus jadwal ini?")) {
               deleteMut.mutate(viewing.id, { onSuccess: () => setViewing(null) });
             }
          } : undefined}
          isDeleting={deleteMut.isPending}
        />
      )}

      {editing && (
        <SecurityScheduleFormModal
          title="Edit Jadwal Keamanan"
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
