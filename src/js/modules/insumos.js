// Módulo de Insumos y Costos (Vistas Separadas / Supabase / Proveedores / Histórico Dual y Paginado)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let listaInsumosLocal = [];
let listaTiposInsumosLocal = [];
let listaProveedoresGlobal = [];
let proveedoresAsociadosActuales = new Map();
let insumoSeleccionadoId = null;

// Variables para el paginador y buscador de la sub-pantalla de histórico
let historicoInsumoActualData = [];
let paginaActualHistorico = 1;
const registrosPorPagina = 10;
let insumoActualNombreCache = '';

export async function initInsumos() {
    await cargarTiposInsumos();
    await cargarProveedoresGlobales();
    await obtenerInsumosSupabase();
    window.cambiarVistaInsumos('listado');
}

window.cambiarVistaInsumos = function(vista) {
    const vListado = document.getElementById('vista-insumos-listado');
    const vDetalle = document.getElementById('vista-insumos-detalle');
    const vForm = document.getElementById('vista-insumos-formulario');
    const vHistorico = document.getElementById('vista-insumos-historico');

    if (vListado) vListado.classList.add('hidden');
    if (vDetalle) vDetalle.classList.add('hidden');
    if (vForm) vForm.classList.add('hidden');
    if (vHistorico) vHistorico.classList.add('hidden');

    if (vista === 'listado') {
        if (vListado) vListado.classList.remove('hidden');
        renderizarTablaInsumos(listaInsumosLocal);
    } else if (vista === 'detalle') {
        if (vDetalle) vDetalle.classList.remove('hidden');
    } else if (vista === 'formulario') {
        if (vForm) vForm.classList.remove('hidden');
    } else if (vista === 'historico') {
        if (vHistorico) vHistorico.classList.remove('hidden');
    }
}

async function cargarTiposInsumos() {
    try {
        if (!window.supabaseClient) return;
        const { data, error } = await window.supabaseClient.from('tipos_insumos').select('*');
        if (error) throw error;
        listaTiposInsumosLocal = data || [];
    } catch (e) {
        console.warn("No se pudieron cargar los tipos de insumos:", e);
    }
}

async function cargarProveedoresGlobales() {
    try {
        if (!window.supabaseClient) return;
        const { data, error } = await window.supabaseClient.from('proveedores').select('id, nombre').order('nombre', { ascending: true });
        if (error) throw error;
        listaProveedoresGlobal = data || [];
    } catch (e) {
        console.warn("No se pudieron cargar los proveedores:", e);
    }
}

async function obtenerInsumosSupabase() {
    const cuerpo = document.getElementById('tabla-insumos-cuerpo');
    if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-emerald-500 font-mono animate-pulse">Cargando insumos...</td></tr>`;

    try {
        if (!window.supabaseClient) return;

        const { data: insumos, error: errIns } = await window.supabaseClient
            .from('insumos')
            .select('*')
            .order('nombre', { ascending: true });
        
        if (errIns) throw errIns;

        const { data: rels, error: errRel } = await window.supabaseClient
            .from('insumo_proveedores')
            .select('*');

        if (errRel) console.warn("Aviso al consultar insumo_proveedores:", errRel);

        listaInsumosLocal = (insumos || []).map(insumo => {
            const misProveedores = (rels || [])
                .filter(r => r.insumo_id === insumo.id)
                .map(r => {
                    const provObj = listaProveedoresGlobal.find(p => p.id === r.proveedor_id);
                    return {
                        proveedor_id: r.proveedor_id,
                        nombre: provObj ? provObj.nombre : 'Proveedor desconocido',
                        precio_oferta: r.precio_oferta
                    };
                });

            return {
                ...insumo,
                proveedores: misProveedores
            };
        });

        renderizarTablaInsumos(listaInsumosLocal);
    } catch (e) {
        console.error("Error crítico obteniendo insumos:", e);
        if (cuerpo) {
            cuerpo.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-red-400 font-mono text-xs">Error al conectar con Supabase.</td></tr>`;
        }
    }
}

function renderizarTablaInsumos(datos) {
    const cuerpo = document.getElementById('tabla-insumos-cuerpo');
    if (!cuerpo) return;

    if (!Array.isArray(datos) || datos.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-gray-500 text-sm">No hay insumos registrados.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = datos.map(insumo => {
        const tipoObj = listaTiposInsumosLocal.find(t => t.id == insumo.tipo_id);
        const nombreTipo = tipoObj ? tipoObj.nombre : 'General';
        
        const badgeArtesanal = insumo.es_artesanal ? 
            `<span class="bg-purple-950 text-purple-400 border border-purple-900/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Sí</span>` : 
            `<span class="text-gray-500 text-xs">No</span>`;

        const graduacionTexto = insumo.graduacion_alcohol_base > 0 ? 
            `<span class="text-amber-400 font-semibold">${insumo.graduacion_alcohol_base}%</span>` : 
            `<span class="text-gray-500">-</span>`;

        const rendimientoPorcentaje = insumo.rendimiento_neto_porcentaje ? 
            `${(insumo.rendimiento_neto_porcentaje * 100).toFixed(0)}%` : '100%';

        return `
            <tr onclick="window.verDetalleInsumo(${insumo.id})" class="hover:bg-gray-800/40 transition border-b border-gray-800/40 text-sm cursor-pointer group">
                <td class="py-3.5 px-4 font-medium text-white group-hover:text-emerald-400 transition">${insumo.nombre}</td>
                <td class="py-3.5 px-3 text-gray-400 text-xs font-mono">${nombreTipo}</td>
                <td class="py-3.5 px-3 text-center">${badgeArtesanal}</td>
                <td class="py-3.5 px-3 text-center">${graduacionTexto}</td>
                <td class="py-3.5 px-3 text-right font-mono text-gray-200">$${window.formatearMonedaLocal ? window.formatearMonedaLocal(insumo.precio_compra, 0) : insumo.precio_compra}</td>
                <td class="py-3.5 px-3 text-center font-mono text-gray-300 text-xs">${insumo.formato_envase || 1}</td>
                <td class="py-3.5 px-3 text-center font-mono text-gray-400 text-xs">${insumo.unidad_medida || 'ml'}</td>
                <td class="py-3.5 px-3 text-center font-mono text-gray-300 text-xs">${rendimientoPorcentaje}</td>
                <td class="py-3.5 px-3 text-right font-mono text-emerald-400 font-bold">$${window.formatearMonedaLocal ? window.formatearMonedaLocal(insumo.costo_unitario, 4) : insumo.costo_unitario}</td>
            </tr>
        `;
    }).join('');
}

window.verDetalleInsumo = function(id) {
    insumoSeleccionadoId = id;
    const insumo = listaInsumosLocal.find(i => i.id == id);
    if (!insumo) return;

    insumoActualNombreCache = insumo.nombre;

    document.getElementById('detalle-insumo-acciones').innerHTML = `
        <button type="button" onclick="window.prepararEdicionInsumo(${insumo.id})" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow">Editar</button>
        <button type="button" onclick="window.eliminarInsumo(${insumo.id}, '${insumo.nombre}')" class="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition border border-red-900/50">Eliminar</button>
    `;

    const tipoObj = listaTiposInsumosLocal.find(t => t.id == insumo.tipo_id);
    const nombreTipo = tipoObj ? tipoObj.nombre : 'General';
    const rendimientoPorcentaje = insumo.rendimiento_neto_porcentaje ? `${(insumo.rendimiento_neto_porcentaje * 100).toFixed(0)}%` : '100%';

    let mejorProvTexto = "Sin ofertas de proveedores";
    let ofertaMin = null;
    if (insumo.proveedores && insumo.proveedores.length > 0) {
        insumo.proveedores.forEach(p => {
            if (p.precio_oferta > 0 && (ofertaMin === null || p.precio_oferta < ofertaMin)) {
                ofertaMin = p.precio_oferta;
                mejorProvTexto = `${p.nombre} ($${window.formatearMonedaLocal ? window.formatearMonedaLocal(p.precio_oferta, 0) : p.precio_oferta})`;
            }
        });
    }

    document.getElementById('panel-insumo-contenido').innerHTML = `
        <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-4">
                <div>
                    <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono border border-emerald-500/20">${nombreTipo}</span>
                    <h2 class="text-2xl font-bold text-white mt-2">${insumo.nombre}</h2>
                </div>
                <div class="text-right">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Costo Unitario</span>
                    <span class="text-xl font-mono font-bold text-emerald-400">$${window.formatearMonedaLocal ? window.formatearMonedaLocal(insumo.costo_unitario, 4) : insumo.costo_unitario}</span>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Precio Compra</span>
                    <span class="text-sm font-mono text-white font-semibold">$${window.formatearMonedaLocal ? window.formatearMonedaLocal(insumo.precio_compra, 0) : insumo.precio_compra}</span>
                </div>
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Formato / Envase</span>
                    <span class="text-sm font-mono text-white font-semibold">${insumo.formato_envase} ${insumo.unidad_medida}</span>
                </div>
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Rendimiento Neto</span>
                    <span class="text-sm font-mono text-white font-semibold">${rendimientoPorcentaje}</span>
                </div>
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Graduación (ABV)</span>
                    <span class="text-sm font-mono text-amber-400 font-semibold">${insumo.graduacion_alcohol_base > 0 ? insumo.graduacion_alcohol_base + '%' : 'Sin alcohol'}</span>
                </div>
            </div>

            <div class="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl flex items-center justify-between">
                <div>
                    <span class="text-[10px] uppercase font-bold text-emerald-400 block">Proveedor Más Económico Sugerido</span>
                    <span class="text-xs font-semibold text-white">${mejorProvTexto}</span>
                </div>
                ${ofertaMin !== null ? `
                    <button type="button" onclick="window.usarPrecioProveedorRecomendado()" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition shadow">Aplicar Precio</button>
                ` : ''}
            </div>

            <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                <span class="text-xs text-gray-300 font-medium">Origen del Insumo</span>
                <span class="text-xs font-bold font-mono ${insumo.es_artesanal ? 'text-purple-400 bg-purple-950/40 border border-purple-900/50 px-3 py-1 rounded-lg' : 'text-gray-400'}">
                    ${insumo.es_artesanal ? 'Artesanal / Producción Propia' : 'Industrial / Comercial'}
                </span>
            </div>
        </div>

        <div class="space-y-3">
            <h3 class="text-sm font-bold text-emerald-400 uppercase tracking-wider font-mono">Proveedores que Suministran este Insumo</h3>
            <div class="space-y-2">
                ${insumo.proveedores && insumo.proveedores.length > 0 ? insumo.proveedores.map(p => `
                    <div onclick="window.seleccionarProveedorAsociadoInsumo(${p.proveedor_id})" class="bg-gray-900 hover:bg-gray-800/80 border border-gray-800 hover:border-emerald-500/50 p-4 rounded-xl flex items-center justify-between cursor-pointer transition group">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition"></div>
                            <div>
                                <span class="text-xs text-white font-semibold group-hover:text-emerald-400 transition">${p.nombre}</span>
                                <span class="text-[10px] text-gray-400 font-mono block">Haz clic para gestionar o ver perfil</span>
                            </div>
                        </div>
                        <span class="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            ${p.precio_oferta ? '$' + window.formatearMonedaLocal(p.precio_oferta, 0) : 'Sin oferta definida'}
                        </span>
                    </div>
                `).join('') : `<div class="text-xs text-gray-500 py-4 text-center bg-gray-900 border border-gray-800 rounded-xl">Este insumo no tiene proveedores asociados actualmente.</div>`}
            </div>
        </div>

        <div class="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
                <span class="text-xs font-bold text-white block uppercase tracking-wider font-mono text-emerald-400">Histórico de Precios y Costos</span>
                <p class="text-[11px] text-gray-400 mt-0.5">Consulta todos los registros de auditoría y cambios con buscador y paginación.</p>
            </div>
            <button type="button" onclick="window.abrirVistaHistoricoInsumo(${insumo.id}, '${insumo.nombre.replace(/'/g, "\\'")}')" class="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-500/30 font-bold transition flex items-center gap-1.5 shadow">
                <span>Ver Histórico Completo</span>
                <span>→</span>
            </button>
        </div>
    `;

    window.cambiarVistaInsumos('detalle');
}

// Funciones para la navegación y gestión de la sub-pantalla de Histórico
window.abrirVistaHistoricoInsumo = async function(insumoId, nombreInsumo) {
    insumoSeleccionadoId = insumoId;
    insumoActualNombreCache = nombreInsumo;
    
    const titulo = document.getElementById('titulo-historico-insumo');
    if (titulo) titulo.innerText = `Histórico de Precios: ${nombreInsumo}`;

    const inputBuscador = document.getElementById('buscador-historico-insumo');
    if (inputBuscador) inputBuscador.value = '';

    paginaActualHistorico = 1;
    window.cambiarVistaInsumos('historico');
    await cargarDatosHistoricoCompleto(insumoId);
}

window.volverDesdeHistoricoInsumo = function() {
    if (insumoSeleccionadoId) {
        window.verDetalleInsumo(insumoSeleccionadoId);
    } else {
        window.cambiarVistaInsumos('listado');
    }
}

async function cargarDatosHistoricoCompleto(insumoId) {
    const cuerpo = document.getElementById('tabla-historico-insumo-completo');
    if (!cuerpo) return;

    cuerpo.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500 font-mono text-xs">Cargando registros...</td></tr>`;

    try {
        if (!window.supabaseClient) return;
        const { data, error } = await window.supabaseClient
            .from('insumo_precios_historicos')
            .select('*')
            .eq('insumo_id', insumoId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        historicoInsumoActualData = data || [];
        renderizarTablaHistoricoPaginada();
    } catch (e) {
        console.warn("Error al cargar histórico completo:", e);
        cuerpo.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-red-400 text-xs">Error al conectar con el servidor.</td></tr>`;
    }
}

window.renderizarTablaHistoricoPaginada = function() {
    const cuerpo = document.getElementById('tabla-historico-insumo-completo');
    const infoPaginador = document.getElementById('paginador-info');
    if (!cuerpo) return;

    const query = (document.getElementById('buscador-historico-insumo')?.value || '').toLowerCase();
    
    const filtrados = historicoInsumoActualData.filter(h => {
        const fechaStr = h.created_at ? new Date(h.created_at).toLocaleString('es-CL').toLowerCase() : '';
        const precioStr = h.precio_compra ? h.precio_compra.toString() : '';
        return fechaStr.includes(query) || precioStr.includes(query);
    });

    const totalRegistros = filtrados.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;

    if (paginaActualHistorico > totalPaginas) paginaActualHistorico = totalPaginas;
    if (paginaActualHistorico < 1) paginaActualHistorico = 1;

    const inicio = (paginaActualHistorico - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = filtrados.slice(inicio, fin);

    if (infoPaginador) {
        infoPaginador.innerText = `Mostrando página ${paginaActualHistorico} de ${totalPaginas} (${totalRegistros} registros totales)`;
    }

    if (registrosPagina.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500 text-xs">No se encontraron registros históricos.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = registrosPagina.map(h => {
        const fechaFormateada = h.created_at ? new Date(h.created_at).toLocaleString('es-CL', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
        }) : 'Fecha no registrada';

        return `
            <tr class="hover:bg-gray-800/40 transition border-b border-gray-800/40 text-sm">
                <td class="py-3 px-4 font-mono text-gray-300 text-xs">${fechaFormateada}</td>
                <td class="py-3 px-3 text-right font-mono text-emerald-400 font-bold">$${window.formatearMonedaLocal ? window.formatearMonedaLocal(h.precio_compra, 0) : h.precio_compra}</td>
                <td class="py-3 px-3 text-right font-mono text-gray-300">$${window.formatearMonedaLocal ? window.formatearMonedaLocal(h.costo_unitario, 0) : h.costo_unitario}</td>
            </tr>
        `;
    }).join('');
}

window.filtrarHistoricoInsumoLocal = function() {
    paginaActualHistorico = 1;
    renderizarTablaHistoricoPaginada();
}

window.cambiarPaginaHistorico = function(delta) {
    paginaActualHistorico += delta;
    renderizarTablaHistoricoPaginada();
}

window.seleccionarProveedorAsociadoInsumo = function(proveedorId) {
    console.log("Proveedor seleccionado desde insumo:", proveedorId);
}

window.prepararCreacionInsumo = async function() {
    insumoSeleccionadoId = null;
    document.getElementById('form-insumo-titulo').innerText = "Nuevo Insumo";
    document.getElementById('form-insumo').reset();
    document.getElementById('insumo-id').value = '';
    document.getElementById('insumo-rendimiento').value = 100;
    document.getElementById('insumo-formato-envase').value = 1;
    
    const checkArtesanal = document.getElementById('insumo-es-artesanal');
    if (checkArtesanal) checkArtesanal.checked = false;

    await cargarTiposInsumosParaForm();
    await cargarProveedoresGlobales();
    proveedoresAsociadosActuales.clear();
    window.renderizarProveedoresInsumoForm();
    window.calcularCostoUnitarioAutomatico();

    window.cambiarVistaInsumos('formulario');
}

window.prepararEdicionInsumo = async function(id) {
    insumoSeleccionadoId = id;
    const insumo = listaInsumosLocal.find(x => x.id == id);
    if (!insumo) return;

    document.getElementById('form-insumo-titulo').innerText = "Editar Insumo: " + insumo.nombre;
    document.getElementById('insumo-id').value = insumo.id;
    document.getElementById('insumo-nombre').value = insumo.nombre;
    document.getElementById('insumo-unidad').value = insumo.unidad_medida || 'ml';
    document.getElementById('insumo-formato-envase').value = insumo.formato_envase || 1;
    document.getElementById('insumo-precio-compra').value = insumo.precio_compra || 0;
    document.getElementById('insumo-costo-unitario').value = insumo.costo_unitario || 0;
    document.getElementById('insumo-graduacion').value = insumo.graduacion_alcohol_base || 0;
    document.getElementById('insumo-rendimiento').value = insumo.rendimiento_neto_porcentaje ? insumo.rendimiento_neto_porcentaje * 100 : 100;
    
    const checkArtesanal = document.getElementById('insumo-es-artesanal');
    if (checkArtesanal) checkArtesanal.checked = !!insumo.es_artesanal;

    await cargarTiposInsumosParaForm();
    const selectTipo = document.getElementById('insumo-tipo-id');
    if (selectTipo) selectTipo.value = insumo.tipo_id || '';

    await cargarProveedoresGlobales();
    proveedoresAsociadosActuales.clear();
    if (insumo.proveedores && Array.isArray(insumo.proveedores)) {
        insumo.proveedores.forEach(prov => {
            proveedoresAsociadosActuales.set(prov.proveedor_id, prov.precio_oferta);
        });
    }

    window.renderizarProveedoresInsumoForm();
    window.calcularCostoUnitarioAutomatico();
    window.cambiarVistaInsumos('formulario');
}

async function cargarTiposInsumosParaForm() {
    const selectTipo = document.getElementById('insumo-tipo-id');
    if (!selectTipo) return;
    selectTipo.innerHTML = listaTiposInsumosLocal.length > 0 ? 
        listaTiposInsumosLocal.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('') :
        `<option value="">Sin tipos registrados</option>`;
}

window.renderizarProveedoresInsumoForm = function() {
    const contenedor = document.getElementById('contenedor-proveedores-insumo');
    if (!contenedor) return;

    if (listaProveedoresGlobal.length === 0) {
        contenedor.innerHTML = `<div class="text-xs text-gray-500 text-center py-2">No hay proveedores registrados.</div>`;
        return;
    }

    contenedor.innerHTML = listaProveedoresGlobal.map(p => {
        const isChecked = proveedoresAsociadosActuales.has(p.id);
        const precioOfertaVal = isChecked ? (proveedoresAsociadosActuales.get(p.id) ?? '') : '';

        return `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-gray-900 border border-gray-800 gap-3">
                <label class="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input type="checkbox" value="${p.id}" ${isChecked ? 'checked' : ''} onchange="window.toggleProveedorInsumo(${p.id}, this.checked)" class="w-4 h-4 rounded bg-gray-850 border-gray-700 text-emerald-600 focus:ring-emerald-500">
                    <span class="text-xs text-white font-medium">${p.nombre}</span>
                </label>
                <div class="flex items-center gap-1.5">
                    <span class="text-[10px] text-gray-400 font-mono">Oferta $:</span>
                    <input type="number" step="0.01" id="precio-oferta-${p.id}" value="${precioOfertaVal}" ${!isChecked ? 'disabled' : ''} oninput="window.actualizarPrecioOferta(${p.id}, this.value)" placeholder="Ej: 14500" class="w-32 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono transition shadow-inner">
                </div>
            </div>
        `;
    }).join('');
}

window.toggleProveedorInsumo = function(proveedorId, isChecked) {
    const inputPrecio = document.getElementById(`precio-oferta-${proveedorId}`);
    if (isChecked) {
        proveedoresAsociadosActuales.set(proveedorId, null);
        if (inputPrecio) {
            inputPrecio.disabled = false;
            inputPrecio.focus();
        }
    } else {
        proveedoresAsociadosActuales.delete(proveedorId);
        if (inputPrecio) {
            inputPrecio.value = '';
            inputPrecio.disabled = true;
        }
    }
}

window.actualizarPrecioOferta = function(proveedorId, valor) {
    const num = valor === '' ? null : parseFloat(valor);
    if (proveedoresAsociadosActuales.has(proveedorId)) {
        proveedoresAsociadosActuales.set(proveedorId, isNaN(num) ? null : num);
    }
}

window.obtenerMejorOfertaActual = function() {
    if (proveedoresAsociadosActuales.size === 0) return null;
    let mejorPrecio = null;
    let mejorProveedorId = null;

    for (let [provId, oferta] of proveedoresAsociadosActuales.entries()) {
        if (oferta !== null && !isNaN(oferta) && oferta > 0) {
            if (mejorPrecio === null || oferta < mejorPrecio) {
                mejorPrecio = oferta;
                mejorProveedorId = provId;
            }
        }
    }
    return mejorPrecio !== null ? { proveedorId: mejorProveedorId, precio: mejorPrecio } : null;
};

window.aplicarMejorPrecioOferta = function() {
    const mejor = window.obtenerMejorOfertaActual();
    if (!mejor) {
        alert("Ninguno de los proveedores seleccionados tiene un precio de oferta válido definido.");
        return;
    }

    const inputPrecioCompra = document.getElementById('insumo-precio-compra');
    if (inputPrecioCompra) {
        inputPrecioCompra.value = mejor.precio;
        window.calcularCostoUnitarioAutomatico();
    }
};

window.usarPrecioProveedorRecomendado = function() {
    if (!insumoSeleccionadoId) return;
    const insumo = listaInsumosLocal.find(i => i.id == insumoSeleccionadoId);
    if (!insumo || !insumo.proveedores || insumo.proveedores.length === 0) return;

    let ofertaMinima = null;
    insumo.proveedores.forEach(p => {
        if (p.precio_oferta > 0 && (ofertaMinima === null || p.precio_oferta < ofertaMinima)) {
            ofertaMinima = p.precio_oferta;
        }
    });

    if (ofertaMinima === null) {
        alert("Este insumo no tiene precios de oferta registrados en sus proveedores.");
        return;
    }

    window.prepararEdicionInsumo(insumo.id);
    setTimeout(() => {
        const inputPrecio = document.getElementById('insumo-precio-compra');
        if (inputPrecio) {
            inputPrecio.value = ofertaMinima;
            window.calcularCostoUnitarioAutomatico();
        }
    }, 100);
};

window.calcularCostoUnitarioAutomatico = function() {
    const precioCompra = parseFloat(document.getElementById('insumo-precio-compra')?.value) || 0;
    const formatoEnvase = parseFloat(document.getElementById('insumo-formato-envase')?.value) || 1;
    const rendimiento = (parseFloat(document.getElementById('insumo-rendimiento')?.value) || 100) / 100;

    if (formatoEnvase <= 0) return;

    const costoCalculado = (precioCompra / formatoEnvase) / (rendimiento > 0 ? rendimiento : 1);

    const labelCosto = document.getElementById('label-costo-calculado');
    const inputCosto = document.getElementById('insumo-costo-unitario');
    
    if (labelCosto) labelCosto.textContent = `$${window.formatearMonedaLocal ? window.formatearMonedaLocal(costoCalculado, 4) : costoCalculado.toFixed(4)}`;
    if (inputCosto) inputCosto.value = costoCalculado.toFixed(4);
}

async function generarSlugUnico(nombre, idActual = null) {
    let slugBase = nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, '-');

    if (!slugBase) slugBase = 'insumo';

    let slugFinal = slugBase;
    let contador = 1;

    while (true) {
        let urlCheck = `${SUPABASE_URL}/rest/v1/insumos?slug=eq.${slugFinal}&select=id`;
        if (idActual) urlCheck += `&id=neq.${idActual}`;

        try {
            const res = await fetch(urlCheck, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            const existing = await res.json();
            if (!existing || existing.length === 0) break;
            slugFinal = `${slugBase}-${contador}`;
            contador++;
        } catch (e) {
            break;
        }
    }
    return slugFinal;
}

window.guardarInsumo = async function(e) {
    e.preventDefault();
    if (!window.supabaseClient) return;

    const idInput = document.getElementById('insumo-id').value;
    const esEdicion = idInput !== '';

    const nombreInsumo = document.getElementById('insumo-nombre').value;
    const slugUnico = await generarSlugUnico(nombreInsumo, esEdicion ? idInput : null);

    const precioCompra = parseFloat(document.getElementById('insumo-precio-compra').value) || 0;
    const formatoEnvase = parseFloat(document.getElementById('insumo-formato-envase').value) || 1;
    const rendimiento = (parseFloat(document.getElementById('insumo-rendimiento').value) || 100) / 100;
    const costoUnitarioCalculado = (precioCompra / formatoEnvase) / (rendimiento > 0 ? rendimiento : 1);

    const insumoPayload = {
        nombre: nombreInsumo,
        slug: slugUnico,
        tipo_id: parseInt(document.getElementById('insumo-tipo-id').value) || null,
        unidad_medida: document.getElementById('insumo-unidad').value,
        formato_envase: formatoEnvase,
        precio_compra: precioCompra,
        costo_unitario: costoUnitarioCalculado,
        graduacion_alcohol_base: parseFloat(document.getElementById('insumo-graduacion').value) || 0.00,
        rendimiento_neto_porcentaje: rendimiento,
        es_artesanal: document.getElementById('insumo-es-artesanal')?.checked || false
    };

    try {
        let insumoIdReal = idInput;

        if (esEdicion) {
            const { error: errUpd } = await window.supabaseClient
                .from('insumos')
                .update(insumoPayload)
                .eq('id', idInput);
            if (errUpd) throw errUpd;
        } else {
            const { data: dataIns, error: errIns } = await window.supabaseClient
                .from('insumos')
                .insert([insumoPayload])
                .select();
            if (errIns) throw errIns;
            if (dataIns && dataIns.length > 0) {
                insumoIdReal = dataIns[0].id;
            }
        }

        if (esEdicion) {
            await window.supabaseClient
                .from('insumo_proveedores')
                .delete()
                .eq('insumo_id', insumoIdReal);
        }

        let registrosHistoricos = [];

        registrosHistoricos.push({
            insumo_id: parseInt(insumoIdReal),
            proveedor_id: null,
            precio_compra: precioCompra,
            costo_unitario: costoUnitarioCalculado
        });

        if (proveedoresAsociadosActuales.size > 0) {
            const nuevasRelaciones = Array.from(proveedoresAsociadosActuales.entries()).map(([provId, oferta]) => {
                const precioOfertaVal = oferta !== null && !isNaN(oferta) ? oferta : null;

                if (precioOfertaVal !== null) {
                    registrosHistoricos.push({
                        insumo_id: parseInt(insumoIdReal),
                        proveedor_id: parseInt(provId),
                        precio_compra: precioOfertaVal,
                        costo_unitario: (precioOfertaVal / formatoEnvase) / (rendimiento > 0 ? rendimiento : 1)
                    });
                }

                return {
                    insumo_id: parseInt(insumoIdReal),
                    proveedor_id: parseInt(provId),
                    precio_oferta: precioOfertaVal
                };
            });

            const { error: errRel } = await window.supabaseClient
                .from('insumo_proveedores')
                .insert(nuevasRelaciones);

            if (errRel) console.warn("Aviso al guardar insumo_proveedores:", errRel);
        }

        const { error: errHist } = await window.supabaseClient
            .from('insumo_precios_historicos')
            .insert(registrosHistoricos);

        if (errHist) console.warn("Aviso al guardar histórico de precios:", errHist);

        await obtenerInsumosSupabase();
        window.verDetalleInsumo(insumoIdReal);
    } catch (err) {
        console.error("Error al procesar insumo:", err);
        alert("Ocurrió un error al guardar el insumo en Supabase. Revisa la consola.");
    }
}

window.eliminarInsumo = async function(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el insumo "${nombre}"?`)) return;

    try {
        if (!window.supabaseClient) return;
        const { error } = await window.supabaseClient
            .from('insumos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await obtenerInsumosSupabase();
        window.cambiarVistaInsumos('listado');
    } catch (err) {
        console.error("Error al eliminar insumo:", err);
        alert("No se pudo eliminar el insumo.");
    }
}

window.filtrarInsumos = function() {
    const query = document.getElementById('buscador-insumos').value.toLowerCase();
    const filtrados = listaInsumosLocal.filter(i => i.nombre.toLowerCase().includes(query));
    renderizarTablaInsumos(filtrados);
}

export default initInsumos;