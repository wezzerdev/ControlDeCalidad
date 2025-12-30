import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Lock, 
  MapPin, 
  Calendar, 
  FileText, 
  Activity,
  Building2,
  ArrowLeft,
  ExternalLink,
  User
} from 'lucide-react';
import { CertificateTemplate } from '../components/certificados/CertificateTemplate';
import { CompanyInfo } from '../context/CompanyContext';
import { CertificateTemplate as TemplateConfig } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { cn } from '../lib/utils';

export default function Verification() {
  const { type, id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for certificate view
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [template, setTemplate] = useState<TemplateConfig | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    // If auth is loading, wait
    if (authLoading) return;
    
    if (!user) {
        setLoading(false);
        return; // Render login prompt
    }

    const verifyItem = async () => {
      if (!id || !type) return;

      try {
        if (type === 'muestra' || type === 'certificado') {
          const { data: result, error } = await supabase
            .from('muestras')
            .select(`
              *,
              normas (codigo, nombre, campos, tipo, descripcion),
              proyectos (nombre, cliente)
            `)
            .eq('id', id)
            .maybeSingle(); 

          if (error) throw error;
          
          if (!result) {
             throw new Error('Elemento no encontrado o no tiene permisos para verlo.');
          }
          
          setData({
             ...result,
             fechaRecepcion: result.fecha_recepcion,
             fechaTermino: result.fecha_termino,
             fechaEnsayo: result.fecha_ensayo,
             tipoMaterial: result.tipo_material
          });

          // Fetch company info based on tecnico_id
          if (result.tecnico_id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', result.tecnico_id)
                .single();
            
            if (profile?.company_id) {
                const { data: company } = await supabase
                    .from('company_settings')
                    .select('*')
                    .eq('id', profile.company_id)
                    .single();
                    
                if (company) {
                    setCompanyInfo({
                        name: company.name,
                        address: company.address || '',
                        city: company.city || '',
                        phone: company.phone || '',
                        email: company.email || '',
                        logoUrl: company.logo_url,
                        planId: 'pro'
                    });
                }
            }
          }

          if (type === 'certificado') {
             setTemplate({
               id: 'default',
               name: 'Default',
               layout: 'classic',
               primaryColor: '#000000',
               showWatermark: true,
               showQr: true,
               showBorder: true,
               isDefault: true
             });
          }
        } else {
          throw new Error('Tipo de verificación no soportado');
        }
      } catch (err: any) {
        console.error(err);
        setError('No se pudo verificar el elemento. Puede que no exista o no tengas permisos.');
      } finally {
        setLoading(false);
      }
    };

    verifyItem();
  }, [type, id, user, authLoading]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in view
  if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 animate-pulse">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Acceso Protegido</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6 px-8 pb-8">
                    <p className="text-muted-foreground text-sm">
                        Estás intentando acceder a un documento certificado. Por seguridad, necesitas verificar tu identidad.
                    </p>
                    <Button 
                        className="w-full py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all" 
                        onClick={() => navigate('/login', { state: { from: location } })}
                    >
                        Iniciar Sesión Segura
                    </Button>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        Sistema de Verificación ConstruLab
                    </p>
                </CardContent>
            </Card>
        </div>
      );
  }

  // Error view
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">No Encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            {error || 'El elemento solicitado no existe o no tienes permisos.'}
            <div className="mt-6">
                <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                    Volver al Inicio
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Certificate Full View
  if (type === 'certificado' && companyInfo && template && showCertificate) {
    const norma = {
        ...data.normas,
        campos: data.normas.campos || [],
        tiposMuestraCompatibles: []
    };
    
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
            <Button variant="ghost" onClick={() => setShowCertificate(false)} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Resumen
            </Button>
            <div className="flex gap-2">
                 <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                    Ir al Sistema
                </Button>
                <Button onClick={() => window.print()} className="shadow-md">
                    Imprimir / PDF
                </Button>
            </div>
        </div>
        <CertificateTemplate
          muestra={data}
          proyecto={data.proyectos}
          norma={norma}
          companyInfo={companyInfo}
          template={template}
        />
      </div>
    );
  }

  // Main Summary View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
             <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
             </Button>
             <div className="flex items-center gap-2">
                 {user && (
                     <Button variant="outline" size="sm" onClick={() => navigate('/app/dashboard')}>
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ir al Sistema
                     </Button>
                 )}
             </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Company Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {companyInfo?.logoUrl && (
                <img 
                    src={companyInfo.logoUrl} 
                    alt={companyInfo.name} 
                    className="h-24 w-auto mx-auto mb-4 object-contain drop-shadow-sm bg-white dark:bg-gray-800 p-2 rounded-lg"
                />
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {companyInfo?.name || 'Laboratorio de Construcción'}
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                <MapPin className="h-3 w-3" />
                <span>{companyInfo?.city || 'México'}</span>
            </div>
        </div>

        {/* Verification Card */}
        <Card className="border-t-4 border-t-green-500 shadow-xl overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 border-b border-green-100 dark:border-green-900/30 flex items-center justify-center gap-2">
             <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
             <span className="font-bold text-green-700 dark:text-green-300 uppercase tracking-wide text-sm">Documento Auténtico</span>
          </div>

          <CardContent className="p-0">
            <div className="p-6 space-y-6">
                {/* Main ID Section */}
                <div className="text-center pb-6 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Identificador</p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-mono">{data.codigo}</h2>
                    <div className="mt-3 flex justify-center">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                            data.estado === 'aprobado' ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : 
                            data.estado === 'rechazado' ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        )}>
                            {data.estado}
                        </span>
                    </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Proyecto</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-200">{data.proyectos?.nombre}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{data.proyectos?.cliente}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Norma</p>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{data.normas?.codigo}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                         <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Fechas</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Recepción:</span> {new Date(data.fecha_recepcion).toLocaleDateString()}</p>
                                {data.fecha_ensayo && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Ensayo:</span> {new Date(data.fecha_ensayo).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                        {data.ubicacion && (
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Ubicación en Obra</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-200">{data.ubicacion}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {data.resultados && (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-4 w-4 text-primary" />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 uppercase">Resultados Clave</h3>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                          {Object.entries(data.resultados).slice(0, 6).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700 last:border-0 border-dashed">
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate mr-2 capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-200">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
            
            {/* Actions Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/30 p-6 border-t border-gray-100 dark:border-gray-700">
                {(data.estado === 'aprobado' || type === 'certificado') ? (
                     type === 'certificado' ? (
                        <Button onClick={() => setShowCertificate(true)} className="w-full shadow-md py-6">
                            <FileText className="mr-2 h-5 w-5" /> Ver Certificado Original
                        </Button>
                    ) : (
                        <Link to={`/verify/certificado/${id}`} className="block">
                             <Button className="w-full shadow-md py-6" variant="primary">
                                <CheckCircle className="mr-2 h-5 w-5" /> Ver Certificado Digital
                            </Button>
                        </Link>
                    )
                ) : (
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-700 dark:text-yellow-400 text-sm">
                        La muestra aún no ha sido aprobada para emitir certificado.
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Validación segura garantizada por</p>
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border dark:border-gray-600 shadow-sm">
             <span className="font-bold text-primary-600 dark:text-primary-400">ConstruLab SaaS</span>
             <span className="text-[10px] bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded font-medium">v1.0</span>
          </div>
          <p className="mt-4 text-[10px] text-gray-400">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
