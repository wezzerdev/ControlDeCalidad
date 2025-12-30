import React, { useState, useEffect, useCallback } from 'react';
import { Muestra, Norma, Proyecto } from '../../data/mockData';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface EnsayoFormProps {
  muestra: Muestra;
  norma: Norma;
  proyecto: Proyecto;
  onSave: (muestra: Muestra) => void;
  onCancel: () => void;
}

export function EnsayoForm({ muestra, norma, proyecto, onSave, onCancel }: EnsayoFormProps) {
  const { addToast } = useToast();
  const [resultados, setResultados] = useState<Record<string, string | number | boolean>>(muestra.resultados || {});
  const [status, setStatus] = useState<'aprobado' | 'rechazado' | 'en_proceso'>('en_proceso');
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [specimenRows, setSpecimenRows] = useState<Record<string, any>[]>([]);

  // Initialize state from muestra.resultados
  useEffect(() => {
    const res = muestra.resultados || {};
    // Check implicit multi-mode
    if (res._is_multi_implicit) {
        setIsMultiMode(true);
        // Reconstruct rows
        const qty = Number(res._qty || 0);
        const newRows = [];
        for (let i = 0; i < qty; i++) {
            const row: Record<string, any> = {};
            // Find keys ending in _i
            Object.keys(res).forEach(key => {
                if (key.endsWith(`_${i}`)) {
                    const baseKey = key.replace(`_${i}`, '');
                    row[baseKey] = res[key];
                }
            });
            newRows.push(row);
        }
        if (newRows.length === 0) newRows.push({}); // Start with 1 if empty but flag set
        setSpecimenRows(newRows);
    } else {
        // Check explicit multi-mode (qty field)
        const qtyField = norma.campos.find(f => 
            f.id.includes('qty') || f.nombre.toLowerCase().includes('cantidad')
        );
        if (qtyField && res[qtyField.id]) {
            const qty = Number(res[qtyField.id]);
            if (qty > 0) {
                 // Logic for explicit mode (already handled by renderField in previous code, but we want to unify)
                 // For now, let's keep explicit mode as is in previous logic if possible, OR migrate to unified?
                 // User complaint: "En los ensayos no salen todas las muestras capturadas si uso el boton multiple"
                 // This refers to the Implicit Mode (toggle).
            }
        }
    }
  }, [muestra.resultados]);

  const handleResultChange = (fieldId: string, value: string | number | boolean) => {
    setResultados(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSpecimenChange = (index: number, fieldId: string, value: any) => {
      const newRows = [...specimenRows];
      if (!newRows[index]) newRows[index] = {};
      newRows[index][fieldId] = value;
      setSpecimenRows(newRows);
      
      // Sync back to flat structure for storage
      const flatKey = `${fieldId}_${index}`;
      handleResultChange(flatKey, value);
  };

  const addSpecimen = () => {
      setSpecimenRows([...specimenRows, {}]);
      handleResultChange('_qty', specimenRows.length + 1);
  };

  const removeSpecimen = (index: number) => {
      const newRows = [...specimenRows];
      newRows.splice(index, 1);
      setSpecimenRows(newRows);
      
      // We need to cleanup old keys from resultados to avoid ghosts?
      // Or just update _qty. Ideally we should reconstruct 'resultados' from rows on save.
      handleResultChange('_qty', newRows.length);
  };

  const handleBatchValueChange = (fieldId: string, value: any) => {
      // Update all rows with this value
      const newRows = specimenRows.map(row => ({
          ...row,
          [fieldId]: value
      }));
      setSpecimenRows(newRows);
      
      // Update flat results
      newRows.forEach((row, idx) => {
          handleResultChange(`${fieldId}_${idx}`, value);
      });
  };

  // Identificar campos globales y específicos
  // If Implicit Multi Mode is ON, then ALL fields that are not strictly global (if any) become specimen fields?
  // Or rather, the user decides via the UI.
  // In SampleForm we treated non-global scope as specimen fields when isMultiMode is true.
  
  const globalFields = norma.campos.filter(f => f.scope === 'global' || (!isMultiMode && !f.scope));
  // If isMultiMode, fields without scope become specimen fields
  const effectiveSpecimenFields = isMultiMode 
    ? norma.campos.filter(f => f.scope === 'specimen' || !f.scope)
    : norma.campos.filter(f => f.scope === 'specimen');
  
  // Buscar campo que define la cantidad de especímenes (convención: contiene "qty" o "cantidad" en ID o nombre)
  const qtyField = norma.campos.find(f => 
    f.id.includes('qty') || f.nombre.toLowerCase().includes('cantidad') || f.nombre.toLowerCase().includes('número')
  );

  const getSpecimenCount = (): number => {
    if (isMultiMode) return specimenRows.length;
    if (!qtyField) return 0;
    const val = resultados[qtyField.id];
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const specimenCount = getSpecimenCount();

  const calculateStatus = useCallback(() => {
    // Simple auto-validation logic based on min/max
    let allPass = true;
    let allFilled = true;

    // Validate global fields
    globalFields.forEach(field => {
      const val = resultados[field.id];
      if (field.esRequerido && (val === undefined || val === '')) allFilled = false;
      if (field.tipo === 'number' && val !== undefined && val !== '') {
        const numVal = Number(val);
        if (field.limiteMin !== undefined && numVal < field.limiteMin) allPass = false;
        if (field.limiteMax !== undefined && numVal > field.limiteMax) allPass = false;
      }
    });

    // Validate specimen fields
    if (specimenCount > 0 && effectiveSpecimenFields.length > 0) {
       for (let i = 0; i < specimenCount; i++) {
         effectiveSpecimenFields.forEach(field => {
           const key = `${field.id}_${i}`;
           const val = resultados[key];
           if (field.esRequerido && (val === undefined || val === '')) allFilled = false;
           if (field.tipo === 'number' && val !== undefined && val !== '') {
             const numVal = Number(val);
             if (field.limiteMin !== undefined && numVal < field.limiteMin) allPass = false;
             if (field.limiteMax !== undefined && numVal > field.limiteMax) allPass = false;
           }
         });
       }
    }

    if (!allFilled) return 'en_proceso';
    return allPass ? 'aprobado' : 'rechazado';
  }, [norma.campos, resultados, specimenCount, globalFields, effectiveSpecimenFields]);

  const renderField = (field: typeof norma.campos[0], index?: number) => {
    const fieldId = index !== undefined ? `${field.id}_${index}` : field.id;
    const value = resultados[fieldId];

    return (
      <div key={fieldId} className={cn(
        "space-y-2 p-4 rounded-lg border border-border/50 bg-card/50",
        field.tipo === 'boolean' && "col-span-1 md:col-span-2"
      )}>
        <div className="flex justify-between items-start">
          <label className="text-sm font-medium text-foreground block">
            {field.nombre} {index !== undefined && `#${index + 1}`}
            {field.esRequerido && <span className="text-destructive ml-1">*</span>}
          </label>
          <div className="flex items-center gap-2">
             {index !== undefined && isMultiMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Aplicar a todos"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => handleBatchValueChange(field.id, value)}
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
             )}
             <span className="text-xs text-muted-foreground ml-2 text-right">
                {field.tipo === 'number' && field.unidad && `[${field.unidad}]`}
             </span>
          </div>
        </div>
        
        <div className="pt-1">
          {field.tipo === 'select' ? (
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={String(value || '')}
              onChange={(e) => {
                  if (index !== undefined && isMultiMode) {
                      handleSpecimenChange(index, field.id, e.target.value);
                  } else {
                      handleResultChange(fieldId, e.target.value);
                  }
              }}
              required={field.esRequerido}
            >
              <option value="">Seleccionar...</option>
              {field.opciones?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.tipo === 'boolean' ? (
            <div className="flex gap-4">
              <label className={cn(
                "flex-1 flex items-center justify-center space-x-2 cursor-pointer p-3 rounded-md border transition-all",
                value === true 
                  ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              )}>
                <input
                  type="radio"
                  name={fieldId}
                  checked={value === true}
                  onChange={() => {
                      if (index !== undefined && isMultiMode) {
                          handleSpecimenChange(index, field.id, true);
                      } else {
                          handleResultChange(fieldId, true);
                      }
                  }}
                  className="sr-only"
                />
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Cumple</span>
              </label>
              <label className={cn(
                "flex-1 flex items-center justify-center space-x-2 cursor-pointer p-3 rounded-md border transition-all",
                value === false 
                  ? "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              )}>
                <input
                  type="radio"
                  name={fieldId}
                  checked={value === false}
                  onChange={() => {
                      if (index !== undefined && isMultiMode) {
                          handleSpecimenChange(index, field.id, false);
                      } else {
                          handleResultChange(fieldId, false);
                      }
                  }}
                  className="sr-only"
                />
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">No Cumple</span>
              </label>
            </div>
          ) : (
            <Input
              type={field.tipo === 'number' ? 'number' : 'text'}
              step={field.tipo === 'number' ? 'any' : undefined}
              value={String(value || '')}
              onChange={(e) => {
                  if (index !== undefined && isMultiMode) {
                      handleSpecimenChange(index, field.id, e.target.value);
                  } else {
                      handleResultChange(fieldId, e.target.value);
                  }
              }}
              required={field.esRequerido}
              placeholder={field.tipo === 'number' && (field.limiteMin !== undefined || field.limiteMax !== undefined) 
                ? `Rango: ${field.limiteMin ?? 'min'} - ${field.limiteMax ?? 'max'}` 
                : ''}
              className={cn(
                field.tipo === 'number' && value !== undefined && value !== '' && (
                  (field.limiteMin !== undefined && parseFloat(String(value)) < field.limiteMin) ||
                  (field.limiteMax !== undefined && parseFloat(String(value)) > field.limiteMax)
                ) && "border-destructive focus-visible:ring-destructive bg-destructive/10"
              )}
            />
          )}
        </div>
        {field.tipo === 'number' && (field.limiteMin !== undefined || field.limiteMax !== undefined) && (
           <p className="text-xs text-muted-foreground mt-1">
             Permitido: {field.limiteMin ?? '-∞'} a {field.limiteMax ?? '+∞'}
           </p>
        )}
      </div>
    );
  };

  useEffect(() => {
    setStatus(calculateStatus());
  }, [calculateStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cleanup if isMultiMode: Ensure _qty and _is_multi_implicit are correct
    let finalResultados = { ...resultados };
    if (isMultiMode) {
        finalResultados._is_multi_implicit = true;
        finalResultados._qty = specimenRows.length;
        
        // Ensure rows are synced (though they should be via handleSpecimenChange)
        specimenRows.forEach((row, idx) => {
            Object.entries(row).forEach(([k, v]) => {
                finalResultados[`${k}_${idx}`] = v;
            });
        });
        
        // Remove potentially deleted rows (ghosts)
        // A simple way is to iterate up to a large number and delete keys > _qty-1
        // But for now, relying on _qty for rendering is enough.
    }

    onSave({ ...muestra, resultados: finalResultados, estado: status });
    addToast('Resultados guardados correctamente', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Registro de Resultados</h2>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Guardar Resultados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Muestra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Código</p>
                <p className="font-medium text-foreground">{muestra.codigo}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Proyecto</p>
                <p className="font-medium text-foreground">{proyecto.nombre}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Norma</p>
                <p className="font-medium text-foreground">{norma.codigo} - {norma.nombre}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Material</p>
                <p className="font-medium text-foreground">{muestra.tipoMaterial}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha Recepción</p>
                <p className="font-medium text-foreground">{new Date(muestra.fechaRecepcion).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado Calculado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed",
                status === 'aprobado' && "border-green-500 bg-green-50 dark:bg-green-900/20",
                status === 'rechazado' && "border-red-500 bg-red-50 dark:bg-red-900/20",
                status === 'en_proceso' && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              )}>
                {status === 'aprobado' && <CheckCircle className="h-12 w-12 text-green-500 mb-2" />}
                {status === 'rechazado' && <XCircle className="h-12 w-12 text-red-500 mb-2" />}
                {status === 'en_proceso' && <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-2" />}
                
                <span className="text-lg font-bold capitalize">
                  {status.replace('_', ' ')}
                </span>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  {status === 'en_proceso' ? 'Complete todos los campos requeridos' : 'Basado en los límites de la norma'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resultados del Ensayo</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Campos Globales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {globalFields.map(field => renderField(field))}
              </div>

              {/* Campos por Espécimen */}
              {(specimenCount > 0 || isMultiMode) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                        Detalle de Especímenes ({specimenCount})
                    </h3>
                    {isMultiMode && (
                        <Button type="button" size="sm" variant="outline" onClick={addSpecimen}>
                            Agregar Especímen
                        </Button>
                    )}
                  </div>

                  {Array.from({ length: specimenCount }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card/30 p-4 relative group">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                            Espécimen {i + 1}
                          </h4>
                          {isMultiMode && specimenCount > 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeSpecimen(i)}
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              >
                                  <XCircle className="w-4 h-4" />
                              </Button>
                          )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {effectiveSpecimenFields.map(field => renderField(field, i))}
                      </div>
                    </div>
                  ))}
                  
                  {isMultiMode && specimenCount === 0 && (
                      <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                          No hay especímenes registrados. 
                          <Button variant="link" onClick={addSpecimen}>Agregar uno</Button>
                      </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
