// src/modules/eventos/components/EventoPickingsTab.tsx
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Truck, Layers, Box, Wrench, ShieldCheck } from 'lucide-react';

interface EventoPickingsTabProps {
  totalPax: number;
}

interface ItemPickingSoporte {
  id: number;
  nombre: string;
  unidadesNecesarias: number;
  unidadesPorRack: number;
  racksPorPallet: number;
}

export function EventoPickingsTab({ totalPax }: EventoPickingsTabProps) {
  const factorCristaleriaPorPax = 2.5; 
  const totalPiezasCristaleria = Math.round(totalPax * factorCristaleriaPorPax);

  const soportesLogistica: ItemPickingSoporte[] = [
    { id: 1, nombre: 'Vaso Highball Cristalino 350ml', unidadesNecesarias: Math.round(totalPiezasCristaleria * 0.5), unidadesPorRack: 25, racksPorPallet: 4 },
    { id: 2, nombre: 'Copa Cocktail / Nick & Nora', unidadesNecesarias: Math.round(totalPiezasCristaleria * 0.3), unidadesPorRack: 25, racksPorPallet: 4 },
    { id: 3, nombre: 'Vaso Old Fashioned 300ml', unidadesNecesarias: Math.round(totalPiezasCristaleria * 0.2), unidadesPorRack: 30, racksPorPallet: 4 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resumen Logístico de Carga (Trucking Dashboard) usando tokens semánticos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-surface-muted border border-border rounded-xl text-primary">
            <Truck size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Capacidad Camión</span>
            <span className="text-lg font-bold text-foreground font-mono mt-0.5">~1.2 Pallets Estándar</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-surface-muted border border-border rounded-xl text-info">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Total Racks Cristalería</span>
            <span className="text-lg font-bold text-foreground font-mono mt-0.5">
              {soportesLogistica.reduce((acc, item) => acc + Math.ceil(item.unidadesNecesarias / item.unidadesPorRack), 0)} Racks
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-surface-muted border border-border rounded-xl text-purple-400">
            <Box size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Piezas Totales Manejadas</span>
            <span className="text-lg font-bold text-primary font-mono mt-0.5">{totalPiezasCristaleria} Unidades</span>
          </div>
        </div>
      </div>

      {/* Tabla 1: Logística de Soportes */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
              1. Picking de Soportes & Cristalería
            </span>
          </div>
          <Badge variant="info">WMS Activo</Badge>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Soporte Operativo</TableHeaderCell>
                <TableHeaderCell align="center">Piezas Totales</TableHeaderCell>
                <TableHeaderCell align="center">Capacidad x Rack</TableHeaderCell>
                <TableHeaderCell align="center">Racks Requeridos</TableHeaderCell>
                <TableHeaderCell align="right">Pallets (Equivalente)</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {soportesLogistica.map((item) => {
                const racksCount = Math.ceil(item.unidadesNecesarias / item.unidadesPorRack);
                const palletsCount = (racksCount / item.racksPorPallet).toFixed(1);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-foreground">{item.nombre}</TableCell>
                    <TableCell align="center" className="font-mono text-muted">
                      {item.unidadesNecesarias} un.
                    </TableCell>
                    <TableCell align="center" className="font-mono text-xs text-muted">
                      {item.unidadesPorRack} un/rack
                    </TableCell>
                    <TableCell align="center">
                      <span className="font-mono font-bold text-primary">{racksCount} Racks</span>
                    </TableCell>
                    <TableCell align="right" className="font-mono text-xs text-info font-bold">
                      {palletsCount} Pallets
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tabla 2: Herramientas Fijas y Estaciones */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Wrench size={16} className="text-warning" />
          <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            2. Kits de Herramientas y Estaciones de Servicio
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Categoría Activo</TableHeaderCell>
                <TableHeaderCell>Descripción del Kit</TableHeaderCell>
                <TableHeaderCell align="center">Cantidad de Estaciones</TableHeaderCell>
                <TableHeaderCell align="right">Estado Bodega</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs text-warning uppercase">Preparación</TableCell>
                <TableCell className="text-foreground">Kit Shakers, Jiggers Inox, Hostelería de Medición</TableCell>
                <TableCell align="center" className="font-mono font-bold text-muted">4 Kits</TableCell>
                <TableCell align="right"><Badge variant="success">Disponible</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs text-warning uppercase">Servicio</TableCell>
                <TableCell className="text-foreground">Pinzas de Hielo, Cucharas Bailarina, Strainers Hawthorne</TableCell>
                <TableCell align="center" className="font-mono font-bold text-muted">4 Kits</TableCell>
                <TableCell align="right"><Badge variant="success">Disponible</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs text-warning uppercase">Montaje</TableCell>
                <TableCell className="text-foreground">Bandejas Antideslizantes, Speed Rails Modulares</TableCell>
                <TableCell align="center" className="font-mono font-bold text-muted">8 Unidades</TableCell>
                <TableCell align="right"><Badge variant="success">Disponible</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-surface-muted border border-border rounded-xl text-xs text-muted">
        <ShieldCheck size={18} className="text-primary shrink-0" />
        <p>
          Las órdenes de despacho de bodega están listas para ser impresas o exportadas al formato de carga de camión para la locación externa.
        </p>
      </div>
    </div>
  );
}