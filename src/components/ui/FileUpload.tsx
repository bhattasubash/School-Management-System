'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  isUploading?: boolean;
  error?: string;
  currentFileName?: string;
  className?: string;
}

export default function FileUpload({
  accept = '.xlsx,.csv,.xls',
  maxSizeMB = 10,
  onFileSelect,
  onClear,
  isUploading = false,
  error,
  currentFileName,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const validateAndSelect = useCallback(
    (file: File) => {
      setLocalError(null);
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        setLocalError(`File size exceeds ${maxSizeMB}MB limit`);
        return;
      }
      if (accept) {
        const allowedExts = accept.split(',').map((e) => e.trim().toLowerCase());
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedExts.includes(fileExt)) {
          setLocalError(`Invalid file type. Allowed: ${accept}`);
          return;
        }
      }
      onFileSelect(file);
    },
    [accept, maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [validateAndSelect]
  );

  const handleClear = () => {
    setLocalError(null);
    onClear?.();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (currentFileName) {
    return (
      <div className={clsx('rounded-xl border border-brand-border bg-brand-subtle p-4', className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <File className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-primary text-brand-dark font-medium truncate">{currentFileName}</p>
            {isUploading && (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                <span className="text-caption text-brand-muted">Uploading...</span>
              </div>
            )}
          </div>
          {!isUploading && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-dark"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'rounded-xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all',
          isDragOver ? 'border-brand-primary bg-brand-light/50' : 'border-brand-border hover:border-brand-muted hover:bg-brand-subtle',
          displayError && 'border-red-400 bg-red-50/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center mb-3', isDragOver ? 'bg-brand-light' : 'bg-brand-subtle')}>
            <Upload className={clsx('w-6 h-6', isDragOver ? 'text-brand-primary' : 'text-brand-muted')} />
          </div>
          <p className="text-body-primary text-brand-dark font-medium">
            {isDragOver ? 'Drop file here' : 'Drag & drop file here or click to browse'}
          </p>
          <p className="text-caption text-brand-muted mt-1">
            Supports {accept.replace(/\./g, '').toUpperCase()} (max {maxSizeMB}MB)
          </p>
        </div>
      </div>
      {displayError && (
        <div className="flex items-center gap-1.5 mt-2 text-[12px] text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {displayError}
        </div>
      )}
    </div>
  );
}

export { FileUpload };
