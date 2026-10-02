'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface AdminSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  widthClass?: string;
}

export default function AdminSearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  widthClass = 'w-full max-w-md',
}: AdminSearchInputProps) {
  return (
    <div
      className={`relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3.5 py-2 focus-within:border-[#0B72E7] focus-within:ring-2 focus-within:ring-[#0B72E7]/10 transition-all ${widthClass} ${className}`}
    >
      <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent outline-none font-normal"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
