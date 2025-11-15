import { useEffect } from 'react';

interface UseColorKeyboardProps {
  currentHex: string;
  onCopy: () => void;
  onReset: () => void;
  onToggleShortcuts: () => void;
  showKeyboardShortcuts: boolean;
}

export function useColorKeyboard({
  currentHex,
  onCopy,
  onReset,
  onToggleShortcuts,
  showKeyboardShortcuts,
}: UseColorKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'c':
            event.preventDefault();
            onCopy();
            break;
          case 'r':
            event.preventDefault();
            onReset();
            break;
          case 'h':
            event.preventDefault();
            onToggleShortcuts();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentHex, onCopy, onReset, onToggleShortcuts, showKeyboardShortcuts]);
}

