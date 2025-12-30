import React, { useState, useEffect, useMemo } from 'react';
import { Muestra, Proyecto, Norma, SampleTypeCategory } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Save, ArrowLeft, QrCode as QrIcon, MapPin, Navigation, Info, FileText, Search, BookOpen, CheckCircle, Lightbulb, ChevronDown, X, PlusCircle, Trash2 } from 'lucide-react';
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
    qrCode: `QR-${Date.now()}`,
    resultados: {}
  });

  const [selectedCategory, setSelectedCategory] = useState<SampleTypeCategory | ''>('');
  const [availableNormas, setAvailableNormas] = useState<Norma[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('');
  const [showNormaReview, setShowNormaReview] = useState(false);
  const [selectedNormaDetails, setSelectedNormaDetails] = useState<Norma | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  // Multi-sample state
  const [specimenRows, setSpecimenRows] = useState<Record<string, any>[]>([{}]);
  const [globalResults, setGlobalResults] = useState<Record<string, any>>({});
  const [isMultiMode, setIsMultiMode] = useState(false);

  // Initialize multi-sample state from initialData
  useEffect(() => {
    if (initialData && initialData.resultados) {
        // Separate global fields from specimen fields
        // This is tricky without knowing the exact schema used when saving
        // But we can check for _qty or keys ending in _0, _1 etc.
        
        const res = initialData.resultados;
        const newGlobal: Record<string, any> = {};
        const newSpecimens: Record<string, any>[] = [];
        
        // Simple heuristic: keys with _\d+ suffix are specimen fields
        // But we need to group them by index.
        const specimenDataByIndex: Record<number, Record<string, any>> = {};
        let maxIndex = -1;

        Object.entries(res).forEach(([key, value]) => {
            const match = key.match(/(.+)_(\d+)$/);
            if (match) {
                const fieldId = match[1];
                const index = parseInt(match[2]);
                if (!specimenDataByIndex[index]) specimenDataByIndex[index] = {};
                specimenDataByIndex[index][fieldId] = value;
                if (index > maxIndex) maxIndex = index;
            } else {
                newGlobal[key] = value;
            }
        });

        if (maxIndex >= 0) {
            // Reconstruct array
            for (let i = 0; i <= maxIndex; i++) {
                newSpecimens.push(specimenDataByIndex[i] || {});
            }
            setSpecimenRows(newSpecimens);
            setIsMultiMode(true);
        } else {
            // Single mode or no data
            // If explicit multi mode flag exists?
            if (res._is_multi_implicit) {
                 setIsMultiMode(true);
                 if (newSpecimens.length === 0) setSpecimenRows([{}]);
            } else {
                 setSpecimenRows([{}]); // Default 1 row
                 setIsMultiMode(false);
            }
        }
        setGlobalResults(newGlobal);
    }
  }, [initialData]);

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
                // Check if the name already includes the category (from DB rename or otherwise)
                // We use a flexible check to avoid double labeling
                const hasCategoryInName = cleanName.toLowerCase().includes(cat.toLowerCase());
                const label = hasCategoryInName ? cleanName : `${cleanName} [${cat}]`;
                
                options.push({
                    id: `${n.id}-${cat}`, // Unique key
                    label: label,
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

  // Sync display value when selection changes externally or initially
  useEffect(() => {
      if (formData.normaId && selectedCategory) {
          const match = availableTestTypes.find(opt => opt.normId === formData.normaId && opt.category === selectedCategory);
          if (match) {
              setDisplayValue(match.label);
          }
      } else if (!formData.normaId) {
          setDisplayValue('');
      }
  }, [formData.normaId, selectedCategory, availableTestTypes]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      setDisplayValue(value);
      setIsDropdownOpen(true);
      
      if (value === '') {
           setSelectedCategory('');
           setFormData(prev => ({ ...prev, normaId: '' }));
      }
  };

  // Handle Option Selection
  const handleSelectOption = (option: typeof availableTestTypes[0]) => {
      setSelectedCategory(option.category);
      setFormData(prev => ({ 
          ...prev, 
          normaId: option.normId,
          tipoMaterial: !prev.tipoMaterial ? option.category : prev.tipoMaterial 
      }));
      setDisplayValue(option.label);
      setSearchTerm(''); // Reset search term so next time we open we see all options (or filtered by nothing)
      setIsDropdownOpen(false);
  };

  // Clear Selection
  const handleClearSelection = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSearchTerm('');
      setDisplayValue('');
      setSelectedCategory('');
      setFormData(prev => ({ ...prev, normaId: '' }));
      setIsDropdownOpen(true); // Open dropdown to show all options
  };

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

  const handleDynamicFieldChange = (fieldId: string, value: any) => {
    // This is for Global fields
    setGlobalResults(prev => ({ ...prev, [fieldId]: value }));
    setFormData(prev => ({
      ...prev,
      resultados: { ...prev.resultados, [fieldId]: value }
    }));
  };

  const handleSpecimenFieldChange = (index: number, fieldId: string, value: any) => {
      const newRows = [...specimenRows];
      newRows[index] = { ...newRows[index], [fieldId]: value };
      setSpecimenRows(newRows);
  };

  const addSpecimen = () => {
      setSpecimenRows([...specimenRows, {}]);
  };

  const removeSpecimen = (index: number) => {
      const newRows = [...specimenRows];
      newRows.splice(index, 1);
      setSpecimenRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      addToast('Por favor seleccione una categoría de muestra', 'error');
      return;
    }

    // Consolidate results
    const consolidatedResults: Record<string, any> = { ...globalResults };
    
    if (isMultiMode || (selectedNormaDetails?.campos.some(c => c.scope === 'specimen'))) {
        // Save specimen data
        specimenRows.forEach((row, index) => {
            Object.entries(row).forEach(([key, val]) => {
                consolidatedResults[`${key}_${index}`] = val;
            });
        });
        
        // Try to find quantity field to update automatically
        const qtyField = selectedNormaDetails?.campos.find(f => 
            f.id.includes('qty') || 
            f.nombre.toLowerCase().includes('cantidad') || 
            f.nombre.toLowerCase().includes('número')
        );
        if (qtyField) {
            consolidatedResults[qtyField.id] = specimenRows.length;
        } else {
            // Implicit quantity
            consolidatedResults['_qty'] = specimenRows.length;
        }
        
        consolidatedResults['_is_multi_implicit'] = true;
    } else {
        // Single mode, map first row to base fields if they are in specimenRows (for toggle case)
        // Actually, if !isMultiMode, we just use globalResults + maybe first row of specimenRows merged flat?
        // If the norm has NO scopes, we treated them as globalResults via handleDynamicFieldChange.
        // If the norm HAS scopes, globalResults has globals, and specimenRows[0] has specimens.
        if (specimenRows.length > 0) {
             Object.entries(specimenRows[0]).forEach(([key, val]) => {
                consolidatedResults[key] = val;
            });
        }
    }

    // Validate required dynamic fields
    if (selectedNormaDetails && selectedNormaDetails.campos) {
        for (const field of selectedNormaDetails.campos) {
            if (field.esRequerido) {
                // Check logic:
                // If field is global: check globalResults
                // If field is specimen: check ALL specimenRows
                // If scope undefined: check globalResults (unless isMultiMode, then check rows)
                
                const isSpecimenScope = field.scope === 'specimen' || (isMultiMode && !field.scope);
                
                if (isSpecimenScope) {
                    for (let i = 0; i < specimenRows.length; i++) {
                        const val = specimenRows[i][field.id];
                        if (val === undefined || val === '' || val === null) {
                             addToast(`El campo "${field.nombre}" es requerido en el espécimen #${i+1}.`, 'error');
                             return;
                        }
                    }
                } else {
                    const val = globalResults[field.id] ?? (specimenRows[0]?.[field.id]); 
                    // Fallback to row 0 if single mode and stored there
                    if (val === undefined || val === '' || val === null) {
                        addToast(`El campo "${field.nombre}" es requerido.`, 'error');
                        return;
                    }
                }
            }
        }
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
      resultados: consolidatedResults,
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
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder={!formData.proyectoId ? "Seleccione proyecto primero" : "Buscar o seleccionar ensayo..."}
                                value={displayValue}
                                onChange={handleSearchChange}
                                onFocus={() => formData.proyectoId && setIsDropdownOpen(true)}
                                className="pl-9 pr-10 cursor-pointer"
                                disabled={!formData.proyectoId}
                                readOnly={false}
                                autoComplete="off"
                            />
                            <div className="absolute right-3 top-2.5 flex items-center gap-1">
                                {displayValue && (
                                    <X 
                                        className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
                                        onClick={handleClearSelection}
                                    />
                                )}
                                <ChevronDown 
                                    className={`h-4 w-4 text-muted-foreground cursor-pointer transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    onClick={() => formData.proyectoId && setIsDropdownOpen(!isDropdownOpen)}
                                />
                            </div>
                        </div>

                        {isDropdownOpen && formData.proyectoId && (
                            <>
                                {/* Invisible overlay to handle click outside */}
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                
                                <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-md shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                    {filteredTestTypes.length === 0 ? (
                                        <div className="p-3 text-sm text-muted-foreground text-center">No se encontraron resultados</div>
                                    ) : (
                                        filteredTestTypes.map(opt => (
                                            <div 
                                                key={opt.id}
                                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors ${formData.normaId === opt.normId && selectedCategory === opt.category ? 'bg-accent/50 text-accent-foreground font-medium' : ''}`}
                                                onClick={() => handleSelectOption(opt)}
                                            >
                                                <span>{opt.label}</span>
                                                {formData.normaId === opt.normId && selectedCategory === opt.category && (
                                                    <CheckCircle className="h-3 w-3 text-primary" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                        
                        {!formData.proyectoId && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Seleccione un proyecto para ver los ensayos disponibles.
                            </p>
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

              {selectedNormaDetails && selectedNormaDetails.campos && selectedNormaDetails.campos.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center text-primary">
                            <FileText className="w-4 h-4 mr-2" />
                            Datos Técnicos del Ensayo
                        </h3>
                        
                        {!selectedNormaDetails.campos.some(c => c.scope) && (
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-muted-foreground">Múltiples Muestras</label>
                                <input 
                                    type="checkbox" 
                                    checked={isMultiMode} 
                                    onChange={() => setIsMultiMode(!isMultiMode)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </div>
                        )}
                    </div>

                    {/* Global Fields Section */}
                    {selectedNormaDetails.campos.some(c => c.scope === 'global' || (!c.scope && !isMultiMode)) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {selectedNormaDetails.campos
                                .filter(c => c.scope === 'global' || (!c.scope && !isMultiMode))
                                .map((campo) => (
                                <div key={campo.id} className="space-y-2">
                                    <label className="text-sm font-medium flex justify-between">
                                        <span>{campo.nombre}</span>
                                        {campo.unidad && <span className="text-muted-foreground text-xs">({campo.unidad})</span>}
                                    </label>
                                    
                                    {campo.tipo === 'select' ? (
                                        <select
                                            value={String(globalResults[campo.id] ?? (specimenRows[0]?.[campo.id] ?? ''))}
                                            onChange={(e) => handleDynamicFieldChange(campo.id, e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required={campo.esRequerido}
                                        >
                                            <option value="">Seleccione...</option>
                                            {campo.opciones?.map(op => (
                                                <option key={op} value={op}>{op}</option>
                                            ))}
                                        </select>
                                    ) : campo.tipo === 'boolean' ? (
                                        <select
                                            value={globalResults[campo.id] === undefined ? (specimenRows[0]?.[campo.id] === undefined ? '' : String(specimenRows[0][campo.id])) : String(globalResults[campo.id])}
                                            onChange={(e) => handleDynamicFieldChange(campo.id, e.target.value === 'true')}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required={campo.esRequerido}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="true">Sí / Cumple</option>
                                            <option value="false">No / No Cumple</option>
                                        </select>
                                    ) : (
                                        <Input 
                                            type={campo.tipo === 'number' ? 'number' : 'text'}
                                            step={campo.tipo === 'number' ? "any" : undefined}
                                            value={String(globalResults[campo.id] ?? (specimenRows[0]?.[campo.id] ?? ''))}
                                            onChange={(e) => handleDynamicFieldChange(campo.id, campo.tipo === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                            placeholder={campo.nombre}
                                            required={campo.esRequerido}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Specimen Fields Section */}
                    {(isMultiMode || selectedNormaDetails.campos.some(c => c.scope === 'specimen')) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Resultados por Especímen ({specimenRows.length})
                                </h4>
                                <Button type="button" size="sm" variant="outline" onClick={addSpecimen} className="h-7 text-xs">
                                    <PlusCircle className="w-3 h-3 mr-1" /> Agregar
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                {specimenRows.map((row, index) => (
                                    <div key={index} className="bg-card border border-border p-3 rounded-md relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => removeSpecimen(index)}
                                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                                disabled={specimenRows.length === 1}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="mb-2 text-xs font-bold text-primary">
                                            #{index + 1}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedNormaDetails.campos
                                                .filter(c => c.scope === 'specimen' || (isMultiMode && !c.scope))
                                                .map((campo) => (
                                                <div key={campo.id} className="space-y-1">
                                                    <label className="text-xs font-medium text-muted-foreground truncate block" title={campo.nombre}>
                                                        {campo.nombre} {campo.unidad && `(${campo.unidad})`}
                                                    </label>
                                                    
                                                    {campo.tipo === 'select' ? (
                                                        <select
                                                            value={String(row[campo.id] || '')}
                                                            onChange={(e) => handleSpecimenFieldChange(index, campo.id, e.target.value)}
                                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                                            required={campo.esRequerido}
                                                        >
                                                            <option value="">...</option>
                                                            {campo.opciones?.map(op => (
                                                                <option key={op} value={op}>{op}</option>
                                                            ))}
                                                        </select>
                                                    ) : campo.tipo === 'boolean' ? (
                                                        <select
                                                            value={row[campo.id] === undefined ? '' : String(row[campo.id])}
                                                            onChange={(e) => handleSpecimenFieldChange(index, campo.id, e.target.value === 'true')}
                                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                                            required={campo.esRequerido}
                                                        >
                                                            <option value="">...</option>
                                                            <option value="true">Sí</option>
                                                            <option value="false">No</option>
                                                        </select>
                                                    ) : (
                                                        <Input 
                                                            type={campo.tipo === 'number' ? 'number' : 'text'}
                                                            step={campo.tipo === 'number' ? "any" : undefined}
                                                            value={String(row[campo.id] || '')}
                                                            onChange={(e) => handleSpecimenFieldChange(index, campo.id, campo.tipo === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                                            placeholder={campo.nombre}
                                                            required={campo.esRequerido}
                                                            className="h-8 text-xs"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              )}
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
                    value={initialData?.qrCode && initialData.qrCode.startsWith('http') 
                        ? initialData.qrCode 
                        : 'https://controldecalidad.vercel.app'} 
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
