import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { CheckCircle, XCircle, Loader2, Lock } from 'lucide-react';
import { CertificateTemplate } from '../components/certificados/CertificateTemplate';
import { CompanyInfo } from '../context/CompanyContext';
import { CertificateTemplate as TemplateConfig } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

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

  useEffect(() => {
    // If auth is loading, wait
    if (authLoading) return;

    // If not authenticated, we can either redirect immediately or show a "Login Required" screen.
    // The user requested: "que pudieran autenticarce con su cuenta"
    // Let's check permissions after fetching or attempt fetch and fail if RLS blocks it.
    // But to provide a better UX, we should check if user is logged in first.
    
    if (!user) {
        setLoading(false);
        return; // Render login prompt
    }

    const verifyItem = async () => {
      if (!id || !type) return;

      try {
        if (type === 'muestra' || type === 'certificado') {
          // Attempt to fetch. If RLS is set to "authenticated" only, this works for logged in users.
          // RLS should handle "related to them" logic (e.g., project assignment).
          const { data: result, error } = await supabase
            .from('muestras')
            .select(`
              *,
              normas (codigo, nombre, campos, tipo, descripcion),
              proyectos (nombre, cliente)
            `)
            .eq('id', id)
            .maybeSingle(); 

          if (error) {
             console.error("Verification fetch error:", error);
             throw error;
          }
          
          if (!result) {
             throw new Error('Elemento no encontrado o no tiene permisos para verlo.');
          }
          
          setData({
             ...result,
             fechaRecepcion: result.fecha_recepcion, // Map snake_case to camelCase
             fechaTermino: result.fecha_termino,
             fechaEnsayo: result.fecha_ensayo,
             tipoMaterial: result.tipo_material
          });

          if (type === 'certificado') {
             // Set default company info for public view since we don't have the context
             setCompanyInfo({
               name: 'LABORATORIO DE CONSTRUCCIÓN',
               address: 'Verificación Digital',
               city: 'México',
               phone: '',
               email: '',
               planId: 'free'
             });
             
             // Default template
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

  // If not logged in, show login required screen
  if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Autenticación Requerida</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Para ver este certificado o muestra, necesitas iniciar sesión con tu cuenta de ConstruLab.
                    </p>
                    <div className="pt-2">
                        <Button 
                            className="w-full" 
                            onClick={() => navigate('/login', { state: { from: location } })}
                        >
                            Iniciar Sesión
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                        Solo personal autorizado o clientes asignados pueden ver esta información.
                    </p>
                </CardContent>
            </Card>
        </div>
      );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">Acceso Denegado / No Encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            {error || 'El elemento solicitado no existe o no tienes permisos para verlo.'}
            <div className="mt-4">
                <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
                    Ir al Dashboard
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Certificate View
  if (type === 'certificado' && companyInfo && template) {
    const norma = {
        ...data.normas,
        campos: data.normas.campos || [],
        tiposMuestraCompatibles: []
    };
    
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-2">
                <Link to={`/verify/muestra/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
                    &larr; Ver Resumen
                </Link>
                <h1 className="text-xl font-bold ml-4">Vista Pública del Certificado</h1>
            </div>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Imprimir / Guardar PDF
            </button>
        </div>
        <CertificateTemplate
          muestra={data}
          proyecto={data.proyectos}
          norma={norma}
          companyInfo={companyInfo}
          template={template}
        />
        <div className="text-center mt-8 text-xs text-gray-400 print:hidden">
            <p>Este es un documento de solo lectura generado para validación pública.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-800">ConstruLab Verificación</h1>
          <p className="text-muted-foreground">Sistema de Autenticidad Digital</p>
        </div>

        <Card className="border-green-500 border-t-4 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-green-600 mb-2">
              <CheckCircle className="h-6 w-6" />
              <span className="font-bold text-lg">Elemento Auténtico</span>
            </div>
            <CardTitle className="text-xl">
              {`Muestra ${data.codigo}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              ID: {data.id}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Proyecto</p>
                <p>{data.proyectos?.nombre || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Cliente</p>
                <p>{data.proyectos?.cliente || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Norma</p>
                <p>{data.normas?.codigo || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Estado</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                  ${data.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 
                    data.estado === 'rechazado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {data.estado?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Fecha Recepción</p>
                <p>{new Date(data.fecha_recepcion).toLocaleDateString()}</p>
              </div>
            </div>

            {data.resultados && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-bold mb-3">Resultados Registrados</h3>
                <div className="bg-gray-50 p-3 rounded-md text-sm space-y-2">
                  {Object.entries(data.resultados).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link to Certificate View */}
            {data.estado === 'aprobado' && (
                <div className="mt-6 pt-4 border-t text-center">
                    <Link 
                        to={`/verify/certificado/${id}`}
                        className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 hover:underline"
                    >
                        Ver Certificado Digital Completo
                    </Link>
                </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>Este documento es una representación digital de los registros en ConstruLab.</p>
          <p>© {new Date().getFullYear()} Laboratorio de Construcción SaaS</p>
        </div>
      </div>
    </div>
  );
}
