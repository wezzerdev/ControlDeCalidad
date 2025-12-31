import React, { useState, useEffect } from 'react';
import { NormaList } from '../components/normas/NormaList';
import { NormaEditor } from '../components/normas/NormaEditor';
import { useData } from '../context/DataContext';
import { Norma } from '../data/mockData';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { Plus, Search, Filter, Download } from 'lucide-react';

export function Normas() {
  const { normas, addNorma, updateNorma, deleteNorma } = useData();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedNorma, setSelectedNorma] = useState<Norma | null>(null);
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filter logic
  const filteredNormas = normas.filter(norma => {
    const matchesSearch = 
      norma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      norma.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || norma.tipo === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    goToPage, 
    setCurrentPage 
  } = usePagination(filteredNormas, 10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, setCurrentPage]);

  const handleCreate = () => {
    setSelectedNorma(null);
    setView('create');
  };

  const handleEdit = (norma: Norma) => {
    setSelectedNorma(norma);
    setView('edit');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta norma?')) {
      deleteNorma(id);
    }
  };

  const handleSave = (norma: Norma) => {
    if (view === 'create') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, ...rest } = norma;
      addNorma(rest);
    } else if (view === 'edit' && selectedNorma) {
      updateNorma(selectedNorma.id, norma);
    }
    setView('list');
    setSelectedNorma(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedNorma(null);
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = [
      'Código',
      'Nombre',
      'Tipo',
      'Descripción',
      'Estado',
      'Creada Por',
      'Fecha Creación',
      'Tipos Compatibles',
      'Campos Definidos'
    ];

    const rows = filteredNormas.map(n => {
      const tiposCompatibles = n.tiposMuestraCompatibles ? n.tiposMuestraCompatibles.join('; ') : '';
      const camposDefinidos = n.campos ? n.campos.map(c => c.nombre).join('; ') : '';
      
      // Escape quotes and handle commas in content
      const clean = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;

      return [
        clean(n.codigo),
        clean(n.nombre),
        clean(n.tipo),
        clean(n.descripcion),
        n.activa ? 'Activa' : 'Inactiva',
        clean(n.creadaPor),
        clean(n.createdAt),
        clean(tiposCompatibles),
        clean(camposDefinidos)
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n"
      + rows.join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `normas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <NormaEditor
        initialData={selectedNorma}
        onSave={handleSave}
        onCancel={handleCancel}
        readOnly={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Normas</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza las normas técnicas y configuraciones de ensayo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} title="Exportar Normas">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border border-border shadow-sm" id="normas-filters">
        <div className="flex-1">
          <Input
            placeholder="Buscar por código o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-full md:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todos los Tipos</option>
              <option value="NMX">NMX</option>
              <option value="ACI">ACI</option>
              <option value="ASTM">ASTM</option>
              <option value="Local">Local</option>
              <option value="Privada">Privada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4" id="normas-list">
        <NormaList
          normas={paginatedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleEdit} // Reusing edit for view for now
          viewMode={viewMode}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={filteredNormas.length}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
