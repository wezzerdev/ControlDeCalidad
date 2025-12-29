import React, { useState } from 'react';
import { Proyecto, Norma, InventoryItem, mockUsers, User } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/Table';
import { Edit, Trash2, Calendar, MapPin, Users, FileText, Package, Wrench, FlaskConical, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Modal } from '../common/Modal';

export interface ProjectListProps {
  proyectos: Proyecto[];
  normas: Norma[]; // Passed to display norm names
  inventory?: InventoryItem[]; // Optional inventory items to display assigned
  onEdit: (proyecto: Proyecto) => void;
  onDelete: (id: string) => void;
  viewMode?: 'list' | 'grid';
}

export function ProjectList({ proyectos, normas, inventory = [], onEdit, onDelete, viewMode = 'list' }: ProjectListProps) {
  const [selectedProjectInventory, setSelectedProjectInventory] = useState<Proyecto | null>(null);
  const [selectedProjectTeam, setSelectedProjectTeam] = useState<Proyecto | null>(null);

  const getNormaNames = (ids: string[]) => {
    return ids.map(id => normas.find(n => n.id === id)?.codigo).filter(Boolean).join(', ');
  };

  const getProjectInventory = (projectId: string) => {
    return inventory.filter(item => item.proyectoId === projectId);
  };

  const getUserDetails = (userId: string): User | undefined => {
    return mockUsers.find(u => u.id === userId);
  };

  const ProjectTeamModal = () => {
    if (!selectedProjectTeam) return null;

    return (
      <Modal
        isOpen={!!selectedProjectTeam}
        onClose={() => setSelectedProjectTeam(null)}
        title={`Equipo Asignado - ${selectedProjectTeam.nombre}`}
        className="max-w-2xl"
      >
        <div className="space-y-4 py-2">
          {selectedProjectTeam.usuarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay usuarios asignados a este proyecto.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol en Proyecto</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProjectTeam.usuarios.map((assignment, idx) => {
                    const user = getUserDetails(assignment.userId);
                    return (
                      <TableRow key={`${assignment.userId}-${idx}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {user?.name.charAt(0)}
                              </div>
                            )}
                            {user?.name || 'Usuario Desconocido'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            assignment.rol === 'residente' && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                            assignment.rol === 'tecnico' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                            assignment.rol === 'gerente' && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                            assignment.rol === 'administrador' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {assignment.rol ? (assignment.rol.charAt(0).toUpperCase() + assignment.rol.slice(1)) : 'Sin Rol'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user?.email || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setSelectedProjectTeam(null)}>Cerrar</Button>
          </div>
        </div>
      </Modal>
    );
  };

  const ProjectInventoryModal = () => {
    if (!selectedProjectInventory) return null;
    
    const items = getProjectInventory(selectedProjectInventory.id);
    const equipos = items.filter(i => i.tipo === 'Equipo');
    const reactivos = items.filter(i => i.tipo === 'Reactivo');
    const materiales = items.filter(i => i.tipo === 'Material');

    return (
      <Modal
        isOpen={!!selectedProjectInventory}
        onClose={() => setSelectedProjectInventory(null)}
        title={`Inventario Asignado - ${selectedProjectInventory.nombre}`}
        className="max-w-3xl"
      >
        <div className="space-y-6 py-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay ítems de inventario asignados a este proyecto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-500" />
                    Equipos ({equipos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {equipos.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {equipos.map(i => (
                        <li key={i.id} className="truncate">{i.nombre}</li>
                      ))}
                    </ul>
                  ) : <span className="text-muted-foreground text-xs italic">Ninguno</span>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-green-500" />
                    Reactivos ({reactivos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {reactivos.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {reactivos.map(i => (
                        <li key={i.id} className="truncate">{i.nombre} ({i.cantidad} {i.unidad})</li>
                      ))}
                    </ul>
                  ) : <span className="text-muted-foreground text-xs italic">Ninguno</span>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    Materiales ({materiales.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {materiales.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {materiales.map(i => (
                        <li key={i.id} className="truncate">{i.nombre} ({i.cantidad} {i.unidad})</li>
                      ))}
                    </ul>
                  ) : <span className="text-muted-foreground text-xs italic">Ninguno</span>}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-4">
             <h4 className="font-medium mb-2 text-sm">Detalle Completo</h4>
             <div className="border rounded-md overflow-hidden">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="h-8">Nombre</TableHead>
                     <TableHead className="h-8">Tipo</TableHead>
                     <TableHead className="h-8">Cant.</TableHead>
                     <TableHead className="h-8">Estado</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {items.map(item => (
                     <TableRow key={item.id} className="h-10">
                       <TableCell className="py-1">{item.nombre}</TableCell>
                       <TableCell className="py-1">{item.tipo}</TableCell>
                       <TableCell className="py-1">{item.cantidad} {item.unidad}</TableCell>
                       <TableCell className="py-1">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-full text-[10px] font-medium border",
                            item.estado === 'Operativo' ? "bg-green-50 text-green-700 border-green-200" :
                            item.estado === 'En Uso' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                          )}>
                            {item.estado}
                          </span>
                       </TableCell>
                     </TableRow>
                   ))}
                   {items.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-4">
                         Sin asignaciones
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setSelectedProjectInventory(null)}>Cerrar</Button>
          </div>
        </div>
      </Modal>
    );
  };

  if (proyectos.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <h3 className="text-lg font-medium text-foreground">No hay proyectos</h3>
        <p className="text-muted-foreground mt-1">Comienza creando un nuevo proyecto.</p>
      </div>
    );
  }

  return (
    <>
      <ProjectInventoryModal />
      <ProjectTeamModal />
      
      {viewMode === 'list' ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre / Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Inventario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proyectos.map((proyecto) => {
                const assignedItems = getProjectInventory(proyecto.id).length;
                return (
                  <TableRow key={proyecto.id}>
                    <TableCell>
                      <div className="font-medium">{proyecto.nombre}</div>
                      <div className="text-sm text-muted-foreground">{proyecto.cliente}</div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium w-fit",
                        proyecto.estado === 'activo' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                        proyecto.estado === 'completado' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                        proyecto.estado === 'pausado' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      )}>
                        {proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="truncate max-w-[150px]" title={proyecto.direccion}>{proyecto.direccion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div>{new Date(proyecto.fechaInicio).toLocaleDateString()}</div>
                        <div className="text-xs">a {new Date(proyecto.fechaFin).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-7 text-xs gap-1", proyecto.usuarios.length > 0 ? "text-primary" : "text-muted-foreground")}
                        onClick={() => setSelectedProjectTeam(proyecto)}
                      >
                        <Users className="h-3 w-3" />
                        {proyecto.usuarios.length}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-7 text-xs gap-1", assignedItems > 0 ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")}
                        onClick={() => setSelectedProjectInventory(proyecto)}
                      >
                        <Package className="h-3 w-3" />
                        {assignedItems} ítems
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(proyecto)}>
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(proyecto.id)}>
                          <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proyectos.map((proyecto) => {
             const assignedItems = getProjectInventory(proyecto.id).length;
             return (
              <Card key={proyecto.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">{proyecto.nombre}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{proyecto.cliente}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    proyecto.estado === 'activo' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    proyecto.estado === 'completado' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    proyecto.estado === 'pausado' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}>
                    {proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{proyecto.descripcion}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {proyecto.direccion}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(proyecto.fechaInicio).toLocaleDateString()} - {new Date(proyecto.fechaFin).toLocaleDateString()}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => setSelectedProjectTeam(proyecto)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Equipo ({proyecto.usuarios.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => setSelectedProjectInventory(proyecto)}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Inventario ({assignedItems})
                      </Button>
                    </div>

                    <div className="flex items-start text-muted-foreground pt-1">
                      <FileText className="mr-2 h-4 w-4 mt-0.5" />
                      <span className="flex-1">
                        Normas: {proyecto.normasAsignadas.length > 0 ? getNormaNames(proyecto.normasAsignadas) : 'Ninguna'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => onEdit(proyecto)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(proyecto.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
