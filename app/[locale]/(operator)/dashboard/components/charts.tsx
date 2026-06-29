"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

type TrendPoint = { label: string; tertagih: number; terkumpul: number };

const CREAM = "#e8d9b8";
const BRAND = "#1f6f5c";
const AMBER = "#f59e0b";
const EMERALD = "#047857";
const ROSE = "#e11d48";

export function TrendBarChart({ data }: { data: TrendPoint[] }) {
  const terkumpulColors = data.map((_, i) =>
    i === data.length - 1 ? AMBER : BRAND,
  );

  return (
    <div className="h-48">
      <Bar
        data={{
          labels: data.map((d) => d.label),
          datasets: [
            {
              label: "Tertagih",
              data: data.map((d) => d.tertagih),
              backgroundColor: CREAM,
              borderRadius: 4,
            },
            {
              label: "Terkumpul",
              data: data.map((d) => d.terkumpul),
              backgroundColor: terkumpulColors,
              borderRadius: 4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { intersect: false, mode: "index" },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#71717a" } },
            y: {
              beginAtZero: true,
              grid: { color: "#f4f4f5" },
              ticks: { color: "#71717a" },
            },
          },
        }}
      />
    </div>
  );
}

type StatusSlice = { label: string; value: number; color: string };

export function PaymentStatusChart({
  percent,
  slices,
}: {
  percent: number;
  slices: StatusSlice[];
}) {
  return (
    <div className="relative h-28 w-28">
      <Doughnut
        data={{
          labels: slices.map((s) => s.label),
          datasets: [
            {
              data: slices.map((s) => s.value),
              backgroundColor: slices.map((s) => {
                if (s.color === "emerald") return EMERALD;
                if (s.color === "amber") return AMBER;
                return ROSE;
              }),
              borderWidth: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
        }}
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-bold">{percent}</div>
          <div className="text-[10px] uppercase text-zinc-500">%</div>
        </div>
      </div>
    </div>
  );
}
