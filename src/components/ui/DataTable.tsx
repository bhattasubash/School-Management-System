'use client';

import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  searchPlaceholder?: string;
  searchKey?: string;
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  searchPlaceholder = 'Search records...',
  searchKey,
  pagination,
  onPageChange,
  onSort,
  isLoading = false,
  emptyMessage = 'No records found',
  emptyIcon,
  actions,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Client-side search if no server pagination/search
  const filtered = React.useMemo(() => {
    if (!searchKey || !localSearch.trim()) return data;
    const term = localSearch.toLowerCase();
    return data.filter((row) => {
      const val = getNestedValue(row, searchKey);
      return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
    });
  }, [data, searchKey, localSearch]);

  // Client-side sort
  const sorted = React.useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = getNestedValue(a, sortCol);
      const bVal = getNestedValue(b, sortCol);
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const handleSort = (key: string) => {
    let nextDir: 'asc' | 'desc' = 'asc';
    if (sortCol === key) {
      if (sortDir === 'asc') nextDir = 'desc';
      else {
        setSortCol(null);
        return;
      }
    }
    setSortCol(key);
    setSortDir(nextDir);
    onSort?.(key, nextDir);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortCol !== columnKey) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300 ml-1 inline shrink-0" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#0B72E7] ml-1 inline shrink-0" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#0B72E7] ml-1 inline shrink-0" />
    );
  };

  const skeletonRows = Array.from({ length: 5 });

  return (
    <div
      className={clsx(
        'w-full bg-white rounded-[22px] border border-[#E2EEF8] shadow-[0_4px_24px_rgba(30,64,175,0.03)] overflow-hidden',
        className
      )}
    >
      {/* Optional Search Bar */}
      {searchKey && (
        <div className="p-4 border-b border-slate-100 bg-[#FAFCFE]">
          <div className="relative flex items-center max-w-sm bg-white rounded-full border border-slate-200 px-3.5 py-1.5 focus-within:border-[#0B72E7] focus-within:ring-2 focus-within:ring-[#0B72E7]/10 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="text-slate-400 hover:text-slate-600 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-[#F8FAFC]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none',
                    col.sortable && 'cursor-pointer hover:text-slate-700 transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/90 text-slate-700">
            {isLoading ? (
              skeletonRows.map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div
                        className="h-4 bg-slate-100 rounded animate-pulse"
                        style={{ width: `${60 + Math.random() * 30}%` }}
                      />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-14 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center">
                  <EmptyState title={emptyMessage} icon={emptyIcon} />
                </td>
              </tr>
            ) : (
              sorted.map((row, rowIndex) => (
                <tr
                  key={String(getNestedValue(row, keyField) ?? rowIndex)}
                  className={clsx(
                    'hover:bg-[#F8FBFE] transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={clsx('px-4 py-3.5 font-medium', col.className)}>
                      {col.render
                        ? col.render(getNestedValue(row, col.key), row)
                        : String(getNestedValue(row, col.key) ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-4 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-[#FAFCFE] text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{Math.min(1, pagination.total)}</span> to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{pagination.total}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700">
              Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
            </span>
            <button
              type="button"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };
