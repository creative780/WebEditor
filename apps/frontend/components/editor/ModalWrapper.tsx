'use client';

import { useEffect, useRef } from 'react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ModalWrapper({ isOpen, onClose, children, className = '' }: ModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-10" />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`absolute ${className}`}
        style={{
          top: '64px', // Below the top bar
          maxHeight: 'calc(100vh - 64px)', // Don't exceed viewport minus top bar
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

