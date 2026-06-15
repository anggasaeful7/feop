import { useMemo } from "react";
import { useOfficers } from "@/hooks/api/use-petugas";
import { useShifts } from "@/hooks/api/use-shift";
import { categoryColorMap } from "@/lib/utils";
import type { BaseSchedule } from "@/types/schedules";
import type { CalendarEvent } from "@/components/ui/calendar-view";
import type { OfficerDivision } from "@/types/master-data";

export function useScheduleCalendarEvents(
  schedules: BaseSchedule[],
  division: OfficerDivision
): CalendarEvent[] {
  const { data: officersData } = useOfficers({ division, per_page: 100 });
  const { data: shiftsData } = useShifts({ division, per_page: 100 });

  return useMemo(() => {
    const officers = officersData?.items || [];
    const shifts = shiftsData?.items || [];

    return schedules.map((item) => {
      const shift = shifts.find(s => s.id === item.shift_id);
      const officerNames = item.officer_ids
        ?.map(id => officers.find(o => o.id === id)?.name)
        .filter(Boolean)
        .join(", ");
        
      return {
        id: item.id,
        date: item.scheduled_date,
        title: officerNames ? `${item.activity} (${officerNames})` : item.activity,
        time: shift ? `${shift.time_start.slice(0, 5)}` : "",
        colorClass: categoryColorMap[item.category] || "bg-zinc-50 text-zinc-700 border-zinc-200 border",
        raw: item,
      };
    });
  }, [schedules, officersData?.items, shiftsData?.items]);
}
