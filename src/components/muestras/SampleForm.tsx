import React, { useState, useEffect, useMemo } from 'react';
import { Muestra, Proyecto, Norma, SampleTypeCategory } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Save, ArrowLeft, QrCode as QrIcon, MapPin, Navigation, Info, FileText, Search, BookOpen, CheckCircle, Lightbulb } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  // Create options for "Tipo de Muestra" based on Project's assigned norms
  // Format: "Category - Norm Name"
  const availableTestTypes = useMemo(() => {
    if (!formData.proyectoId) return [];
    
    const project = proyectos.find(p => p.id === formData.proyectoId);
    if (!project || !project.normasAsignadas || project.normasAsignadas.length === 0) {
      return [];
    }

    const projectNorms = normas.filter(n => project.normasAsignadas.includes(n.id));
    const options: { id: string, label: string, category: SampleTypeCategory, normId: string }[] = [];

    projectNorms.forEach(n => {
        // Clean up norm name by removing common prefixes to make it shorter
        const cleanName = n.nombre
          .replace(/^(NMX-[A-Z]-\d+-ONNCCE|ASTM [A-Z]\d+|ACI \d+) - /, '') // Remove code prefix if duplicated in name
          .replace(/^Industria de la construcción - /, '')
          .replace(/^Concreto - /, '')
          .replace(/^Cementos hidráulicos - /, '')
          .trim();

        const code = n.codigo.split(' ')[0]; // Keep short code
        
        // If norm has compatible types, create an option for each
        if (n.tiposMuestraCompatibles && n.tiposMuestraCompatibles.length > 0) {
            n.tiposMuestraCompatibles.forEach(cat => {
                options.push({
                    id: `${n.id}-${cat}`, // Unique key
                    label: cleanName,
                    category: cat,
                    normId: n.id
                });
            });
        } else {
             // Fallback if no types defined
             options.push({
                id: n.id,
                label: cleanName,
                category: 'Otro' as SampleTypeCategory,
                normId: n.id
            });
        }
    });
    
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [formData.proyectoId, proyectos, normas]);

  // Filter options based on search term
  const filteredTestTypes = useMemo(() => {
    if (!searchTerm) return availableTestTypes;
    return availableTestTypes.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableTestTypes, searchTerm]);

  // Handle specific test selection
  const handleTestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptionId = e.target.value;
      if (!selectedOptionId) {
          setSelectedCategory('');
          setFormData(prev => ({ ...prev, normaId: '' }));
          return;
      }

      const selectedOption = availableTestTypes.find(opt => opt.id === selectedOptionId);
      if (selectedOption) {
          setSelectedCategory(selectedOption.category);
          setFormData(prev => ({ 
              ...prev, 
              normaId: selectedOption.normId,
              // Auto-fill material description if empty
              tipoMaterial: !prev.tipoMaterial ? selectedOption.category : prev.tipoMaterial 
          }));
      }
  };

  // Keep compatibility with manual category selection if needed, but primary is now TestType
  // We can derive "selectedTestType" value from current category + normId
  const currentTestTypeValue = useMemo(() => {
      if (formData.normaId && selectedCategory) {
          const match = availableTestTypes.find(opt => opt.normId === formData.normaId && opt.category === selectedCategory);
          return match ? match.id : '';
      }
      return '';
  }, [formData.normaId, selectedCategory, availableTestTypes]);

  // Update available norms based on Project AND Selected Category (Step 3 logic remains for verification)
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
        // If a norm has no specific compatible types defined (empty), we assume it's available for selection (fallback)
        const filtered = normas.filter(n => 
          project.normasAsignadas.includes(n.id) && 
          (!n.tiposMuestraCompatibles || n.tiposMuestraCompatibles.length === 0 || n.tiposMuestraCompatibles.includes(selectedCategory as SampleTypeCategory))
        );
        setAvailableNormas(filtered);
        
        // Auto-select logic: If norms are available and current selection is invalid, select the first one.
        if (filtered.length > 0) {
             const currentIsValid = formData.normaId && filtered.find(n => n.id === formData.normaId);
             if (!currentIsValid) {
                 setFormData(prev => ({ ...prev, normaId: filtered[0].id }));
             }
        } else {
             if (formData.normaId) {
                setFormData(prev => ({ ...prev, normaId: '' }));
             }
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
                      <label className="text-sm font-medium">2. Ensayo / Tipo de Muestra</label>
                      <div className="relative">
                        {availableTestTypes.length > 5 && (
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        {availableTestTypes.length > 5 ? (
                          <>
                             {/* Searchable Custom Select could be complex, for now we keep simple select but add a filter input above if many items */}
                             {/* Or better, just a searchable dropdown. Let's use a simple approach first: Input filter + Select */}
                             <Input 
                               placeholder="Buscar ensayo..." 
                               value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                               className="mb-2 pl-9"
                             />
                             <select
                               value={currentTestTypeValue}
                               onChange={handleTestTypeChange}
                               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                               required
                               disabled={!formData.proyectoId}
                               size={5} // Show multiple items to make it easier to pick from filtered list
                             >
                               {filteredTestTypes.length === 0 && <option value="" disabled>No se encontraron resultados</option>}
                               {filteredTestTypes.map(opt => (
                                 <option key={opt.id} value={opt.id} className="py-1">{opt.label}</option>
                               ))}
                             </select>
                             <p className="text-xs text-muted-foreground mt-1">
                               {filteredTestTypes.length} ensayos encontrados. Haga clic para seleccionar.
                             </p>
                          </>
                        ) : (
                          <select
                            value={currentTestTypeValue}
                            onChange={handleTestTypeChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                            disabled={!formData.proyectoId}
                          >
                            <option value="">Seleccione Ensayo</option>
                            {availableTestTypes.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </select>
                        )}
                      </div>
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
                        disabled={true} 
                      >
                        <option value="">
                          {!selectedCategory 
                            ? 'Seleccione primero el ensayo' 
                            : availableNormas.length === 0 
                              ? 'No hay normas compatibles asignadas al proyecto' 
                              : 'Norma Seleccionada'}
                        </option>
                        {/* We still render options so the selected value can be shown properly */}
                        {normas.map(n => (
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
              <div className="bg-white p-4 rounded-lg border border-border flex items-center justify-center relative">
                <QRCode 
                    value={initialData?.qrCode && initialData.qrCode !== 'pending' && !initialData.qrCode.startsWith('QR-') 
                        ? initialData.qrCode 
                        : 'https://constru-lab-saas.vercel.app'} 
                    size={128} 
                    className={!initialData?.id ? "opacity-20 blur-sm" : ""}
                />
                {!initialData?.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-center bg-background/80 p-1 rounded">
                            Se generará al guardar
                        </span>
                    </div>
                )}
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
          <div className="space-y-6">
             <div>
               <h4 className="font-semibold text-primary mb-2 flex items-center">
                   <Info className="w-4 h-4 mr-2" />
                   Descripción General
               </h4>
               <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md">
                   {selectedNormaDetails.descripcion}
               </p>
             </div>

             {selectedNormaDetails.tutorial && (
                 <div className="space-y-4">
                     <div>
                        <h4 className="font-semibold text-primary mb-2 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Guía Rápida de Muestreo
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                            <ul className="space-y-3">
                                {selectedNormaDetails.tutorial.pasos.map((paso, index) => (
                                    <li key={index} className="flex items-start text-sm">
                                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <span className="text-foreground/90">{paso}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                     </div>

                     {selectedNormaDetails.tutorial.tips && selectedNormaDetails.tutorial.tips.length > 0 && (
                         <div>
                             <h4 className="font-semibold text-primary mb-2 flex items-center text-sm">
                                 <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                                 Tips del Experto
                             </h4>
                             <ul className="space-y-2">
                                 {selectedNormaDetails.tutorial.tips.map((tip, index) => (
                                     <li key={index} className="flex items-start text-xs text-muted-foreground italic bg-yellow-50/50 dark:bg-yellow-900/10 p-2 rounded">
                                         <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                         {tip}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     )}
                 </div>
             )}
             
             <div>
               <h4 className="font-semibold text-primary mb-2 text-sm">Detalles Técnicos</h4>
               <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
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
             
             <div className="flex justify-end pt-2">
               <Button onClick={() => setShowNormaReview(false)}>Entendido, iniciar muestreo</Button>
             </div>
          </div>
        </Modal>
      )}
    </form>
  );
}
