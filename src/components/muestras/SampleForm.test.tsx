import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SampleForm } from './SampleForm';
import { mockProyectos, mockNormas, Muestra } from '../../data/mockData';

// Mock hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user', name: 'Test User' } })
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() })
}));

describe('SampleForm Logic', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const renderComponent = () => {
    return render(
      <SampleForm 
        proyectos={mockProyectos} 
        normas={mockNormas} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Nueva Muestra Estructurada')).toBeInTheDocument();
    expect(screen.getByText('Selección de Normativa')).toBeInTheDocument();
  });

  it('enables Sample Type selection after Project selection', async () => {
    renderComponent();
    
    // Project selector
    const selects = screen.getAllByRole('combobox');
    const projectDropdown = selects[0];
    const typeDropdown = selects[1];
    const normDropdown = selects[2];

    expect(typeDropdown).toBeDisabled();
    expect(normDropdown).toBeDisabled();

    // Select a project
    fireEvent.change(projectDropdown, { target: { value: mockProyectos[0].id } });
    
    expect(typeDropdown).not.toBeDisabled();
    // Norm should still be disabled until type is selected
    expect(normDropdown).toBeDisabled();
  });

  it('filters norms based on selected Sample Type', async () => {
    renderComponent();
    const selects = screen.getAllByRole('combobox');
    const projectDropdown = selects[0];
    const typeDropdown = selects[1];
    const normDropdown = selects[2];

    // Select Project (Torre XYZ has norma_nmx_c414 assigned)
    fireEvent.change(projectDropdown, { target: { value: mockProyectos[0].id } });

    // Select Type 'Concreto'
    fireEvent.change(typeDropdown, { target: { value: 'Concreto' } });

    expect(normDropdown).not.toBeDisabled();

    // Check if Concrete norm is an option
    // NMX-C-414 is Concrete
    const concreteNormOption = screen.getByText(/NMX-C-414/i);
    expect(concreteNormOption).toBeInTheDocument();

    // Change Type to 'Suelo'
    fireEvent.change(typeDropdown, { target: { value: 'Suelo' } });

    // NMX-C-414 should NOT be an option (or at least not visible/valid if we could check children)
    // However, since we rely on `availableNormas` state, the option should physically disappear from the DOM or the select value.
    // React testing library `getByText` might fail if it's removed. 
    // Let's check queryByText.
    const concreteNormOptionAfter = screen.queryByText(/NMX-C-414/i);
    expect(concreteNormOptionAfter).not.toBeInTheDocument();
  });
});
