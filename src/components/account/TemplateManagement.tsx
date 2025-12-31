import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useData } from '../../context/DataContext';
import { useCompany } from '../../context/CompanyContext';
import { CertificateTemplate } from '../../data/mockData';
import { Plus, Edit, Trash2, CheckCircle, Layout, Eye, QrCode, Droplet, Square } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MobileFormActions } from '../common/MobileFormActions';

// --- PREVIEW COMPONENTS ---

const PreviewCertificate = ({ 
  template, 
  companyInfo 
}: { 
  template: Partial<CertificateTemplate>, 
  companyInfo: any 
}) => {
  const primaryColor = template.primaryColor || '#000000';
  
  // Dummy Content
  const Content = () => (
    <div className="space-y-2 mt-4 text-[6px] text-gray-400">
      <div className="flex justify-between border-b pb-1">
        <span>Muestra: MUE-2024-001</span>
        <span>Fecha: 2024-03-20</span>
      </div>
      <div className="space-y-1">
        <div className="h-1 bg-gray-100 w-full" />
        <div className="h-1 bg-gray-100 w-full" />
        <div className="h-1 bg-gray-100 w-3/4" />
      </div>
      <div className="grid grid-cols-4 gap-1 mt-2">
        <div className="h-8 bg-gray-50 rounded" />
        <div className="h-8 bg-gray-50 rounded" />
        <div className="h-8 bg-gray-50 rounded" />
        <div className="h-8 bg-gray-50 rounded" />
      </div>
    </div>
  );

  const Footer = () => (
    <div className="mt-auto pt-2 flex items-end justify-between">
      <div className="text-[5px] text-gray-400 w-2/3">
        {companyInfo.address} • {companyInfo.phone}
      </div>
      {template.showQr && (
        <div className="h-6 w-6 bg-gray-200 flex items-center justify-center">
          <QrCode className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  );

  const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div 
      className={cn(
        "aspect-[210/297] bg-white w-full shadow-sm p-4 flex flex-col relative overflow-hidden transition-all", 
        template.showBorder && "border-2",
        className
      )}
      style={{ borderColor: template.showBorder ? primaryColor : 'transparent' }}
    >
      {template.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none transform -rotate-45">
          <span className="text-4xl font-bold text-black">BORRADOR</span>
        </div>
      )}
      {children}
    </div>
  );

  if (template.layout === 'modern') {
    return (
      <Container>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-400 overflow-hidden">
              {companyInfo.logoUrl ? <img src={companyInfo.logoUrl} className="w-full h-full object-cover" /> : 'LOGO'}
            </div>
            <div>
              <div className="font-bold text-[8px] uppercase tracking-wider text-gray-800">{companyInfo.name}</div>
              <div className="text-[5px] text-gray-500">INFORME DE RESULTADOS</div>
            </div>
          </div>
          <div className="h-8 w-1 bg-gray-200" style={{ backgroundColor: primaryColor }} />
        </div>
        <div className="h-1 w-full mb-2" style={{ backgroundColor: primaryColor }} />
        <Content />
        <Footer />
      </Container>
    );
  }

  if (template.layout === 'minimal') {
    return (
      <Container>
        <div className="text-center mb-6">
          <div className="font-bold text-[10px] uppercase tracking-widest mb-1">{companyInfo.name}</div>
          <div className="text-[5px] text-gray-400">{companyInfo.city}</div>
        </div>
        <Content />
        <Footer />
      </Container>
    );
  }

  if (template.layout === 'bold') {
    return (
      <Container className="bg-gray-50">
        <div className="bg-gray-800 text-white p-3 -mx-4 -mt-4 mb-4" style={{ backgroundColor: primaryColor }}>
          <div className="flex justify-between items-center">
            <div className="font-bold text-[10px]">{companyInfo.name}</div>
            <div className="text-[6px] opacity-80">CERTIFICADO DE CALIDAD</div>
          </div>
        </div>
        <div className="bg-white p-2 shadow-sm flex-1 flex flex-col">
           <Content />
           <Footer />
        </div>
      </Container>
    );
  }

  // Classic Default
  return (
    <Container>
      <div className="flex items-start justify-between border-b pb-2 mb-2" style={{ borderColor: primaryColor }}>
        <div className="h-8 w-8 bg-gray-100 flex items-center justify-center text-[6px] text-gray-400">
           {companyInfo.logoUrl ? <img src={companyInfo.logoUrl} className="w-full h-full object-cover" /> : 'LOGO'}
        </div>
        <div className="text-right">
          <div className="font-bold text-[9px] text-gray-800">{companyInfo.name}</div>
          <div className="text-[5px] text-gray-500">{companyInfo.address}</div>
        </div>
      </div>
      <div className="text-center font-bold text-[8px] mb-2 uppercase" style={{ color: primaryColor }}>Informe de Ensayo</div>
      <Content />
      <Footer />
    </Container>
  );
};


export default function TemplateManagement() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useData();
  const { companyInfo } = useCompany();
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentTemplate, setCurrentTemplate] = useState<Partial<CertificateTemplate>>({
    name: '',
    layout: 'classic',
    primaryColor: '#000000',
    showWatermark: true,
    showQr: true,
    showBorder: true,
    isDefault: false
  });

  const handleEdit = (template: CertificateTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      deleteTemplate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      updateTemplate(id, { ...template, isDefault: true });
    }
  };

  const handleCreate = () => {
    setCurrentTemplate({
      name: '',
      layout: 'classic',
      primaryColor: '#000000',
      showWatermark: false,
      showQr: true,
      showBorder: true,
      isDefault: false
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate.name) return;

    if (currentTemplate.id) {
      updateTemplate(currentTemplate.id, currentTemplate);
    } else {
      addTemplate(currentTemplate as Omit<CertificateTemplate, 'id'>);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Editor Column */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{currentTemplate.id ? 'Editar Modelo' : 'Nuevo Modelo'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <Input
                label="Nombre de la Configuración"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                placeholder="Ej. Certificado Cliente General"
                required
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecciona un Diseño Base</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'classic', name: 'Clásico' },
                    { id: 'modern', name: 'Moderno' },
                    { id: 'minimal', name: 'Minimalista' },
                    { id: 'bold', name: 'Industrial' }
                  ].map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => setCurrentTemplate({ ...currentTemplate, layout: layout.id as any })}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all hover:bg-accent",
                        currentTemplate.layout === layout.id ? "border-primary bg-primary/5" : "border-transparent bg-secondary"
                      )}
                    >
                      <Layout className="h-6 w-6 mb-2 text-muted-foreground" />
                      <span className="text-xs font-medium">{layout.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium">Personalización Visual</h3>
                
                <div className="flex items-center justify-between">
                   <label className="text-sm text-muted-foreground">Color de Acento</label>
                   <div className="flex items-center gap-2">
                     <input
                        type="color"
                        value={currentTemplate.primaryColor}
                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, primaryColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                     />
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="checkbox"
                      checked={currentTemplate.showBorder}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, showBorder: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Square className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Mostrar Borde Exterior</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="checkbox"
                      checked={currentTemplate.showQr}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, showQr: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Incluir Código QR de Validación</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="checkbox"
                      checked={currentTemplate.showWatermark}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, showWatermark: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Droplet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Marca de Agua "Borrador" (en preliminares)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={currentTemplate.isDefault}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-foreground">
                  Usar como plantilla predeterminada
                </label>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Guardar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Column */}
        <div className="flex flex-col gap-4">
          <div className="bg-muted/30 border rounded-lg p-4 flex items-center justify-center flex-1 min-h-[400px]">
            <div className="w-full max-w-[320px] shadow-2xl transform transition-transform hover:scale-[1.02]">
              <PreviewCertificate template={currentTemplate} companyInfo={companyInfo} />
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Vista previa aproximada con los datos de tu empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Plantillas de Certificados</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los diseños para la emisión de informes y certificados.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className={cn(
                "border rounded-lg p-4 space-y-3 transition-all hover:shadow-md bg-card",
                template.isDefault && "ring-1 ring-primary"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {template.name}
                    {template.isDefault && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Default
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize flex items-center gap-1 mt-1">
                    <Layout className="h-3 w-3" />
                    {template.layout}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!template.isDefault && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleSetDefault(template.id)}
                      title="Establecer como predeterminado"
                    >
                      Usar
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Mini Preview in List */}
              <div className="mt-2 border rounded overflow-hidden opacity-90 pointer-events-none transform scale-95 origin-top-left w-full">
                 <PreviewCertificate template={template} companyInfo={companyInfo} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
