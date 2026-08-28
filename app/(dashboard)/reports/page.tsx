'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Settings, Download, Table2, FileSpreadsheet, RefreshCw,
} from 'lucide-react';
import { Card, Button, Input, Select, EmptyState, Badge, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { generateReport, getStrategies } from '@/lib/api';
import type { ReportData, StrategyResponse } from '@/lib/api';

const REPORT_TYPES = [
  { value: 'daily',    label: 'Daily Report'    },
  { value: 'monthly',  label: 'Monthly Report'  },
  { value: 'strategy', label: 'Strategy Report' },
  { value: 'custom',   label: 'Custom Range'    },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [reportType, setReportType]     = useState('daily');
  const [strategy, setStrategy]         = useState('all');
  const [fromDate, setFromDate]         = useState(thirtyDaysAgo());
  const [toDate, setToDate]             = useState(todayStr());
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport]             = useState<ReportData | null>(null);
  const [error, setError]               = useState<string | null>(null);

  // Load strategies for dropdown
  const [strategies, setStrategies] = useState<StrategyResponse[]>([]);
  useEffect(() => {
    getStrategies().then(setStrategies).catch(() => {});
  }, []);

  const strategyOptions = [
    { value: 'all', label: 'All Strategies' },
    ...strategies.map((s) => ({ value: s.name, label: s.name })),
  ];

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setReport(null);
    try {
      const params: Record<string, string> = {
        report_type: reportType,
        date_from:   fromDate,
        date_to:     toDate,
      };
      if (strategy !== 'all') params.strategy = strategy;
      const data = await generateReport(params);
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  }

  const profitable = report?.trades.filter((t) => Number(t.net_pnl ?? 0) > 0).length ?? 0;
  const losing     = report?.trades.filter((t) => Number(t.net_pnl ?? 0) < 0).length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-gold-400" />
            <h1 className="text-2xl font-bold text-white">Reports</h1>
          </div>
          <p className="text-[#4a5a8a] mt-1 text-sm">Generate reports from live trade data</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <Card className="lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-4 h-4 text-gold-400" />
            <h2 className="font-semibold text-white">Configure Report</h2>
          </div>
          <div className="space-y-4">
            <Select
              label="Report Type"
              options={REPORT_TYPES}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            />
            <Select
              label="Strategy"
              options={strategyOptions}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            />
            <Input
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <p className="text-xs text-[#4a5a8a]">
              Reports include all closed trades (target-hit, sl-hit, exited) in the selected range.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating
                ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                : <><FileText className="w-4 h-4 mr-2" /> Generate Report</>
              }
            </Button>

            <div className="border-t border-[#1e2d5a] pt-4">
              <p className="text-xs text-[#4a5a8a] mb-3">Export As</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" disabled={!report}>
                  <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" disabled={!report}>
                  <Table2 className="w-3.5 h-3.5 mr-1" /> Excel
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" disabled={!report}>
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> CSV
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Preview */}
        <Card className="lg:col-span-2 min-h-[400px]">
          {isGenerating ? (
            <div className="space-y-3 animate-pulse">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
              <Button variant="ghost" size="sm" onClick={handleGenerate}>Retry</Button>
            </div>
          ) : !report ? (
            <EmptyState
              title="No report generated yet"
              description="Configure your report settings and click Generate Report to see live data from your trades."
              action={
                <Button variant="primary" size="sm" onClick={handleGenerate}>
                  Generate Report
                </Button>
              }
            />
          ) : (
            <div className="animate-fade-in space-y-5">
              {/* Report header */}
              <div className="border-b border-[#1e2d5a] pb-4">
                <h2 className="text-lg font-bold text-gold-400">
                  {REPORT_TYPES.find((r) => r.value === reportType)?.label} · {fromDate} to {toDate}
                </h2>
                <p className="text-xs text-[#4a5a8a] mt-1">
                  Strategy: {strategy === 'all' ? 'All Strategies' : strategy}
                </p>
              </div>

              {/* Summary strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Trades', value: report.summary.total_trades,            color: '' },
                  { label: 'Profitable',   value: report.summary.winners,                  color: 'text-green-400' },
                  { label: 'Loss',         value: report.summary.losers,                   color: 'text-red-400' },
                  {
                    label: 'Net P&L',
                    value: `₹${Math.abs(report.summary.net_pnl).toLocaleString('en-IN')}`,
                    color: report.summary.net_pnl >= 0 ? 'text-green-400' : 'text-red-400',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-navy-800 rounded-lg p-3 text-center">
                    <p className={cn('text-xl font-bold font-mono', stat.color || 'text-white')}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-[#4a5a8a] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Trade history table */}
              {report.trades.length === 0 ? (
                <p className="text-sm text-center text-[#4a5a8a] py-8">
                  No closed trades found in this date range
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1e2d5a]">
                        {['Trade ID', 'Symbol', 'Type', 'Entry', 'Exit', 'Qty', 'Net P&L', 'Status'].map((col) => (
                          <th key={col} className="text-left py-2 px-3 text-xs text-[#4a5a8a] font-medium uppercase tracking-wide">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.trades.map((trade, i) => {
                        const pnl = Number(trade.net_pnl ?? 0);
                        return (
                          <tr
                            key={i}
                            className={cn(
                              'border-b border-[#1e2d5a]/50',
                              i % 2 === 0 ? 'bg-navy-900/30' : 'bg-navy-800/20',
                            )}
                          >
                            <td className="py-2 px-3 font-mono text-xs text-[#4a5a8a]">{String(trade.trade_id)}</td>
                            <td className="py-2 px-3 font-semibold text-white">{String(trade.symbol)}</td>
                            <td className="py-2 px-3 text-xs">
                              <span className={String(trade.signal_type) === 'BUY' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                {String(trade.signal_type)}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-white">₹{Number(trade.entry_price).toLocaleString('en-IN')}</td>
                            <td className="py-2 px-3 font-mono text-white">
                              {trade.exit_price != null ? `₹${Number(trade.exit_price).toLocaleString('en-IN')}` : '–'}
                            </td>
                            <td className="py-2 px-3 font-mono text-[#4a5a8a]">{String(trade.quantity)}</td>
                            <td className={cn('py-2 px-3 font-mono font-semibold', pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                              {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3">
                              <Badge status={String(trade.status) as 'target-hit' | 'sl-hit' | 'exited'} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-[#4a5a8a] text-right">
                Report generated at {new Date().toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
