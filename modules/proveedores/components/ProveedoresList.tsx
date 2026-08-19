// src/modules/proveedores/components/ProveedoresList.tsx
import { useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import type { Proveedor } from '../types';

// Importamos los átomos y componentes del UI Kit
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

export function ProveedoresList({ proveedores, cargando, onVerDetalle, onNuevo }: Props) {
  const [buscador, setBuscador] = useState('');
  const [limite, setLimite] = useState(25);
  const [pagina, setPagina] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);
  const [showKpis, setShowKpis] = useState(true);

  const filtrados = useMemo(() => {
    return proveedores.filter(p => {
      const q = buscador.toLowerCase();
      const n = p.nombre ? p.nombre.toLowerCase() : '';
      const c = p.contacto ? p.contacto.toLowerCase() : '';
      const e = p.email ? p.email.toLowerCase() : '';
      return n.includes(q) || c.includes(q) || e.includes(q);
    }).sort((a, b) => {
      let valA = a.nombre ? a.nombre.toLowerCase() : '';
      let valB = b.nombre ? b.nombre.toLowerCase() : '';
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [proveedores, buscador, sortAsc]);

  const totalPaginas = Math.ceil(filtrados.length / limite) || 1;
  const paginaSegura = Math.min(pagina, totalPaginas);
  
  const paginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * limite;
    return filtrados.slice(inicio, inicio + limite);
  }, [filtrados, paginaSegura, limite]);

  // Cálculos para las tarjetas de KPIs
  const totalProveedores = proveedores.length;
  const conInsumosAsociados = proveedores.filter(p => p.insumos && p.insumos.length > 0).length;
  const promedioInsumos = totalProveedores > 0 
    ? (proveedores.reduce((acc, p) => acc + (p.insumos?.length || 0), 0) / totalProveedores).toFixed(1) 
    : '0';

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in p-4 md:p-6 bg-slate-950 text-slate-100 overflow-hidden">      
      {/* 1. MODULE HEADER TRANSPARENTE */}
      <ModuleHeader 
        icon={<Users size={20} />}
        title="Directorio de Proveedores"
        subtitle="Gestión de distribuidores, catálogos de ofertas y auditoría de precios."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
        primaryAction={
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={14} />} 
            onClick={onNuevo}
          >
            Nuevo Proveedor
          </Button>
        }
      />

      {/* 1.5 TARJETAS DE INDICADORES (KPIs) DESPLEGABLES */}
      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard 
            label="Total Proveedores" 
            value={
              <>
                {totalProveedores} <span className="text-xs font-normal text-slate-500">Registrados</span>
              </>
            } 
          />

          <SummaryCard 
            label="Proveedores con Insumos" 
            value={
              <>
                {conInsumosAsociados} <span className="text-xs font-normal text-slate-500">/ {totalProveedores}</span>
              </>
            }
            valueClassName="text-emerald-400"
          />

          <SummaryCard 
            label="Promedio Insumos / Prov." 
            value={promedioInsumos}
            valueClassName="text-sky-400"
          />
        </div>
      )}

      {/* 2. BARRA DE HERRAMIENTAS */}
      <TableToolbar 
        busqueda={buscador}
        onBusquedaChange={(val) => {
          setBuscador(val);
          setPagina(1);
        }}
        placeholder="Buscar proveedor, contacto o email..."
        limite={limite}
        onLimiteChange={(val) => {
          setLimite(val);
          setPagina(1);
        }}
      />

      {/* 3. TABLA DE RESULTADOS (Usando el UI Kit con esquinas superiores redondeadas y sin bordes laterales) */}
      <Table className="flex-1">
        <TableHead>
          <tr>
            <TableHeaderCell isSortable sortDirection={sortAsc ? 'asc' : 'desc'} onSort={() => setSortAsc(!sortAsc)}>
              Nombre
            </TableHeaderCell>
            <TableHeaderCell>Contacto</TableHeaderCell>
            <TableHeaderCell>Teléfono</TableHeaderCell>
            <TableHeaderCell align="center">Insumos Asociados</TableHeaderCell>
            <TableHeaderCell align="center">Acciones</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {cargando ? (
            <TableRow>
              <TableCell colSpan={5} align="center" className="py-12 text-slate-500 font-mono text-xs animate-pulse">
                Cargando proveedores...
              </TableCell>
            </TableRow>
          ) : paginados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" className="py-12 text-slate-500 font-mono text-xs">
                No se encontraron proveedores.
              </TableCell>
            </TableRow>
          ) : (
            paginados.map(p => (
              <TableRow key={p.id} isClickable onClick={() => onVerDetalle(p)}>
                <TableCell className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {p.nombre}
                </TableCell>
                <TableCell className="text-xs text-slate-300">
                  {p.contacto || '-'}
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-400">
                  {p.telefono || '-'}
                </TableCell>
                <TableCell align="center" className="text-xs font-mono text-emerald-400 font-bold">
                  {p.insumos?.length || 0} insumos
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => onVerDetalle(p)}
                    className="h-7 text-[10px] bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-900/50"
                  >
                    Ver Ficha
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 4. FOOTER PAGINACIÓN (Minimalista y unificado del UI Kit) */}
      <TablePagination 
        paginaActual={paginaSegura}
        totalPaginas={totalPaginas}
        onCambiarPagina={(p) => setPagina(p)}
        elementosMostrados={filtrados.length === 0 ? 0 : paginados.length}
        totalElementos={filtrados.length}
      />

    </div>
  );
}