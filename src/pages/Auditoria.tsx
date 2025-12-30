import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ShieldCheck, CheckCircle, FileSearch, Plus, Search, Calendar, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import { mockUsers } from '../data/mockData';
import { Audit } from '../data/mockData';
import { cn } from '../lib/utils';

export default function Auditoria() {
  const { auditLogs, audits, addAudit, updateAudit } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [newAudit, setNewAudit] = useState<Partial<Audit>>({
    type: 'Interna',
    status: 'Programada',
    scheduledDate: '',
    auditor: ''
  });

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    
    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const sortedAudits = [...audits].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAudit.type && newAudit.scheduledDate && newAudit.auditor) {
      addAudit(newAudit as Omit<Audit, 'id'>);
      setIsModalOpen(false);
      setNewAudit({ type: 'Interna', status: 'Programada', scheduledDate: '', auditor: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Programada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Cerrada': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Cancelada': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auditoría y Seguimiento</h1>
          <p className="text-muted-foreground mt-2">Registro de actividades y control de cumplimiento normativo.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Programar Auditoría
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auditorías Programadas</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audits.filter(a => a.status === 'Programada').length}</div>
            <p className="text-xs text-muted-foreground">Próxima: {sortedAudits.find(a => a.status === 'Programada')?.scheduledDate || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento Global</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">+2.5% vs año anterior (Simulado)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auditorías Cerradas</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{audits.filter(a => a.status === 'Cerrada').length}</div>
             <p className="text-xs text-muted-foreground">Este año</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOGS SECTION */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <FileSearch className="h-5 w-5" />
                Registro de Actividades
              </div>
            </CardTitle>
            <div className="pt-2">
              <Input 
                placeholder="Buscar en logs..." 
                icon={<Search className="h-4 w-4" />} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No se encontraron registros.</p>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0 hover:bg-muted/30 p-2 rounded-md transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {log.action}
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{log.module}</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getUserName(log.userId)} • {log.ip}
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground italic">Detalle: {log.details}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* AUDITS SECTION */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Gestión de Auditorías
            </CardTitle>
          </CardHeader>
          <CardContent className={cn("flex-1 overflow-y-auto", viewMode === 'grid' && "p-2")}>
            {viewMode === 'grid' ? (
              <div className="space-y-4">
                {sortedAudits.map((audit) => (
                  <div key={audit.id} className="bg-card rounded-lg border shadow-sm p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                         <div className="font-medium">{audit.type}</div>
                         {audit.entity && <div className="text-xs text-muted-foreground">{audit.entity}</div>}
                      </div>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", getStatusColor(audit.status))}>
                        {audit.status}
                      </span>
                    </div>
                    
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground text-xs block">Fecha</span>
                        <span className="font-medium">{audit.scheduledDate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Auditor</span>
                        <span className="font-medium">{audit.auditor}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border mt-2">
                      {audit.status === 'Programada' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-8 text-xs"
                          onClick={() => updateAudit(audit.id, { status: 'En Proceso' })}
                        >
                          Iniciar
                        </Button>
                      )}
                      {audit.status === 'En Proceso' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-8 text-xs text-green-600 hover:text-green-700 border-green-200 bg-green-50 dark:bg-green-900/10"
                          onClick={() => updateAudit(audit.id, { status: 'Cerrada' })}
                        >
                          Cerrar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo / Entidad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell>
                      <div className="font-medium">{audit.type}</div>
                      {audit.entity && <div className="text-xs text-muted-foreground">{audit.entity}</div>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{audit.scheduledDate}</TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", getStatusColor(audit.status))}>
                        {audit.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {audit.status === 'Programada' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7"
                          onClick={() => updateAudit(audit.id, { status: 'En Proceso' })}
                        >
                          Iniciar
                        </Button>
                      )}
                      {audit.status === 'En Proceso' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7 text-green-600 hover:text-green-700"
                          onClick={() => updateAudit(audit.id, { status: 'Cerrada' })}
                        >
                          Cerrar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CREATE AUDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Programar Nueva Auditoría"
      >
        <form onSubmit={handleCreateAudit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Auditoría</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newAudit.type}
              onChange={(e) => setNewAudit({ ...newAudit, type: e.target.value as any })}
              required
            >
              <option value="Interna">Interna</option>
              <option value="Externa">Externa</option>
              <option value="Certificación">Certificación</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Entidad (Opcional)</label>
            <Input
              placeholder="Ej. EMA, ISO, Cliente..."
              value={newAudit.entity || ''}
              onChange={(e) => setNewAudit({ ...newAudit, entity: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha Programada</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9"
                value={newAudit.scheduledDate}
                onChange={(e) => setNewAudit({ ...newAudit, scheduledDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Auditor Responsable</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Nombre del auditor o equipo"
                value={newAudit.auditor}
                onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Programar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
