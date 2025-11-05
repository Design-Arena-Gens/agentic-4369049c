"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Expense } from '@/lib/types';
import { getWeekDays } from '@/lib/utils';

const Doughnut = dynamic(() => import('react-chartjs-2').then(m => m.Doughnut), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(m => m.Bar), { ssr: false });
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ExpenseCharts({ expenses, weekStart }: { expenses: Expense[]; weekStart: Date }) {
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const byDay = useMemo(() => {
    const days = getWeekDays(weekStart);
    const totals = days.map(() => 0);
    for (const e of expenses) {
      const d = new Date(e.date);
      const idx = Math.floor((d.getTime() - days[0].getTime()) / (24 * 60 * 60 * 1000));
      if (idx >= 0 && idx < 7) totals[idx] += e.amount;
    }
    return { labels: days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short' })), totals };
  }, [expenses, weekStart]);

  const catColors = byCategory.map((_, i) => `hsl(${(i * 47) % 360}deg 70% 55%)`);

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 20 }}>
      <div className="panel" style={{ background: '#0b1324' }}>
        <div className="section-title">By Category</div>
        <Doughnut
          data={{
            labels: byCategory.map(([k]) => k),
            datasets: [
              {
                label: 'Amount',
                data: byCategory.map(([, v]) => Number(v.toFixed(2))),
                backgroundColor: catColors,
              },
            ],
          }}
          options={{
            plugins: { legend: { labels: { color: '#e6ecff' } } },
          }}
        />
      </div>

      <div className="panel" style={{ background: '#0b1324' }}>
        <div className="section-title">By Day</div>
        <Bar
          data={{
            labels: byDay.labels,
            datasets: [
              {
                label: 'Total',
                data: byDay.totals.map((v) => Number(v.toFixed(2))),
                backgroundColor: 'rgba(124,156,255,0.6)',
              },
            ],
          }}
          options={{
            scales: {
              x: { ticks: { color: '#e6ecff' }, grid: { color: 'rgba(255,255,255,0.08)' } },
              y: { ticks: { color: '#e6ecff' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            },
            plugins: { legend: { labels: { color: '#e6ecff' } } },
          }}
        />
      </div>
    </div>
  );
}
