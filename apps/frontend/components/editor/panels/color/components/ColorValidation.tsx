'use client';

import { AlertTriangle } from 'lucide-react';

interface ColorValidationProps {
  warnings: string[];
  errors: string[];
}

export function ColorValidation({
  warnings,
  errors,
}: ColorValidationProps) {
  if (warnings.length === 0 && errors.length === 0) return null;

  return (
    <>
      {warnings.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="w-4 h-4 text-yellow-600 mt-0.5"
              size={16}
            />
            <div className="flex-1">
              <span className="text-xs font-semibold text-yellow-800">
                Print Warnings
              </span>
              {warnings.map((warning, index) => (
                <div key={index} className="text-xs text-yellow-700 mt-1">
                  • {warning}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="w-4 h-4 text-red-600 mt-0.5"
              size={16}
            />
            <div className="flex-1">
              <span className="text-xs font-semibold text-red-800">
                Print Errors
              </span>
              {errors.map((error, index) => (
                <div key={index} className="text-xs text-red-700 mt-1">
                  • {error}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

