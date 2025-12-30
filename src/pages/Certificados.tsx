import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CertificadoList } from '../components/certificados/CertificadoList';
import { CertificadoView } from '../components/certificados/CertificadoView';
import { Muestra, SampleTypeCategory } from '../data/mockData';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function Certificados() {
  const { muestras, proyectos, normas } = useData();
  const { user } = useAuth();
  const [selectedMuestra, setSelectedMuestra] = useState<Muestra | null>(null);

  // UI Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Logic to get available test types (Rubros) dynamically
  const availableTestTypes = useMemo(() => {
    // 1. Determine base norms: All norms OR norms assigned to selected project
    let relevantNorms = normas;
    
    if (filterProject !== 'all') {
        const project = proyectos.find(p => p.id === filterProject);
        if (project && project.normasAsignadas) {
            relevantNorms = normas.filter(n => project.normasAsignadas.includes(n.id));
        } else {
            relevantNorms = [];
        }
    }

    const options: { id: string, label: string, normId: string, category: string }[] = [];

    relevantNorms.forEach(n => {
        // Clean up norm name
        const cleanName = n.nombre
          .replace(/^(NMX-[A-Z]-\d+-ONNCCE|ASTM [A-Z]\d+|ACI \d+) - /, '') 
          .replace(/^Industria de la construcción - /, '')
          .replace(/^Concreto - /, '')
          .replace(/^Cementos hidráulicos - /, '')
          .trim();

        // If norm has compatible types, create an option for each
        if (n.tiposMuestraCompatibles && n.tiposMuestraCompatibles.length > 0) {
            n.tiposMuestraCompatibles.forEach(cat => {
                const hasCategoryInName = cleanName.toLowerCase().includes(cat.toLowerCase());
                const label = hasCategoryInName ? cleanName : `${cleanName} [${cat}]`;
                
                // For the filter value, we'll use a composite key or just norm ID if unique context isn't needed for ID
                // But since we want to filter by "Type", we should ideally filter by Norm ID.
                // However, one norm ID can support multiple types.
                // If the user selects "Densidad [Agregados]", they want that norm context.
                // Since our Muestras only store normId, filtering by just normId might be ambiguous if the norm is shared.
                // But for now, let's use a composite value to distinguish in the dropdown, and parse it for filtering.
                options.push({
                    id: `${n.id}|${cat}`, 
                    label: label,
                    normId: n.id,
                    category: cat
                });
            });
        } else {
             options.push({
                id: `${n.id}|Otro`,
                label: cleanName,
                normId: n.id,
                category: 'Otro'
            });
        }
    });
    
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [normas, proyectos, filterProject]);

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
      muestra.tipoMaterial.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Project Filter
    const matchesProject = filterProject === 'all' || muestra.proyectoId === filterProject;

    // 4. Status Filter
    const matchesStatus = filterStatus === 'all' || muestra.estado === filterStatus;

    // 5. Type Filter (Rubro / Ensayo)
    let matchesType = true;
    if (filterType !== 'all') {
        const [targetNormId, targetCategory] = filterType.split('|');
        
        // Primary check: Norm ID must match
        if (muestra.normaId !== targetNormId) {
            matchesType = false;
        } else {
            // Secondary check: If the norm is shared (e.g. Concreto/Agregados), 
            // we should try to match the category if possible.
            // Muestras have 'tipoMaterial' string. We can check if it contains the category name?
            // Or if the norm only supports ONE category, we assume it matches.
            const norm = normas.find(n => n.id === targetNormId);
            if (norm && norm.tiposMuestraCompatibles && norm.tiposMuestraCompatibles.length > 1) {
                // Shared norm: Try to match category in 'tipoMaterial' or strict check if we had a category field
                // For now, heuristic: Check if tipoMaterial contains category name (case insensitive)
                if (targetCategory !== 'Otro' && !muestra.tipoMaterial.toLowerCase().includes(targetCategory.toLowerCase())) {
                    // This might be too strict if user entered arbitrary material name.
                    // But usually SampleForm auto-fills tipoMaterial with category name.
                    // Let's accept it if it matches, OR if we want to be lenient, we can just filter by Norm ID.
                    // But user specifically asked for "rubros".
                    // Let's stick to Norm ID check primarily, but if shared, use heuristic.
                    // Actually, if I select "Densidad [Agregados]" and show "Densidad [Concreto]" samples, it's confusing.
                    // So we try to filter.
                     matchesType = muestra.tipoMaterial.toLowerCase().includes(targetCategory.toLowerCase());
                }
            }
        }
    }

    return matchesSearch && matchesProject && matchesStatus && matchesType;
  })
  .sort((a, b) => {
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
  }, [searchTerm, filterProject, filterStatus, filterType, setCurrentPage]);

  // Get list of projects available to the user for the filter dropdown
  const availableProjects = proyectos.filter(p => {
    if (user?.role === 'administrador' || user?.role === 'gerente') return true;
    return p.usuarios.some(u => u.userId === user?.id);
  });

  const handleExport = () => {
    if (filteredMuestras.length === 0) return;

    // Define CSV headers
    const headers = ['Código', 'Proyecto', 'Norma', 'Tipo Material', 'Fecha Ensayo', 'Estado', 'Ubicación', 'Proveedor'];
    
    // Convert data to CSV rows
    const rows = filteredMuestras.map(m => {
        const proyecto = proyectos.find(p => p.id === m.proyectoId)?.nombre || 'N/A';
        const norma = normas.find(n => n.id === m.normaId)?.codigo || 'N/A';
        
        return [
            m.codigo,
            proyecto,
            norma,
            m.tipoMaterial,
            m.fechaEnsayo || 'Pendiente',
            m.estado,
            m.ubicacion,
            m.proveedor
        ].map(val => `"${val}"`).join(','); // Quote values to handle commas
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `certificados_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {!selectedMuestra && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Certificados e Informes</h1>
            <p className="text-muted-foreground mt-2">
              Genera, visualiza e imprime los informes de ensayos completados.
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={filteredMuestras.length === 0}>
             <Download className="mr-2 h-4 w-4" />
             Exportar CSV
          </Button>
        </div>
      )}

      {!selectedMuestra && (
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
          <div className="flex-1">
            <Input
              placeholder="Buscar por código o material..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todos los Tipos</option>
              {availableTestTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-40">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todos los Estados</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="en_proceso">En Proceso</option>
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
      )}

      {selectedMuestra ? (
        <CertificadoView
          muestra={selectedMuestra}
          norma={normas.find(n => n.id === selectedMuestra.normaId)!}
          proyecto={proyectos.find(p => p.id === selectedMuestra.proyectoId)!}
          onBack={() => setSelectedMuestra(null)}
        />
      ) : (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4">
          <CertificadoList
            muestras={paginatedData}
            proyectos={proyectos}
            normas={normas}
            onView={setSelectedMuestra}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={filteredMuestras.length}
            itemsPerPage={10}
          />
        </div>
      )}
    </div>
  );
}
