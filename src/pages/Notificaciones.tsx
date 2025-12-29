import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Bell, AlertCircle, Info, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function Notificaciones() {
  const notifications = [
    { id: 1, titulo: 'Calibración Vencida', mensaje: 'La Prensa Hidráulica 200T requiere calibración urgente.', tipo: 'critical', fecha: 'Hace 2 horas' },
    { id: 2, titulo: 'Nuevo Proyecto Asignado', mensaje: 'Se te ha asignado al proyecto "Torre XYZ".', tipo: 'info', fecha: 'Hace 5 horas' },
    { id: 3, titulo: 'Ensayo Aprobado', mensaje: 'El ensayo de compresión MUE-2024-001 ha sido aprobado.', tipo: 'success', fecha: 'Ayer' },
    { id: 4, titulo: 'Stock Bajo', mensaje: 'El reactivo Azufre está por debajo del mínimo.', tipo: 'warning', fecha: 'Ayer' },
  ];

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificaciones y Alertas</h1>
          <p className="text-muted-foreground mt-2">Centro de mensajes y avisos del sistema.</p>
        </div>
        <Button variant="outline">
          Marcar todas como leídas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                <div className="mt-1">{getIcon(notif.tipo)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-foreground">{notif.titulo}</h4>
                    <span className="text-xs text-muted-foreground">{notif.fecha}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.mensaje}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración Rápida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Alertas por Email</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones Push</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resumen Semanal</span>
              <input type="checkbox" className="toggle" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
