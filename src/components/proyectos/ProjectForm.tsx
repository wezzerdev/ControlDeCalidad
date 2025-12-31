import React, { useState, useEffect } from 'react';
import { Proyecto, Norma, UserRole } from '../../data/mockData';
import { useCompany } from '../../context/CompanyContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Save, ArrowLeft, Check, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { cn } from '../../lib/utils';
import { MobileFormActions } from '../common/MobileFormActions';
import { useToast } from '../../context/ToastContext';

interface ProjectFormProps {
  initialData?: Proyecto | null;
  normas: Norma[];
  onSave: (proyecto: Proyecto) => void;
  onCancel: () => void;
}

export function ProjectForm({ initialData, normas, onSave, onCancel }: ProjectFormProps) {
  const { addToast } = useToast();
  const { users } = useCompany();
  const [formData, setFormData] = useState<Partial<Proyecto>>({
    nombre: '',
    cliente: '',
    descripcion: '',
    direccion: '',
    estado: 'activo',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    normasAsignadas: [],
    usuarios: [],
    proveedores: []
  });

  const [newProvider, setNewProvider] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fechaInicio: initialData.fechaInicio.split('T')[0],
        fechaFin: initialData.fechaFin.split('T')[0],
        proveedores: initialData.proveedores || []
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addProvider = () => {
    if (newProvider.trim()) {
      setFormData(prev => ({
        ...prev,
        proveedores: [...(prev.proveedores || []), newProvider.trim()]
      }));
      setNewProvider('');
    }
  };

  const removeProvider = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proveedores: (prev.proveedores || []).filter((_, i) => i !== index)
    }));
  };

  const toggleNorma = (normaId: string) => {
    setFormData(prev => {
      const current = prev.normasAsignadas || [];
      if (current.includes(normaId)) {
        return { ...prev, normasAsignadas: current.filter(id => id !== normaId) };
      } else {
        return { ...prev, normasAsignadas: [...current, normaId] };
      }
    });
  };

  const toggleUser = (userId: string, role: UserRole) => {
    setFormData(prev => {
      const current = prev.usuarios || [];
      const exists = current.find(u => u.userId === userId);
      
      if (exists) {
        return { ...prev, usuarios: current.filter(u => u.userId !== userId) };
      } else {
        return { ...prev, usuarios: [...current, { userId, rol: role }] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proyectoToSave: Proyecto = {
      id: initialData?.id || uuidv4(),
      nombre: formData.nombre || '',
      cliente: formData.cliente || '',
      descripcion: formData.descripcion || '',
      direccion: formData.direccion || '',
      estado: (formData.estado as 'activo' | 'completado' | 'pausado') || 'activo',
      fechaInicio: formData.fechaInicio || '',
      fechaFin: formData.fechaFin || '',
      normasAsignadas: formData.normasAsignadas || [],
      usuarios: formData.usuarios || [],
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    onSave(proyectoToSave);
    addToast(initialData ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente', 'success');
    onCancel();
  };

  const filteredNormas = normas.filter(norma => 
    norma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    norma.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {initialData ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </h2>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Mobile Floating Action Bar */}
      <MobileFormActions onCancel={onCancel} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 md:pb-0">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Proyecto"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <Input
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Fecha Inicio"
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Fecha Fin"
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  required
                />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>
              
              {/* Proveedores Section */}
              <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-sm font-medium text-foreground">Proveedores Autorizados</label>
                <div className="flex gap-2">
                  <Input 
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    placeholder="Agregar proveedor..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProvider())}
                  />
                  <Button type="button" onClick={addProvider} variant="secondary">Agregar</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.proveedores?.map((prov, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm">
                      <span>{prov}</span>
                      <button 
                        type="button" 
                        onClick={() => removeProvider(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!formData.proveedores || formData.proveedores.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">No hay proveedores asignados.</p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div>
                  <CardTitle>Normas Aplicables</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecciona las normas que se utilizarán en este proyecto.
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar norma por código o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredNormas.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No se encontraron normas que coincidan con "{searchTerm}"
                  </div>
                ) : (
                  filteredNormas.map(norma => (
                  <div 
                    key={norma.id}
                    className={cn(
                      "flex items-start p-3 rounded-lg border cursor-pointer transition-colors hover:shadow-sm",
                      formData.normasAsignadas?.includes(norma.id)
                        ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => toggleNorma(norma.id)}
                  >
                    <div className={cn(
                      "flex h-5 w-5 min-w-[1.25rem] items-center justify-center rounded border mr-3 mt-0.5 transition-colors",
                      formData.normasAsignadas?.includes(norma.id)
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-input"
                    )}>
                      {formData.normasAsignadas?.includes(norma.id) && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold text-sm",
                        formData.normasAsignadas?.includes(norma.id) ? "text-green-700 dark:text-green-400" : "text-foreground"
                      )}>{norma.codigo}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2" title={norma.nombre}>
                        {norma.nombre}
                      </p>
                    </div>
                  </div>
                ))
              )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipo Asignado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {users.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center py-4">
                   No hay usuarios registrados en el equipo. Ve a "Mi Cuenta &gt; Equipo" para agregar miembros.
                 </p>
              ) : (
                users.map(user => {
                  const isAssigned = formData.usuarios?.some(u => u.userId === user.id);
                  return (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mr-3 overflow-hidden">
                          {user.avatar ? (
                             <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                             user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant={isAssigned ? "primary" : "outline"}
                        size="sm"
                        onClick={() => toggleUser(user.id, user.role)}
                      >
                        {isAssigned ? "Asignado" : "Asignar"}
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
