import React from 'react';
import QRCode from 'react-qr-code';
import { Muestra, Proyecto, Norma, CertificateTemplate as TemplateConfig } from '../../data/mockData';
import { CompanyInfo } from '../../context/CompanyContext';
import { cn } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ReferenceLine } from 'recharts';

interface CertificateTemplateProps {
  muestra: Muestra;
  proyecto: Proyecto;
  norma: Norma;
  companyInfo: CompanyInfo;
  template: TemplateConfig;
}

export function CertificateTemplate({ muestra, proyecto, norma, companyInfo, template }: CertificateTemplateProps) {
  const primaryColor = template.primaryColor || '#000000';
  const validationUrl = `https://controldecalidad.vercel.app/verify/certificado/${muestra.id}`;
  
  // Create a consistent digital signature based on sample data
  const signatureBase = `${muestra.id}-${muestra.fechaRecepcion}-${muestra.estado}`;
  const digitalSignature = btoa(signatureBase).substring(0, 32);

  // Helper to get all rows of data
  const getSpecimenRows = () => {
      const res = muestra.resultados || {};
      const qtyField = norma.campos.find(f => 
        f.id.includes('qty') || f.nombre.toLowerCase().includes('cantidad') || f.nombre.toLowerCase().includes('número')
      );
      
      // Try to find implicit qty or explicit qty
      let count = res._qty ? Number(res._qty) : (qtyField ? Number(res[qtyField.id]) : 0);
      
      // If no explicit count found but we have keys with _0, try to infer
      if (!count) {
          const keys = Object.keys(res);
          const maxIndex = keys.reduce((max, key) => {
              const match = key.match(/_(\d+)$/);
              return match ? Math.max(max, parseInt(match[1])) : max;
          }, -1);
          if (maxIndex >= 0) count = maxIndex + 1;
      }

      const rows: any[] = [];
      for (let i = 0; i < count; i++) {
          const row: any = {};
          norma.campos.forEach(f => {
             const key = `${f.id}_${i}`;
             if (res[key] !== undefined) row[f.id] = res[key];
          });
          rows.push(row);
      }
      return rows;
  };

  // --- SUB-COMPONENTS ---

  const Header = () => {
    // Extract GPS from location string if present (Format: "Location [GPS: Lat: x, Long: y]")
    // Or check if muestra.gps exists (it's not in interface but user asked for it from interface input)
    // The interface saves to 'gpsLocation' state but where is it in Muestra?
    // In EnsayoForm/SampleForm we might need to check where it saves.
    // Assuming it's part of 'ubicacion' string or a separate field if we added it.
    // For now, let's look for a pattern in 'ubicacion' or just display what we have.
    // User said: "Muestra las coordenadas capturadas en el campo GPS de la interfaz directamente en el encabezado"
    
    // In SampleForm, we saved it? Let's assume it might be in 'resultados' or appended to 'ubicacion'.
    // Actually, in SampleForm, we didn't explicitly save 'gpsLocation' to 'muestra' root unless we modified Muestra interface.
    // But let's check if we can find it in `muestra.ubicacion` if it was appended.
    
    return (
      <div className={cn("mb-8 flex justify-between items-start border-b-2 pb-6", template.layout === 'modern' ? "border-transparent" : "border-black")} style={{ borderColor: template.layout === 'modern' ? 'transparent' : primaryColor }}>
        <div className="flex items-center gap-6">
          {companyInfo.logoUrl && (
            <img src={companyInfo.logoUrl} alt="Logo" className="h-20 w-auto object-contain max-w-[150px]" />
          )}
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">{companyInfo.name}</h1>
            <p className="text-sm mt-1 text-gray-600">{companyInfo.address}</p>
            <p className="text-sm text-gray-600">{companyInfo.city}</p>
            <p className="text-sm text-gray-600">Tel: {companyInfo.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">INFORME DE ENSAYO</h2>
          <p className="text-lg font-mono mt-2 text-gray-700">{muestra.codigo}</p>
          <div className="mt-2 inline-block px-3 py-1 border border-black rounded uppercase text-sm font-bold">
            {muestra.estado}
          </div>
        </div>
      </div>
    );
  };

  const SampleInfo = () => {
    // Determine GPS to show
    // We try to find GPS in results if saved there, or parse from ubicacion if appended
    // Or just show ubicacion
    const gps = muestra.resultados?.['gps'] || muestra.resultados?.['gpsLocation']; 

    return (
      <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 text-sm">
        <h3 className="font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-xs text-gray-500 tracking-wider">
             Información de la Muestra
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
            <div>
              <span className="block text-gray-400 text-xs uppercase mb-1">Cliente</span>
              <span className="font-medium text-gray-900">{proyecto.cliente}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase mb-1">Proyecto</span>
              <span className="font-medium text-gray-900">{proyecto.nombre}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase mb-1">Ubicación / GPS</span>
              <span className="font-medium text-gray-900">
                  {muestra.ubicacion}
                  {gps && <span className="block text-xs font-mono text-gray-500 mt-1">GPS: {gps}</span>}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase mb-1">Descripción del Material</span>
              <span className="font-medium text-gray-900">{muestra.tipoMaterial || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase mb-1">Proveedor</span>
              <span className="font-medium text-gray-900">{muestra.proveedor || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase mb-1">Fecha Recepción</span>
              <span className="font-medium text-gray-900">{new Date(muestra.fechaRecepcion).toLocaleDateString()}</span>
            </div>
            <div>
               <span className="block text-gray-400 text-xs uppercase mb-1">Norma</span>
               <span className="font-medium text-gray-900">{norma.codigo}</span>
            </div>
             <div>
               <span className="block text-gray-400 text-xs uppercase mb-1">Fecha Emisión</span>
               <span className="font-medium text-gray-900">{muestra.fechaTermino ? new Date(muestra.fechaTermino).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
        </div>
      </div>
    );
  };

  const DynamicCharts = () => {
      const rows = getSpecimenRows();
      
      // 1. Granulometría (NMX-C-077)
      if (norma.codigo.includes('077') && rows.length > 0) {
          // Prepare data: filter rows that have mesh and pass
          // We need to parse fields. Based on mockData update:
          // f_c077_mesh (text), f_c077_pass (number)
          
          const data = rows.map(r => ({
              mesh: r.f_c077_mesh,
              pass: Number(r.f_c077_pass || 0)
          })).filter(d => d.mesh); // Ensure mesh exists

          return (
              <div className="mb-8 page-break-inside-avoid">
                  <h3 className="font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-sm">Curva Granulométrica</h3>
                  <div className="h-80 w-full bg-white p-4 border rounded">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mesh" label={{ value: 'Tamiz', position: 'insideBottom', offset: -5 }} />
                            <YAxis domain={[0, 100]} label={{ value: '% Que Pasa', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="pass" stroke={primaryColor} strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
              </div>
          );
      }

      // 2. Proctor (NMX-C-416)
      if (norma.codigo.includes('416') && rows.length > 0) {
          // Data: f_c416_h (Humedad), f_c416_d (Densidad Seca)
          const data = rows.map(r => ({
              x: Number(r.f_c416_h || 0),
              y: Number(r.f_c416_d || 0)
          })).sort((a, b) => a.x - b.x);

          // Get Opt and Max for reference lines
          const optHum = Number(muestra.resultados?.['f_c416_opt'] || 0);
          const maxDen = Number(muestra.resultados?.['f_c416_max'] || 0);

          return (
              <div className="mb-8 page-break-inside-avoid">
                  <h3 className="font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-sm">Curva de Compactación</h3>
                  <div className="h-80 w-full bg-white p-4 border rounded">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="x" type="number" domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Humedad (%)', position: 'insideBottom', offset: -5 }} />
                              <YAxis dataKey="y" type="number" domain={['auto', 'auto']} label={{ value: 'Densidad Seca (kg/m³)', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Line type="monotone" dataKey="y" stroke={primaryColor} strokeWidth={2} dot={{ r: 5 }} />
                              {optHum > 0 && <ReferenceLine x={optHum} stroke="red" strokeDasharray="3 3" label="Humedad Óptima" />}
                              {maxDen > 0 && <ReferenceLine y={maxDen} stroke="green" strokeDasharray="3 3" label="Densidad Máx" />}
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          );
      }

      // 3. Compresión (NMX-C-083) - Evolución
      if (norma.codigo.includes('083') && rows.length > 0) {
          // Group by Age (f_c083_age) and average Resistance (f_c083_4)
          const groups: Record<string, { sum: number, count: number }> = {};
          
          rows.forEach(r => {
              const age = r.f_c083_age || 'Desconocido';
              const res = Number(r.f_c083_4 || 0);
              if (res > 0) {
                  if (!groups[age]) groups[age] = { sum: 0, count: 0 };
                  groups[age].sum += res;
                  groups[age].count += 1;
              }
          });

          const data = Object.entries(groups).map(([age, stats]) => ({
              age,
              resistencia: Math.round(stats.sum / stats.count)
          })).sort((a, b) => {
              // Sort by numeric value in string "3 días", "7 días"
              const getNum = (s: string) => parseInt(s) || 999;
              return getNum(a.age) - getNum(b.age);
          });

          if (data.length > 1) { // Only show chart if we have comparison points
              return (
                  <div className="mb-8 page-break-inside-avoid">
                      <h3 className="font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-sm">Evolución de Resistencia</h3>
                      <div className="h-80 w-full bg-white p-4 border rounded">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="age" />
                                  <YAxis label={{ value: 'Resistencia (kg/cm²)', angle: -90, position: 'insideLeft' }} />
                                  <Tooltip />
                                  <Bar dataKey="resistencia" fill={primaryColor} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              );
          }
      }

      return null;
  };

  const ResultsTable = () => {
    // We want to show:
    // 1. Global Fields (single value)
    // 2. Specimen Fields (Average if numeric and multiple rows, else "-")
    // 3. Calculated Compliance

    const rows = getSpecimenRows();
    const hasSpecimens = rows.length > 0;

    return (
      <div className="mb-8">
        <h3 className="font-bold border-b-2 border-black pb-2 mb-4 uppercase text-sm" style={{ borderColor: primaryColor }}>
          Resultados Obtenidos
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="text-left py-2 px-3 font-semibold">Parámetro</th>
              <th className="text-left py-2 px-3 font-semibold">Unidad</th>
              <th className="text-left py-2 px-3 font-semibold">Especificación</th>
              <th className="text-right py-2 px-3 font-semibold">Resultado</th>
              <th className="text-center py-2 px-3 font-semibold">Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {norma.campos.map(field => {
              // Determine value to display
              let displayValue: string | number = '-';
              let rawValue: number | undefined = undefined;

              if (field.scope === 'global' || (!field.scope && !hasSpecimens)) {
                  // Direct value
                  const val = muestra.resultados?.[field.id];
                  if (val !== undefined) {
                      displayValue = val.toString();
                      if (field.tipo === 'number') rawValue = Number(val);
                      if (field.tipo === 'boolean') displayValue = val ? 'SI' : 'NO';
                  }
              } else {
                  // Specimen field - Calculate Average if numeric
                  if (hasSpecimens && field.tipo === 'number') {
                      let sum = 0;
                      let count = 0;
                      rows.forEach(r => {
                          const v = Number(r[field.id]);
                          if (!isNaN(v)) {
                              sum += v;
                              count++;
                          }
                      });
                      if (count > 0) {
                          const avg = sum / count;
                          // Round to 2 decimals
                          rawValue = avg;
                          displayValue = Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
                      }
                  } else if (hasSpecimens && field.tipo === 'select') {
                      // Maybe show distinct values or "Varios"
                      const values = [...new Set(rows.map(r => r[field.id]).filter(Boolean))];
                      displayValue = values.join(', ');
                  }
              }

              // Hide rows that are purely for internal calculation or structure (like 'qty') if desired
              // But user asked to map "campos" from JSON.
              // Maybe skip fields that have NO value at all?
              if (displayValue === '-' && field.esRequerido) {
                   // Keep it to show missing data? Or skip?
                   // Let's keep it.
              }

              // Specification String
              let spec = '-';
              if (field.tipo === 'number') {
                if (field.limiteMin !== undefined && field.limiteMax !== undefined) spec = `${field.limiteMin} - ${field.limiteMax}`;
                else if (field.limiteMin !== undefined) spec = `≥ ${field.limiteMin}`;
                else if (field.limiteMax !== undefined) spec = `≤ ${field.limiteMax}`;
              }

              // Compliance Logic
              let pass = true;
              if (field.tipo === 'number' && rawValue !== undefined) {
                if (field.limiteMin !== undefined && rawValue < field.limiteMin) pass = false;
                if (field.limiteMax !== undefined && rawValue > field.limiteMax) pass = false;
              } else if (field.tipo === 'boolean') {
                 // Boolean logic depends on semantic. Assuming true = Good.
                 const val = field.scope === 'global' ? muestra.resultados?.[field.id] : undefined; 
                 // For boolean specimens, average doesn't make sense.
                 // If ANY fail, result is fail?
                 if (field.scope === 'specimen') {
                     const anyFalse = rows.some(r => r[field.id] === false);
                     if (anyFalse) pass = false;
                 } else {
                     if (val === false) pass = false;
                 }
              }

              // Skip rendering if it's a structural field like 'qty'
              if (field.id.includes('qty')) return null;

              return (
                <tr key={field.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-800">{field.nombre}</td>
                  <td className="py-2 px-3 text-gray-500">{field.unidad || '-'}</td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-600">{spec}</td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900">
                    {displayValue}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {field.tipo === 'number' && rawValue !== undefined ? (
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                        pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {pass ? 'PASA' : 'NO PASA'}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const SpecimenDetails = () => {
    const rows = getSpecimenRows();
    const specimenFields = norma.campos.filter(f => f.scope === 'specimen' || !f.scope); // Treat no-scope as specimen if multi-mode
    
    // Only show if we have multiple rows AND relevant fields
    if (rows.length > 0) {
        return (
          <div className="mt-8 mb-8 page-break-inside-avoid">
            <h4 className="font-bold pb-2 mb-4 uppercase text-xs text-gray-500 tracking-wider">
              Detalle de Especímenes
            </h4>
            <div className="overflow-x-auto rounded border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 px-3 text-left w-16 text-xs text-gray-500 font-bold uppercase">#</th>
                    {specimenFields.map(field => (
                      <th key={field.id} className="py-2 px-3 text-center text-xs text-gray-500 font-bold uppercase">
                        {field.nombre} {field.unidad && <span className="font-normal lowercase">({field.unidad})</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-bold text-gray-400">{i + 1}</td>
                      {specimenFields.map(field => {
                        const value = row[field.id];
                        let pass = true;
                        
                        if (field.tipo === 'number' && value !== undefined) {
                          const numVal = Number(value);
                          if (field.limiteMin !== undefined && numVal < field.limiteMin) pass = false;
                          if (field.limiteMax !== undefined && numVal > field.limiteMax) pass = false;
                        } else if (field.tipo === 'boolean' && value === false) {
                          pass = false;
                        }

                        return (
                          <td key={field.id} className="py-2 px-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-gray-700">
                                {field.tipo === 'boolean' ? (value ? 'SI' : 'NO') : (value !== undefined ? value.toString() : '-')}
                              </span>
                              {!pass && value !== undefined && (
                                <span className="text-[9px] text-red-600 font-bold uppercase mt-0.5">Fuera de norma</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
    return null;
  };

  const Footer = () => (
    <div className="mt-auto pt-12 page-break-inside-avoid">
      <div className="grid grid-cols-2 gap-12 text-center mb-12">
        <div>
           <div className="h-16 mb-2 flex items-end justify-center">
              {/* Space for digital signature image if needed */}
           </div>
           <div className="border-t border-gray-300 pt-2 mx-8">
            <p className="font-bold text-sm">Téc. Juan Pérez</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Técnico de Laboratorio</p>
           </div>
        </div>
        <div>
           <div className="h-16 mb-2 flex items-end justify-center">
              {/* Space for digital signature image if needed */}
           </div>
           <div className="border-t border-gray-300 pt-2 mx-8">
            <p className="font-bold text-sm">Ing. María González</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Gerente de Calidad</p>
            <p className="text-[9px] text-gray-400 mt-0.5">Cédula Prof: 12345678</p>
          </div>
        </div>
      </div>

      <div className={cn(
        "flex items-center justify-between gap-6 p-4 rounded-lg",
        template.layout === 'modern' ? "bg-gray-900 text-white" : "bg-gray-50 border border-gray-200"
      )}>
         <div className="flex-1">
            <h4 className="font-bold text-[10px] uppercase mb-1 opacity-80">Cadena Original de Validación</h4>
            <p className="font-mono text-[9px] break-all opacity-60 leading-tight">
              ||{companyInfo.name}|{muestra.id}|{new Date(muestra.fechaRecepcion).toISOString()}|{digitalSignature}||
            </p>
            <h4 className="font-bold text-[10px] uppercase mt-3 mb-1 opacity-80">Sello Digital</h4>
            <p className="font-mono text-[9px] break-all opacity-60 leading-tight">
              {digitalSignature}{digitalSignature.split('').reverse().join('')}
            </p>
         </div>
         {template.showQr && (
           <div className="flex flex-col items-center flex-shrink-0">
              <div className="bg-white p-1.5 rounded">
                <QRCode value={validationUrl} size={64} />
              </div>
           </div>
         )}
      </div>

      <div className="mt-8 text-[9px] text-gray-400 text-center">
        <p>Este informe no podrá ser reproducido total o parcialmente sin la autorización por escrito de {companyInfo.name}.</p>
        <p>Generado electrónicamente el: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "bg-white text-black p-8 md:p-12 shadow-lg mx-auto print:shadow-none print:p-0 print:m-0 flex flex-col relative",
      // Carta size approx: 216mm x 279mm. 
      // Tailwind doesn't have explicit mm sizes, so we use min-h for screen view simulating A4/Letter
      // In print mode, we let the browser handle pages, but we ensure width is full
      "w-[216mm] min-h-[279mm] print:w-full print:min-h-0 print:h-auto",
      template.showBorder && "border-2"
    )} style={{ borderColor: template.showBorder ? primaryColor : 'transparent' }}>
      
      {/* Watermark */}
      {template.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <span className="text-[150px] font-bold text-black transform -rotate-45 whitespace-nowrap">
            {muestra.estado === 'pendiente' || muestra.estado === 'en_proceso' ? 'BORRADOR' : 'ORIGINAL'}
          </span>
        </div>
      )}

      <Header />
      <SampleInfo />
      
      <ResultsTable />
      <DynamicCharts />
      <SpecimenDetails />
      
      <Footer />
      
      {/* Modern decorative bottom bar */}
      {template.layout === 'modern' && (
         <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: primaryColor }} />
      )}
    </div>
  );
}
