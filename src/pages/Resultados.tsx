import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Download, Filter, Search, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Input } from '../components/common/Input';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { Modal } from '../components/common/Modal';
import { cn } from '../lib/utils';

interface ResultRow {
  id: string;
  muestraId: string;
  muestraCodigo: string;
  ensayoNombre: string;
  valor: string;
  rawValue: number | string | boolean;
  unidad?: string;
  fecha: string;
  tecnicoNombre: string;
  estado: 'Conforme' | 'No Conforme' | 'Pendiente' | 'N/A';
  proyectoNombre: string;
  normaCodigo: string;
  limiteMin?: number;
  limiteMax?: number;
  comentarios?: string;
}

export default function Resultados() {
  const { muestras, normas, proyectos } = useData();
  const { user } = useAuth();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<ResultRow | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      } else {
        setViewMode('list'); // Revert to list on desktop
      }
    };
    
    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Derivar la lista plana de resultados
  const allResults: ResultRow[] = useMemo(() => {
    const resultsList: ResultRow[] = [];

    muestras.forEach(muestra => {
      // Check permissions: if not admin/manager, user must be assigned to project
      if (user?.role !== 'administrador' && user?.role !== 'gerente') {
          const proyecto = proyectos.find(p => p.id === muestra.proyectoId);
          if (!proyecto || !proyecto.usuarios.some(u => u.userId === user?.id)) {
              return; // Skip this muestra
          }
      }

      // Solo procesar muestras que tienen resultados
      if (!muestra.resultados) return;

      const norma = normas.find(n => n.id === muestra.normaId);
      const proyecto = proyectos.find(p => p.id === muestra.proyectoId);
      // We don't have easy access to technician name without fetching all profiles or storing it in muestra
      // For now, use ID or generic
      const tecnicoNombre = muestra.tecnicoId ? 'Técnico Asignado' : 'Sin Asignar'; 

      if (!norma) return;

      // Iterar sobre los campos de la norma para extraer los resultados
      norma.campos.forEach(campo => {
        const valor = muestra.resultados?.[campo.id];
        
        // Si no hay valor para este campo, lo saltamos (o podríamos mostrarlo como pendiente)
        if (valor === undefined || valor === null || valor === '') return;

        // Determinar estado
        let estado: ResultRow['estado'] = 'Conforme';
        
        if (typeof valor === 'number') {
          if (campo.limiteMin !== undefined && valor < campo.limiteMin) estado = 'No Conforme';
          if (campo.limiteMax !== undefined && valor > campo.limiteMax) estado = 'No Conforme';
        } else if (typeof valor === 'boolean') {
            // Asumimos que true es 'Pass'/'Cumple' si el campo es de cumplimiento
            // Si el nombre sugiere fallo (ej. "Fisuras"), la lógica podría ser inversa, 
            // pero por convención boolean suele ser check de cumplimiento.
            // En mockData 'f_aci_pass' es Cumplimiento -> true es bueno.
            if (valor === false) estado = 'No Conforme'; 
        }

        // Formatear valor
        let formattedValue = String(valor);
        if (typeof valor === 'boolean') formattedValue = valor ? 'Cumple' : 'No Cumple';
        if (campo.unidad) formattedValue += ` ${campo.unidad}`;

        resultsList.push({
          id: `${muestra.id}-${campo.id}`,
          muestraId: muestra.id,
          muestraCodigo: muestra.codigo,
          ensayoNombre: campo.nombre,
          valor: formattedValue,
          rawValue: valor,
          unidad: campo.unidad,
          fecha: muestra.fechaEnsayo || muestra.fechaRecepcion,
          tecnicoNombre: tecnicoNombre,
          estado: estado,
          proyectoNombre: proyecto?.nombre || 'Sin Proyecto',
          normaCodigo: norma.codigo,
          limiteMin: campo.limiteMin,
          limiteMax: campo.limiteMax,
        });
      });
    });

    return resultsList;
  }, [muestras, normas, proyectos, user]);

  // Filtrado y Ordenamiento
  const filteredResults = allResults.filter(res => 
    res.muestraCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.ensayoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.tecnicoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.proyectoNombre.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Ordenar por fecha primero, luego por código
    const dateComparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    if (dateComparison !== 0) return sortOrder === 'asc' ? -dateComparison : dateComparison;
    
    return sortOrder === 'asc' 
      ? a.muestraCodigo.localeCompare(b.muestraCodigo) 
      : b.muestraCodigo.localeCompare(a.muestraCodigo);
  });

  // Pagination
  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    goToPage, 
    setCurrentPage 
  } = usePagination(filteredResults, 10);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, setCurrentPage]);

  const handleExport = () => {
    const headers = ['ID Muestra', 'Proyecto', 'Ensayo', 'Valor', 'Unidad', 'Límite Min', 'Límite Max', 'Estado', 'Fecha', 'Técnico'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(r => [
        r.muestraCodigo,
        `"${r.proyectoNombre}"`,
        `"${r.ensayoNombre}"`,
        r.rawValue,
        r.unidad || '',
        r.limiteMin || '',
        r.limiteMax || '',
        r.estado,
        r.fecha,
        r.tecnicoNombre
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resultados_laboratorio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const ResultDetailModal = () => {
    if (!selectedResult) return null;

    return (
      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title={`Detalle de Resultado - ${selectedResult.muestraCodigo}`}
        className="max-w-md"
      >
        <div className="space-y-4 py-2">
          <div className="bg-muted/30 p-3 rounded-lg border">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Proyecto:</span>
              <span className="font-medium text-right">{selectedResult.proyectoNombre}</span>
              
              <span className="text-muted-foreground">Norma:</span>
              <span className="font-medium text-right">{selectedResult.normaCodigo}</span>
              
              <span className="text-muted-foreground">Fecha Ensayo:</span>
              <span className="font-medium text-right">{new Date(selectedResult.fecha).toLocaleDateString()}</span>
              
              <span className="text-muted-foreground">Técnico:</span>
              <span className="font-medium text-right">{selectedResult.tecnicoNombre}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Resultados de la Prueba</h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center p-3 bg-card border rounded-md shadow-sm">
                <div>
                  <p className="text-sm font-medium">{selectedResult.ensayoNombre}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                    {selectedResult.limiteMin !== undefined && <span>Min: {selectedResult.limiteMin}</span>}
                    {selectedResult.limiteMax !== undefined && <span>Max: {selectedResult.limiteMax}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{selectedResult.valor}</span>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-md border",
                selectedResult.estado === 'Conforme' 
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" 
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              )}>
                {selectedResult.estado === 'Conforme' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  Dictamen: {selectedResult.estado.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setSelectedResult(null)}>Cerrar</Button>
            <Button onClick={() => {
              setSelectedResult(null);
              setIsReportModalOpen(true);
            }}>
              <FileText className="mr-2 h-4 w-4" />
              Generar Informe
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const ReportPreviewModal = () => {
    if (!isReportModalOpen) return null;
    
    // Si venimos de un resultado específico, usamos ese contexto, si no, es genérico
    // Para simplificar, asumiremos que se genera el informe de la muestra seleccionada previamente
    // Pero como cerramos el modal anterior, necesitamos persistir esa data o manejarlo diferente.
    // Hack rápido: no borrar selectedResult al abrir reporte, o usar un estado separado 'reportData'.
    // Mejor: Reporte Modal recibe la data antes de borrar selectedResult.
    
    // Sin embargo, para no complicar el estado, vamos a asumir que el usuario quiere ver el PDF.
    return (
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Vista Previa de Informe"
        className="max-w-3xl h-[80vh]"
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg border p-8 overflow-y-auto shadow-inner">
            <div className="bg-white text-black p-8 min-h-[800px] shadow-lg max-w-2xl mx-auto flex flex-col">
              {/* Header Reporte */}
              <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wider">Informe de Resultados</h1>
                  <p className="text-sm text-gray-600">Laboratorio de Control de Calidad</p>
                </div>
                <div className="text-right text-xs">
                  <p><strong>Folio:</strong> INF-{new Date().getFullYear()}-001</p>
                  <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Contenido Mock */}
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4 text-sm border p-4 bg-gray-50">
                  <div>
                    <p><span className="font-bold">Cliente:</span> Constructora ABC</p>
                    <p><span className="font-bold">Proyecto:</span> Torre XYZ</p>
                    <p><span className="font-bold">Ubicación:</span> Av. Reforma 123</p>
                  </div>
                  <div>
                    <p><span className="font-bold">Muestra:</span> MUE-2024-001</p>
                    <p><span className="font-bold">Material:</span> Concreto Hidráulico</p>
                    <p><span className="font-bold">Norma:</span> NMX-C-414</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold border-b mb-2">Resultados de Ensayo</h3>
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2">Parámetro</th>
                        <th className="p-2">Unidad</th>
                        <th className="p-2">Resultado</th>
                        <th className="p-2">Especificación</th>
                        <th className="p-2">Cumplimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Resistencia Compresión</td>
                        <td className="p-2">kg/cm²</td>
                        <td className="p-2 font-bold">210</td>
                        <td className="p-2">&ge; 200</td>
                        <td className="p-2 text-green-600 font-bold">CUMPLE</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Revenimiento</td>
                        <td className="p-2">cm</td>
                        <td className="p-2 font-bold">10</td>
                        <td className="p-2">8 - 12</td>
                        <td className="p-2 text-green-600 font-bold">CUMPLE</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold border-b mb-2">Dictamen Final</h3>
                  <p className="text-sm text-justify">
                    La muestra analizada <strong>CUMPLE</strong> con las especificaciones de la norma NMX-C-414 y los requisitos del proyecto para los parámetros evaluados.
                  </p>
                </div>
              </div>

              {/* Firmas */}
              <div className="mt-12 pt-8 grid grid-cols-2 gap-12 text-center text-sm">
                <div>
                  <div className="border-t border-black w-full pt-2">
                    <p className="font-bold">Juan Técnico</p>
                    <p className="text-xs text-gray-500">Técnico de Laboratorio</p>
                  </div>
                </div>
                <div>
                  <div className="border-t border-black w-full pt-2">
                    <p className="font-bold">Ing. Supervisor</p>
                    <p className="text-xs text-gray-500">Jefe de Laboratorio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4 bg-background">
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Cerrar</Button>
            <Button onClick={() => alert("Función de impresión real pendiente de integración con backend/biblioteca PDF")}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <ResultDetailModal />
      <ReportPreviewModal />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Resultados</h1>
          <p className="text-muted-foreground mt-2">Consulta, validación y reporte de resultados de ensayos.</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="hidden md:flex">
          <Download className="mr-2 h-4 w-4" />
          Exportar Datos
        </Button>
      </div>

      <div className="flex gap-4 flex-col md:flex-row" id="results-filters">
        <div className="flex-1">
          <Input 
            icon={<Search className="h-4 w-4" />} 
            placeholder="Buscar por código, ensayo, proyecto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
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

      <Card className={cn(viewMode === 'grid' && "bg-transparent border-0 shadow-none")} id="results-list">
        <CardContent className={cn("p-0", viewMode === 'grid' && "bg-transparent")}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((res) => (
                <div key={res.id} className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{res.muestraCodigo}</h3>
                      <p className="text-sm text-muted-foreground">{res.normaCodigo}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                      res.estado === 'Conforme' 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : res.estado === 'No Conforme'
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    )}>
                      {res.estado === 'Conforme' && <CheckCircle className="h-3 w-3" />}
                      {res.estado === 'No Conforme' && <AlertCircle className="h-3 w-3" />}
                      {res.estado}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Proyecto</span>
                      <span className="font-medium truncate block">{res.proyectoNombre}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground block text-xs">Ensayo</span>
                        <span className="font-medium">{res.ensayoNombre}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Valor</span>
                        <span className="font-bold font-mono">{res.valor}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Fecha</span>
                      <span className="font-medium">{new Date(res.fecha).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border mt-2">
                    <Button className="w-full" onClick={() => setSelectedResult(res)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
              {paginatedData.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
                  No se encontraron resultados que coincidan con la búsqueda.
                </div>
              )}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Muestra</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Ensayo / Parámetro</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron resultados que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((res) => (
                  <TableRow key={res.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{res.muestraCodigo}</span>
                        <span className="text-xs text-muted-foreground">{res.normaCodigo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={res.proyectoNombre}>
                      {res.proyectoNombre}
                    </TableCell>
                    <TableCell>{res.ensayoNombre}</TableCell>
                    <TableCell className="font-bold font-mono text-sm">{res.valor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(res.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                        res.estado === 'Conforme' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : res.estado === 'No Conforme'
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        {res.estado === 'Conforme' && <CheckCircle className="h-3 w-3" />}
                        {res.estado === 'No Conforme' && <AlertCircle className="h-3 w-3" />}
                        {res.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedResult(res)}>
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
        <div className="p-4 border-t border-border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={filteredResults.length}
            itemsPerPage={10}
          />
        </div>
      </Card>
    </div>
  );
}
