// Módulo de Dashboard Operativo (Conteo dinámico con tablas maestras extendidas)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export async function initDashboard() {
    setTimeout(() => {
        cargarMetricasYCatalogos();
    }, 150);
}

async function cargarMetricasYCatalogos() {
    if (!window.supabaseClient) {
        console.warn("Cliente de Supabase no inicializado.");
        return;
    }

    async function obtenerConteoTabla(nombreTabla) {
        try {
            const { count, error } = await window.supabaseClient
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

    try {
        // Consultar métricas operativas y catálogos completos en paralelo
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
            obtenerConteoTabla('soportes'),          // Tabla maestra: soportes de cristalería
            obtenerConteoTabla('hielos'),            // Tabla maestra: tipos de hielo
            obtenerConteoTabla('tecnicas'),          // Tabla maestra: técnicas de barra
            obtenerConteoTabla('tipos_insumos'),
            obtenerConteoTabla('tipos_sub_recetas')
        ]);

        const asignarValor = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        };

        // 1. Inyectar KPIs Principales
        asignarValor('kpi-insumos', totalInsumos);
        asignarValor('kpi-sub-recetas', totalSubRecetas);
        asignarValor('kpi-cocteles', totalCocteles);
        asignarValor('kpi-proveedores', totalProveedores);

        // 2. Inyectar Catálogos y Tablas Maestras
        asignarValor('cat-categorias', totalCategorias);
        asignarValor('cat-familias', totalFamilias);
        asignarValor('cat-soportes', totalSoportes);
        asignarValor('cat-hielos', totalHielos);
        asignarValor('cat-tecnicas', totalTecnicas);
        asignarValor('cat-tipos-insumos', totalTiposInsumos);
        asignarValor('cat-tipos-sub-recetas', totalTiposSubRecetas);

    } catch (e) {
        console.error("Error crítico cargando datos del dashboard:", e);
    }
}

export default initDashboard;