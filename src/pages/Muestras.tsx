import React, { useState, useEffect } from 'react';
import { SampleList } from '../components/muestras/SampleList';
import { SampleForm } from '../components/muestras/SampleForm';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Muestra } from '../data/mockData';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { Plus, Search, Filter } from 'lucide-react';
import { MobileFloatingActions } from '../components/common/MobileFloatingActions';

export function Muestras() {
  const { 
    muestras, proyectos, normas,
    addMuestra, updateMuestra, deleteMuestra 
  } = useData();
  const { user } = useAuth();

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedSample, setSelectedSample] = useState<Muestra | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    
    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // UI Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter samples based on user role and assigned projects AND UI filters
  const filteredMuestras = muestras
    .filter(muestra => {
      // 1. Role Check
      let hasAccess = false;
      if (user?.role === 'administrador' || user?.role === 'gerente') {
        hasAccess = true;
      } else {
        const proyecto = proyectos.find(p => p.id === muestra.proyectoId);
        if (proyecto) {
          hasAccess = proyecto.usuarios.some(u => u.userId === user?.id);
        }
      }
      
      if (!hasAccess) return false;

      // 2. Search Text
      const matchesSearch = 
        muestra.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        muestra.tipoMaterial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        muestra.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        muestra.proveedor.toLowerCase().includes(searchTerm.toLowerCase());

      // 3. Project Filter
      const matchesProject = filterProject === 'all' || muestra.proyectoId === filterProject;

      // 4. Status Filter
      const matchesStatus = filterStatus === 'all' || muestra.estado === filterStatus;

      return matchesSearch && matchesProject && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by code (which usually contains year and sequence, e.g., MUE-2024-001)
      return sortOrder === 'asc' 
        ? a.codigo.localeCompare(b.codigo) 
        : b.codigo.localeCompare(a.codigo);
    });

  // Pagination
  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    goToPage, 
    setCurrentPage 
  } = usePagination(filteredMuestras, 10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProject, filterStatus, setCurrentPage]);

  // Get list of projects available to the user for the filter dropdown
  const availableProjects = proyectos.filter(p => {
    if (user?.role === 'administrador' || user?.role === 'gerente') return true;
    return p.usuarios.some(u => u.userId === user?.id);
  });

  const handleCreate = () => {
    setSelectedSample(null);
    setView('create');
  };

  const handleEdit = (muestra: Muestra) => {
    setSelectedSample(muestra);
    setView('edit');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta muestra?')) {
      deleteMuestra(id);
    }
  };

  const handleSave = (muestra: Muestra) => {
    if (view === 'create') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, codigo, ...rest } = muestra;
      // Let DataContext handle ID and Code generation
      addMuestra(rest);
    } else if (view === 'edit' && selectedSample) {
      updateMuestra(selectedSample.id, muestra);
    }
    setView('list');
    setSelectedSample(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedSample(null);
  };

  const handleScanQr = () => {
    addToast('Escáner de QR iniciado (Simulación)', 'info');
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Codigo,Proyecto,Norma,Material,Fecha,Estado\n"
      + filteredMuestras.map(m => {
          const proyecto = proyectos.find(p => p.id === m.proyectoId)?.nombre || 'N/A';
          const norma = normas.find(n => n.id === m.normaId)?.codigo || 'N/A';
          return `${m.codigo},${proyecto},${norma},${m.tipoMaterial},${m.fechaRecepcion},${m.estado}`;
      }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "muestras.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <SampleForm
        initialData={selectedSample}
        proyectos={proyectos}
        normas={normas}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Muestras</h1>
          <p className="text-muted-foreground mt-1">
            Registra y administra las muestras de materiales para ensayo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="hidden md:flex">
            Exportar CSV
          </Button>
          <Button onClick={handleCreate} id="btn-new-sample" className="hidden md:flex">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Muestra
          </Button>
        </div>
      </div>

      <MobileFloatingActions 
        onAdd={handleCreate}
        onExport={handleExport}
        onScanQr={handleScanQr}
      />

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border border-border shadow-sm" id="samples-filters">
        <div className="flex-1">
          <Input
            placeholder="Buscar por código, material, ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-full md:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todos los Proyectos</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full md:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
        <div className="w-full md:w-40">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="desc">Más Recientes</option>
            <option value="asc">Más Antiguos</option>
          </select>
        </div>
      </div>

      <div className="space-y-4" id="samples-list">
        <SampleList
          muestras={paginatedData}
          proyectos={proyectos}
          normas={normas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleEdit} // Reuse edit for now
          viewMode={viewMode}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={filteredMuestras.length}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
