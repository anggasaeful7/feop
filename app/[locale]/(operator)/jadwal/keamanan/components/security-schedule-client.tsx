"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { useSecuritySchedules } from "@/hooks/api/use-schedules";
import type { SecuritySchedule } from "@/types/schedules";
import { SecurityScheduleFormModal } from "./security-schedule-modal";
import { CalendarView, type CalendarEvent } from "@/components/ui/calendar-view";

export function SecurityScheduleClient() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, error } = useSecuritySchedules({
    per_page: 200,
  });

  const [editing, setEditing] = useState<SecuritySchedule | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const items = data?.items || [];
    return items.map((item) => ({
      id: item.id,
      date: item.scheduled_date,
      title: `${item.officer_name} (${item.shift_name})`,
      time: `${item.start_time}-${item.end_time}`,
      colorClass: "bg-sky-100 text-sky-800 border-sky-200",
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
    setEditing(event.raw as SecuritySchedule);
  };

  return (
    <>
      <PageHeader
        eyebrow="Jadwal · Keamanan"
        title="Jadwal Keamanan"
        subtitle="Atur dan pantau jadwal petugas keamanan"
        actions={
          <Button onClick={() => {
            setCreatingDate(null);
            setCreating(true);
          }}>
            <Plus size={16} className="mr-2" /> Tambah Jadwal
          </Button>
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
        <SecurityScheduleFormModal
          title="Tambah Jadwal Keamanan"
          initialDate={creatingDate || undefined}
          onClose={() => {
            setCreating(false);
            setCreatingDate(null);
          }}
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
