'use client';

import { useEffect, useRef } from 'react';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

// Register only what we use (keeps the bundle small).
Chart.register(ArcElement, BarController, BarElement, CategoryScale, DoughnutController, Legend, LinearScale, Tooltip);

const COLORS = { total: '#1e3557', completed: '#0d9488', missed: '#b91c1c', other: '#94a3b8' };

/** Daily bar chart + status doughnut. `stats` is `dailyStats` from GET /admin/analytics. */
export function AnalyticsCharts({ stats }) {
  const barRef = useRef(null);
  const donutRef = useRef(null);

  useEffect(() => {
    if (!barRef.current || !donutRef.current) return undefined;

    const labels = stats.map((s) => s._id);
    const totals = stats.map((s) => s.total);
    const completed = stats.map((s) => s.completed);
    const missed = stats.map((s) => s.missed);
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);

    const bar = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Total', data: totals, backgroundColor: COLORS.total, borderRadius: 4 },
          { label: 'Completed', data: completed, backgroundColor: COLORS.completed, borderRadius: 4 },
          { label: 'Missed', data: missed, backgroundColor: COLORS.missed, borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 14 } } } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0, font: { size: 13 } } }, x: { ticks: { font: { size: 12 } } } },
      },
    });

    const donut = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Missed', 'Booked / cancelled'],
        datasets: [
          {
            data: [sum(completed), sum(missed), Math.max(sum(totals) - sum(completed) - sum(missed), 0)],
            backgroundColor: [COLORS.completed, COLORS.missed, COLORS.other],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 14 } } } },
      },
    });

    return () => {
      bar.destroy();
      donut.destroy();
    };
  }, [stats]);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Appointments per day</h3>
        <div className="h-80" role="img" aria-label="Bar chart of total, completed and missed appointments per day">
          <canvas ref={barRef} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-lg font-semibold">Outcome breakdown</h3>
        <div className="h-80" role="img" aria-label="Doughnut chart of appointment outcomes">
          <canvas ref={donutRef} />
        </div>
      </div>
    </div>
  );
}
