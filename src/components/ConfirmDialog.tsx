import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Send, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className={cn(
          'fixed z-[70] bg-white dark:bg-gray-900',
          'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-sm mx-4',
          'rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
              isDanger
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-violet-100 dark:bg-violet-900/30'
            )}
          >
            {isDanger ? (
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <Send className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            )}
          </div>

          {/* Content */}
          <h3
            id="confirm-title"
            className="text-lg font-bold text-gray-900 dark:text-white mb-2"
          >
            {title}
          </h3>
          <p
            id="confirm-message"
            className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            id="confirm-dialog-confirm"
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white',
              'transition-all duration-150 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
              isDanger
                ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-red-900/30'
                : 'bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-200 dark:shadow-violet-900/30'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </>
  );
}
