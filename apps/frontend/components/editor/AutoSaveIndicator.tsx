'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, AlertCircle, Check, Loader2 } from 'lucide-react';
import { autoSaveManager, SaveStatus } from '../../lib/autoSave';

export function AutoSaveIndicator() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<string>('');

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = autoSaveManager.onStatusChange(setStatus);

    // Update last save time every second
    const interval = setInterval(() => {
      const lastSave = autoSaveManager.getLastSaveTime();
      if (lastSave) {
        const timeSince = autoSaveManager.getTimeSinceLastSave();
        setLastSaveTime(formatTimeSince(timeSince));
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const formatTimeSince = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 size={14} className="animate-spin text-blue-500" />;
      case 'saved':
        return <Check size={14} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={14} className="text-red-500" />;
      case 'conflict':
        return <AlertCircle size={14} className="text-yellow-500" />;
      default:
        return <Cloud size={14} className="text-gray-400" />;
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaveTime ? `Saved ${lastSaveTime}` : 'Saved';
      case 'error':
        return 'Save failed';
      case 'conflict':
        return 'Conflict detected';
      default:
        return 'Auto-save enabled';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'conflict':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <button
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      onClick={() => autoSaveManager.forceSave()}
      title="Click to save now"
    >
      {getIcon()}
      <span className={`text-xs font-medium ${getTextColor()}`}>
        {getMessage()}
      </span>
    </button>
  );
}

