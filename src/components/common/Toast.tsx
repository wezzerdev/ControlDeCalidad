import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className={cn(
      "flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100",
      type === 'success' && "bg-white dark:bg-gray-800 border-green-500 text-green-700 dark:text-green-400",
      type === 'error' && "bg-white dark:bg-gray-800 border-red-500 text-red-700 dark:text-red-400",
      type === 'info' && "bg-white dark:bg-gray-800 border-blue-500 text-blue-700 dark:text-blue-400"
    )}>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {type === 'success' && <CheckCircle className="w-5 h-5" />}
        {type === 'error' && <AlertCircle className="w-5 h-5" />}
        {type === 'info' && <Info className="w-5 h-5" />}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button 
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-300"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
