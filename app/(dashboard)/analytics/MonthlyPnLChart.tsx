'use client';

import { LightweightChart, type HistogramPoint } from '@/components/charts/LightweightChart';
import { CHART_COLORS } from '@/lib/design-tokens';

interface MonthlyPnLChartProps {
  data: HistogramPoint[];
}

const coloredData = (data: HistogramPoint[]): HistogramPoint[] =>
  data.map((d) => ({
    ...d,
    color: d.value >= 0 ? CHART_COLORS.profit : CHART_COLORS.loss,
  }));

export function MonthlyPnLChart({ data }: MonthlyPnLChartProps) {
  return <LightweightChart data={coloredData(data)} type="histogram" height={260} />;
}
