'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ProgressTask {
  id: string;
  message: string;
  progress: number; // 0-100
  status: 'loading' | 'success' | 'error';
  details?: string;
}

interface ProgressIndicatorProps {
  tasks: ProgressTask[];
  onDismiss?: (id: string) => void;
}

export function ProgressIndicator({ tasks, onDismiss }: ProgressIndicatorProps) {
  const [visible, setVisible] = useState(true);

  // Auto-hide successful/errored tasks after 3 seconds
  useEffect(() => {
    tasks.forEach(task => {
      if (task.status !== 'loading') {
        setTimeout(() => {
          onDismiss?.(task.id);
        }, 3000);
      }
    });
  }, [tasks, onDismiss]);

  if (tasks.length === 0 || !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2 max-w-sm">
      {tasks.map(task => (
        <ProgressCard
          key={task.id}
          task={task}
          onDismiss={() => onDismiss?.(task.id)}
        />
      ))}
    </div>
  );
}

function ProgressCard({
  task,
  onDismiss,
}: {
  task: ProgressTask;
  onDismiss: () => void;
}) {
  const getIcon = () => {
    switch (task.status) {
      case 'loading':
        return <Loader2 size={20} className="animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (task.status) {
      case 'loading':
        return 'bg-white';
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
    }
  };

  const getBorderColor = () => {
    switch (task.status) {
      case 'loading':
        return 'border-blue-300';
      case 'success':
        return 'border-green-300';
      case 'error':
        return 'border-red-300';
    }
  };

  return (
    <div
      className={`rounded-lg shadow-lg border-2 p-4 ${getBackgroundColor()} ${getBorderColor()} transition-all duration-300`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">{task.message}</div>
          
          {task.details && (
            <div className="text-xs text-gray-600 mt-1">{task.details}</div>
          )}

          {/* Progress Bar */}
          {task.status === 'loading' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        {task.status !== 'loading' && (
          <button
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onDismiss}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for managing progress tasks
 */
export function useProgressIndicator() {
  const [tasks, setTasks] = useState<ProgressTask[]>([]);

  const addTask = (
    id: string,
    message: string,
    details?: string
  ): void => {
    setTasks(prev => [
      ...prev,
      {
        id,
        message,
        progress: 0,
        status: 'loading',
        details,
      },
    ]);
  };

  const updateTask = (
    id: string,
    updates: Partial<ProgressTask>
  ): void => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const removeTask = (id: string): void => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completeTask = (id: string, details?: string): void => {
    updateTask(id, {
      status: 'success',
      progress: 100,
      details: details || 'Completed successfully',
    });
  };

  const errorTask = (id: string, error: string): void => {
    updateTask(id, {
      status: 'error',
      progress: 0,
      details: error,
    });
  };

  return {
    tasks,
    addTask,
    updateTask,
    removeTask,
    completeTask,
    errorTask,
  };
}

/**
 * Skeleton Screen Component for Loading States
 */
export function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animated = true,
}: {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: number | string;
  height?: number | string;
  animated?: boolean;
}) {
  const baseClasses = `bg-gray-200 ${animated ? 'animate-pulse' : ''}`;
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

/**
 * Skeleton Card for Template/Plugin Loading
 */
export function SkeletonCard() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-3">
      <SkeletonLoader variant="rectangular" width="100%" height={120} />
      <SkeletonLoader variant="text" width="60%" />
      <SkeletonLoader variant="text" width="100%" />
      <SkeletonLoader variant="text" width="80%" />
    </div>
  );
}

/**
 * Skeleton List Item
 */
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 p-3">
      <SkeletonLoader variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <SkeletonLoader variant="text" width="40%" />
        <SkeletonLoader variant="text" width="70%" />
      </div>
    </div>
  );
}

/**
 * Loading Overlay Component
 */
export function LoadingOverlay({
  message = 'Loading...',
  progress,
  showProgress = false,
}: {
  message?: string;
  progress?: number;
  showProgress?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center loading-overlay">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-lg font-medium text-gray-900">{message}</span>
        </div>
        {showProgress && progress !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

