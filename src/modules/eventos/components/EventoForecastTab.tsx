// src/modules/eventos/components/EventoForecastTab.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Clock, Martini, Package, Check, ListFilter } from 'lucide-react';

interface EventoForecastTabProps {
  eventoId: number;
  totalPax?: number;
}

interface OfertaItem {
  id: number;
  tipo: 'coctel' | 'concepto';
  nombre: string;
  consumoUnitario: number;
  peso: number;
  unidadBase: string;
}

interface PuntoServicioForecast {
  id: number;
  nombre: string;
  paxAsignado: number;
  oferta: OfertaItem[];
}

interface EtapaForecast {
  id: number;
  nombre: string;
  horario: string;
  paxEtapa: number;
  reglaConsumo: number; // Factor de holgura
  puntos: PuntoServicioForecast[];
}

export function EventoForecastTab({ eventoId }: EventoForecastTabProps) {

  const [selecciones, setSelecciones] = useState<Record<number, 'todos' | number[]>>({});

  // Mock de datos (Read-Only) alineado al DDL
  const etapasForecast: EtapaForecast[] = [
    {
      id: 1,
      nombre: 'Etapa 1: Recepción & Cóctel',
      horario: '19:00 - 21:00',
      paxEtapa: 600,
      reglaConsumo: 1.15,
      puntos: [
        {
          id: 101,
          nombre: 'Barra Terraza Exterior',
          paxAsignado: 450,
          oferta: [
            { id: 1, tipo: 'coctel', nombre: 'Pisco Sour Catedral', consumoUnitario: 1.5, peso: 1.2, unidadBase: 'unit' },
            { id: 2, tipo: 'concepto', nombre: 'Bebida de Fantasía Cola', consumoUnitario: 250, peso: 0.8, unidadBase: 'ml' },
          ]
        },
        {
          id: 102,
          nombre: 'Estación de Bienvenida VIP',
          paxAsignado: 150,
          oferta: [
            { id: 4, tipo: 'concepto', nombre: 'Espumante Brut', consumoUnitario: 200, peso: 1.5, unidadBase: 'ml' },
            { id: 2, tipo: 'concepto', nombre: 'Bebida de Fantasía Cola', consumoUnitario: 250, peso: 0.3, unidadBase: 'ml' },
          ]
        }
      ]
    }
  ];

  const toggleSeleccion = (etapaId: number, puntoId: number | 'todos') => {
    setSelecciones(prev => {
      const seleccionActual = prev[etapaId] || 'todos';
      if (puntoId === 'todos') return { ...prev, [etapaId]: 'todos' };
      if (seleccionActual === 'todos') return { ...prev, [etapaId]: [puntoId] };

      const nuevaSeleccion = seleccionActual.includes(puntoId)
        ? seleccionActual.filter(id => id !== puntoId)
        : [...seleccionActual, puntoId];

      return {
        ...prev,
        [etapaId]: nuevaSeleccion.length === 0 ? 'todos' : nuevaSeleccion
      };
    });
  };

  const obtenerConsolidado = (etapa: EtapaForecast) => {
    const seleccion = selecciones[etapa.id] || 'todos';
    const puntosActivos = seleccion === 'todos' 
      ? etapa.puntos 
      : etapa.puntos.filter(p => seleccion.includes(p.id));

    const consolidado = new Map<number, OfertaItem & { volumenTotal: number }>();

    puntosActivos.forEach(punto => {
      punto.oferta.forEach(item => {
        const volumenCalculado = punto.paxAsignado * item.consumoUnitario * item.peso * etapa.reglaConsumo;
        
        if (consolidado.has(item.id)) {
          consolidado.get(item.id)!.volumenTotal += volumenCalculado;
        } else {
          consolidado.set(item.id, { ...item, volumenTotal: volumenCalculado });
        }
      });
    });

    return Array.from(consolidado.values());
  };

  return (
      <div className="space-y-12 animate-fade-in pb-10" data-evento-id={eventoId}>
        {etapasForecast.map((etapa) => {
        const seleccionActual = selecciones[etapa.id] || 'todos';
        const itemsConsolidados = obtenerConsolidado(etapa);

        return (
          <div key={etapa.id} className="flex flex-col gap-6">
            
            {/* Cabecera Informativa de la Etapa */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-2 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl shadow-sm">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">{etapa.nombre}</h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted">
                    <span>{etapa.horario} hrs</span>
                    <span className="text-border/50">•</span>
                    <span className="font-bold text-primary">{etapa.paxEtapa} PAX Globales</span>
                  </div>
                </div>
              </div>
              <Badge variant="info">Holgura Etapa: {(etapa.reglaConsumo * 100 - 100).toFixed(0)}%</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* COLUMNA IZQUIERDA: Puntos Operativos */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted font-bold ml-1">
                  <ListFilter size={14} />
                  <span>Puntos Operativos</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleSeleccion(etapa.id, 'todos')}
                    className={`flex items-center justify-between p-3 rounded-2xl text-sm transition-all duration-200 border ${
                      seleccionActual === 'todos' 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                        : 'bg-transparent hover:bg-surface text-foreground border-border/50'
                    }`}
                  >
                    <span className="font-semibold">Consolidado Etapa</span>
                    {seleccionActual === 'todos' && <Check size={16} />}
                  </button>

                  {etapa.puntos.map(punto => {
                    const estaSeleccionado = seleccionActual !== 'todos' && seleccionActual.includes(punto.id);
                    return (
                      <button
                        key={punto.id}
                        onClick={() => toggleSeleccion(etapa.id, punto.id)}
                        className={`flex flex-col text-left p-3 rounded-2xl transition-all duration-200 border ${
                          estaSeleccionado 
                            ? 'bg-primary/10 border-primary/30 shadow-sm' 
                            : 'bg-transparent hover:bg-surface border-border/50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-medium text-sm ${estaSeleccionado ? 'text-primary font-bold' : 'text-foreground'}`}>
                            {punto.nombre}
                          </span>
                          {estaSeleccionado && <Check size={16} className="text-primary" />}
                        </div>
                        <span className="text-xs font-mono text-muted mt-1">{punto.paxAsignado} PAX Asignados</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLUMNA DERECHA: Tabla Flotante Read-Only */}
              <div className="lg:col-span-8 xl:col-span-9">
                <div className="overflow-x-auto custom-scrollbar">
                  <Table>
                    <TableHead>
                      <TableRow className="border-b border-border/50">
                        <TableHeaderCell>Concepto Comercial / Cóctel</TableHeaderCell>
                        <TableHeaderCell align="center">Consumo Base</TableHeaderCell>
                        <TableHeaderCell align="center">Peso (Ajuste)</TableHeaderCell>
                        <TableHeaderCell align="right">Volumen Requerido</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemsConsolidados.length > 0 ? (
                        itemsConsolidados.map((item) => (
                          <TableRow key={item.id} className="border-b border-border/30 hover:bg-transparent transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-surface rounded-lg border border-border/50 shadow-sm">
                                  {item.tipo === 'coctel' ? (
                                    <Martini size={14} className="text-primary" />
                                  ) : (
                                    <Package size={14} className="text-muted-foreground" />
                                  )}
                                </div>
                                <span className="font-medium text-foreground">{item.nombre}</span>
                              </div>
                            </TableCell>
                            <TableCell align="center" className="font-mono text-xs text-muted">
                              {item.consumoUnitario} {item.unidadBase}/PAX
                            </TableCell>
                            <TableCell align="center" className="font-mono text-xs text-muted">
                              {item.peso}x
                            </TableCell>
                            <TableCell align="right">
                              <span className="font-mono text-base font-bold text-primary">
                                {item.volumenTotal.toLocaleString('es-CL', { maximumFractionDigits: 1 })} {item.unidadBase}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" className="py-8 text-muted border-none">
                            Selecciona al menos un punto de servicio.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}