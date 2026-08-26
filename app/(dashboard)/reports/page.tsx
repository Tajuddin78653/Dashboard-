'use client';

import { useState } from 'react';
import {
  FileText, Settings, Download, Table2, FileSpreadsheet,
} from 'lucide-react';
import { Card, Button, Input, Select, EmptyState, Badge, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

const MOCK_TRADES = [
  { date: '2024-12-01', symbol: 'RELIANCE', strategy: '13/50 EMA', entry: 2820, exit: 2910, qty: 10, pnl: 900, status: 'target-hit' as const },
  { date: '2024-12-01', symbol: 'TCS', strategy: 'Pro Engine', entry: 3950, exit: 3880, qty: 5, pnl: -350, status: 'sl-hit' as const },
  { date: '2024-12-02', symbol: 'HDFCBANK', strategy: 'ST+ADX', entry: 1670, exit: 1720, qty: 15, pnl: 750, status: 'target-hit' as const },
  { date: '2024-12-02', symbol: 'INFY', strategy: '13/50 EMA', entry: 1530, exit: 1490, qty: 20, pnl: -800, status: 'sl-hit' as const },
  { date: '2024-12-03', symbol: 'SBIN', strategy: 'Gap D/U', entry: 800, exit: 855, qty: 25, pnl: 1375, status: 'target-hit' as const },
  { date: '2024-12-03', symbol: 'WIPRO', strategy: 'ST+ADX', entry: 490, exit: 510, qty: 30, pnl: 600, status: 'target-hit' as const },
  { date: '2024-12-04', symbol: 'ICICIBANK', strategy: 'Pro Engine', entry: 1200, exit: 1158, qty: 12, pnl: -504, status: 'sl-hit' as const },
  { date: '2024-12-04', symbol: 'BHARTIARTL', strategy: 'Gap D/U', entry: 1320, exit: 1390, qty: 8, pnl: 560, status: 'target-hit' as const },
  { date: '2024-12-05', symbol: 'TATAMOTORS', strategy: '13/50 EMA', entry: 820, exit: 875, qty: 20, pnl: 1100, status: 'target-hit' as const },
  { date: '2024-12-05', symbol: 'AXISBANK', strategy: 'ST+ADX', entry: 1105, exit: 1080, qty: 15, pnl: -375, status: 'sl-hit' as const },
];

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'strategy', label: 'Strategy Report' },
  { value: 'custom', label: 'Custom Range' },
];

const STRATEGIES = [
  { value: 'all', label: 'All Strategies' },
  { value: 'ema', label: '13/50 EMA' },
  { value: 'gap', label: 'Gap D/U' },
  { value: 'stadx', label: 'ST+ADX' },
  { value: 'pro', label: 'Pro Engine' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily');
  const [strategy, setStrategy] = useState('all');
  const [fromDate, setFromDate] = useState('2024-12-01');
  const [toDate, setToDate] = useState('2024-12-05');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const profitable = MOCK_TRADES.filter(t => t.pnl > 0).length;
  const losing = MOCK_TRADES.filter(t => t.pnl < 0).length;
  const netPnl = MOCK_TRADES.reduce((sum, t) => sum + t.pnl, 0);

  function handleGenerate() {
    setIsGenerating(true);
    setReportGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-gold-400" />
            <h1 className="text-2xl font-bold text-white">Reports</h1>
          </div>
          <p className="text-muted mt-1 text-sm">Generate and export trading reports</p>
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
              onChange={e => setReportType(e.target.value)}
            />
            <Select
              label="Strategy"
              options={STRATEGIES}
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
            />
            <Input
              label="From Date"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
            <p className="text-xs text-muted">
              Reports include trade history, P&L summary, and strategy breakdown.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              loading={isGenerating}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>

            <div className="border-t border-[var(--color-border)] pt-4">
              <p className="text-xs text-muted mb-3">Export As</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  <Table2 className="w-3.5 h-3.5 mr-1" />
                  Excel
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Preview */}
        <Card className="lg:col-span-2 min-h-[400px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Spinner size="lg" />
              <p className="text-muted text-sm">Generating report...</p>
            </div>
          ) : !reportGenerated ? (
            <EmptyState
              title="No report generated yet"
              description="Configure your report settings and click Generate Report to see a preview."
              action={
                <Button variant="primary" size="sm" onClick={handleGenerate}>
                  Generate Report
                </Button>
              }
            />
          ) : (
            <div className="animate-fade-in space-y-5">
              {/* Report header */}
              <div className="border-b border-[var(--color-border)] pb-4">
                <h2 className="text-lg font-bold text-gold-400">
                  Daily Report — {fromDate} to {toDate}
                </h2>
                <p className="text-xs text-muted mt-1">
                  Strategy: {STRATEGIES.find(s => s.value === strategy)?.label}
                </p>
              </div>

              {/* Summary strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Trades', value: MOCK_TRADES.length },
                  { label: 'Profitable', value: profitable, color: 'text-success' },
                  { label: 'Loss', value: losing, color: 'text-danger' },
                  {
                    label: 'Net P&L',
                    value: `₹${netPnl.toLocaleString('en-IN')}`,
                    color: netPnl >= 0 ? 'text-success' : 'text-danger',
                  },
                ].map(stat => (
                  <div key={stat.label} className="bg-navy-800 rounded-lg p-3 text-center">
                    <p className={cn('text-xl font-bold font-mono', stat.color ?? 'text-white')}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Trade history table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      {['Date', 'Symbol', 'Strategy', 'Entry', 'Exit', 'Qty', 'P&L', 'Status'].map(col => (
                        <th key={col} className="text-left py-2 px-3 text-xs text-muted font-medium uppercase tracking-wide">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TRADES.map((trade, i) => (
                      <tr
                        key={i}
                        className={cn(
                          'border-b border-[var(--color-border)]/50',
                          i % 2 === 0 ? 'bg-navy-900/30' : 'bg-navy-800/20',
                        )}
                      >
                        <td className="py-2 px-3 text-muted text-xs">{trade.date}</td>
                        <td className="py-2 px-3 font-semibold text-white">{trade.symbol}</td>
                        <td className="py-2 px-3 text-muted text-xs">{trade.strategy}</td>
                        <td className="py-2 px-3 font-mono text-white">₹{trade.entry.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 font-mono text-white">₹{trade.exit.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 font-mono text-muted">{trade.qty}</td>
                        <td className={cn('py-2 px-3 font-mono font-semibold', trade.pnl >= 0 ? 'text-success' : 'text-danger')}>
                          {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3">
                          <Badge status={trade.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted text-right">
                Report generated at {new Date().toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
