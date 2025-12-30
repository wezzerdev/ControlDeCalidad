import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function Verification() {
  const { type, id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyItem = async () => {
      if (!id || !type) return;

      try {
        if (type === 'muestra') {
          // Use RPC for public verification to be safe, or direct select if policy allows
          // For now, we try direct select. If it fails due to RLS, we need the RPC.
          const { data: result, error } = await supabase
            .from('muestras')
            .select(`
              *,
              normas (codigo, nombre),
              proyectos (nombre, cliente)
            `)
            .eq('id', id)
            .maybeSingle(); // Use maybeSingle to avoid 406 error if not found immediately

          if (error) {
             console.error("Verification fetch error:", error);
             throw error;
          }
          
          if (!result) {
             throw new Error('Elemento no encontrado');
          }
          
          setData(result);
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
  }, [type, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">Verificación Fallida</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            {error || 'El elemento solicitado no existe en nuestros registros.'}
          </CardContent>
        </Card>
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
              {type === 'muestra' ? `Muestra ${data.codigo}` : 'Certificado'}
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
