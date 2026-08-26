'use client';

import { cn } from '@/lib/utils';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
}

type SortDir = 'asc' | 'desc' | null;

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  className,
  rowClassName,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    }
  }

  const sortedData = (() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = String(av) < String(bv) ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  })();

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-[#1e2d5a]', className)}>
      <table className="w-full min-w-full table-auto border-collapse text-sm">
        {/* Sticky header */}
        <thead className="sticky top-0 z-10 bg-navy-800 border-b border-[#1e2d5a]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#4a5a8a] whitespace-nowrap',
                  col.sortable && 'cursor-pointer select-none hover:text-gold-400 transition-colors',
                  col.headerClassName,
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-gold-500/60">
                      {sortKey === col.key && sortDir === 'asc' && (
                        <ChevronUpIcon className="h-3.5 w-3.5 text-gold-500" />
                      )}
                      {sortKey === col.key && sortDir === 'desc' && (
                        <ChevronDownIcon className="h-3.5 w-3.5 text-gold-500" />
                      )}
                      {sortKey !== col.key && (
                        <ChevronsUpDownIcon className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#1e2d5a] bg-navy-900">
          {loading ? (
            // Ghost loading rows
            Array.from({ length: 3 }).map((_, ri) => (
              <tr key={ri}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className={cn('h-4', col.key === columns[0].key ? 'w-24' : 'w-16')} />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            sortedData.map((row, ri) => (
              <tr
                key={ri}
                className={cn(
                  'transition-colors duration-75',
                  ri % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/40',
                  'hover:bg-navy-800',
                  rowClassName?.(row, ri),
                )}
              >
                {columns.map((col) => {
                  const rawValue = row[col.key];
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-slate-200 whitespace-nowrap',
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(rawValue, row, ri)
                        : rawValue !== undefined && rawValue !== null
                        ? String(rawValue)
                        : '—'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
