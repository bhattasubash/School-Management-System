import React from 'react';
import { clsx } from 'clsx';

export interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({ label, name, error, required, helpText, children, className }: FormFieldProps) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      <label htmlFor={name} className="block text-caption font-semibold text-brand-dark">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[12px] text-red-600 font-medium">{error}</p>}
      {helpText && !error && <p className="text-[12px] text-brand-muted">{helpText}</p>}
    </div>
  );
}

export { FormField };
