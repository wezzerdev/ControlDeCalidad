import React from 'react';
import QRCode from 'react-qr-code';
import { Muestra, Proyecto, Norma, CertificateTemplate as TemplateConfig } from '../../data/mockData';
import { CompanyInfo } from '../../context/CompanyContext';
import { cn } from '../../lib/utils';

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
  // In a real app, this would be a cryptographic signature stored in DB
  const signatureBase = `${muestra.id}-${muestra.fechaRecepcion}-${muestra.estado}`;
  const digitalSignature = btoa(signatureBase).substring(0, 32);

  // --- SUB-COMPONENTS ---

  const Header = () => {
    if (template.layout === 'modern') {
      return (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {companyInfo.logoUrl && (
               <img src={companyInfo.logoUrl} alt="Logo" className="h-16 w-16 object-cover rounded-full bg-gray-50 p-1" />
            )}
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">{companyInfo.name}</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Informe de Resultados</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold text-gray-200">#{muestra.codigo.split('-')[2]}</div>
          </div>
        </div>
      );
    }
    
    if (template.layout === 'minimal') {
      return (
        <div className="text-center mb-12">
          {companyInfo.logoUrl && (
             <img src={companyInfo.logoUrl} alt="Logo" className="h-12 w-auto mx-auto mb-4 grayscale opacity-80" />
          )}
          <h1 className="text-lg font-bold uppercase tracking-[0.2em]">{companyInfo.name}</h1>
          <p className="text-xs text-gray-400 mt-1">{companyInfo.city}</p>
        </div>
      );
    }

    if (template.layout === 'bold') {
       return (
         <div className="bg-gray-900 text-white p-6 -mx-8 -mt-8 mb-8 flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
            <div>
               <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
               <p className="opacity-80 text-sm">CERTIFICADO DE CALIDAD</p>
            </div>
            {companyInfo.logoUrl && (
               <img src={companyInfo.logoUrl} alt="Logo" className="h-12 w-12 object-contain bg-white rounded p-1" />
            )}
         </div>
       );
    }

    // Classic
    return (
      <div className="border-b-2 border-black pb-6 mb-8 flex justify-between items-start" style={{ borderColor: primaryColor }}>
        <div className="flex items-center gap-6">
          {companyInfo.logoUrl && (
            <img src={companyInfo.logoUrl} alt="Logo" className="h-20 w-auto object-contain max-w-[150px]" />
          )}
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">{companyInfo.name}</h1>
            <p className="text-sm mt-1">{companyInfo.address}</p>
            <p className="text-sm">{companyInfo.city}</p>
            <p className="text-sm">Tel: {companyInfo.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">INFORME DE ENSAYO</h2>
          <p className="text-lg font-mono mt-2">{muestra.codigo}</p>
          <div className="mt-2 inline-block px-3 py-1 border border-black rounded uppercase text-sm font-bold">
            {muestra.estado}
          </div>
        </div>
      </div>
    );
  };

  const SampleInfo = () => {
    const isModern = template.layout === 'modern';
    
    return (
      <div className={cn(
        "mb-8 text-sm",
        isModern ? "bg-gray-50 p-6 rounded-xl" : "bg-white border p-4",
        template.layout === 'minimal' && "border-none bg-transparent p-0 grid grid-cols-2 gap-8"
      )} style={{ borderColor: isModern ? 'transparent' : '#e5e7eb' }}>
        
        {template.layout !== 'minimal' && (
           <h3 className="font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-xs text-gray-500">
             Información de la Muestra
           </h3>
        )}

        <div className={cn("grid gap-4", template.layout === 'minimal' ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3")}>
            <div>
              <span className="block text-gray-400 text-xs uppercase">Cliente</span>
              <span className="font-medium">{proyecto.cliente}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase">Proyecto</span>
              <span className="font-medium">{proyecto.nombre}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase">Ubicación</span>
              <span className="font-medium">{muestra.ubicacion}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase">Material</span>
              <span className="font-medium">{muestra.tipoMaterial}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase">Fecha Recepción</span>
              <span className="font-medium">{new Date(muestra.fechaRecepcion).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs uppercase">Norma</span>
              <span className="font-medium">{norma.codigo}</span>
            </div>
        </div>
      </div>
    );
  };

  const ResultsTable = () => (
    <div className="mb-8">
      <h3 className="font-bold border-b-2 border-black pb-2 mb-4 uppercase text-sm" style={{ borderColor: primaryColor }}>
        Resultados Obtenidos
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className={cn(
            "border-b", 
            template.layout === 'modern' ? "bg-gray-100 border-none" : "bg-gray-50 border-gray-300"
          )}>
            <th className="text-left py-2 px-3 font-semibold">Parámetro</th>
            <th className="text-left py-2 px-3 font-semibold">Unidad</th>
            <th className="text-left py-2 px-3 font-semibold">Especificación</th>
            <th className="text-right py-2 px-3 font-semibold">Resultado</th>
            <th className="text-center py-2 px-3 font-semibold">Cumplimiento</th>
          </tr>
        </thead>
        <tbody>
          {norma.campos.filter(f => f.scope !== 'specimen').map(field => {
            const value = muestra.resultados?.[field.id];
            let spec = '-';
            if (field.tipo === 'number') {
              if (field.limiteMin !== undefined && field.limiteMax !== undefined) spec = `${field.limiteMin} - ${field.limiteMax}`;
              else if (field.limiteMin !== undefined) spec = `≥ ${field.limiteMin}`;
              else if (field.limiteMax !== undefined) spec = `≤ ${field.limiteMax}`;
            }

            let pass = true;
            if (field.tipo === 'number' && value !== undefined) {
              const numVal = Number(value);
              if (field.limiteMin !== undefined && numVal < field.limiteMin) pass = false;
              if (field.limiteMax !== undefined && numVal > field.limiteMax) pass = false;
            } else if (field.tipo === 'boolean' && value === false) {
              pass = false;
            }

            return (
              <tr key={field.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="py-2 px-3">{field.nombre}</td>
                <td className="py-2 px-3 text-gray-500">{field.unidad || '-'}</td>
                <td className="py-2 px-3 font-mono text-xs text-gray-600">{spec}</td>
                <td className="py-2 px-3 text-right font-medium">
                  {field.tipo === 'boolean' ? (value ? 'SI' : 'NO') : (value !== undefined ? value.toString() : '-')}
                </td>
                <td className="py-2 px-3 text-center">
                  {value !== undefined && field.tipo !== 'select' && field.tipo !== 'text' ? (
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                      pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {pass ? 'CUMPLE' : 'NO CUMPLE'}
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

  const SpecimenDetails = () => {
    // Logic to find qty field and specimen fields
    const qtyField = norma.campos.find(f => 
      f.id.includes('qty') || f.nombre.toLowerCase().includes('cantidad') || f.nombre.toLowerCase().includes('número')
    );
    const specimenFields = norma.campos.filter(f => f.scope === 'specimen');
    
    if (qtyField && muestra.resultados?.[qtyField.id] && specimenFields.length > 0) {
      const count = Number(muestra.resultados[qtyField.id]);
      if (count > 0) {
        return (
          <div className="mt-8 mb-8">
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
                  {Array.from({ length: count }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-bold text-gray-400">{i + 1}</td>
                      {specimenFields.map(field => {
                        const key = `${field.id}_${i}`;
                        const value = muestra.resultados?.[key];
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
                              {!pass && (
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
    }
    return null;
  };

  const Footer = () => (
    <div className="mt-auto pt-12">
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
      "bg-white text-black p-8 md:p-12 shadow-lg max-w-4xl mx-auto print:shadow-none print:p-0 print:max-w-none flex flex-col min-h-[1123px] relative",
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
      <SpecimenDetails />
      <Footer />
      
      {/* Modern decorative bottom bar */}
      {template.layout === 'modern' && (
         <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: primaryColor }} />
      )}
    </div>
  );
}
