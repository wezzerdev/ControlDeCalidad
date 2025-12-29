import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Plus, Package, Wrench, FlaskConical, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import { InventoryItem } from '../data/mockData';

export default function Inventarios() {
  const { inventory, proyectos, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const initialFormState: Omit<InventoryItem, 'id'> = {
    nombre: '',
    tipo: 'Material',
    estado: 'Disponible',
    ubicacion: '',
    proyectoId: '',
    cantidad: 0,
    unidad: '',
    ultimoMantenimiento: '',
    minimoStock: 0
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      tipo: item.tipo,
      estado: item.estado,
      ubicacion: item.ubicacion,
      proyectoId: item.proyectoId || '',
      cantidad: item.cantidad,
      unidad: item.unidad,
      ultimoMantenimiento: item.ultimoMantenimiento || '',
      minimoStock: item.minimoStock || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este ítem?')) {
      deleteInventoryItem(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateInventoryItem(editingItem.id, formData);
    } else {
      addInventoryItem(formData);
    }
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormState);
  };

  const getProjectName = (id?: string) => {
    if (!id) return '';
    return proyectos.find(p => p.id === id)?.nombre || '';
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getProjectName(item.proyectoId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.tipo === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Inventarios</h1>
          <p className="text-muted-foreground mt-2">Control de equipos, materiales y reactivos.</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setFormData(initialFormState); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ítem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Equipos</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{inventory.filter(i => i.tipo === 'Equipo').length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <Wrench className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reactivos</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{inventory.filter(i => i.tipo === 'Reactivo').length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
              <FlaskConical className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Materiales</p>
              <p className="text-3xl font-bold mt-2 text-foreground">{inventory.filter(i => i.tipo === 'Material').length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
              <Package className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, ubicación o proyecto..."
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
              <option value="Equipo">Equipos</option>
              <option value="Reactivo">Reactivos</option>
              <option value="Material">Materiales</option>
            </select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario General</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación / Proyecto</TableHead>
                <TableHead>Stock / Info</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nombre}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.estado === 'Operativo' || item.estado === 'Disponible' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : item.estado === 'Mantenimiento' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.proyectoId ? (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Package className="h-3 w-3" />
                        {getProjectName(item.proyectoId)}
                      </span>
                    ) : (
                      item.ubicacion
                    )}
                  </TableCell>
                  <TableCell>
                    {item.tipo === 'Equipo' 
                      ? `Mant: ${item.ultimoMantenimiento}` 
                      : `${item.cantidad} ${item.unidad}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Ítem' : 'Nuevo Ítem de Inventario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}
              >
                <option value="Equipo">Equipo</option>
                <option value="Reactivo">Reactivo</option>
                <option value="Material">Material</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
              >
                <option value="Operativo">Operativo</option>
                <option value="Disponible">Disponible</option>
                <option value="En Uso">En Uso</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Agotado">Agotado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cantidad</label>
              <Input 
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unidad</label>
              <Input 
                value={formData.unidad}
                onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                placeholder="pza, kg, lt..."
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Ubicación / Proyecto</label>
            <div className="space-y-2">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.proyectoId}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData, 
                    proyectoId: val,
                    ubicacion: val ? 'En Obra' : formData.ubicacion // Auto-set location name if project selected
                  });
                }}
              >
                <option value="">-- Sin asignar a proyecto (Ubicación Manual) --</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              
              {!formData.proyectoId && (
                <Input 
                  placeholder="Especifique ubicación (ej. Almacén Central)"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  required={!formData.proyectoId}
                />
              )}
            </div>
          </div>

          {formData.tipo === 'Equipo' && (
             <div>
             <label className="text-sm font-medium">Último Mantenimiento</label>
             <Input 
               type="date"
               value={formData.ultimoMantenimiento}
               onChange={(e) => setFormData({...formData, ultimoMantenimiento: e.target.value})}
             />
           </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
