import { useCallback } from 'react';
import { PanelTab } from '../components/PanelTabs';

export function usePanelSwitcher() {
  const switchPanel = useCallback((tab: PanelTab) => {
    // This hook can be extended with panel-specific logic
    // For now, it's a simple wrapper
    return tab;
  }, []);

  return { switchPanel };
}

