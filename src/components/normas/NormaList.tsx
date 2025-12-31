import React from 'react';
import { Norma } from '../../data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/Table';
import { Button } from '../common/Button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface NormaListProps {
  normas: Norma[];
  onEdit: (norma: Norma) => void;
  onDelete: (id: string) => void;
  onView: (norma: Norma) => void;
  viewMode?: 'list' | 'grid';
}

export function NormaList({ normas, onEdit, onDelete, onView, viewMode = 'list' }: NormaListProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {normas.map((norma) => (
          <div key={norma.id} className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2" title={norma.nombre}>{norma.codigo}</h3>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium mt-1 inline-block",
                  norma.tipo === 'NMX' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                  norma.tipo === 'ACI' && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                  norma.tipo === 'ASTM' && "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
                  (norma.tipo === 'Local' || norma.tipo === 'Privada') && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {norma.tipo}
                </span>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                norma.activa 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", norma.activa ? "bg-green-600" : "bg-red-600")} />
                {norma.activa ? 'ACTIVA' : 'INACTIVA'}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2" title={norma.nombre}>
              {norma.nombre}
            </p>

            <div className="text-xs text-muted-foreground">
              {norma.campos.length} campos configurados
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2">
              <Button variant="ghost" size="sm" onClick={() => onView(norma)} title="Ver detalles">
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(norma)} title="Editar">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(norma.id)} className="text-destructive hover:text-destructive" title="Eliminar">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {normas.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
            No hay normas registradas.
          </div>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Campos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {normas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
              No hay normas registradas.
            </TableCell>
          </TableRow>
        ) : (
          normas.map((norma) => (
            <TableRow key={norma.id}>
              <TableCell className="font-medium">{norma.codigo}</TableCell>
              <TableCell>{norma.nombre}</TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  norma.tipo === 'NMX' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                  norma.tipo === 'ACI' && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                  norma.tipo === 'ASTM' && "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
                  (norma.tipo === 'Local' || norma.tipo === 'Privada') && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {norma.tipo}
                </span>
              </TableCell>
              <TableCell>{norma.campos.length} campos</TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                  norma.activa 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", norma.activa ? "bg-green-600" : "bg-red-600")} />
                  {norma.activa ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onView(norma)} title="Ver detalles">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
