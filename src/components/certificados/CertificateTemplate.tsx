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
  // (Same sub-components logic, keeping them concise for SearchReplace match context if needed, 
  // but since we are replacing the return, I will focus on the return part and the styles injection)

  // ... (Sub-components definitions remain same, assuming they are inside the function scope) ...
  // To avoid huge replacement, I will assume sub-components are fine and I'm targeting the return statement block mostly.
  // But wait, SearchReplace needs context. I will fetch the file content again to be sure about lines.

  const Header = () => {
    return (
      <div className={cn("mb-6 flex justify-between items-start border-b-2 pb-4", template.layout === 'modern' ? "border-transparent" : "border-black")} style={{ borderColor: template.layout === 'modern' ? 'transparent' : primaryColor }}>
        <div className="flex items-center gap-4">
          {companyInfo.logoUrl && (
            <img src={companyInfo.logoUrl} alt="Logo" className="h-16 w-auto object-contain max-w-[120px]" />
          )}
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wider text-gray-900 leading-tight">{companyInfo.name}</h1>
            <p className="text-xs mt-1 text-gray-600">{companyInfo.address}</p>
            <p className="text-xs text-gray-600">{companyInfo.city}</p>
            <p className="text-xs text-gray-600">Tel: {companyInfo.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-800">INFORME DE ENSAYO</h2>
          <p className="text-base font-mono mt-1 text-gray-700">{muestra.codigo}</p>
          <div className="mt-1 inline-block px-2 py-0.5 border border-black rounded uppercase text-xs font-bold">
            {muestra.estado}
          </div>
        </div>
      </div>
    );
  };

  const SampleInfo = () => {
    const gps = muestra.resultados?.['gps'] || muestra.resultados?.['gpsLocation']; 
    return (
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs">
        <h3 className="font-bold border-b border-gray-200 pb-1 mb-3 uppercase text-[10px] text-gray-500 tracking-wider">
             Información de la Muestra
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
            <div>
              <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Cliente</span>
              <span className="font-medium text-gray-900">{proyecto.cliente}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Proyecto</span>
              <span className="font-medium text-gray-900">{proyecto.nombre}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Ubicación / GPS</span>
              <span className="font-medium text-gray-900 block truncate" title={muestra.ubicacion}>
                  {muestra.ubicacion}
              </span>
              {gps && <span className="block text-[10px] font-mono text-gray-500 mt-0.5">GPS: {gps}</span>}
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Material</span>
              <span className="font-medium text-gray-900">{muestra.tipoMaterial || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Proveedor</span>
              <span className="font-medium text-gray-900">{muestra.proveedor || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Recepción</span>
              <span className="font-medium text-gray-900">{new Date(muestra.fechaRecepcion).toLocaleDateString()}</span>
            </div>
            <div>
               <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Norma</span>
               <span className="font-medium text-gray-900">{norma.codigo}</span>
            </div>
             <div>
               <span className="block text-gray-400 text-[10px] uppercase mb-0.5">Emisión</span>
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
          const data = rows.map(r => ({
              mesh: r.f_c077_mesh,
              pass: Number(r.f_c077_pass || 0)
          })).filter(d => d.mesh);

          return (
              <div className="mb-6 page-break-inside-avoid">
                  <h3 className="font-bold border-b border-gray-200 pb-1 mb-3 uppercase text-xs">Curva Granulométrica</h3>
                  <div className="h-64 w-full bg-white p-2 border rounded">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mesh" label={{ value: 'Tamiz', position: 'insideBottom', offset: -5, fontSize: 10 }} tick={{fontSize: 10}} />
                            <YAxis domain={[0, 100]} label={{ value: '% Que Pasa', angle: -90, position: 'insideLeft', fontSize: 10 }} tick={{fontSize: 10}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="pass" stroke={primaryColor} strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
              </div>
          );
      }

      // 2. Proctor (NMX-C-416)
      if (norma.codigo.includes('416') && rows.length > 0) {
          const data = rows.map(r => ({
              x: Number(r.f_c416_h || 0),
              y: Number(r.f_c416_d || 0)
          })).sort((a, b) => a.x - b.x);
          const optHum = Number(muestra.resultados?.['f_c416_opt'] || 0);
          const maxDen = Number(muestra.resultados?.['f_c416_max'] || 0);

          return (
              <div className="mb-6 page-break-inside-avoid">
                  <h3 className="font-bold border-b border-gray-200 pb-1 mb-3 uppercase text-xs">Curva de Compactación</h3>
                  <div className="h-64 w-full bg-white p-2 border rounded">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="x" type="number" domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Humedad (%)', position: 'insideBottom', offset: -5, fontSize: 10 }} tick={{fontSize: 10}} />
                              <YAxis dataKey="y" type="number" domain={['auto', 'auto']} label={{ value: 'Densidad Seca (kg/m³)', angle: -90, position: 'insideLeft', fontSize: 10 }} tick={{fontSize: 10}} />
                              <Tooltip />
                              <Line type="monotone" dataKey="y" stroke={primaryColor} strokeWidth={2} dot={{ r: 4 }} />
                              {optHum > 0 && <ReferenceLine x={optHum} stroke="red" strokeDasharray="3 3" />}
                              {maxDen > 0 && <ReferenceLine y={maxDen} stroke="green" strokeDasharray="3 3" />}
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          );
      }

      // 3. Compresión (NMX-C-083)
      if (norma.codigo.includes('083') && rows.length > 0) {
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
              const getNum = (s: string) => parseInt(s) || 999;
              return getNum(a.age) - getNum(b.age);
          });

          if (data.length > 1) {
              return (
                  <div className="mb-6 page-break-inside-avoid">
                      <h3 className="font-bold border-b border-gray-200 pb-1 mb-3 uppercase text-xs">Evolución de Resistencia</h3>
                      <div className="h-64 w-full bg-white p-2 border rounded">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="age" tick={{fontSize: 10}} />
                                  <YAxis label={{ value: 'Resistencia (kg/cm²)', angle: -90, position: 'insideLeft', fontSize: 10 }} tick={{fontSize: 10}} />
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
    const rows = getSpecimenRows();
    const hasSpecimens = rows.length > 0;

    return (
      <div className="mb-6">
        <h3 className="font-bold border-b-2 border-black pb-1 mb-3 uppercase text-xs" style={{ borderColor: primaryColor }}>
          Resultados Obtenidos
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="text-left py-1.5 px-2 font-semibold">Parámetro</th>
              <th className="text-left py-1.5 px-2 font-semibold">Unidad</th>
              <th className="text-left py-1.5 px-2 font-semibold">Especificación</th>
              <th className="text-right py-1.5 px-2 font-semibold">Resultado</th>
              <th className="text-center py-1.5 px-2 font-semibold">Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {norma.campos.map(field => {
              let displayValue: string | number = '-';
              let rawValue: number | undefined = undefined;

              if (field.scope === 'global' || (!field.scope && !hasSpecimens)) {
                  const val = muestra.resultados?.[field.id];
                  if (val !== undefined) {
                      displayValue = val.toString();
                      if (field.tipo === 'number') rawValue = Number(val);
                      if (field.tipo === 'boolean') displayValue = val ? 'SI' : 'NO';
                  }
              } else {
                  if (hasSpecimens && field.tipo === 'number') {
                      let sum = 0;
                      let count = 0;
                      rows.forEach(r => {
                          const v = Number(r[field.id]);
                          if (!isNaN(v)) { sum += v; count++; }
                      });
                      if (count > 0) {
                          const avg = sum / count;
                          rawValue = avg;
                          displayValue = Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
                      }
                  } else if (hasSpecimens && field.tipo === 'select') {
                      const values = [...new Set(rows.map(r => r[field.id]).filter(Boolean))];
                      displayValue = values.join(', ');
                  }
              }

              if (displayValue === '-' && field.esRequerido) { }
              
              let spec = '-';
              if (field.tipo === 'number') {
                if (field.limiteMin !== undefined && field.limiteMax !== undefined) spec = `${field.limiteMin} - ${field.limiteMax}`;
                else if (field.limiteMin !== undefined) spec = `≥ ${field.limiteMin}`;
                else if (field.limiteMax !== undefined) spec = `≤ ${field.limiteMax}`;
              }

              let pass = true;
              if (field.tipo === 'number' && rawValue !== undefined) {
                if (field.limiteMin !== undefined && rawValue < field.limiteMin) pass = false;
                if (field.limiteMax !== undefined && rawValue > field.limiteMax) pass = false;
              } else if (field.tipo === 'boolean') {
                 const val = field.scope === 'global' ? muestra.resultados?.[field.id] : undefined; 
                 if (field.scope === 'specimen') {
                     const anyFalse = rows.some(r => r[field.id] === false);
                     if (anyFalse) pass = false;
                 } else {
                     if (val === false) pass = false;
                 }
              }

              if (field.id.includes('qty')) return null;

              return (
                <tr key={field.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-1.5 px-2 text-gray-800">{field.nombre}</td>
                  <td className="py-1.5 px-2 text-gray-500">{field.unidad || '-'}</td>
                  <td className="py-1.5 px-2 font-mono text-[10px] text-gray-600">{spec}</td>
                  <td className="py-1.5 px-2 text-right font-medium text-gray-900">{displayValue}</td>
                  <td className="py-1.5 px-2 text-center">
                    {field.tipo === 'number' && rawValue !== undefined ? (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide",
                        pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {pass ? 'PASA' : 'NO'}
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
    const specimenFields = norma.campos.filter(f => f.scope === 'specimen' || !f.scope);
    
    if (rows.length > 0) {
        return (
          <div className="mt-6 mb-6 page-break-inside-avoid">
            <h4 className="font-bold pb-1 mb-3 uppercase text-[10px] text-gray-500 tracking-wider">
              Detalle de Especímenes
            </h4>
            <div className="overflow-x-auto rounded border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-1.5 px-2 text-left w-10 text-[10px] text-gray-500 font-bold uppercase">#</th>
                    {specimenFields.map(field => (
                      <th key={field.id} className="py-1.5 px-2 text-center text-[10px] text-gray-500 font-bold uppercase">
                        {field.nombre} {field.unidad && <span className="font-normal lowercase">({field.unidad})</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1.5 px-2 font-bold text-gray-400">{i + 1}</td>
                      {specimenFields.map(field => {
                        const value = row[field.id];
                        let pass = true;
                        if (field.tipo === 'number' && value !== undefined) {
                          const numVal = Number(value);
                          if (field.limiteMin !== undefined && numVal < field.limiteMin) pass = false;
                          if (field.limiteMax !== undefined && numVal > field.limiteMax) pass = false;
                        } else if (field.tipo === 'boolean' && value === false) pass = false;

                        return (
                          <td key={field.id} className="py-1.5 px-2 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-gray-700">
                                {field.tipo === 'boolean' ? (value ? 'SI' : 'NO') : (value !== undefined ? value.toString() : '-')}
                              </span>
                              {!pass && value !== undefined && (
                                <span className="text-[8px] text-red-600 font-bold uppercase mt-0.5">Fuera</span>
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

  const PhotoEvidence = () => {
    if (!muestra.evidenciaFotografica || muestra.evidenciaFotografica.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="font-bold border-b border-gray-200 pb-1 mb-3 uppercase text-xs">Evidencia Fotográfica</h3>
        <div className="grid grid-cols-2 gap-4">
          {muestra.evidenciaFotografica.slice(0, 4).map((foto, index) => (
            <div key={index} className="aspect-video rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
               <img src={foto} alt={`Evidencia ${index+1}`} className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LegalFooter = ({ pageText }: { pageText: string }) => (
    <div className="absolute bottom-[15mm] left-[15mm] right-[15mm]">
        <div className="flex justify-between items-end text-[8px] text-gray-400 border-t border-gray-100 pt-2">
            <div className="w-12"></div> {/* Spacer for balance */}
            <p className="text-center flex-1">
                Este informe no podrá ser reproducido total o parcialmente sin la autorización por escrito de {companyInfo.name}.
                <br />
                Generado electrónicamente el: {new Date().toLocaleString()}
            </p>
            <div className="w-12 text-right">
                <span>{pageText}</span>
            </div>
        </div>
    </div>
  );

  const FooterContent = () => (
    <div className="w-full mb-8"> {/* mb-8 to give space for LegalFooter if flow reaches bottom, though LegalFooter is absolute */}
      <div className="grid grid-cols-2 gap-8 text-center mb-8">
        <div>
           <div className="h-12 mb-1 flex items-end justify-center"></div>
           <div className="border-t border-gray-300 pt-1 mx-4">
            <p className="font-bold text-xs">Téc. Juan Pérez</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wide">Técnico</p>
           </div>
        </div>
        <div>
           <div className="h-12 mb-1 flex items-end justify-center"></div>
           <div className="border-t border-gray-300 pt-1 mx-4">
            <p className="font-bold text-xs">Ing. María González</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wide">Gerente de Calidad</p>
            <p className="text-[8px] text-gray-400 mt-0.5">Cédula: 12345678</p>
          </div>
        </div>
      </div>

      <div className={cn(
        "flex items-center justify-between gap-4 p-3 rounded-lg",
        template.layout === 'modern' ? "bg-gray-900 text-white" : "bg-gray-50 border border-gray-200"
      )}>
         <div className="flex-1">
            <h4 className="font-bold text-[9px] uppercase mb-0.5 opacity-80">Cadena de Validación</h4>
            <p className="font-mono text-[8px] break-all opacity-60 leading-tight">
              ||{companyInfo.name}|{muestra.id}|{new Date(muestra.fechaRecepcion).toISOString()}|{digitalSignature}||
            </p>
            <h4 className="font-bold text-[9px] uppercase mt-2 mb-0.5 opacity-80">Sello Digital</h4>
            <p className="font-mono text-[8px] break-all opacity-60 leading-tight">
              {digitalSignature}{digitalSignature.split('').reverse().join('')}
            </p>
         </div>
         {template.showQr && (
           <div className="flex flex-col items-center flex-shrink-0">
              <div className="bg-white p-1 rounded">
                <QRCode value={validationUrl} size={48} />
              </div>
           </div>
         )}
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: Letter portrait;
              margin: 0mm;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-page {
                width: 215.9mm;
                height: 279.4mm; /* Force fixed height for print pages */
                padding: 15mm;
                position: relative;
                page-break-after: always;
                display: flex;
                flex-direction: column;
                overflow: hidden; /* Prevent spillover */
            }
            .print-page:last-child {
                page-break-after: auto;
            }
          }
        `}
      </style>
      
      <div className="bg-gray-100 p-8 print:p-0 print:bg-white">
        
        {/* PAGE 1: Content */}
        <div className={cn(
            "bg-white text-black shadow-lg mx-auto flex flex-col relative mb-8 print:mb-0",
            "w-[215.9mm] min-h-[279.4mm] p-[15mm]",
            "print:w-[215.9mm] print:h-[279.4mm] print:shadow-none print:break-after-page print-page"
        )} style={{ borderColor: template.showBorder ? primaryColor : 'transparent', borderWidth: template.showBorder ? '2px' : '0' }}>
            
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
            
            {/* Page 1 Footer */}
            <LegalFooter pageText="Página 1/2" />

            {/* Modern decorative bottom bar */}
            {template.layout === 'modern' && (
            <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: primaryColor }} />
            )}
        </div>

        {/* PAGE 2: Signatures & QR */}
        <div className={cn(
            "bg-white text-black shadow-lg mx-auto flex flex-col relative",
            "w-[215.9mm] min-h-[279.4mm] p-[15mm]",
            "print:w-[215.9mm] print:h-[279.4mm] print:shadow-none print-page"
        )} style={{ borderColor: template.showBorder ? primaryColor : 'transparent', borderWidth: template.showBorder ? '2px' : '0' }}>
             
             {/* Header repeated on Page 2 */}
             <Header />
             
             <div className="flex-grow">
               <PhotoEvidence />
             </div>
             
             <FooterContent />
             
             {/* Spacer for LegalFooter */}
             <div className="h-8"></div>

             {/* Page 2 Footer */}
             <LegalFooter pageText="Página 2/2" />

             {/* Modern decorative bottom bar */}
             {template.layout === 'modern' && (
                <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: primaryColor }} />
             )}
        </div>

      </div>
    </>
  );
}
