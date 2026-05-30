"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { useCleaningSchedules } from "@/hooks/api/use-schedules";
import type { CleaningSchedule } from "@/types/schedules";
import { CleaningScheduleFormModal } from "./components/cleaning-schedule-modal";
import { BulkCleaningScheduleFormModal } from "./components/bulk-cleaning-schedule-modal";
import { CalendarView, type CalendarEvent } from "@/components/ui/calendar-view";

export default function JadwalKebersihanPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // We fetch a large number to ensure we get most events for the month.
  // In a real app, we'd pass date_from and date_to spanning the current month grid.
  const { data, error } = useCleaningSchedules({
    per_page: 200,
  });

  const [editing, setEditing] = useState<CleaningSchedule | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingBulk, setCreatingBulk] = useState(false);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const items = data?.items || [];
    return items.map((item) => ({
      id: item.id,
      date: item.scheduled_date,
      title: item.activity,
      time: item.scheduled_time,
      colorClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      raw: item,
    }));
  }, [data?.items]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    setCreatingDate(dateStr);
    setCreating(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditing(event.raw as CleaningSchedule);
  };

  return (
    <>
      <PageHeader
        eyebrow="Jadwal · Kebersihan"
        title="Jadwal Kebersihan"
        subtitle="Atur dan pantau jadwal kebersihan lingkungan"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setCreatingBulk(true)}>
              <Plus size={16} className="mr-2" /> Tambah Massal
            </Button>
            <Button onClick={() => {
              setCreatingDate(null);
              setCreating(true);
            }}>
              <Plus size={16} className="mr-2" /> Tambah Jadwal
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error.message || "Gagal memuat jadwal"}
        </div>
      )}

      <div className="mb-6">
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
        <CleaningScheduleFormModal
          title="Tambah Jadwal Kebersihan"
          initialDate={creatingDate || undefined}
          onClose={() => {
            setCreating(false);
            setCreatingDate(null);
          }}
        />
      )}

      {creatingBulk && (
        <BulkCleaningScheduleFormModal
          onClose={() => setCreatingBulk(false)}
        />
      )}

      {editing && (
        <CleaningScheduleFormModal
          title="Edit Jadwal Kebersihan"
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
