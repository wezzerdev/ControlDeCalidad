import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/common/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Briefcase, TestTube, CheckCircle, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { normas, proyectos, muestras } = useData();
  const { primaryColor } = useTheme();
  const { user } = useAuth();
  const { companyInfo, retryCompanySetup, isLoading: isCompanyLoading } = useCompany();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await retryCompanySetup();
    setIsRetrying(false);
  };

  const metrics = [
    { 
      title: 'Proyectos Activos', 
      value: proyectos.filter(p => p.estado === 'activo').length, 
      icon: Briefcase,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      title: 'Muestras Totales', 
      value: muestras.length, 
      icon: TestTube,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    { 
      title: 'Normas Activas', 
      value: normas.filter(n => n.activa).length, 
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    { 
      title: 'Muestras Pendientes', 
      value: muestras.filter(m => m.estado === 'pendiente').length, 
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
  ];

  const getLast7Days = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      
      const count = muestras.filter(m => m.fechaRecepcion.startsWith(dateStr)).length;
      
      result.push({ name: dayName, muestras: count });
    }
    return result;
  };

  const data = getLast7Days();

  // Calculate real analytics data from samples
  const dataEnsayo = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const today = new Date();
    const result = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      const monthName = months[monthIndex];

      const samplesInMonth = muestras.filter(m => {
        const date = new Date(m.fechaRecepcion);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      });

      const conforme = samplesInMonth.filter(m => m.estado === 'aprobado').length;
      const noConforme = samplesInMonth.filter(m => m.estado === 'rechazado').length;

      result.push({
        name: monthName,
        Conforme: conforme,
        NoConforme: noConforme
      });
    }
    return result;
  }, [muestras]);

  const dataPie = React.useMemo(() => {
    const counts: Record<string, number> = {};
    muestras.forEach(m => {
      const type = m.tipoMaterial || 'Otros';
      counts[type] = (counts[type] || 0) + 1;
    });

    const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
    
    // Return empty state if no data
    if (result.length === 0) {
      return [{ name: 'Sin datos', value: 1 }];
    }
    
    return result;
  }, [muestras]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      
      {/* System Status Check */}
      {user?.role === 'administrador' && !isCompanyLoading && !companyInfo.id && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Atención: Configuración de Empresa Incompleta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Tu usuario administrador no tiene una empresa asociada correctamente. Esto impedirá registrar nuevos usuarios y realizar otras acciones.
            </p>
            <Button 
              onClick={handleRetry} 
              isLoading={isRetrying}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reparar Configuración
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-3xl font-bold mt-2 text-foreground">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-full ${metric.bg}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Muestras Recibidas (Semana)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground text-xs" />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="muestras" fill={primaryColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {muestras.slice(0, 5).map(muestra => (
                <div key={muestra.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{muestra.codigo}</p>
                    <p className="text-sm text-muted-foreground">{muestra.tipoMaterial}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    muestra.estado === 'aprobado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    muestra.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {muestra.estado}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section (Merged from Reportes) */}
      <h2 className="text-xl font-semibold text-foreground pt-4">Análisis de Calidad</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Mensual (Conforme vs No Conforme)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataEnsayo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Conforme" fill="#4ade80" />
                <Bar dataKey="NoConforme" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Material</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia de Ensayos Realizados</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataEnsayo}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Conforme" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
