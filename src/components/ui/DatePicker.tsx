'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'DD/MM/YYYY',
  error,
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) setViewDate(value);
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isDisabled = (day: number) => {
    const d = new Date(year, month, day);
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const handleSelect = (day: number) => {
    if (isDisabled(day)) return;
    const selected = new Date(year, month, day);
    onChange(selected);
    setIsOpen(false);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-body-primary text-left transition-colors',
          isOpen ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-brand-border hover:border-brand-muted',
          error && 'border-red-500 ring-2 ring-red-500/20',
          disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
        )}
      >
        <span className={value ? 'text-brand-dark' : 'text-brand-muted'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-brand-muted flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-72 bg-white border border-brand-border rounded-xl shadow-lg p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-brand-subtle transition-colors">
              <ChevronLeft className="w-4 h-4 text-brand-dark" />
            </button>
            <span className="text-body-primary font-semibold text-brand-dark">
              {MONTHS[month]} {year}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-brand-subtle transition-colors">
              <ChevronRight className="w-4 h-4 text-brand-dark" />
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-brand-muted py-1">{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0">
            {cells.map((day, i) => (
              <div key={i} className="flex items-center justify-center">
                {day === null ? (
                  <div className="w-9 h-9" />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelect(day)}
                    disabled={isDisabled(day)}
                    className={clsx(
                      'w-9 h-9 rounded-lg text-caption font-medium transition-colors',
                      isDisabled(day) && 'text-gray-300 cursor-not-allowed',
                      !isDisabled(day) && 'hover:bg-brand-subtle',
                      value && isSameDay(new Date(year, month, day), value) && 'bg-brand-primary text-white hover:bg-brand-hover',
                      isSameDay(new Date(year, month, day), today) && !(value && isSameDay(new Date(year, month, day), value)) && 'ring-1 ring-brand-primary text-brand-primary font-bold'
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Today button */}
          <div className="mt-2 pt-2 border-t border-brand-border">
            <button
              type="button"
              onClick={() => { onChange(new Date()); setIsOpen(false); }}
              className="w-full text-center text-caption font-semibold text-brand-primary hover:text-brand-hover transition-colors py-1"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DatePicker };
