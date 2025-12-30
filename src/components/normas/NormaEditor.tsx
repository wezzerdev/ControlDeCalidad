import React, { useState, useEffect } from 'react';
import { Norma, NormaField, SampleTypeCategory } from '../../data/mockData';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { useToast } from '../../context/ToastContext';

interface NormaEditorProps {
  initialData?: Norma | null;
  onSave: (norma: Norma) => void;
  onCancel: () => void;
}

export function NormaEditor({ initialData, onSave, onCancel }: NormaEditorProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<Norma>>({
    codigo: '',
    nombre: '',
    tipo: 'NMX',
    descripcion: '',
    activa: true,
    campos: [],
    tiposMuestraCompatibles: []
  });

  const [campos, setCampos] = useState<NormaField[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setCampos(initialData.campos || []);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addField = () => {
    const newField: NormaField = {
      id: uuidv4(),
      nombre: '',
      tipo: 'number',
      esRequerido: true,
      unidad: ''
    };
    setCampos([...campos, newField]);
  };

  const removeField = (id: string) => {
    setCampos(campos.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<NormaField>) => {
    setCampos(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normaToSave: Norma = {
      id: initialData?.id || uuidv4(),
      codigo: formData.codigo || '',
      nombre: formData.nombre || '',
      tipo: formData.tipo as 'NMX' | 'ACI' | 'ASTM' | 'Local' | 'Privada',
      descripcion: formData.descripcion || '',
      activa: formData.activa ?? true,
      creadaPor: initialData?.creadaPor || 'current_user', // Mock user
      createdAt: initialData?.createdAt || new Date().toISOString(),
      campos: campos,
      tiposMuestraCompatibles: formData.tiposMuestraCompatibles || []
    };
    onSave(normaToSave);
    addToast(initialData ? 'Norma actualizada correctamente' : 'Norma creada correctamente', 'success');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {initialData ? 'Editar Norma' : 'Nueva Norma'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Código"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="ej. NMX-C-414"
                required
              />
              <Input
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre descriptivo de la norma"
                required
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="NMX">NMX (Mexicana)</option>
                  <option value="ACI">ACI (Americana)</option>
                  <option value="ASTM">ASTM (Estándar)</option>
                  <option value="Local">Local</option>
                  <option value="Privada">Privada</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Tipos de Muestra Compatibles</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Concreto', 'Suelo', 'Acero', 'Agregados', 'Asfalto', 'Otro'].map((type) => (
                    <label key={type} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.tiposMuestraCompatibles?.includes(type as SampleTypeCategory)}
                        onChange={(e) => {
                          const current = formData.tiposMuestraCompatibles || [];
                          const updated = e.target.checked
                            ? [...current, type as SampleTypeCategory]
                            : current.filter(t => t !== type);
                          setFormData(prev => ({ ...prev, tiposMuestraCompatibles: updated }));
                        }}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campos Dinámicos</CardTitle>
              <Button type="button" onClick={addField} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Campo
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {campos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  No hay campos definidos. Agrega campos para configurar los parámetros de ensayo de esta norma.
                </div>
              ) : (
                campos.map((campo) => (
                  <div key={campo.id} className="p-4 border border-border rounded-lg bg-card/50 space-y-4 relative group">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeField(campo.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                      <Input
                        label="Nombre del Campo"
                        value={campo.nombre}
                        onChange={(e) => updateField(campo.id, { nombre: e.target.value })}
                        placeholder="ej. Resistencia Compresión"
                        required
                      />
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground">Tipo de Dato</label>
                        <select
                          value={campo.tipo}
                          onChange={(e) => updateField(campo.id, { tipo: e.target.value as 'number' | 'text' | 'boolean' | 'select' })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="number">Numérico</option>
                          <option value="text">Texto</option>
                          <option value="boolean">Si/No</option>
                          <option value="select">Lista de Opciones</option>
                        </select>
                      </div>
                    </div>

                    {campo.tipo === 'number' && (
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label="Unidad"
                          value={campo.unidad || ''}
                          onChange={(e) => updateField(campo.id, { unidad: e.target.value })}
                          placeholder="ej. kg/cm²"
                        />
                        <Input
                          label="Mínimo"
                          type="number"
                          value={campo.limiteMin || ''}
                          onChange={(e) => updateField(campo.id, { limiteMin: parseFloat(e.target.value) })}
                          placeholder="Opcional"
                        />
                        <Input
                          label="Máximo"
                          type="number"
                          value={campo.limiteMax || ''}
                          onChange={(e) => updateField(campo.id, { limiteMax: parseFloat(e.target.value) })}
                          placeholder="Opcional"
                        />
                      </div>
                    )}

                    {campo.tipo === 'select' && (
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          label="Opciones (separadas por comas)"
                          value={campo.opciones?.join(', ') || ''}
                          onChange={(e) => updateField(campo.id, { opciones: e.target.value.split(',').map(s => s.trim()) })}
                          placeholder="ej. Opción 1, Opción 2"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
