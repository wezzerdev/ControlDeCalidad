import React from 'react';
import { Muestra, Proyecto, Norma } from '../../data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/Table';
import { Button } from '../common/Button';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CertificadoListProps {
  muestras: Muestra[];
  proyectos: Proyecto[];
  normas: Norma[];
  onView: (muestra: Muestra) => void;
  viewMode?: 'list' | 'grid';
}

export function CertificadoList({ muestras, proyectos, normas, onView, viewMode = 'list' }: CertificadoListProps) {
  const getProjectName = (id: string) => proyectos.find(p => p.id === id)?.nombre || 'Desconocido';
  const getNormaCode = (id: string) => normas.find(n => n.id === id)?.codigo || 'N/A';

  // Filter for samples that are completed (aprobado or rechazado)
  const completedMuestras = muestras.filter(m => m.estado === 'aprobado' || m.estado === 'rechazado');

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {completedMuestras.map((muestra) => (
          <div key={muestra.id} className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{muestra.codigo}</h3>
                <p className="text-sm text-muted-foreground">{getProjectName(muestra.proyectoId)}</p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                muestra.estado === 'aprobado' 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {muestra.estado === 'aprobado' && <CheckCircle2 className="h-3 w-3" />}
                {muestra.estado === 'rechazado' && <XCircle className="h-3 w-3" />}
                {muestra.estado.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Norma</span>
                <span className="font-medium">{getNormaCode(muestra.normaId)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Fecha Ensayo</span>
                <span className="font-medium">
                  {muestra.fechaEnsayo ? new Date(muestra.fechaEnsayo).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button className="w-full" onClick={() => onView(muestra)}>
                <FileText className="mr-2 h-4 w-4" />
                Ver Certificado
              </Button>
            </div>
          </div>
        ))}
        {completedMuestras.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
            No hay certificados disponibles.
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
          <TableHead>Fecha Ensayo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {completedMuestras.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
              No hay certificados disponibles.
            </TableCell>
          </TableRow>
        ) : (
          completedMuestras.map((muestra) => (
            <TableRow key={muestra.id}>
              <TableCell className="font-medium">{muestra.codigo}</TableCell>
              <TableCell>{getProjectName(muestra.proyectoId)}</TableCell>
              <TableCell>{getNormaCode(muestra.normaId)}</TableCell>
              <TableCell>
                {muestra.fechaEnsayo ? new Date(muestra.fechaEnsayo).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                  muestra.estado === 'aprobado' 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {muestra.estado === 'aprobado' && <CheckCircle2 className="h-3 w-3" />}
                  {muestra.estado === 'rechazado' && <XCircle className="h-3 w-3" />}
                  {muestra.estado.toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onView(muestra)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Certificado
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
