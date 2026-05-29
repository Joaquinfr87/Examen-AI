import type { FitnessRecord } from '../types';

interface FitnessChartProps {
  history: FitnessRecord[];
}

export function FitnessChart({ history }: FitnessChartProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg bg-tokyo-surface p-3 mb-3 min-h-[100px] flex items-center justify-center">
        <p className="text-xs text-tokyo-fg/50 text-center">
          La gráfica de fitness aparecerá aquí durante la evolución
        </p>
      </div>
    );
  }

  const width = 280;
  const height = 120;
  const pad = { top: 10, right: 10, bottom: 24, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const maxGen = history.length - 1;
  const maxFit = Math.max(...history.map(h => h.bestFitness), 1);

  function x(i: number) { return pad.left + (i / maxGen) * chartW; }
  function y(v: number) { return pad.top + chartH - (v / maxFit) * chartH; }

  const bestPts = history.map((h, i) => `${x(i)},${y(h.bestFitness)}`).join(' ');
  const avgPts = history.map((h, i) => `${x(i)},${y(h.avgFitness)}`).join(' ');

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#24283b" rx="6" />
    <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#3b4261" stroke-width="1" />
    <text x="${pad.left - 5}" y="${pad.top + chartH + 14}" fill="#565f89" font-size="9" text-anchor="end">0</text>
    <text x="${pad.left - 5}" y="${pad.top + 4}" fill="#565f89" font-size="9" text-anchor="end">${maxFit.toFixed(0)}</text>
    <line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#3b4261" stroke-width="1" />
    <text x="${pad.left}" y="${pad.top + chartH + 14}" fill="#565f89" font-size="9">0</text>
    <text x="${pad.left + chartW}" y="${pad.top + chartH + 14}" fill="#565f89" font-size="9" text-anchor="end">${maxGen}</text>
    <line x1="${pad.left}" y1="${pad.top + chartH / 2}" x2="${pad.left + chartW}" y2="${pad.top + chartH / 2}" stroke="#3b4261" stroke-width="0.5" stroke-dasharray="3,3" />
    <polyline points="${bestPts}" fill="none" stroke="#7aa2f7" stroke-width="2" />
    <polyline points="${avgPts}" fill="none" stroke="#bb9af7" stroke-width="1.5" stroke-dasharray="4,3" />
    <circle cx="${width - 100}" cy="${height - 18}" r="3" fill="#7aa2f7" />
    <text x="${width - 94}" y="${height - 15}" fill="#a9b1d6" font-size="9">Mejor</text>
    <circle cx="${width - 50}" cy="${height - 18}" r="3" fill="#bb9af7" />
    <text x="${width - 44}" y="${height - 15}" fill="#a9b1d6" font-size="9">Promedio</text>
  </svg>`;

  return (
    <div className="rounded-lg bg-tokyo-surface p-3 mb-3">
      <h3 className="m-0 mb-2 text-sm text-tokyo-fg font-medium">Evolución del Fitness</h3>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
