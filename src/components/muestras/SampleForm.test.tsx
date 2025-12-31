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

// Mock scrollIntoView since jsdom doesn't support it
window.HTMLElement.prototype.scrollIntoView = vi.fn();

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
    const projectDropdown = screen.getByLabelText('1. Proyecto');
    const typeInput = screen.getByPlaceholderText('Seleccione proyecto primero');
    // Note: Norm dropdown might be disabled
    // const normDropdown = screen.getByLabelText('3. Norma Aplicable'); // Label text might be split, checking by name/role is safer or just use getAllByRole('combobox') carefully

    expect(typeInput).toBeDisabled();
    
    // Select a project
    fireEvent.change(projectDropdown, { target: { value: mockProyectos[0].id } });
    
    // Type input should now be enabled and placeholder changed
    const typeInputEnabled = screen.getByPlaceholderText('Buscar o seleccionar ensayo...');
    expect(typeInputEnabled).not.toBeDisabled();
  });

  it('filters norms based on selected Sample Type', async () => {
    renderComponent();
    const projectDropdown = screen.getByLabelText('1. Proyecto');
    
    // Select Project (Torre XYZ has norma_nmx_c414 assigned)
    fireEvent.change(projectDropdown, { target: { value: mockProyectos[0].id } });

    // Open Type Dropdown
    const typeInput = screen.getByPlaceholderText('Buscar o seleccionar ensayo...');
    fireEvent.focus(typeInput);
    fireEvent.click(typeInput);

    // Should see options
    // The option label format in component: "NormName" or "NormName [Category]"
    // NMX-C-414 is "Concreto Hidráulico - Cabecería", type "Concreto"
    // The component cleans up the name. "Concreto Hidráulico - Cabecería" -> "Cabecería" (based on regex)
    // Let's just look for text appearing in the document
    
    // Wait for dropdown to appear
    const options = await screen.findAllByText(/Cabecería/i);
    // Filter out the <option> element which is inside the Norm select
    const dropdownOption = options.find(el => el.tagName !== 'OPTION');
    
    expect(dropdownOption).toBeInTheDocument();

    // Select it
    if (dropdownOption) {
      fireEvent.click(dropdownOption);
    }

    // Now check if Norm dropdown is auto-selected or enabled
    // The component logic says: "Auto-select logic: If norms are available and current selection is invalid, select the first one."
    // So norma_nmx_c414 should be selected.
    
    // Find the select for norm (it's the second combobox now, or find by name "normaId")
    // Using container query is hard with screen. 
    // Let's use displayValue check or check if the select has the value.
    
    // We can just check if the Norm select has the value
    // We need to find the select.
    // It's inside a label "3. Norma Aplicable".
    // But the label contains a button "Ver Reseña" if selected.
    
    // Let's find by name attribute
    // React Testing Library doesn't have getByName, so use querySelector or standard getByRole
    // project is first combobox, norm is second.
    const selects = screen.getAllByRole('combobox');
    const normDropdown = selects[1]; // 0 is project, 1 is norm (since Type is input now)

    expect(normDropdown).toHaveValue('norma_nmx_c414');
  });
});
