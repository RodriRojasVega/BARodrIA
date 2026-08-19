// src/modules/dashboard/DashboardView.tsx
import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Importamos los componentes del UI Kit unificados
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';

export function DashboardView() {
  const [cargando, setCargando] = useState<boolean>(true);

  // Estados para métricas principales
  const [kpis, setKpis] = useState({
    insumos: 0,
    subRecetas: 0,
    cocteles: 0,
    proveedores: 0,
  });

  // Estados para catálogos y tablas maestras
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
      
      if (error) {
        console.warn(`Aviso al consultar la tabla '${nombreTabla}':`, error.message);
        return 0;
      }
      return count ?? 0;
    } catch (e) {
      console.warn(`Excepción al consultar '${nombreTabla}':`, e);
      return 0;
    }
  }

  async function cargarDatosDashboard() {
    setCargando(true);
    try {
      const [
        totalInsumos,
        totalSubRecetas,
        totalCocteles,
        totalProveedores,
        totalCategorias,
        totalFamilias,
        totalSoportes,
        totalHielos,
        totalTecnicas,
        totalTiposInsumos,
        totalTiposSubRecetas
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

    } catch (e) {
      console.error("Error crítico cargando datos del dashboard:", e);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 md:p-6 space-y-6 animate-fade-in pb-6">
      
      {/* 1. MODULE HEADER TRANSPARENTE (Sin props de toggle de KPI para eliminar por completo el botón) */}
      <ModuleHeader 
        icon={<LayoutDashboard size={20} />}
        title="Panel de Control Operativo"
        subtitle="Métricas en tiempo real, volúmenes de inventario y estado general de la plataforma."
        primaryAction={
          <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-xl shrink-0 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Supabase Conectado</span>
          </div>
        }
      />

      {/* 2. SECCIÓN 1: MÉTRICAS OPERATIVAS (Usando SummaryCard con estilos personalizados por color) */}
      <div className="space-y-3 shrink-0">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">Métricas Principales</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard 
            label="Total Insumos" 
            value={cargando ? '...' : kpis.insumos} 
            className="bg-sky-950/20 border-sky-900/50 hover:bg-sky-950/40"
            labelClassName="text-sky-400"
            valueClassName="text-sky-100 text-3xl sm:text-4xl"
          />

          <SummaryCard 
            label="Sub-recetas" 
            value={cargando ? '...' : kpis.subRecetas} 
            className="bg-purple-950/20 border-purple-900/50 hover:bg-purple-950/40"
            labelClassName="text-purple-400"
            valueClassName="text-purple-100 text-3xl sm:text-4xl"
          />

          <SummaryCard 
            label="Total Cócteles" 
            value={cargando ? '...' : kpis.cocteles} 
            className="bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-950/40"
            labelClassName="text-emerald-400"
            valueClassName="text-emerald-100 text-3xl sm:text-4xl"
          />

          <SummaryCard 
            label="Proveedores" 
            value={cargando ? '...' : kpis.proveedores} 
            className="bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/40"
            labelClassName="text-amber-400"
            valueClassName="text-amber-100 text-3xl sm:text-4xl"
          />
        </div>
      </div>

      {/* 3. SECCIÓN 2: CATÁLOGOS MAESTROS (Usando SummaryCard con formato compacto) */}
      <div className="space-y-3 shrink-0">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">Tablas Maestras y Catálogos</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <SummaryCard 
            label="Categorías" 
            value={cargando ? '...' : catalogos.categorias} 
            className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-950 py-3.5"
            valueClassName="text-white text-xl mt-1"
          />

          <SummaryCard 
            label="Familias" 
            value={cargando ? '...' : catalogos.familias} 
            className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-950 py-3.5"
            valueClassName="text-white text-xl mt-1"
          />

          <SummaryCard 
            label="Soportes" 
            value={cargando ? '...' : catalogos.soportes} 
            className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-950 py-3.5"
            valueClassName="text-white text-xl mt-1"
          />

          <SummaryCard 
            label="Hielos" 
            value={cargando ? '...' : catalogos.hielos} 
            className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-950 py-3.5"
            valueClassName="text-white text-xl mt-1"
          />

          <SummaryCard 
            label="Técnicas" 
            value={cargando ? '...' : catalogos.tecnicas} 
            className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-950 py-3.5"
            valueClassName="text-white text-xl mt-1"
          />

          <SummaryCard 
            label="T. Insumos" 
            value={cargando ? '...' : catalogos.tiposInsumos} 
            className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-950 py-3.5"
            valueClassName="text-white text-xl mt-1"
          />

          <SummaryCard 
            label="T. Sub-recetas" 
            value={cargando ? '...' : catalogos.tiposSubRecetas} 
            className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-950 py-3.5 lg:col-span-1 col-span-2 sm:col-span-3"
            valueClassName="text-white text-xl mt-1"
          />
        </div>
      </div>

    </div>
  );
}

export default DashboardView;