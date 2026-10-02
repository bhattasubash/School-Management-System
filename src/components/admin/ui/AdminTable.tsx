'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminTableProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTable({ children, className = '' }: AdminTableProps) {
  return (
    <div
      className={`w-full overflow-hidden bg-white rounded-[20px] border border-[#E2EEF8] shadow-[0_4px_24px_rgba(30,64,175,0.03)] ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">{children}</table>
      </div>
    </div>
  );
}

export function AdminTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#F8FAFC] border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
      {children}
    </thead>
  );
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100/90 text-slate-700">{children}</tbody>;
}

export function AdminTableRow({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-[#F8FBFE] transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({
  children,
  className = '',
  isHeader = false,
}: {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}) {
  if (isHeader) {
    return <th className={`py-3.5 px-4 font-semibold text-slate-500 ${className}`}>{children}</th>;
  }
  return <td className={`py-3.5 px-4 font-medium ${className}`}>{children}</td>;
}

interface AdminTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}: AdminTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-[#FAFCFE] text-xs text-slate-500 ${className}`}
    >
      <div>
        Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 text-xs font-semibold text-slate-700">
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
