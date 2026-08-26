'use client';

import { LightweightChart, type LinePoint } from '@/components/charts/LightweightChart';

interface EquityCurveChartProps {
  data: LinePoint[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  return <LightweightChart data={data} type="line" height={260} />;
}
