import React, { useState, useEffect } from 'react';
import { ProjectList } from '../components/proyectos/ProjectList';
import { ProjectForm } from '../components/proyectos/ProjectForm';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Proyecto } from '../data/mockData';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';

export function Proyectos() {
  const { proyectos, normas, inventory, addProyecto, updateProyecto, deleteProyecto } = useData();
  const { user } = useAuth();

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  
  // UI Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter projects based on user role AND UI filters
  const filteredProyectos = proyectos.filter(proyecto => {
    // 1. Role Check
    let hasAccess = false;
    if (user?.role === 'administrador' || user?.role === 'gerente') {
      hasAccess = true;
    } else {
      hasAccess = proyecto.usuarios.some(u => u.userId === user?.id);
    }
    
    if (!hasAccess) return false;

    // 2. Search Text
    const matchesSearch = 
      proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.cliente.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Status Filter
    const matchesStatus = filterStatus === 'all' || proyecto.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    goToPage, 
    setCurrentPage 
  } = usePagination(filteredProyectos, 10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, setCurrentPage]);

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

  const handleCreate = () => {
    setSelectedProject(null);
    setView('create');
  };

  const handleEdit = (proyecto: Proyecto) => {
    setSelectedProject(proyecto);
    setView('edit');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      deleteProyecto(id);
    }
  };

  const handleSave = (proyecto: Proyecto) => {
    if (view === 'create') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, ...rest } = proyecto;
      addProyecto(rest);
    } else if (view === 'edit' && selectedProject) {
      updateProyecto(selectedProject.id, proyecto);
    }
    setView('list');
    setSelectedProject(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedProject(null);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nombre,Cliente,Estado,Inicio,Fin\n"
      + filteredProyectos.map(p => `${p.nombre},${p.cliente},${p.estado},${p.fechaInicio},${p.fechaFin}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "proyectos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <ProjectForm
        initialData={selectedProject}
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
          <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las obras y asigna las normas correspondientes a cada una.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-1 bg-muted p-1 rounded-lg border border-border mr-2">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={handleExport} id="btn-export-csv" className="hidden md:flex">
            Exportar CSV
          </Button>
          {(user?.role === 'administrador' || user?.role === 'gerente') && (
            <Button onClick={handleCreate} id="btn-new-project">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Nuevo Proyecto</span>
              <span className="md:hidden">Nuevo</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border border-border shadow-sm" id="projects-filters">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-full md:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4" id="projects-list">
        <ProjectList
          proyectos={paginatedData}
          normas={normas}
          inventory={inventory}
          onEdit={handleEdit}
          onDelete={handleDelete}
          viewMode={viewMode}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={filteredProyectos.length}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
