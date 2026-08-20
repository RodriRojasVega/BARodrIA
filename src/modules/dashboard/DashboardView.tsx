// src/modules/dashboard/DashboardView.tsx
import { useState, useEffect } from 'react';
import { LayoutDashboard, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Componentes del UI Kit Maestro 2.0
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';

export function DashboardView() {
  const [cargando, setCargando] = useState<boolean>(true);

  const [kpis, setKpis] = useState({
    insumos: 0,
    subRecetas: 0,
    cocteles: 0,
    proveedores: 0,
  });

  const [catalogos, setCatalogos] = useState({
    categorias: 0,
    familias: 0,
    soportes: 0,
    hielos: 0,
    tecnicas: 0,
    tiposInsumos: 0,
    tiposSubRecetas: 0,
  });

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  async function obtenerConteoTabla(nombreTabla: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(nombreTabla)
        .select('*', { count: 'exact', head: true });
      
      if (error) return 0;
      return count ?? 0;
    } catch (e) {
      return 0;
    }
  }

  async function cargarDatosDashboard() {
    setCargando(true);
    const [
      totalInsumos, totalSubRecetas, totalCocteles, totalProveedores,
      totalCategorias, totalFamilias, totalSoportes, totalHielos,
      totalTecnicas, totalTiposInsumos, totalTiposSubRecetas
    ] = await Promise.all([
      obtenerConteoTabla('insumos'),
      obtenerConteoTabla('sub_recetas_artesanales'),
      obtenerConteoTabla('cocteles'),
      obtenerConteoTabla('proveedores'),
      obtenerConteoTabla('categorias'),
      obtenerConteoTabla('familias'),
      obtenerConteoTabla('soportes'),
      obtenerConteoTabla('hielos'),
      obtenerConteoTabla('tecnicas'),
      obtenerConteoTabla('tipos_insumos'),
      obtenerConteoTabla('tipos_sub_recetas')
    ]);

    setKpis({
      insumos: totalInsumos,
      subRecetas: totalSubRecetas,
      cocteles: totalCocteles,
      proveedores: totalProveedores,
    });

    setCatalogos({
      categorias: totalCategorias,
      familias: totalFamilias,
      soportes: totalSoportes,
      hielos: totalHielos,
      tecnicas: totalTecnicas,
      tiposInsumos: totalTiposInsumos,
      tiposSubRecetas: totalTiposSubRecetas,
    });
    setCargando(false);
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground p-4 md:p-6 space-y-8 animate-fade-in">
      
      <ModuleHeader 
        icon={<LayoutDashboard size={20} />}
        title="Live Dashboard"
        //subtitle="Métricas operativas y estado de catálogos."
        primaryAction={
          <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg bg-surface">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-[10px] font-mono text-muted font-bold uppercase tracking-wider">Supabase Ready</span>
          </div>
        }
      />

      {/* MÉTRICAS OPERATIVAS */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider font-mono">Métricas Principales</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard label="Insumos" value={cargando ? '...' : kpis.insumos} valueClassName="text-primary text-3xl font-bold" />
          <SummaryCard label="Sub-recetas" value={cargando ? '...' : kpis.subRecetas} valueClassName="text-primary text-3xl font-bold" />
          <SummaryCard label="Cócteles" value={cargando ? '...' : kpis.cocteles} valueClassName="text-primary text-3xl font-bold" />
          <SummaryCard label="Proveedores" value={cargando ? '...' : kpis.proveedores} valueClassName="text-primary text-3xl font-bold" />
        </div>
      </section>

      {/* CATÁLOGOS MAESTROS */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider font-mono">Tablas Maestras</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <SummaryCard label="Categorías" value={cargando ? '...' : catalogos.categorias} valueClassName="text-foreground" />
          <SummaryCard label="Familias" value={cargando ? '...' : catalogos.familias} valueClassName="text-foreground" />
          <SummaryCard label="Soportes" value={cargando ? '...' : catalogos.soportes} valueClassName="text-foreground" />
          <SummaryCard label="Hielos" value={cargando ? '...' : catalogos.hielos} valueClassName="text-foreground" />
          <SummaryCard label="Técnicas" value={cargando ? '...' : catalogos.tecnicas} valueClassName="text-foreground" />
          <SummaryCard label="T. Insumos" value={cargando ? '...' : catalogos.tiposInsumos} valueClassName="text-foreground" />
          <SummaryCard label="T. Sub-recetas" value={cargando ? '...' : catalogos.tiposSubRecetas} valueClassName="text-foreground" />
        </div>
      </section>

    </div>
  );
}

export default DashboardView;