import React, { useRef } from 'react';
import { Muestra, Proyecto, Norma } from '../../data/mockData';
import { Button } from '../common/Button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useData } from '../../context/DataContext';
import { CertificateTemplate } from './CertificateTemplate';

interface CertificadoViewProps {
  muestra: Muestra;
  proyecto: Proyecto;
  norma: Norma;
  onBack: () => void;
}

export function CertificadoView({ muestra, proyecto, norma, onBack }: CertificadoViewProps) {
  const { companyInfo } = useCompany();
  const { templates } = useData();
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Get active template
  const activeTemplate = templates.find(t => t.isDefault) || templates[0] || {
    id: 'default',
    name: 'Default',
    layout: 'classic',
    primaryColor: '#000000',
    showWatermark: true,
    showQr: true,
    showBorder: true,
    isDefault: true
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Guardar como PDF
          </Button>
        </div>
      </div>

      <div ref={componentRef} className="print:w-full">
        <CertificateTemplate
            muestra={muestra}
            proyecto={proyecto}
            norma={norma}
            companyInfo={companyInfo}
            template={activeTemplate}
        />
      </div>
    </div>
  );
}
