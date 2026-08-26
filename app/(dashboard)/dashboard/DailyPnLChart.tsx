'use client';

import { LightweightChart, type LinePoint } from '@/components/charts/LightweightChart';

interface DailyPnLChartProps {
  data: LinePoint[];
}

export function DailyPnLChart({ data }: DailyPnLChartProps) {
  return <LightweightChart data={data} type="line" height={250} />;
}
