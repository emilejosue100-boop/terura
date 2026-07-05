import type { Transaction } from '../types';

export interface ChartPoint {
  label: string;
  value: number;
}

export function buildSavingsTrend(transactions: Transaction[]): ChartPoint[] {
  const saved = transactions
    .filter((tx) => tx.type === 'saved')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (saved.length === 0) return [];

  const byMonth = new Map<string, number>();
  for (const tx of saved) {
    const month = tx.date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + tx.amount);
  }

  let cumulative = 0;
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => {
      cumulative += amount;
      const [year, mon] = month.split('-');
      const label = new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      return { label, value: cumulative };
    });
}

export function chartPath(points: ChartPoint[], width = 600, height = 160): string {
  if (points.length === 0) return '';
  const max = Math.max(...points.map((p) => p.value), 1);
  const step = points.length === 1 ? width : width / (points.length - 1);

  return points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.value / max) * (height - 20) - 10;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}
