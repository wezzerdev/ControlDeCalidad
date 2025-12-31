import React, { useState } from 'react';
import { Plus, Download, QrCode } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface MobileFloatingActionsProps {
  onAdd?: () => void;
  onExport?: () => void;
  onScanQr?: () => void;
  addLabel?: string;
  exportLabel?: string;
  scanLabel?: string;
  className?: string;
}

export function MobileFloatingActions({
  onAdd,
  onExport,
  onScanQr,
  addLabel = "Nuevo",
  exportLabel = "Exportar",
  scanLabel = "Escanear QR",
  className
}: MobileFloatingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // If only one action, show it directly (usually Add)
  const hasMultipleActions = (onAdd ? 1 : 0) + (onExport ? 1 : 0) + (onScanQr ? 1 : 0) > 1;

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 md:hidden flex flex-col-reverse items-end gap-3", className)}>
      {/* Primary Action: Add or Menu Toggle if we wanted a proper FAB menu, but for now we stack them which is cleaner for < 4 actions */}
      
      {onAdd && (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-2 duration-300"
          onClick={onAdd}
          title={addLabel}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Secondary Actions */}
      {onScanQr && (
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95 bg-white dark:bg-zinc-800 animate-in slide-in-from-bottom-4 duration-500 delay-75"
          onClick={onScanQr}
          title={scanLabel}
        >
          <QrCode className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      )}

      {onExport && (
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95 bg-white dark:bg-zinc-800 animate-in slide-in-from-bottom-4 duration-500 delay-100"
          onClick={onExport}
          title={exportLabel}
        >
          <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      )}
    </div>
  );
}
