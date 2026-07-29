// Shared formatters. Locale-aware, deterministic — safe to call during render.

export const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const idrShort = (n: number) => {
  if (n >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(".", ",")}jt`;
  }
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return idr(n);
};

const monthFmt = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

const longMonthFmt = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dayFmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFmt = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEffective(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return monthFmt.format(d);
}

export function formatMonthYear(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return longMonthFmt.format(d);
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFmt.format(d);
}

const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatProtobufTimestamp(ts: { seconds: number; nanos: number } | undefined | null) {
  if (!ts) return "—";
  const d = new Date(ts.seconds * 1000 + ts.nanos / 1000000);
  if (Number.isNaN(d.getTime())) return "—";
  return dateTimeFmt.format(d).replace(/\./g, ":");
}

export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateTimeFmt.format(d).replace(/\./g, ":");
}

export function formatBookingWindow(startsAt: string, endsAt: string) {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return `${startsAt} – ${endsAt}`;
  }
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  if (sameDay) {
    return `${dayFmt.format(s)} · ${timeFmt.format(s)}–${timeFmt.format(e)}`;
  }
  return `${dayFmt.format(s)} ${timeFmt.format(s)} → ${dayFmt.format(e)} ${timeFmt.format(e)}`;
}

// "YYYY-MM-DDTHH:mm" (datetime-local) → RFC3339 with the browser's UTC offset.
export function localToISOWithOffset(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  const pad = (n: number) => String(n).padStart(2, "0");
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? "+" : "-";
  const abs = Math.abs(tz);
  const tzStr = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00${tzStr}`
  );
}

// ISO → "YYYY-MM-DDTHH:mm" suitable for <input type="datetime-local">.
export function isoToLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

export const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatLocalDate = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseLocalTime = (timeStr: string) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const formatLocalTime = (date: Date | null) => {
  if (!date) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getMonthDateRange = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthStr = String(month + 1).padStart(2, "0");
  const dateFrom = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dateTo = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  return { dateFrom, dateTo };
};

export function formatTimeAgo(dateInput: Date | string | number): string {
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "always" });

  const absDiff = Math.abs(diffInSeconds);
  if (absDiff < 60) {
    return "baru saja";
  }
  if (absDiff < 3600) {
    return rtf.format(Math.round(diffInSeconds / 60), "minute");
  }
  if (absDiff < 86400) {
    return rtf.format(Math.round(diffInSeconds / 3600), "hour");
  }
  if (absDiff < 2592000) {
    return rtf.format(Math.round(diffInSeconds / 86400), "day");
  }
  if (absDiff < 31536000) {
    return rtf.format(Math.round(diffInSeconds / 2592000), "month");
  }
  return rtf.format(Math.round(diffInSeconds / 31536000), "year");
}

export function formatMonthLabel(label: string) {
  try {
    const [year, month] = label.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "short" });
  } catch {
    return label;
  }
}
