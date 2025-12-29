import React, { useState } from 'react';
import { Muestra, Proyecto, Norma } from '../../data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/Table';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Edit, Trash2, QrCode, ClipboardCheck, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import QRCode from 'react-qr-code';

export interface SampleListProps {
  muestras: Muestra[];
  proyectos: Proyecto[];
  normas: Norma[];
  onEdit: (muestra: Muestra) => void;
  onDelete: (id: string) => void;
  onView: (muestra: Muestra) => void;
}

export function SampleList({ muestras, proyectos, normas, onEdit, onDelete, onView }: SampleListProps) {
  const [qrMuestra, setQrMuestra] = useState<Muestra | null>(null);

  const getProjectName = (id: string) => proyectos.find(p => p.id === id)?.nombre || 'Desconocido';
  const getNormaCode = (id: string) => normas.find(n => n.id === id)?.codigo || 'N/A';

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR-${qrMuestra?.codigo}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Proyecto</TableHead>
            <TableHead>Norma</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {muestras.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No hay muestras registradas.
              </TableCell>
            </TableRow>
          ) : (
            muestras.map((muestra) => (
              <TableRow key={muestra.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setQrMuestra(muestra)}
                      title="Ver código QR"
                    >
                      <QrCode className="h-5 w-5" />
                    </Button>
                    <span className="font-medium">{muestra.codigo}</span>
                  </div>
                </TableCell>
                <TableCell>{getProjectName(muestra.proyectoId)}</TableCell>
                <TableCell>{getNormaCode(muestra.normaId)}</TableCell>
                <TableCell>{muestra.tipoMaterial}</TableCell>
                <TableCell>{new Date(muestra.fechaRecepcion).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    muestra.estado === 'aprobado' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    muestra.estado === 'pendiente' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    muestra.estado === 'en_proceso' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    muestra.estado === 'rechazado' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {muestra.estado.replace('_', ' ').toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(muestra)} title="Ver/Registrar Resultados">
                      <ClipboardCheck className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(muestra)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(muestra.id)} className="text-destructive hover:text-destructive" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={!!qrMuestra}
        onClose={() => setQrMuestra(null)}
        title={`Código QR - ${qrMuestra?.codigo}`}
        className="max-w-sm"
      >
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="bg-white p-4 rounded-lg shadow-inner">
            {qrMuestra && (
              <QRCode
                id="qr-code-svg"
                value={JSON.stringify({
                  id: qrMuestra.id,
                  codigo: qrMuestra.codigo,
                  proyecto: getProjectName(qrMuestra.proyectoId),
                  material: qrMuestra.tipoMaterial
                })}
                size={200}
                level="M"
              />
            )}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Escanea este código para acceder rápidamente a los detalles de la muestra <strong>{qrMuestra?.codigo}</strong>.
          </p>
          <div className="flex w-full gap-2">
            <Button className="w-full" variant="outline" onClick={downloadQR}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PNG
            </Button>
            <Button className="w-full" onClick={() => setQrMuestra(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
