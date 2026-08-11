// Módulo de Proveedores y Catálogo de Precios Avanzado (Supabase / Módulos ES)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let listaProveedoresLocal = [];
let listaInsumosGlobal = [];
let insumosProveedorActual = new Map();
let proveedorSeleccionadoId = null;

let historicoProveedorActualData = [];
let paginaActualHistoricoProv = 1;
const registrosPorPaginaProv = 10;
let proveedorActualNombreCache = '';

export async function initProveedores() {
    await cargarInsumosGlobales();
    await obtenerProveedoresSupabase();
    cambiarVistaProveedores('listado');

    // Delegación de clics nativa infalible para las filas
    document.addEventListener('click', function(e) {
        const fila = e.target.closest('.fila-proveedor');
        if (fila) {
            const id = fila.getAttribute('data-id');
            if (id) {
                verDetalleProveedor(id);
            }
        }
    });
}

export function cambiarVistaProveedores(vista) {
    const vListado = document.getElementById('vista-proveedores-listado');
    const vDetalle = document.getElementById('vista-proveedores-detalle');
    const vForm = document.getElementById('vista-proveedores-formulario');
    const vHistorico = document.getElementById('vista-proveedores-historico');

    if (vListado) vListado.classList.add('hidden');
    if (vDetalle) vDetalle.classList.add('hidden');
    if (vForm) vForm.classList.add('hidden');
    if (vHistorico) vHistorico.classList.add('hidden');

    if (vista === 'listado') {
        if (vListado) vListado.classList.remove('hidden');
        renderizarTablaProveedores(listaProveedoresLocal);
    } else if (vista === 'detalle') {
        if (vDetalle) vDetalle.classList.remove('hidden');
    } else if (vista === 'formulario') {
        if (vForm) vForm.classList.remove('hidden');
    } else if (vista === 'historico') {
        if (vHistorico) vHistorico.classList.remove('hidden');
    }
}

async function cargarInsumosGlobales() {
    try {
        if (!window.supabaseClient) return;
        const { data, error } = await window.supabaseClient
            .from('insumos')
            .select('id, nombre, unidad_medida, precio_compra, formato_envase, rendimiento_neto_porcentaje')
            .order('nombre', { ascending: true });
        
        if (error) throw error;
        listaInsumosGlobal = data || [];
    } catch (e) {
        console.warn("No se pudieron cargar los insumos globales:", e);
    }
}

async function obtenerProveedoresSupabase() {
    const cuerpo = document.getElementById('tabla-proveedores-cuerpo');
    if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-emerald-500 font-mono animate-pulse">Cargando proveedores...</td></tr>`;

    try {
        if (!window.supabaseClient) return;

        const { data: proveedores, error: errProv } = await window.supabaseClient
            .from('proveedores')
            .select('*')
            .order('nombre', { ascending: true });
        
        if (errProv) throw errProv;

        const { data: rels, error: errRel } = await window.supabaseClient
            .from('insumo_proveedores')
            .select('*');

        if (errRel) console.warn("Aviso al consultar insumo_proveedores:", errRel);

        listaProveedoresLocal = (proveedores || []).map(prov => {
            const misInsumos = (rels || [])
                .filter(r => r.proveedor_id === prov.id)
                .map(r => {
                    const insObj = listaInsumosGlobal.find(i => i.id === r.insumo_id);
                    return {
                        insumo_id: r.insumo_id,
                        nombre: insObj ? insObj.nombre : 'Insumo desconocido',
                        precio_oferta: r.precio_oferta,
                        unidad_medida: insObj ? insObj.unidad_medida : 'ml'
                    };
                });

            return {
                ...prov,
                insumos: misInsumos
            };
        });

        renderizarTablaProveedores(listaProveedoresLocal);
    } catch (e) {
        console.error("Error crítico obteniendo proveedores:", e);
        if (cuerpo) {
            cuerpo.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-400 font-mono text-xs">Error al conectar con Supabase.</td></tr>`;
        }
    }
}

function renderizarTablaProveedores(datos) {
    const cuerpo = document.getElementById('tabla-proveedores-cuerpo');
    if (!cuerpo) return;

    if (!Array.isArray(datos) || datos.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500 text-sm">No hay proveedores registrados.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = datos.map(prov => {
        const totalInsumos = prov.insumos ? prov.insumos.length : 0;

        return `
            <tr data-id="${prov.id}" class="fila-proveedor hover:bg-gray-800/40 transition border-b border-gray-800/40 text-sm cursor-pointer group">
                <td class="py-3.5 px-4 font-medium text-white group-hover:text-emerald-400 transition">${prov.nombre}</td>
                <td class="py-3.5 px-3 text-gray-300 text-xs">${prov.contacto || 'Sin contacto'}</td>
                <td class="py-3.5 px-3 text-gray-400 text-xs font-mono">${prov.telefono || 'Sin teléfono'}</td>
                <td class="py-3.5 px-3 text-gray-400 text-xs">${prov.email || 'Sin email'}</td>
                <td class="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">${totalInsumos} insumos</td>
            </tr>
        `;
    }).join('');
}

export function verDetalleProveedor(id) {
    proveedorSeleccionadoId = id;
    const prov = listaProveedoresLocal.find(p => p.id == id);
    if (!prov) return;

    proveedorActualNombreCache = prov.nombre;

    document.getElementById('detalle-proveedor-acciones').innerHTML = `
        <button type="button" onclick="window.prepararEdicionProveedor(${prov.id})" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow">Editar</button>
        <button type="button" onclick="window.eliminarProveedor(${prov.id}, '${prov.nombre}')" class="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition border border-red-900/50">Eliminar</button>
    `;

    document.getElementById('panel-proveedor-contenido').innerHTML = `
        <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-4">
                <div>
                    <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono border border-emerald-500/20">Distribuidor Autorizado</span>
                    <h2 class="text-2xl font-bold text-white mt-2">${prov.nombre}</h2>
                </div>
                <div class="text-right">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Total Insumos Suministrados</span>
                    <span class="text-xl font-mono font-bold text-emerald-400">${prov.insumos ? prov.insumos.length : 0} productos</span>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Contacto Comercial</span>
                    <span class="text-sm text-white font-semibold">${prov.contacto || 'No especificado'}</span>
                </div>
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Teléfono</span>
                    <span class="text-sm font-mono text-gray-300 font-semibold">${prov.telefono || 'No especificado'}</span>
                </div>
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Correo Electrónico</span>
                    <span class="text-sm text-gray-300 font-semibold">${prov.email || 'No especificado'}</span>
                </div>
            </div>

            ${prov.observaciones ? `
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Observaciones / Notas</span>
                    <p class="text-xs text-gray-300">${prov.observaciones}</p>
                </div>
            ` : ''}
        </div>

        <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="text-sm font-bold text-emerald-400 uppercase tracking-wider">Catálogo de Precios y Ofertas del Proveedor</h3>
                <span class="text-[10px] text-gray-400 font-mono">Listado oficial de insumos surtidos</span>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-950 border-b border-gray-800 text-[10px] uppercase font-mono tracking-wider text-gray-400">
                            <th class="py-3 px-4 font-semibold">Insumo</th>
                            <th class="py-3 px-3 font-semibold">Unidad</th>
                            <th class="py-3 px-3 font-semibold text-right">Precio de Oferta Actual</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800/50 text-sm">
                        ${prov.insumos && prov.insumos.length > 0 ? prov.insumos.map(i => `
                            <tr class="hover:bg-gray-800/40 transition border-b border-gray-800/40">
                                <td class="py-3 px-4 font-medium text-white text-xs">${i.nombre}</td>
                                <td class="py-3 px-3 text-gray-400 text-xs font-mono">${i.unidad_medida}</td>
                                <td class="py-3 px-3 text-right font-mono text-emerald-400 font-bold text-xs">
                                    ${i.precio_oferta ? '$' + window.formatearMonedaLocal(i.precio_oferta, 0) : 'Sin precio definido'}
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="3" class="text-center py-6 text-gray-500 text-xs">Este proveedor no tiene insumos asociados en su catálogo actualmente.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
                <span class="text-xs font-bold text-white block uppercase tracking-wider font-mono text-emerald-400">Histórico de Auditoría de Tarifas</span>
                <p class="text-[11px] text-gray-400 mt-0.5">Consulta todos los registros de auditoría y cambios de precios con buscador y paginación.</p>
            </div>
            <button type="button" onclick="window.abrirVistaHistoricoProveedor(${prov.id}, '${prov.nombre.replace(/'/g, "\\'")}')" class="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-500/30 font-bold transition flex items-center gap-1.5 shadow">
                <span>Ver Histórico Completo</span>
                <span>→</span>
            </button>
        </div>
    `;

    cambiarVistaProveedores('detalle');
}

export async function abrirVistaHistoricoProveedor(proveedorId, nombreProveedor) {
    proveedorSeleccionadoId = proveedorId;
    proveedorActualNombreCache = nombreProveedor;
    
    const titulo = document.getElementById('titulo-historico-proveedor');
    if (titulo) titulo.innerText = `Histórico de Auditoría: ${nombreProveedor}`;

    const inputBuscador = document.getElementById('buscador-historico-proveedor');
    if (inputBuscador) inputBuscador.value = '';

    paginaActualHistoricoProv = 1;
    cambiarVistaProveedores('historico');
    await cargarDatosHistoricoProveedorCompleto(proveedorId);
}

export function volverDesdeHistoricoProveedor() {
    if (proveedorSeleccionadoId) {
        verDetalleProveedor(proveedorSeleccionadoId);
    } else {
        cambiarVistaProveedores('listado');
    }
}

async function cargarDatosHistoricoProveedorCompleto(proveedorId) {
    const cuerpo = document.getElementById('tabla-historico-proveedor-completo');
    if (!cuerpo) return;

    cuerpo.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500 font-mono text-xs">Cargando registros...</td></tr>`;

    try {
        if (!window.supabaseClient) return;
        const { data, error } = await window.supabaseClient
            .from('insumo_precios_historicos')
            .select('*')
            .eq('proveedor_id', proveedorId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        historicoProveedorActualData = data || [];
        renderizarTablaHistoricoProveedorPaginada();
    } catch (e) {
        console.warn("Error al cargar histórico completo del proveedor:", e);
        cuerpo.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-red-400 text-xs">Error al conectar con el servidor.</td></tr>`;
    }
}

export function renderizarTablaHistoricoProveedorPaginada() {
    const cuerpo = document.getElementById('tabla-historico-proveedor-completo');
    const infoPaginador = document.getElementById('paginador-info-proveedor');
    if (!cuerpo) return;

    const query = (document.getElementById('buscador-historico-proveedor')?.value || '').toLowerCase();
    
    const filtrados = historicoProveedorActualData.filter(h => {
        const fechaStr = h.created_at ? new Date(h.created_at).toLocaleString('es-CL').toLowerCase() : '';
        const precioStr = h.precio_compra ? h.precio_compra.toString() : '';
        const insObj = listaInsumosGlobal.find(i => i.id === h.insumo_id);
        const nombreInsumo = insObj ? insObj.nombre.toLowerCase() : '';
        return fechaStr.includes(query) || precioStr.includes(query) || nombreInsumo.includes(query);
    });

    const totalRegistros = filtrados.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaProv) || 1;

    if (paginaActualHistoricoProv > totalPaginas) paginaActualHistoricoProv = totalPaginas;
    if (paginaActualHistoricoProv < 1) paginaActualHistoricoProv = 1;

    const inicio = (paginaActualHistoricoProv - 1) * registrosPorPaginaProv;
    const fin = inicio + registrosPorPaginaProv;
    const registrosPagina = filtrados.slice(inicio, fin);

    if (infoPaginador) {
        infoPaginador.innerText = `Mostrando página ${paginaActualHistoricoProv} de ${totalPaginas} (${totalRegistros} registros totales)`;
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

        const insObj = listaInsumosGlobal.find(i => i.id === h.insumo_id);
        const nombreInsumo = insObj ? insObj.nombre : `Insumo #${h.insumo_id}`;

        return `
            <tr class="hover:bg-gray-800/40 transition border-b border-gray-800/40 text-sm">
                <td class="py-3 px-4 font-mono text-gray-300 text-xs">${fechaFormateada}</td>
                <td class="py-3 px-3 font-medium text-white text-xs">${nombreInsumo}</td>
                <td class="py-3 px-3 text-right font-mono text-emerald-400 font-bold">$${window.formatearMonedaLocal ? window.formatearMonedaLocal(h.precio_compra, 0) : h.precio_compra}</td>
            </tr>
        `;
    }).join('');
}

export function filtrarHistoricoProveedorLocal() {
    paginaActualHistoricoProv = 1;
    renderizarTablaHistoricoProveedorPaginada();
}

export function cambiarPaginaHistoricoProveedor(delta) {
    paginaActualHistoricoProv += delta;
    renderizarTablaHistoricoProveedorPaginada();
}

export function prepararCreacionProveedor() {
    proveedorSeleccionadoId = null;
    cambiarVistaProveedores('formulario');

    const tituloForm = document.getElementById('form-proveedor-titulo');
    if (tituloForm) tituloForm.innerText = "Nuevo Proveedor";

    const formEl = document.getElementById('form-proveedor');
    if (formEl) formEl.reset();

    const inputId = document.getElementById('proveedor-id');
    if (inputId) inputId.value = '';

    insumosProveedorActual.clear();
    renderizarListadosEdicionProveedor();
}

export function prepararEdicionProveedor(id) {
    proveedorSeleccionadoId = id;
    const prov = listaProveedoresLocal.find(x => x.id == id);
    if (!prov) return;

    cambiarVistaProveedores('formulario');

    const tituloForm = document.getElementById('form-proveedor-titulo');
    if (tituloForm) tituloForm.innerText = "Editar Proveedor: " + (prov.nombre || '');

    const inputId = document.getElementById('proveedor-id');
    if (inputId) inputId.value = prov.id || '';

    const inputNombre = document.getElementById('proveedor-nombre');
    if (inputNombre) inputNombre.value = prov.nombre || '';

    const inputContacto = document.getElementById('proveedor-contacto');
    if (inputContacto) inputContacto.value = prov.contacto || '';

    const inputTelefono = document.getElementById('proveedor-telefono');
    if (inputTelefono) inputTelefono.value = prov.telefono || '';

    const inputEmail = document.getElementById('proveedor-email');
    if (inputEmail) inputEmail.value = prov.email || '';

    const inputObs = document.getElementById('proveedor-observaciones');
    if (inputObs) inputObs.value = prov.observaciones || '';

    insumosProveedorActual.clear();
    if (prov.insumos && Array.isArray(prov.insumos)) {
        prov.insumos.forEach(ins => {
            insumosProveedorActual.set(ins.insumo_id, ins.precio_oferta);
        });
    }

    renderizarListadosEdicionProveedor();
}

export function renderizarListadosEdicionProveedor() {
    const contenedorAsociados = document.getElementById('lista-insumos-asociados');
    const contenedorDisponibles = document.getElementById('lista-insumos-disponibles');
    if (!contenedorAsociados || !contenedorDisponibles) return;

    const insumosAsociadosArr = listaInsumosGlobal.filter(ins => insumosProveedorActual.has(ins.id));
    const insumosDisponiblesArr = listaInsumosGlobal.filter(ins => !insumosProveedorActual.has(ins.id));

    if (insumosAsociadosArr.length === 0) {
        contenedorAsociados.innerHTML = `<div class="text-xs text-gray-500 py-3 text-center">No hay insumos asignados a este proveedor. Agrega algunos desde el listado derecho.</div>`;
    } else {
        contenedorAsociados.innerHTML = insumosAsociadosArr.map(ins => {
            const precioActual = insumosProveedorActual.get(ins.id);
            const precioFormateado = precioActual !== null && precioActual !== undefined ? precioActual : '';

            return `
                <div class="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800 gap-3">
                    <div class="flex-1">
                        <span class="text-xs text-white font-semibold block">${ins.nombre}</span>
                        <span class="text-[10px] text-gray-400 font-mono">Unidad: ${ins.unidad_medida}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1.5">
                            <span class="text-[10px] text-gray-400 font-mono">Oferta $:</span>
                            <input type="number" step="0.01" id="input-oferta-${ins.id}" value="${precioFormateado}" oninput="window.actualizarPrecioOferta(${ins.id}, this.value)" placeholder="0" class="w-28 bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono">
                        </div>
                        <button type="button" onclick="window.removerInsumoDeProveedor(${ins.id})" class="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 px-2.5 py-1.5 rounded-lg border border-red-900/50 transition font-bold" title="Quitar insumo">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (insumosDisponiblesArr.length === 0) {
        contenedorDisponibles.innerHTML = `<div class="text-xs text-gray-500 py-3 text-center">Todos los insumos globales ya están asociados a este proveedor.</div>`;
    } else {
        contenedorDisponibles.innerHTML = insumosDisponiblesArr.map(ins => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-gray-950/60 border border-gray-800/60 gap-3">
                <div>
                    <span class="text-xs text-gray-300 font-medium block">${ins.nombre}</span>
                    <span class="text-[10px] text-gray-500 font-mono">Unidad: ${ins.unidad_medida}</span>
                </div>
                <button type="button" onclick="window.agregarInsumoAProveedor(${ins.id})" class="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition font-bold flex items-center gap-1">
                    <span>+ Agregar</span>
                </button>
            </div>
        `).join('');
    }
}

export function agregarInsumoAProveedor(insumoId) {
    insumosProveedorActual.set(insumoId, 0);
    renderizarListadosEdicionProveedor();
}

export function removerInsumoDeProveedor(insumoId) {
    insumosProveedorActual.delete(insumoId);
    renderizarListadosEdicionProveedor();
}

export function actualizarPrecioOferta(insumoId, valor) {
    const num = valor === '' ? null : parseFloat(valor);
    insumosProveedorActual.set(insumoId, isNaN(num) ? null : num);
}

export async function guardarProveedor(e) {
    e.preventDefault();
    if (!window.supabaseClient) return;

    const idInput = document.getElementById('proveedor-id').value;
    const esEdicion = idInput !== '';

    const proveedorPayload = {
        nombre: document.getElementById('proveedor-nombre').value,
        contacto: document.getElementById('proveedor-contacto').value,
        telefono: document.getElementById('proveedor-telefono').value,
        email: document.getElementById('proveedor-email').value,
        observaciones: document.getElementById('proveedor-observaciones').value
    };

    try {
        let proveedorIdReal = idInput;

        if (esEdicion) {
            const { error: errUpd } = await window.supabaseClient
                .from('proveedores')
                .update(proveedorPayload)
                .eq('id', idInput);
            if (errUpd) throw errUpd;
        } else {
            const { data: dataProv, error: errProv } = await window.supabaseClient
                .from('proveedores')
                .insert([proveedorPayload])
                .select();
            if (errProv) throw errProv;
            if (dataProv && dataProv.length > 0) {
                proveedorIdReal = dataProv[0].id;
            }
        }

        let relacionesAnterioresMap = new Map();
        if (esEdicion) {
            const { data: relsViejas } = await window.supabaseClient
                .from('insumo_proveedores')
                .select('*')
                .eq('proveedor_id', proveedorIdReal);
            
            if (relsViejas) {
                relsViejas.forEach(r => relacionesAnterioresMap.set(r.insumo_id, r.precio_oferta));
            }

            await window.supabaseClient
                .from('insumo_proveedores')
                .delete()
                .eq('proveedor_id', proveedorIdReal);
        }

        let nuevasRelaciones = [];
        let registrosHistoricos = [];

        if (insumosProveedorActual.size > 0) {
            insumosProveedorActual.forEach((precioOferta, insumoId) => {
                const precioOfertaVal = precioOferta !== null && !isNaN(precioOferta) ? precioOferta : null;

                nuevasRelaciones.push({
                    insumo_id: parseInt(insumoId),
                    proveedor_id: parseInt(proveedorIdReal),
                    precio_oferta: precioOfertaVal
                });

                const precioAnterior = relacionesAnterioresMap.has(parseInt(insumoId)) ? relacionesAnterioresMap.get(parseInt(insumoId)) : -1;
                
                if (precioOfertaVal !== null && precioOfertaVal !== precioAnterior) {
                    const insObj = listaInsumosGlobal.find(i => i.id === parseInt(insumoId));
                    
                    const formatoEnvase = insObj && insObj.formato_envase && parseFloat(insObj.formato_envase) > 0 ? parseFloat(insObj.formato_envase) : 1;
                    const rendimientoBruto = insObj && insObj.rendimiento_neto_porcentaje !== null && insObj.rendimiento_neto_porcentaje !== undefined ? parseFloat(insObj.rendimiento_neto_porcentaje) : 1;
                    const rendimiento = rendimientoBruto > 1 ? rendimientoBruto / 100 : rendimientoBruto;

                    const costoUnitarioCalculado = (precioOfertaVal / formatoEnvase) / (rendimiento > 0 ? rendimiento : 1);

                    registrosHistoricos.push({
                        insumo_id: parseInt(insumoId),
                        proveedor_id: parseInt(proveedorIdReal),
                        precio_compra: precioOfertaVal,
                        costo_unitario: costoUnitarioCalculado
                    });
                }
            });

            const { error: errRel } = await window.supabaseClient
                .from('insumo_proveedores')
                .insert(nuevasRelaciones);

            if (errRel) console.warn("Aviso al guardar insumo_proveedores:", errRel);
        }

        if (registrosHistoricos.length > 0) {
            await window.supabaseClient
                .from('insumo_precios_historicos')
                .insert(registrosHistoricos);
        }

        await obtenerProveedoresSupabase();
        verDetalleProveedor(proveedorIdReal);
    } catch (err) {
        console.error("Error al procesar proveedor:", err);
        alert("Ocurrió un error al guardar el proveedor en Supabase. Revisa la consola.");
    }
}

export async function eliminarProveedor(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el proveedor "${nombre}"?`)) return;

    try {
        if (!window.supabaseClient) return;
        const { error } = await window.supabaseClient
            .from('proveedores')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await obtenerProveedoresSupabase();
        cambiarVistaProveedores('listado');
    } catch (err) {
        console.error("Error al eliminar proveedor:", err);
        alert("No se pudo eliminar el proveedor.");
    }
}

export function filtrarProveedores() {
    const query = document.getElementById('buscador-proveedores').value.toLowerCase();
    const filtrados = listaProveedoresLocal.filter(p => p.nombre.toLowerCase().includes(query) || (p.contacto && p.contacto.toLowerCase().includes(query)));
    renderizarTablaProveedores(filtrados);
}

// Vinculación segura de seguridad para que el enrutador global y HTML las reconozcan sin excepciones
window.prepararEdicionProveedor = prepararEdicionProveedor;
window.prepararCreacionProveedor = prepararCreacionProveedor;
window.eliminarProveedor = eliminarProveedor;
window.verDetalleProveedor = verDetalleProveedor;
window.cambiarVistaProveedores = cambiarVistaProveedores;
window.abrirVistaHistoricoProveedor = abrirVistaHistoricoProveedor;
window.volverDesdeHistoricoProveedor = volverDesdeHistoricoProveedor;
window.filtrarProveedores = filtrarProveedores;
window.filtrarHistoricoProveedorLocal = filtrarHistoricoProveedorLocal;
window.cambiarPaginaHistoricoProveedor = cambiarPaginaHistoricoProveedor;
window.agregarInsumoAProveedor = agregarInsumoAProveedor;
window.removerInsumoDeProveedor = removerInsumoDeProveedor;
window.actualizarPrecioOferta = actualizarPrecioOferta;
window.guardarProveedor = guardarProveedor;

export default initProveedores;