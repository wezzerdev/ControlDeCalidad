import React, { useState, useEffect } from 'react';
import { Muestra, Proyecto, Norma, SampleTypeCategory } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Save, ArrowLeft, QrCode as QrIcon, MapPin, Navigation, Info, FileText } from 'lucide-react';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal'; 

interface SampleFormProps {
  initialData?: Muestra | null;
  proyectos: Proyecto[];
  normas: Norma[];
  onSave: (muestra: Muestra) => void;
  onCancel: () => void;
}

const SAMPLE_CATEGORIES: SampleTypeCategory[] = ['Concreto', 'Suelo', 'Acero', 'Agregados', 'Asfalto', 'Otro'];

export function SampleForm({ initialData, proyectos, normas, onSave, onCancel }: SampleFormProps) {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Muestra>>({
    proyectoId: '',
    normaId: '',
    tipoMaterial: '',
    fechaRecepcion: new Date().toISOString().split('T')[0],
    fechaTermino: '',
    ubicacion: '',
    proveedor: '',
    estado: 'pendiente',
    qrCode: `QR-${Date.now()}`
  });

  const [selectedCategory, setSelectedCategory] = useState<SampleTypeCategory | ''>('');
  const [availableNormas, setAvailableNormas] = useState<Norma[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('');
  const [showNormaReview, setShowNormaReview] = useState(false);
  const [selectedNormaDetails, setSelectedNormaDetails] = useState<Norma | null>(null);

  useEffect(() => {
    if (initialData) {
      let location = initialData.ubicacion;
      let gps = '';
      if (location.includes('[GPS:')) {
        const parts = location.split('[GPS:');
        location = parts[0].trim();
        gps = parts[1].replace(']', '').trim();
      }

      setFormData({
        ...initialData,
        fechaRecepcion: initialData.fechaRecepcion.split('T')[0],
        fechaTermino: initialData.fechaTermino ? initialData.fechaTermino.split('T')[0] : '',
        ubicacion: location
      });
      setGpsLocation(gps);

      // Try to infer category from existing material or norma
      if (initialData.normaId) {
        const norma = normas.find(n => n.id === initialData.normaId);
        if (norma && norma.tiposMuestraCompatibles && norma.tiposMuestraCompatibles.length > 0) {
           setSelectedCategory(norma.tiposMuestraCompatibles[0]);
        }
      }
    }
  }, [initialData, normas]);

  // Update available norms based on Project AND Selected Category
  useEffect(() => {
    if (formData.proyectoId && selectedCategory) {
      const project = proyectos.find(p => p.id === formData.proyectoId);
      if (project) {
        // Filter norms assigned to project AND compatible with selected category
        const filtered = normas.filter(n => 
          project.normasAsignadas.includes(n.id) && 
          n.tiposMuestraCompatibles?.includes(selectedCategory as SampleTypeCategory)
        );
        setAvailableNormas(filtered);
        
        // Reset selected norma if it's no longer valid
        if (formData.normaId && !filtered.find(n => n.id === formData.normaId)) {
          setFormData(prev => ({ ...prev, normaId: '' }));
        }
      } else {
        setAvailableNormas([]);
      }
    } else {
      setAvailableNormas([]);
    }
  }, [formData.proyectoId, selectedCategory, normas, proyectos]);

  // Update selected norma details for review
  useEffect(() => {
    if (formData.normaId) {
      const norma = normas.find(n => n.id === formData.normaId);
      setSelectedNormaDetails(norma || null);
    } else {
      setSelectedNormaDetails(null);
    }
  }, [formData.normaId, normas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as SampleTypeCategory);
    // Auto-fill material type text if empty
    if (!formData.tipoMaterial) {
      setFormData(prev => ({ ...prev, tipoMaterial: e.target.value }));
    }
  };

  const handleGetLocation = () => {
    setGeoLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsLocation(`Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}`);
          setGeoLoading(false);
          addToast('Ubicación GPS capturada correctamente', 'success');
        },
        (error) => {
          console.error("Error getting location:", error);
          setGeoLoading(false);
          addToast('No se pudo obtener la ubicación. Verifique permisos.', 'error');
        }
      );
    } else {
      setGeoLoading(false);
      addToast('Geolocalización no soportada en este navegador.', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      addToast('Por favor seleccione una categoría de muestra', 'error');
      return;
    }

    const finalLocation = gpsLocation 
        ? `${formData.ubicacion} [GPS: ${gpsLocation}]`
        : formData.ubicacion;

    const muestraToSave: Muestra = {
      id: initialData?.id || uuidv4(),
      codigo: initialData?.codigo || '', 
      proyectoId: formData.proyectoId || null as any, 
      normaId: formData.normaId || null as any,
      tipoMaterial: formData.tipoMaterial || '', 
      fechaRecepcion: formData.fechaRecepcion || '',
      fechaTermino: formData.fechaTermino || undefined,
      ubicacion: finalLocation || '',
      proveedor: formData.proveedor || '',
      qrCode: formData.qrCode || '',
      estado: (formData.estado as 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado') || 'pendiente',
      tecnicoId: user?.id || '',
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    onSave(muestraToSave);
    addToast(initialData ? 'Muestra actualizada correctamente' : 'Muestra registrada y orden de trabajo generada', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {initialData ? 'Editar Muestra' : 'Nueva Muestra Estructurada'}
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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Muestra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hierarchical Selection */}
              <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
                 <h3 className="text-sm font-semibold flex items-center">
                   <Navigation className="w-4 h-4 mr-2" />
                   Selección de Normativa
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">1. Proyecto</label>
                      <select
                        name="proyectoId"
                        value={formData.proyectoId}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Seleccione Proyecto</option>
                        {proyectos.filter(p => p.estado === 'activo').map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">2. Tipo de Muestra</label>
                      <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                        disabled={!formData.proyectoId}
                      >
                        <option value="">Seleccione Tipo</option>
                        {SAMPLE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>3. Norma Aplicable</span>
                        {selectedNormaDetails && (
                           <Button 
                             type="button" 
                             variant="ghost" 
                             size="sm" 
                             className="h-6 text-xs text-primary"
                             onClick={() => setShowNormaReview(true)}
                           >
                             <Info className="w-3 h-3 mr-1" />
                             Ver Reseña
                           </Button>
                        )}
                      </label>
                      <select
                        name="normaId"
                        value={formData.normaId}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                        disabled={!selectedCategory}
                      >
                        <option value="">
                          {!selectedCategory 
                            ? 'Seleccione primero el tipo de muestra' 
                            : availableNormas.length === 0 
                              ? 'No hay normas compatibles asignadas al proyecto' 
                              : 'Seleccione Norma'}
                        </option>
                        {availableNormas.map(n => (
                          <option key={n.id} value={n.id}>{n.codigo} - {n.nombre}</option>
                        ))}
                      </select>
                    </div>
                 </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción del Material</label>
                  <Input
                    name="tipoMaterial"
                    value={formData.tipoMaterial}
                    onChange={handleChange}
                    placeholder="Ej. Concreto f'c=250"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-medium">Proveedor</label>
                   <Input
                      name="proveedor"
                      value={formData.proveedor}
                      onChange={handleChange}
                      placeholder="Proveedor"
                    />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Ubicación</label>
                  <Input
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ubicación física en obra"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between">
                    <span>GPS</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={handleGetLocation}
                      disabled={geoLoading}
                    >
                      {geoLoading ? '...' : <MapPin className="w-3 h-3" />}
                    </Button>
                  </label>
                  <Input
                    value={gpsLocation}
                    placeholder="Coordenadas"
                    readOnly
                    className="opacity-80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                   label="Fecha de Recepción"
                   type="date"
                   name="fechaRecepcion"
                   value={formData.fechaRecepcion}
                   onChange={handleChange}
                   required
                 />
                 <Input
                   label="Fecha de Termino"
                   type="date"
                   name="fechaTermino"
                   value={formData.fechaTermino}
                   onChange={handleChange}
                 />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border border-border flex items-center justify-center">
                <QRCode value={formData.qrCode || 'pending'} size={128} />
              </div>
              
              <div className="w-full text-sm space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="font-medium">{selectedCategory || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Norma:</span>
                  <span className="font-medium text-right max-w-[150px] truncate">
                    {availableNormas.find(n => n.id === formData.normaId)?.codigo || '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      {showNormaReview && selectedNormaDetails && (
        <Modal 
          isOpen={showNormaReview} 
          onClose={() => setShowNormaReview(false)}
          title={`Reseña: ${selectedNormaDetails.codigo}`}
        >
          <div className="space-y-4">
             <div>
               <h4 className="font-semibold text-primary mb-1">Descripción</h4>
               <p className="text-sm text-foreground">{selectedNormaDetails.descripcion}</p>
             </div>
             
             <div>
               <h4 className="font-semibold text-primary mb-1">Detalles Técnicos</h4>
               <ul className="text-sm space-y-1 list-disc list-inside">
                 <li>Tipo: {selectedNormaDetails.tipo}</li>
                 <li>Compatibilidad: {selectedNormaDetails.tiposMuestraCompatibles?.join(', ')}</li>
                 <li>Campos Requeridos: {selectedNormaDetails.campos.length}</li>
               </ul>
             </div>

             <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
               <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start">
                 <FileText className="w-4 h-4 mr-2 mt-0.5" />
                 Asegúrese de contar con todo el equipo necesario antes de iniciar el muestreo conforme a esta norma.
               </p>
             </div>
             
             <div className="flex justify-end pt-4">
               <Button onClick={() => setShowNormaReview(false)}>Entendido</Button>
             </div>
          </div>
        </Modal>
      )}
    </form>
  );
}
