import React from 'react';
import { Muestra, Proyecto, Norma } from '../../data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/Table';
import { Button } from '../common/Button';
import { Beaker, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EnsayoListProps {
  muestras: Muestra[];
  proyectos: Proyecto[];
  normas: Norma[];
  onSelect: (muestra: Muestra) => void;
  viewMode?: 'list' | 'grid';
}

export function EnsayoList({ muestras, proyectos, normas, onSelect, viewMode = 'list' }: EnsayoListProps) {
  const getProjectName = (id: string) => proyectos.find(p => p.id === id)?.nombre || 'Desconocido';
  const getNormaCode = (id: string) => normas.find(n => n.id === id)?.codigo || 'N/A';

  // Filter for samples that are ready for testing or in progress
  const activeMuestras = muestras.filter(m => m.estado === 'pendiente' || m.estado === 'en_proceso');

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeMuestras.map((muestra) => (
          <div key={muestra.id} className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{muestra.codigo}</h3>
                <p className="text-sm text-muted-foreground">{getProjectName(muestra.proyectoId)}</p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                muestra.estado === 'pendiente' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                muestra.estado === 'en_proceso' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              )}>
                {muestra.estado.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Norma</span>
                <span className="font-medium">{getNormaCode(muestra.normaId)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Material</span>
                <span className="font-medium">{muestra.tipoMaterial}</span>
              </div>
            </div>

            <div className="pt-2">
              <Button className="w-full" onClick={() => onSelect(muestra)}>
                {muestra.estado === 'pendiente' ? (
                  <>
                    <Beaker className="mr-2 h-4 w-4" />
                    Iniciar Ensayo
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continuar
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
        {activeMuestras.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
            No hay muestras pendientes de ensayo.
          </div>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código Muestra</TableHead>
          <TableHead>Proyecto</TableHead>
          <TableHead>Norma</TableHead>
          <TableHead>Material</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activeMuestras.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
              No hay muestras pendientes de ensayo.
            </TableCell>
          </TableRow>
        ) : (
          activeMuestras.map((muestra) => (
            <TableRow key={muestra.id}>
              <TableCell className="font-medium">{muestra.codigo}</TableCell>
              <TableCell>{getProjectName(muestra.proyectoId)}</TableCell>
              <TableCell>{getNormaCode(muestra.normaId)}</TableCell>
              <TableCell>{muestra.tipoMaterial}</TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  muestra.estado === 'pendiente' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                  muestra.estado === 'en_proceso' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                )}>
                  {muestra.estado.replace('_', ' ').toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => onSelect(muestra)}>
                  {muestra.estado === 'pendiente' ? (
                    <>
                      <Beaker className="mr-2 h-4 w-4" />
                      Iniciar Ensayo
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Continuar
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
