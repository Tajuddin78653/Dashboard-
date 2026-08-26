'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type HistogramData,
  type Time,
} from 'lightweight-charts';
import { cn } from '@/lib/utils';
import { CHART_BASE_OPTIONS, CHART_COLORS } from '@/lib/design-tokens';

export interface LinePoint {
  time: Time;
  value: number;
}

export interface HistogramPoint {
  time: Time;
  value: number;
  color?: string;
}

interface LightweightChartProps {
  data: LinePoint[] | HistogramPoint[];
  type: 'line' | 'histogram';
  height?: number;
  className?: string;
}

export function LightweightChart({
  data,
  type,
  height = 250,
  className,
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | ISeriesApi<'Histogram'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create chart
    const chart = createChart(containerRef.current, {
      ...CHART_BASE_OPTIONS,
      width: containerRef.current.clientWidth,
      height,
      handleScroll: false,
      handleScale: false,
    });
    chartRef.current = chart;

    // Add series based on type
    if (type === 'line') {
      const series = chart.addSeries(LineSeries, {
        color: CHART_COLORS.primary,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: CHART_COLORS.primary,
        crosshairMarkerBackgroundColor: CHART_COLORS.background,
        lastValueVisible: true,
        priceLineVisible: false,
      });
      series.setData(data as LineData[]);
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(HistogramSeries, {
        color: CHART_COLORS.primary,
        base: 0,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      series.setData(data as HistogramData[]);
      seriesRef.current = series;
    }

    chart.timeScale().fitContent();

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && chartRef.current) {
        chartRef.current.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={cn('w-full', className)} style={{ height }} />;
}

export default LightweightChart;
