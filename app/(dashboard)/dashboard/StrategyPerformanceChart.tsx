'use client';

import { LightweightChart, type HistogramPoint } from '@/components/charts/LightweightChart';
import { CHART_COLORS } from '@/lib/design-tokens';

interface StrategyPerformanceChartProps {
  data: HistogramPoint[];
}

// Colour each bar individually so they all render gold
const coloredData = (data: HistogramPoint[]): HistogramPoint[] =>
  data.map((d) => ({ ...d, color: CHART_COLORS.primary }));

export function StrategyPerformanceChart({ data }: StrategyPerformanceChartProps) {
  return (
    <LightweightChart
      data={coloredData(data)}
      type="histogram"
      height={210}
    />
  );
}
