import React from 'react';
import { Button } from './Button';
import { Save, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileFormActionsProps {
  onSave?: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  showOnDesktop?: boolean;
  hideSave?: boolean;
}

export function MobileFormActions({
  onSave,
  onCancel,
  isSubmitting = false,
  saveLabel = "Guardar",
  cancelLabel = "Cancelar",
  className,
  showOnDesktop = false,
  hideSave = false
}: MobileFormActionsProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-50 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]",
      !showOnDesktop && "md:hidden",
      className
    )}>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={isSubmitting}
        className="flex-1 h-12 text-base"
      >
        <X className="mr-2 h-4 w-4" />
        {cancelLabel}
      </Button>
      
      {!hideSave && (
        <Button 
          type="submit" 
          onClick={onSave}
          disabled={isSubmitting}
          className="flex-1 h-12 text-base shadow-lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {saveLabel}
        </Button>
      )}
    </div>
  );
}
