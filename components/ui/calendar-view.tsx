/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  time?: string;
  colorClass?: string; // e.g. "bg-emerald-100 text-emerald-800"
  raw: any;
};

export function CalendarView({
  currentDate,
  events,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Go back to Sunday

    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Go forward to Saturday
    }

    const days = [];
    const d = new Date(startDate);
    while (d <= endDate) {
      const isCurrentMonth = d.getMonth() === month;

      const pad = (n: number) => n.toString().padStart(2, "0");
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      days.push({
        date: new Date(d),
        dateStr,
        dayOfMonth: d.getDate(),
        isCurrentMonth,
        isToday: dateStr === new Date().toISOString().split("T")[0],
      });
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(ev => {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    });
    // Sort events by time if available
    map.forEach(list => {
      list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    });
    return map;
  }, [events]);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-zinc-200/70 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/70 bg-cream-50">
        <h2 className="text-lg font-bold text-zinc-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-full hover:bg-zinc-200/60 text-zinc-600 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 rounded-full hover:bg-zinc-200/60 text-zinc-600 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[768px] h-full flex flex-col">
          <div className="grid grid-cols-7 border-b border-zinc-200/70 shrink-0">
            {dayNames.map((d, i) => (
              <div key={i} className="py-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)] flex-1">
            {calendarDays.map((day, i) => {
            const dayEvents = eventsByDate.get(day.dateStr) || [];
            return (
              <div
                key={day.dateStr}
                onClick={() => onDateClick(day.dateStr)}
                className={cn(
                  "border-r border-b border-zinc-200/70 p-2 flex flex-col gap-1 transition cursor-pointer group",
                  !day.isCurrentMonth ? "bg-zinc-50/50" : "hover:bg-cream-50/50",
                  (i + 1) % 7 === 0 && "border-r-0"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full",
                      day.isToday
                        ? "bg-brand-900 text-white"
                        : day.isCurrentMonth
                          ? "text-zinc-900"
                          : "text-zinc-400"
                    )}
                  >
                    {day.dayOfMonth}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition text-zinc-400">
                    <Plus size={14} />
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1 flex-1">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      className={cn(
                        "px-2 py-1 rounded-md text-xs truncate transition hover:opacity-80 font-medium",
                        ev.colorClass || "bg-zinc-100 text-zinc-800 border border-zinc-200"
                      )}
                      title={`${ev.time ? ev.time + " - " : ""}${ev.title}`}
                    >
                      {ev.time && <span className="mr-1 opacity-70">{ev.time}</span>}
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
