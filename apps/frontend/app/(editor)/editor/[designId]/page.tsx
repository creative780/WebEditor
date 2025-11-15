'use client';

import { use } from 'react';
import { EditorCanvas } from '../../../../components/editor/EditorCanvas';
import { Topbar } from '../../../../components/editor/Topbar';
import { LeftRail } from '../../../../components/editor/LeftRail';
import { RightPanel } from '../../../../components/editor/RightPanel';
import { FloatingToolbar } from '../../../../components/editor/FloatingToolbar';
import { PerformanceMonitor } from '../../../../components/editor/PerformanceMonitor';
import { useKeyboardShortcuts } from '../../../../hooks/useKeyboardShortcuts';
import { useDesignPersistence } from '../../../../hooks/useDesignPersistence';

interface EditorPageProps {
  params: Promise<{
    designId: string;
  }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { designId } = use(params);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize localStorage persistence
  useDesignPersistence(designId);

  return (
    <div className="editor-layout">
      <Topbar />
      <LeftRail />
      <EditorCanvas />
      <RightPanel />
      <PerformanceMonitor />
    </div>
  );
}
