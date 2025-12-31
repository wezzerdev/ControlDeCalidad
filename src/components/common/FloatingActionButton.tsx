import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface FabAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  disabled?: boolean;
}

interface FloatingActionButtonProps {
  mainAction?: FabAction; // If only one action, or the primary action of the group
  actions?: FabAction[]; // Secondary actions for Speed Dial
  className?: string;
}

export function FloatingActionButton({ mainAction, actions = [], className }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasMultipleActions = actions.length > 0;

  const handleMainClick = () => {
    if (hasMultipleActions) {
      setIsOpen(!isOpen);
    } else if (mainAction) {
      mainAction.onClick();
    }
  };

  return (
    <div className={cn("fixed bottom-20 right-6 z-[100] flex flex-col items-end gap-3 md:hidden", className)}>
      {/* Speed Dial Actions */}
      {isOpen && hasMultipleActions && (
        <div className="flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {actions.map((action, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="bg-background text-foreground text-xs font-medium px-2 py-1 rounded shadow-sm border border-border">
                {action.label}
              </span>
              <Button
                size="icon"
                variant={action.variant || 'secondary'}
                className="h-10 w-10 rounded-full shadow-md"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.icon}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Button */}
      <div className="flex items-center gap-3">
        {hasMultipleActions && isOpen && (
           <span className="bg-background text-foreground text-xs font-medium px-2 py-1 rounded shadow-sm border border-border md:hidden">
             Cerrar
           </span>
        )}
        <Button
          size="icon"
          variant="primary"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-transform duration-200",
            isOpen ? "rotate-45" : "rotate-0"
          )}
          onClick={handleMainClick}
          disabled={mainAction?.disabled}
        >
          {hasMultipleActions ? (
            <Plus className="h-6 w-6" />
          ) : (
            mainAction?.icon || <Plus className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
