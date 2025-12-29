import React, { useState, useEffect } from 'react';
import { Muestra, Proyecto, Norma } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Save, ArrowLeft, QrCode as QrIcon, MapPin, Navigation } from 'lucide-react';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { useToast } from '../../context/ToastContext';

interface SampleFormProps {
  initialData?: Muestra | null;
  proyectos: Proyecto[];
  normas: Norma[];
  onSave: (muestra: Muestra) => void;
  onCancel: () => void;
}

// Mock material database for intelligent suggestions
const materialDatabase = {
  'Concreto': {
    types: ['Concreto Premezclado', 'Concreto Hecho en Obra', 'Mortero'],
    norms: ['norma_nmx_c414', 'norma_aci_318', 'norma_nmx_c155', 'norma_nmx_c161', 'norma_nmx_c083', 'norma_nmx_c156', 'norma_nmx_c109', 'norma_nmx_c077', 'norma_nmx_c164'],
    providers: ['Cemex', 'Holcim', 'Cruz Azul', 'Moctezuma']
  },
  'Suelo': {
    types: ['Tepetate', 'Base Hidráulica', 'Sub-base', 'Terraplén'],
    norms: ['norma_nmx_c416', 'norma_astm_d1883', 'norma_astm_d2216'],
    providers: ['Cantera Local', 'Materiales del Norte', 'Triturados del Valle']
  },
  'Acero': {
    types: ['Varilla Corrugada', 'Malla Electrosoldada', 'Alambre Recocido'],
    norms: ['norma_nmx_b172', 'norma_nmx_b113', 'norma_astm_e415'],
    providers: ['Deacero', 'ArcelorMittal', 'Ternium']
  }
};

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
    qrCode: `QR-${Date.now()}` // Simulate generic QR
  });

  const [availableNormas, setAvailableNormas] = useState<Norma[]>([]);
  const [suggestedMaterials, setSuggestedMaterials] = useState<string[]>([]);
  const [suggestedProviders, setSuggestedProviders] = useState<string[]>([]);
  const [detectedMaterialCategory, setDetectedMaterialCategory] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      // Try to extract GPS from location if it exists in the format "Loc [GPS: ...]"
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
    }
  }, [initialData]);

  // Intelligent Material Detection & Suggestions
  useEffect(() => {
    const materialInput = formData.tipoMaterial?.toLowerCase() || '';
    let foundCategory: string | null = null;

    if (materialInput.includes('concreto') || materialInput.includes('mortero')) foundCategory = 'Concreto';
    else if (materialInput.includes('suelo') || materialInput.includes('tierra') || materialInput.includes('base') || materialInput.includes('tepetate')) foundCategory = 'Suelo';
    else if (materialInput.includes('acero') || materialInput.includes('varilla') || materialInput.includes('malla')) foundCategory = 'Acero';

    setDetectedMaterialCategory(foundCategory);

    if (foundCategory) {
      setSuggestedMaterials(materialDatabase[foundCategory as keyof typeof materialDatabase].types);
      setSuggestedProviders(materialDatabase[foundCategory as keyof typeof materialDatabase].providers);
    } else {
      setSuggestedMaterials([]);
      setSuggestedProviders([]);
    }
  }, [formData.tipoMaterial]);

  // Rule Engine: Update available norms based on Project AND Material Type
  useEffect(() => {
    if (formData.proyectoId) {
      const project = proyectos.find(p => p.id === formData.proyectoId);
      if (project) {
        // Start with project assigned norms
        let filteredNormas = normas.filter(n => project.normasAsignadas.includes(n.id));

        // If a material category is detected, further filter or prioritize relevant norms
        // Instead of hard filtering, we will prioritize relevant norms but keep others available
        // to avoid "disappearing" norms issue.
        
        let prioritizedNorms = filteredNormas;
        
        if (detectedMaterialCategory) {
           const relevantNormIds = materialDatabase[detectedMaterialCategory as keyof typeof materialDatabase].norms;
           
           // Sort norms: Relevant ones first
           prioritizedNorms = [...filteredNormas].sort((a, b) => {
             const aRelevant = relevantNormIds.includes(a.id);
             const bRelevant = relevantNormIds.includes(b.id);
             if (aRelevant && !bRelevant) return -1;
             if (!aRelevant && bRelevant) return 1;
             return 0;
           });
        }

        setAvailableNormas(prioritizedNorms);
        
        // Only reset if the selected norm is not in the project AT ALL
        if (formData.normaId && !filteredNormas.find(n => n.id === formData.normaId)) {
           setFormData(prev => ({ ...prev, normaId: '' }));
        }
      } else {
        setAvailableNormas([]);
      }
    } else {
      setAvailableNormas([]);
    }
  }, [formData.proyectoId, normas, detectedMaterialCategory, formData.normaId, proyectos]);

  // Provider Suggestions Logic (Merged)
  useEffect(() => {
      let providers: string[] = [];
      
      // 1. From Material Database
      if (detectedMaterialCategory) {
          providers = [...materialDatabase[detectedMaterialCategory as keyof typeof materialDatabase].providers];
      }

      // 2. From Project Configuration
      if (formData.proyectoId) {
          const project = proyectos.find(p => p.id === formData.proyectoId);
          if (project && project.proveedores) {
              // Add project providers to the top of the list
              providers = [...project.proveedores, ...providers];
          }
      }

      // Remove duplicates
      setSuggestedProviders([...new Set(providers)]);

  }, [detectedMaterialCategory, formData.proyectoId, proyectos]);

  // Reverse Logic: Auto-detect Material from Selected Norm
  useEffect(() => {
    // Only run if a norm is selected
    if (formData.normaId) {
      // Find which category this norm belongs to
      let foundCategory: string | null = null;
      for (const [category, data] of Object.entries(materialDatabase)) {
        if (data.norms.includes(formData.normaId)) {
          foundCategory = category;
          break;
        }
      }

      if (foundCategory) {
         // Always update material type if a norm is explicitly selected and we found a category
         // This allows changing norms to update the material correctly
         setFormData(prev => ({ ...prev, tipoMaterial: foundCategory }));
      }
    }
  }, [formData.normaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSuggestionClick = (field: 'tipoMaterial' | 'proveedor', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    const finalLocation = gpsLocation 
        ? `${formData.ubicacion} [GPS: ${gpsLocation}]`
        : formData.ubicacion;

    const muestraToSave: Muestra = {
      id: initialData?.id || uuidv4(),
      codigo: initialData?.codigo || '', 
      // Send null if empty string to avoid UUID errors in Supabase
      proyectoId: formData.proyectoId || null as any, 
      normaId: formData.normaId || null as any,
      tipoMaterial: formData.tipoMaterial || '',
      fechaRecepcion: formData.fechaRecepcion || '',
      fechaTermino: formData.fechaTermino || undefined,
      ubicacion: finalLocation || '',
      proveedor: formData.proveedor || '',
      qrCode: formData.qrCode || '',
      estado: (formData.estado as 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado') || 'pendiente',
      tecnicoId: user?.id || '', // Use real user ID
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    onSave(muestraToSave);
    addToast(initialData ? 'Muestra actualizada correctamente' : 'Muestra registrada y orden de trabajo generada', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {initialData ? 'Editar Muestra' : 'Nueva Muestra Inteligente'}
        </h2>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Guardar y Generar Orden
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Inteligente de la Muestra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Proyecto *</label>
                  <select
                    name="proyectoId"
                    value={formData.proyectoId}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Seleccione un proyecto</option>
                    {proyectos.filter(p => p.estado === 'activo').map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tipo de Material (Autodetect) *
                  </label>
                  <div className="relative">
                    <Input
                      name="tipoMaterial"
                      value={formData.tipoMaterial}
                      onChange={handleChange}
                      placeholder="Escriba material (ej. concreto, acero...)"
                      required
                      className="w-full"
                    />
                    {detectedMaterialCategory && (
                      <div className="absolute right-3 top-2.5 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {detectedMaterialCategory} Detectado
                      </div>
                    )}
                  </div>
                  {/* Suggestions Pills */}
                  {suggestedMaterials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedMaterials.map(mat => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => handleSuggestionClick('tipoMaterial', mat)}
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors"
                        >
                          + {mat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-foreground">Norma Aplicable (Filtrado Inteligente) *</label>
                  <select
                    name="normaId"
                    value={formData.normaId}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                    disabled={!formData.proyectoId}
                  >
                    <option value="">
                      {!formData.proyectoId 
                        ? 'Seleccione primero un proyecto' 
                        : availableNormas.length === 0 
                          ? (detectedMaterialCategory ? 'No hay normas compatibles con este material en el proyecto' : 'No hay normas asignadas') 
                          : 'Seleccione una norma recomendada'}
                    </option>
                    {availableNormas.map(n => (
                      <option key={n.id} value={n.id}>{n.codigo} - {n.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground">Proveedor Sugerido</label>
                   <Input
                      name="proveedor"
                      value={formData.proveedor}
                      onChange={handleChange}
                      placeholder="ej. Cemex, Holcim"
                      list="provider-suggestions"
                    />
                    <datalist id="provider-suggestions">
                      {suggestedProviders.map(prov => (
                        <option key={prov} value={prov} />
                      ))}
                    </datalist>
                    {suggestedProviders.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {suggestedProviders
                          .filter(p => !formData.proveedor || p.toLowerCase().includes(formData.proveedor.toLowerCase()))
                          .map(prov => (
                          <button
                            key={prov}
                            type="button"
                            onClick={() => handleSuggestionClick('proveedor', prov)}
                            className="text-xs bg-muted text-muted-foreground hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center justify-between">
                    <span>Ubicación (Descripción) *</span>
                  </label>
                  <div className="relative">
                    <Input
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      placeholder="ej. Columna C-4, Losa Nivel 2"
                      required
                      className="bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center justify-between">
                    <span>Geolocalización (Opcional)</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={handleGetLocation}
                      disabled={geoLoading}
                    >
                      {geoLoading ? 'Obteniendo...' : <><MapPin className="w-3 h-3 mr-1" /> GPS Actual</>}
                    </Button>
                  </label>
                  <div className="relative">
                    <Input
                      value={gpsLocation}
                      placeholder="Coordenadas GPS"
                      readOnly
                      className="cursor-not-allowed opacity-80"
                    />
                    <Navigation className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                  </div>
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
              <CardTitle>Identificación & Trazabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border border-border flex items-center justify-center">
                <QRCode value={formData.qrCode?.startsWith('http') ? formData.qrCode : `${window.location.origin}/verify/muestra/${initialData?.id || 'pending'}`} size={128} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Código QR Único</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                   {formData.qrCode?.startsWith('http') ? 'Enlace de Verificación Activo' : 'Se generará al guardar'}
                </p>
              </div>
              
              <div className="w-full space-y-3 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Resumen Ejecutivo:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Material: {formData.tipoMaterial || 'No definido'}</li>
                    <li>Norma: {availableNormas.find(n => n.id === formData.normaId)?.codigo || 'Pendiente'}</li>
                    <li>Ubicación: {formData.ubicacion ? 'Registrada' : 'Pendiente'}</li>
                  </ul>
                </div>
                <Button type="button" variant="outline" className="w-full">
                  <QrIcon className="mr-2 h-4 w-4" />
                  Imprimir Etiqueta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}