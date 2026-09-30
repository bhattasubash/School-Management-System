'use client';

import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  searchPlaceholder = 'Search...',
  searchKey,
  pagination,
  onPageChange,
  onSort,
  isLoading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  actions,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Client-side search filter
  const filtered = searchKey && searchTerm
    ? data.filter((row) => {
        const val = getNestedValue(row, searchKey);
        return String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      })
    : data;

  // Client-side sort (if no onSort provided)
  const sorted = !onSort && sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = getNestedValue(a, sortKey);
        const bVal = getNestedValue(b, sortKey);
        const aStr = String(aVal ?? '');
        const bStr = String(bVal ?? '');
        const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const showingFrom = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const showingTo = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : sorted.length;

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-brand-muted/50" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-brand-primary" />
      : <ChevronDown className="w-3.5 h-3.5 text-brand-primary" />;
  };

  // Skeleton rows
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className={clsx('bg-white rounded-xl shadow-card overflow-hidden', className)}>
      {/* Search bar */}
      {searchKey && (
        <div className="p-4 border-b border-brand-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-brand-border text-body-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border bg-brand-subtle/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left text-caption font-semibold text-brand-muted uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-brand-dark',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-caption font-semibold text-brand-muted uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {isLoading
              ? skeletonRows.map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </td>
                    ))}
                    {actions && <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded animate-pulse w-16 ml-auto" /></td>}
                  </tr>
                ))
              : sorted.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center">
                      <EmptyState title={emptyMessage} />
                    </td>
                  </tr>
                )
              : sorted.map((row, rowIndex) => (
                  <tr
                    key={String(getNestedValue(row, keyField) ?? rowIndex)}
                    className={clsx(
                      'transition-colors hover:bg-brand-subtle/50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={clsx('px-4 py-3.5 text-body-primary text-brand-dark', col.className)}>
                        {col.render ? col.render(getNestedValue(row, col.key), row) : String(getNestedValue(row, col.key) ?? '-')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden divide-y divide-brand-border">
        {isLoading
          ? skeletonRows.map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>
            ))
          : sorted.length === 0
          ? (
              <div className="p-4">
                <EmptyState title={emptyMessage} />
              </div>
            )
          : sorted.map((row, rowIndex) => (
              <div
                key={String(getNestedValue(row, keyField) ?? rowIndex)}
                className={clsx('p-4 hover:bg-brand-subtle/50 transition-colors', onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <div key={col.key} className="flex items-start justify-between py-1">
                    <span className="text-caption text-brand-muted font-medium">{col.label}</span>
                    <span className="text-body-primary text-brand-dark text-right ml-4">
                      {col.render ? col.render(getNestedValue(row, col.key), row) : String(getNestedValue(row, col.key) ?? '-')}
                    </span>
                  </div>
                ))}
                {actions && (
                  <div className="mt-2 pt-2 border-t border-brand-border flex justify-end" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="px-4 py-3 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-caption text-brand-muted">
            Showing <span className="font-semibold text-brand-dark">{showingFrom}</span> to{' '}
            <span className="font-semibold text-brand-dark">{showingTo}</span> of{' '}
            <span className="font-semibold text-brand-dark">{pagination.total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-brand-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={clsx(
                    'min-w-[36px] h-9 rounded-lg text-caption font-semibold transition-colors',
                    pageNum === pagination.page
                      ? 'bg-brand-primary text-white'
                      : 'text-brand-dark hover:bg-brand-subtle'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-2 rounded-lg hover:bg-brand-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
