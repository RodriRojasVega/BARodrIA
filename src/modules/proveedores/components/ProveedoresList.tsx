// src/modules/proveedores/components/ProveedoresList.tsx
import { useState, useMemo } from 'react';
import { Plus, Truck } from 'lucide-react';
import type { Proveedor } from '@/types/proveedores';

import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

interface Props {
  proveedores: Proveedor[];
  cargando: boolean;
  onVerDetalle: (prov: Proveedor) => void;
  onNuevo: () => void;
}

type ColumnaOrdenable = 'nombre' | 'contacto' | 'telefono' | 'email' | 'observaciones' | 'insumos';

export function ProveedoresList({ proveedores, cargando, onVerDetalle, onNuevo }: Props) {
  const [buscador, setBuscador] = useState('');
  const [limite, setLimite] = useState(10); // Solucionado: Coincide con las opciones del selector (10 por defecto)
  const [pagina, setPagina] = useState(1);
  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrdenable>('nombre');
  const [dirOrden, setDirOrden] = useState<'asc' | 'desc'>('asc');
  const [showKpis, setShowKpis] = useState(false);

  // Manejador general de ordenamiento para todas las columnas
  const manejarOrden = (col: ColumnaOrdenable) => {
    if (columnaOrden === col) {
      setDirOrden(dirOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(col);
      setDirOrden('asc');
    }
  };

  const filtrados = useMemo(() => {
    return proveedores.filter(p => {
      const q = buscador.toLowerCase();
      return (
        p.nombre?.toLowerCase().includes(q) || 
        p.contacto?.toLowerCase().includes(q) || 
        p.email?.toLowerCase().includes(q) ||
        p.telefono?.toLowerCase().includes(q) ||
        p.observaciones?.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (columnaOrden === 'nombre') {
        valA = a.nombre?.toLowerCase() || '';
        valB = b.nombre?.toLowerCase() || '';
      } else if (columnaOrden === 'contacto') {
        valA = a.contacto?.toLowerCase() || '';
        valB = b.contacto?.toLowerCase() || '';
      } else if (columnaOrden === 'telefono') {
        valA = a.telefono?.toLowerCase() || '';
        valB = b.telefono?.toLowerCase() || '';
      } else if (columnaOrden === 'email') {
        valA = a.email?.toLowerCase() || '';
        valB = b.email?.toLowerCase() || '';
      } else if (columnaOrden === 'observaciones') {
        valA = a.observaciones?.toLowerCase() || '';
        valB = b.observaciones?.toLowerCase() || '';
      } else if (columnaOrden === 'insumos') {
        valA = a.insumos?.length || 0;
        valB = b.insumos?.length || 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return dirOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return dirOrden === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });
  }, [proveedores, buscador, columnaOrden, dirOrden]);

  const totalPaginas = Math.ceil(filtrados.length / limite) || 1;
  const paginaSegura = Math.min(pagina, totalPaginas);
  
  const paginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * limite;
    return filtrados.slice(inicio, inicio + limite);
  }, [filtrados, paginaSegura, limite]);

  const totalProveedores = proveedores.length;
  const conInsumosAsociados = proveedores.filter(p => p.insumos?.length > 0).length;
  const promedioInsumos = totalProveedores > 0 
    ? (proveedores.reduce((acc, p) => acc + (p.insumos?.length || 0), 0) / totalProveedores).toFixed(1) 
    : '0';

  return (
    <div className="flex flex-col h-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in">
      
      <ModuleHeader 
        icon={<Truck size={20} />}
        title="Directorio de Proveedores"
        //subtitle="Gestión de distribuidores, catálogos de ofertas y auditoría de precios."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
        primaryAction={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onNuevo}>
            Nuevo Proveedor
          </Button>
        }
      />

      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard label="Total Proveedores" value={totalProveedores.toString()} />
          <SummaryCard label="Proveedores con Insumos" value={`${conInsumosAsociados} / ${totalProveedores}`} />
          <SummaryCard label="Promedio Insumos / Prov." value={promedioInsumos} />
        </div>
      )}

      <TableToolbar 
        busqueda={buscador}
        onBusquedaChange={(val) => { setBuscador(val); setPagina(1); }}
        placeholder="Buscar proveedor, contacto, email o teléfono..."
        limite={limite}
        onLimiteChange={(val) => { setLimite(val); setPagina(1); }}
      />

      <Table className="flex-1">
        <TableHead>
          <tr>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'nombre' ? dirOrden : null} onSort={() => manejarOrden('nombre')}>
              Nombre
            </TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'contacto' ? dirOrden : null} onSort={() => manejarOrden('contacto')}>
              Contacto
            </TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'telefono' ? dirOrden : null} onSort={() => manejarOrden('telefono')}>
              Teléfono
            </TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'email' ? dirOrden : null} onSort={() => manejarOrden('email')}>
              Email
            </TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'observaciones' ? dirOrden : null} onSort={() => manejarOrden('observaciones')}>
              Observaciones
            </TableHeaderCell>
            <TableHeaderCell align="center" isSortable sortDirection={columnaOrden === 'insumos' ? dirOrden : null} onSort={() => manejarOrden('insumos')}>
              Insumos
            </TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {cargando ? (
            <TableRow><TableCell colSpan={6} align="center" className="py-12 text-muted font-mono text-xs animate-pulse">Cargando...</TableCell></TableRow>
          ) : paginados.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center" className="py-12 text-muted">No hay registros encontrados.</TableCell></TableRow>
          ) : (
            paginados.map(p => (
              <TableRow key={p.id} isClickable onClick={() => onVerDetalle(p)}>
                <TableCell className="font-bold text-foreground">{p.nombre}</TableCell>
                <TableCell className="text-muted text-xs">{p.contacto || '-'}</TableCell>
                <TableCell className="text-muted text-xs font-mono">{p.telefono || '-'}</TableCell>
                <TableCell className="text-muted text-xs">{p.email || '-'}</TableCell>
                <TableCell className="text-muted text-xs truncate max-w-xs">{p.observaciones || '-'}</TableCell>
                <TableCell align="center" className="text-primary font-bold font-mono">
                  {p.insumos?.length || 0}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination 
        paginaActual={paginaSegura}
        totalPaginas={totalPaginas}
        onCambiarPagina={(p) => setPagina(p)}
        elementosMostrados={paginados.length}
        totalElementos={filtrados.length}
      />
    </div>
  );
}