'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ErrorToast({ toast, onDismiss }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`p-4 rounded-lg border-2 shadow-lg mb-3 ${getBackgroundColor()} transition-all duration-300 notification-slide-in ${
        toast.type === 'error' ? 'error-toast' : toast.type === 'success' ? 'success-toast' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-semibold underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 */
export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[var(--z-toast)] space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ErrorToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/**
 * Hook for managing toast notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration?: number,
    action?: Toast['action']
  ): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type, duration, action }]);
    return id;
  };

  const showSuccess = (message: string, duration?: number) =>
    showToast(message, 'success', duration);

  const showError = (message: string, duration?: number, action?: Toast['action']) =>
    showToast(message, 'error', duration, action);

  const showWarning = (message: string, duration?: number) =>
    showToast(message, 'warning', duration);

  const showInfo = (message: string, duration?: number) =>
    showToast(message, 'info', duration);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
    dismissAll,
  };
}

