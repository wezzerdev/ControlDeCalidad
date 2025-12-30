import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/common/Table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Search, Filter } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface LogEntry {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: any;
  created_at: string;
  user_id: string;
  user_email?: string; // We'll fetch this
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Fetch logs and join with profiles to get emails/names if possible
      // Since profiles are in a separate table, we might need a join or two queries.
      // For simplicity in Supabase JS client without foreign key direct expansion sometimes:
      
      const { data: logsData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user emails manually if needed, or if profiles table has it
      // Let's assume we can get profiles
      const userIds = Array.from(new Set(logsData.map(l => l.user_id).filter(Boolean)));
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, full_name') // Assuming these exist
            .in('id', userIds);
            
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const enrichedLogs = logsData.map(log => ({
            ...log,
            user_email: profileMap.get(log.user_id)?.email || profileMap.get(log.user_id)?.full_name || 'Usuario desconocido'
        }));
        
        setLogs(enrichedLogs);
      } else {
        setLogs(logsData);
      }

    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-purple-100 text-purple-800';
      case 'approve': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registro de Actividad</h1>
          <p className="text-muted-foreground">Monitoreo de acciones de usuarios en el sistema.</p>
        </div>
        <Button variant="outline" onClick={fetchLogs}>
            Actualizar
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
                placeholder="Buscar por usuario, acción o entidad..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
             <Activity className="h-5 w-5 text-primary" />
             <CardTitle>Historial Reciente</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">Cargando registros...</TableCell>
                    </TableRow>
                ) : filteredLogs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">No se encontraron registros.</TableCell>
                    </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.user_email || log.user_id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getActionColor(log.action)}`}>
                            {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">{log.entity}</TableCell>
                      <TableCell className="max-w-md truncate text-gray-500 text-xs font-mono">
                        {JSON.stringify(log.details)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
