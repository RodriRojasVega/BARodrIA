// src/modules/eventos/components/EventoForecastTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { InfoCard } from '@/components/ui/InfoCard';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface EventoForecastTabProps {
  eventoId: number;
  totalPax: number;
}

interface InsumoProyectado {
  id: number;
  nombre: string;
  unidad: string;
  cantidadUnitaria: number;
  cantidadTotal: number;
  costoUnitario: number;
  costoTotal: number;
}

export function EventoForecastTab({ eventoId: _eventoId, totalPax }: EventoForecastTabProps) {
  const [factorAjuste, setFactorAjuste] = useState<number>(1.15);
  const [calculando, setCalculando] = useState<boolean>(false);

  const [insumosProyectados, setInsumosProyectados] = useState<InsumoProyectado[]>([
    { id: 1, nombre: 'Pisco Control C 40°', unidad: 'ml', cantidadUnitaria: 60, cantidadTotal: 60 * totalPax * 1.15, costoUnitario: 18.5, costoTotal: 60 * totalPax * 1.15 * 18.5 },
    { id: 2, nombre: 'Jarabe de Jengibre & Miel (Batch)', unidad: 'ml', cantidadUnitaria: 30, cantidadTotal: 30 * totalPax * 1.15, costoUnitario: 4.2, costoTotal: 30 * totalPax * 1.15 * 4.2 },
    { id: 3, nombre: 'Jugo de Limón Sutil (Clarificado)', unidad: 'ml', cantidadUnitaria: 30, cantidadTotal: 30 * totalPax * 1.15, costoUnitario: 8.0, costoTotal: 30 * totalPax * 1.15 * 8.0 },
    { id: 4, nombre: 'Hielo Cubo 5x5 Cristalino', unidad: 'g', cantidadUnitaria: 300, cantidadTotal: 300 * totalPax * 1.15, costoUnitario: 1.5, costoTotal: 300 * totalPax * 1.15 * 1.5 },
  ]);

  const handleRecalcular = () => {
    setCalculando(true);
    setTimeout(() => {
      const actualizados = insumosProyectados.map(item => {
        const total = item.cantidadUnitaria * totalPax * factorAjuste;
        return {
          ...item,
          cantidadTotal: total,
          costoTotal: total * item.costoUnitario
        };
      });
      setInsumosProyectados(actualizados);
      setCalculando(false);
    }, 400);
  };

  const costoTotalForecast = insumosProyectados.reduce((acc, item) => acc + item.costoTotal, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Uso de InfoCard oficial y tokens semánticos */}
      <InfoCard variant="success" title="Simulador de Demanda y BOM">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
          <div>
            <p className="text-xs text-muted">Volumen base configurado:</p>
            <span className="text-sm font-bold text-foreground">{totalPax} Asistentes (PAX)</span>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-40">
              <Input 
                label="Factor de Holgura (%)"
                type="number"
                step="0.05"
                min="1.0"
                max="2.0"
                value={factorAjuste}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFactorAjuste(Number(e.target.value))}
              />
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              icon={<RefreshCw size={14} className={calculando ? 'animate-spin' : ''} />} 
              onClick={handleRecalcular}
              className="mt-6"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </InfoCard>

      {/* Tabla utilizando tokens de superficie y bordes semánticos */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            Listado Consolidado de Insumos Requeridos
          </span>
          <Badge variant="success">
            Costo Teórico Total: ${costoTotalForecast.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
          </Badge>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Insumo / Materia Prima</TableHeaderCell>
                <TableHeaderCell align="center">Consumo Unitario</TableHeaderCell>
                <TableHeaderCell align="center">Volumen Total Proyectado</TableHeaderCell>
                <TableHeaderCell align="right">Costo Unitario ($)</TableHeaderCell>
                <TableHeaderCell align="right">Costo Total ($)</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insumosProyectados.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-foreground">{item.nombre}</TableCell>
                  <TableCell align="center" className="font-mono text-xs text-muted">
                    {item.cantidadUnitaria} {item.unidad} / PAX
                  </TableCell>
                  <TableCell align="center">
                    <span className="font-mono font-bold text-primary">
                      {item.cantidadTotal.toLocaleString('es-CL', { maximumFractionDigits: 1 })} {item.unidad}
                    </span>
                  </TableCell>
                  <TableCell align="right" className="font-mono text-xs text-muted">
                    ${item.costoUnitario.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" className="font-mono font-bold text-danger">
                    ${item.costoTotal.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-surface-muted border border-border rounded-xl text-xs text-muted">
        <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
        <p>
          Este listado alimenta directamente las Órdenes de Despacho (WMS). Las cantidades se multiplican de forma síncrona con el rendimiento de las sub-recetas artesanales.
        </p>
      </div>
    </div>
  );
}