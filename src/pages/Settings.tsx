import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Save, Building, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function Settings() {
  const { companyInfo, updateCompanyInfo } = useCompany();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<any>(companyInfo || {
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    logoUrl: '',
    planId: 'free'
  });

  // Sync state if context changes (though unlikely while mounted)
  useEffect(() => {
    if (companyInfo) {
      setFormData(companyInfo);
    }
  }, [companyInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        addToast('La imagen no debe superar los 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(formData);
    addToast('Información de la empresa actualizada correctamente', 'success');
  };
  
  if (!companyInfo) {
    return (
      <div className="p-8 text-center border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">No tienes una empresa configurada.</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
            El sistema está intentando crear tu empresa automáticamente. Si este mensaje persiste, contacta a soporte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
      </div>
      */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle>Información de la Empresa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Estos datos aparecerán en los encabezados de los informes y certificados generados.
              </p>
              
              <Input
                label="Nombre de la Empresa"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. LABORATORIO DE CONSTRUCCIÓN"
                required
              />
              
              <Input
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ej. Av. Principal 123, Zona Industrial"
                required
              />
              
              <Input
                label="Ciudad / Estado"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ej. Ciudad de México, CDMX"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej. (55) 1234-5678"
                  required
                />
                
                <Input
                  label="Email de Contacto"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ej. contacto@laboratorio.com"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <CardTitle>Logo y Marca</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-full h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center relative bg-muted/20 overflow-hidden">
                {formData.logoUrl ? (
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo Empresa" 
                    className="max-h-full max-w-full object-contain p-4" 
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p>No hay logo seleccionado</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Button type="button" variant="outline" className="w-full relative cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Imagen
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
                {formData.logoUrl && (
                  <Button type="button" variant="destructive" onClick={removeLogo}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Formatos recomendados: PNG, JPG. Tamaño máximo: 2MB.
                <br />
                Este logo se mostrará en la parte superior izquierda de los informes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
