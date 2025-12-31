import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileFormActions } from './MobileFormActions';

describe('MobileFormActions', () => {
  const mockOnCancel = vi.fn();
  const mockOnSave = vi.fn();

  it('renders correctly on mobile', () => {
    render(<MobileFormActions onCancel={mockOnCancel} />);
    
    // Check if Cancel button exists
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    
    // Check if Save button exists (default show)
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<MobileFormActions onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onSave when save button is clicked', () => {
    render(<MobileFormActions onCancel={mockOnCancel} onSave={mockOnSave} />);
    
    fireEvent.click(screen.getByText('Guardar'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('hides save button when hideSave is true', () => {
    render(<MobileFormActions onCancel={mockOnCancel} hideSave={true} />);
    
    expect(screen.queryByText('Guardar')).not.toBeInTheDocument();
  });

  it('renders custom labels', () => {
    render(
      <MobileFormActions 
        onCancel={mockOnCancel} 
        cancelLabel="Back" 
        saveLabel="Submit" 
      />
    );
    
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
});
