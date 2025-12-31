import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface MobileFloatingActionsProps {
  onAdd?: () => void;
  onExport?: () => void;
  addLabel?: string;
  exportLabel?: string;
  className?: string;
}

export function MobileFloatingActions({
  onAdd,
  onExport,
  addLabel = "Nuevo",
  exportLabel = "Exportar",
  className
}: MobileFloatingActionsProps) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 md:hidden flex flex-col-reverse items-end gap-3", className)}>
      {/* Primary Action: Add */}
      {onAdd && (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white transition-transform hover:scale-105 active:scale-95"
          onClick={onAdd}
          title={addLabel}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Secondary Action: Export */}
      {onExport && (
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-md border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105 active:scale-95 bg-white dark:bg-zinc-800"
          onClick={onExport}
          title={exportLabel}
        >
          <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      )}
    </div>
  );
}
