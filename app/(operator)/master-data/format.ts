export const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const monthFmt = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

export function formatEffective(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return monthFmt.format(d);
}
