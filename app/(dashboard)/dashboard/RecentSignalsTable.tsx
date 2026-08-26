'use client';

import { Table, Badge, type TableColumn } from '@/components/ui';
import type { BadgeStatus } from '@/components/ui';
import type { Signal } from './page';

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'time',       label: 'Time',    sortable: true, className: 'font-mono text-xs text-[#7a8db3]' },
  { key: 'symbol',     label: 'Symbol',  sortable: true, className: 'font-semibold text-white' },
  {
    key: 'signalType',
    label: 'Signal',
    render: (value) => (
      <span
        className={
          value === 'BUY'
            ? 'text-green-400 font-semibold text-xs tracking-wider'
            : 'text-red-400 font-semibold text-xs tracking-wider'
        }
      >
        {String(value)}
      </span>
    ),
  },
  { key: 'price',    label: 'Price',    sortable: true, className: 'font-mono text-sm' },
  { key: 'strategy', label: 'Strategy', sortable: true, className: 'text-[#7a8db3] text-xs' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <Badge status={value as BadgeStatus} />,
  },
];

interface RecentSignalsTableProps {
  signals: Signal[];
}

export function RecentSignalsTable({ signals }: RecentSignalsTableProps) {
  return (
    <Table
      columns={columns}
      data={signals as unknown as Record<string, unknown>[]}
    />
  );
}
