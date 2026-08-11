// src/js/modules/subrecetas.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaSubRecetasLocal = [];
let listaTiposSubRecetasLocal = [];
let listaInsumosLocal = [];

async function initSubRecetas() {
    await cargarDatosAuxiliares();
    await obtenerSubRecetasSupabase();
    window.cambiarVistaSubRecetas('listado');
}

async function cargarDatosAuxiliares() {
    try {
        const [resTipos, resInsumos] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/tipos_sub_recetas?select=*&order=nombre.asc`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            }),
            fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*&order=nombre.asc`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            })
        ]);

        if (resTipos.ok) listaTiposSubRecetasLocal = await resTipos.json();
        if (resInsumos.ok) listaInsumosLocal = await resInsumos.json();

        poblarSelectsFormulario();
    } catch (e) {
        console.warn("Error cargando datos auxiliares:", e);
    }
}

function poblarSelectsFormulario() {
    const selectTipo = document.getElementById('input-tipo-id');
    if (selectTipo && listaTiposSubRecetasLocal.length > 0) {
        selectTipo.innerHTML = '<option value="">Seleccione tipo...</option>' + 
            listaTiposSubRecetasLocal.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
    }

    const selectInsumo = document.getElementById('input-insumo-asociado');
    if (selectInsumo && listaInsumosLocal.length > 0) {
        selectInsumo.innerHTML = '<option value="">Seleccione insumo en inventario...</option>' + 
            listaInsumosLocal.map(i => `<option value="${i.id}">${i.nombre} (${i.unidad_medida})</option>`).join('');
    }
}

async function obtenerSubRecetasSupabase() {
    const contenedor = document.getElementById('contenedor-tarjetas-subrecetas');
    if (contenedor) contenedor.innerHTML = `<div class="text-center py-12 text-emerald-500 font-mono animate-pulse col-span-full">Cargando sub-recetas...</div>`;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/sub_recetas_artesanales?select=*&order=nombre.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        
        if (!res.ok) throw new Error("Error HTTP al obtener sub-recetas");
        
        listaSubRecetasLocal = await res.json();
        renderizarListaSubRecetas(listaSubRecetasLocal);
    } catch (e) {
        console.error("Error crítico obteniendo sub-recetas:", e);
        if (contenedor) {
            contenedor.innerHTML = `<div class="text-center py-12 text-red-400 font-mono text-xs col-span-full">Error al conectar con Supabase.</div>`;
        }
    }
}

function renderizarListaSubRecetas(datos) {
    const contenedor = document.getElementById('contenedor-tarjetas-subrecetas');
    if (!contenedor) return;

    if (!Array.isArray(datos) || datos.length === 0) {
        contenedor.innerHTML = `<div class="text-center py-12 text-gray-500 text-sm col-span-full">No hay sub-recetas registradas.</div>`;
        return;
    }

    contenedor.innerHTML = datos.map(sub => {
        const tipoObj = listaTiposSubRecetasLocal.find(t => t.id === sub.tipo_id);
        const tipoTexto = tipoObj ? tipoObj.nombre.toUpperCase() : 'PREPARACIÓN';
        
        return `
            <div onclick="window.verDetalleSubReceta(${sub.id})" class="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/60 hover:bg-gray-850 transition cursor-pointer shadow-xl group">
                <div class="flex justify-between items-start gap-2">
                    <h3 class="text-white font-bold text-base leading-snug group-hover:text-emerald-400 transition">${sub.nombre}</h3>
                    <span id="card-costo-${sub.id}" class="font-mono font-bold text-pink-400 text-sm whitespace-nowrap">Calculando...</span>
                </div>

                <div class="flex justify-between items-center pt-3 border-t border-gray-800/60">
                    <span class="bg-purple-950 text-purple-400 border border-purple-900/30 text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">${tipoTexto}</span>
                    <span class="font-mono text-gray-400 text-xs">${sub.rendimiento_batch || 0} ${sub.unidad_rendimiento || 'ml'}</span>
                </div>
            </div>
        `;
    }).join('');

    datos.forEach(async (sub) => {
        try {
            const resBOM = await fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes?sub_receta_id=eq.${sub.id}&select=*,insumos(*)`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            if (resBOM.ok) {
                const items = await resBOM.json();
                const costoTotal = items.reduce((acc, item) => {
                    const costoUnit = item.insumos ? Number(item.insumos.costo_unitario || 0) : 0;
                    return acc + (Number(item.cantidad) * costoUnit);
                }, 0);
                const costoUnitarioReal = sub.rendimiento_batch > 0 ? (costoTotal / sub.rendimiento_batch) : 0;
                
                const spanCosto = document.getElementById(`card-costo-${sub.id}`);
                if (spanCosto) {
                    const costoFormateado = window.formatearMonedaLocal ? window.formatearMonedaLocal(costoUnitarioReal, 4) : costoUnitarioReal.toFixed(4);
                    spanCosto.textContent = `$${costoFormateado}/${sub.unidad_rendimiento || 'ml'}`;
                }
            }
        } catch (err) {
            const spanCosto = document.getElementById(`card-costo-${sub.id}`);
            if (spanCosto) spanCosto.textContent = `$0,0000`;
        }
    });
}

// ================= NAVEGACIÓN DE PANTALLAS =================
window.cambiarVistaSubRecetas = function(vista) {
    const vListado = document.getElementById('vista-listado');
    const vDetalle = document.getElementById('vista-detalle');
    const vFormulario = document.getElementById('vista-formulario');

    if (vListado) vListado.classList.add('hidden');
    if (vDetalle) vDetalle.classList.add('hidden');
    if (vFormulario) vFormulario.classList.add('hidden');

    if (vista === 'listado' && vListado) vListado.classList.remove('hidden');
    if (vista === 'detalle' && vDetalle) vDetalle.classList.remove('hidden');
    if (vista === 'formulario' && vFormulario) vFormulario.classList.remove('hidden');
}

window.verDetalleSubReceta = async function(id) {
    const sub = listaSubRecetasLocal.find(x => x.id === id);
    if (!sub) return;

    window.cambiarVistaSubRecetas('detalle');
    const panel = document.getElementById('panel-detalle-contenido');
    const accionesSup = document.getElementById('detalle-acciones-superiores');
    if (!panel) return;

    if (accionesSup) {
        accionesSup.innerHTML = `
            <button type="button" onclick="window.prepararEdicionSubReceta(${sub.id})" class="text-xs bg-gray-900 hover:bg-gray-800 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 font-bold uppercase transition">Editar</button>
            <button type="button" onclick="window.eliminarSubReceta(${sub.id}, '${sub.nombre}')" class="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-xl border border-red-500/20 font-bold uppercase transition">Eliminar</button>
        `;
    }

    panel.innerHTML = `<div class="text-center py-12 text-emerald-500 font-mono animate-pulse">Cargando desglose de la receta...</div>`;

    let ingredientesBOM = [];
    let pasosList = [];
    let costoTotalLote = 0;

    try {
        const [resBOM, resPasos] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes?sub_receta_id=eq.${sub.id}&select=*,insumos(*)`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            }),
            fetch(`${SUPABASE_URL}/rest/v1/sub_receta_pasos_preparacion?sub_receta_id=eq.${sub.id}&order=numero_paso.asc`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            })
        ]);

        if (resBOM.ok) {
            ingredientesBOM = await resBOM.json();
            costoTotalLote = ingredientesBOM.reduce((acc, item) => {
                const costoInsu = item.insumos ? Number(item.insumos.costo_unitario || 0) : 0;
                return acc + (Number(item.cantidad) * costoInsu);
            }, 0);
        }
        if (resPasos.ok) pasosList = await resPasos.json();
    } catch (e) {
        console.warn("Error cargando detalles relacionales:", e);
    }

    const costoUnitarioReal = (sub.rendimiento_batch > 0 && costoTotalLote > 0) ? (costoTotalLote / sub.rendimiento_batch) : 0;
    const tipoObj = listaTiposSubRecetasLocal.find(t => t.id === sub.tipo_id);
    const tipoTexto = tipoObj ? tipoObj.nombre.toUpperCase() : 'PREPARACIÓN';

    const costoLoteStr = window.formatearMonedaLocal ? window.formatearMonedaLocal(costoTotalLote, 0) : Math.round(costoTotalLote).toLocaleString('es-CL');
    const costoUnitarioStr = window.formatearMonedaLocal ? window.formatearMonedaLocal(costoUnitarioReal, 4) : costoUnitarioReal.toFixed(4);

    panel.innerHTML = `
        <div class="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl space-y-8">
            <div class="border-b border-gray-800 pb-6">
                <span class="bg-purple-950 text-purple-400 border border-purple-900/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">${tipoTexto}</span>
                <h1 class="text-3xl font-bold text-white mt-3">${sub.nombre}</h1>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gray-850/40 p-5 rounded-2xl border border-gray-800">
                    <span class="text-[11px] text-gray-400 uppercase tracking-widest block mb-1">Rendimiento Batch</span>
                    <span class="text-2xl font-mono font-bold text-white">${sub.rendimiento_batch || 0} ${sub.unidad_rendimiento || 'ml'}</span>
                </div>
                <div class="bg-gray-850/40 p-5 rounded-2xl border border-gray-800">
                    <span class="text-[11px] text-gray-400 uppercase tracking-widest block mb-1">Costo Lote</span>
                    <span class="text-2xl font-mono font-bold text-pink-400">$${costoLoteStr}</span>
                </div>
                <div class="bg-gray-850/40 p-5 rounded-2xl border border-gray-800">
                    <span class="text-[11px] text-gray-400 uppercase tracking-widest block mb-1">Costo Unitario</span>
                    <span class="text-2xl font-mono font-bold text-emerald-400">$${costoUnitarioStr} / ${sub.unidad_rendimiento || 'ml'}</span>
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Composición (BOM)</h3>
                <div class="bg-gray-850/20 p-5 rounded-2xl border border-gray-800 space-y-3">
                    ${ingredientesBOM.length > 0 ? ingredientesBOM.map(item => {
                        const ins = item.insumos || {};
                        const costoParcial = Number(item.cantidad) * Number(ins.costo_unitario || 0);
                        const costoParcialStr = window.formatearMonedaLocal ? window.formatearMonedaLocal(costoParcial, 0) : Math.round(costoParcial).toLocaleString('es-CL');
                        return `
                            <div class="flex justify-between items-center text-sm py-2 border-b border-gray-800/40 last:border-0">
                                <span class="text-gray-200">• ${ins.nombre || 'Insumo'}</span>
                                <div class="space-x-6 font-mono text-xs">
                                    <span class="text-gray-400">${item.cantidad} ${item.unidad_medida}</span>
                                    <span class="text-pink-400 font-bold">$${costoParcialStr}</span>
                                </div>
                            </div>
                        `;
                    }).join('') : '<div class="text-xs text-gray-500 italic py-2">No hay insumos registrados en esta sub-receta.</div>'}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-800">
                <div>
                    <h3 class="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4">Pasos de Preparación</h3>
                    <div class="space-y-3">
                        ${pasosList.length > 0 ? pasosList.map(p => `
                            <div class="flex gap-3 text-xs text-gray-300 bg-gray-850/30 p-4 rounded-xl border border-gray-800">
                                <span class="font-mono font-bold text-purple-400">${p.numero_paso}.</span>
                                <p class="leading-relaxed">${p.descripcion}</p>
                            </div>
                        `).join('') : '<p class="text-xs text-gray-500 italic">Sin pasos registrados.</p>'}
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Almacenamiento & Vida Útil</h3>
                        <p class="text-xs text-gray-300 bg-gray-850/30 p-4 rounded-xl border border-gray-800 leading-relaxed">
                            ${sub.indicaciones_almacenamiento || 'N/A'}<br>
                            ${sub.vida_util ? `<strong class="text-amber-300 mt-1 block">Duración: ${sub.vida_util}</strong>` : ''}
                        </p>
                    </div>
                    <div>
                        <h3 class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Economía Circular / Mermas</h3>
                        <p class="text-xs text-gray-300 bg-gray-850/30 p-4 rounded-xl border border-gray-800 leading-relaxed">
                            ${sub.control_mermas_economia_circular || 'No aplica'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ================= GESTIÓN DINÁMICA DE FILAS =================
window.agregarFilaIngrediente = function(insumoId = '', cantidad = '', unidad = 'ml') {
    const contenedor = document.getElementById('contenedor-filas-ingredientes');
    if (!contenedor) return;

    const rowId = 'ing-' + Date.now() + Math.random().toString(36).substr(2, 5);
    const optionsHtml = listaInsumosLocal.map(i => `<option value="${i.id}" ${i.id == insumoId ? 'selected' : ''} class="bg-gray-900 text-white">${i.nombre} (${i.unidad_medida})</option>`).join('');

    const div = document.createElement('div');
    div.id = rowId;
    div.className = "flex items-center gap-3 bg-gray-900 border border-gray-800 p-3 rounded-xl shadow-sm";
    div.innerHTML = `
        <select class="select-insumo-bom flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
            <option value="" class="text-gray-500">Seleccionar insumo...</option>
            ${optionsHtml}
        </select>
        <input type="number" step="0.01" class="input-cant-bom w-28 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" placeholder="Cantidad" value="${cantidad}">
        <select class="select-unidad-bom w-28 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
            <option value="ml" class="bg-gray-900 text-white" ${unidad == 'ml' ? 'selected' : ''}>ml</option>
            <option value="g" class="bg-gray-900 text-white" ${unidad == 'g' ? 'selected' : ''}>g</option>
            <option value="unit" class="bg-gray-900 text-white" ${unidad == 'unit' ? 'selected' : ''}>unit</option>
            <option value="dash" class="bg-gray-900 text-white" ${unidad == 'dash' ? 'selected' : ''}>dash</option>
        </select>
        <button type="button" onclick="document.getElementById('${rowId}').remove()" class="text-red-400 hover:text-red-300 font-bold px-3 py-1 text-sm transition">✕</button>
    `;
    contenedor.appendChild(div);
}

window.agregarFilaPaso = function(numero = '', descripcion = '') {
    const contenedor = document.getElementById('contenedor-filas-pasos');
    if (!contenedor) return;

    const rowId = 'paso-' + Date.now() + Math.random().toString(36).substr(2, 5);
    const totalPasos = contenedor.children.length + 1;

    const div = document.createElement('div');
    div.id = rowId;
    div.className = "flex items-center gap-3 bg-gray-900 border border-gray-800 p-3 rounded-xl shadow-sm";
    div.innerHTML = `
        <span class="font-mono font-bold text-purple-400 text-xs w-8 text-center">${numero || totalPasos}.</span>
        <input type="text" class="input-desc-paso flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" placeholder="Descripción detallada del paso..." value="${descripcion}">
        <button type="button" onclick="document.getElementById('${rowId}').remove()" class="text-red-400 hover:text-red-300 font-bold px-3 py-1 text-sm transition">✕</button>
    `;
    contenedor.appendChild(div);
}

// ================= CREAR Y EDITAR =================
window.prepararCreacionSubReceta = function() {
    window.cambiarVistaSubRecetas('formulario');
    
    const titulo = document.getElementById('form-titulo-seccion');
    if (titulo) titulo.textContent = "Nueva Sub-receta";

    const inputId = document.getElementById('input-subreceta-id');
    if (inputId) inputId.value = '';

    const form = document.getElementById('form-subreceta-completo');
    if (form) form.reset();

    const contIngredientes = document.getElementById('contenedor-filas-ingredientes');
    const contPasos = document.getElementById('contenedor-filas-pasos');
    if (contIngredientes) contIngredientes.innerHTML = '';
    if (contPasos) contPasos.innerHTML = '';

    window.agregarFilaIngrediente();
    window.agregarFilaPaso();
}

window.prepararEdicionSubReceta = async function(id) {
    // Asegurar que los catálogos estén cargados antes de asignar valores
    if (listaTiposSubRecetasLocal.length === 0 || listaInsumosLocal.length === 0) {
        await cargarDatosAuxiliares();
    }

    const sub = listaSubRecetasLocal.find(x => x.id === id);
    if (!sub) return;

    window.cambiarVistaSubRecetas('formulario');
    
    const titulo = document.getElementById('form-titulo-seccion');
    if (titulo) titulo.textContent = "Editar Sub-receta";

    document.getElementById('input-subreceta-id').value = sub.id;
    document.getElementById('input-nombre').value = sub.nombre;
    document.getElementById('input-tipo-id').value = sub.tipo_id || '';
    document.getElementById('input-rendimiento').value = sub.rendimiento_batch || 0;
    document.getElementById('input-unidad').value = sub.unidad_rendimiento || 'ml';
    document.getElementById('input-insumo-asociado').value = sub.insumo_asociado_id || '';
    document.getElementById('input-almacenamiento').value = sub.indicaciones_almacenamiento || '';
    document.getElementById('input-vidautil').value = sub.vida_util || '';
    document.getElementById('input-mermas').value = sub.control_mermas_economia_circular || '';

    document.getElementById('contenedor-filas-ingredientes').innerHTML = '';
    document.getElementById('contenedor-filas-pasos').innerHTML = '';

    try {
        const [resBOM, resPasos] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes?sub_receta_id=eq.${sub.id}&select=*`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            }),
            fetch(`${SUPABASE_URL}/rest/v1/sub_receta_pasos_preparacion?sub_receta_id=eq.${sub.id}&order=numero_paso.asc`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            })
        ]);

        if (resBOM.ok) {
            const items = await resBOM.json();
            if (items.length > 0) {
                items.forEach(i => window.agregarFilaIngrediente(i.insumo_id, i.cantidad, i.unidad_medida));
            } else {
                window.agregarFilaIngrediente();
            }
        }

        if (resPasos.ok) {
            const pasos = await resPasos.json();
            if (pasos.length > 0) {
                pasos.forEach(p => window.agregarFilaPaso(p.numero_paso, p.descripcion));
            } else {
                window.agregarFilaPaso();
            }
        }
    } catch (e) {
        console.warn("Error cargando datos para edición:", e);
    }
}

window.guardarSubRecetaCompleta = async function(e) {
    e.preventDefault();
    const idInput = document.getElementById('input-subreceta-id').value;
    const esEdicion = idInput !== '';

    const payload = {
        nombre: document.getElementById('input-nombre').value,
        slug: document.getElementById('input-nombre').value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, '-'),
        tipo_id: parseInt(document.getElementById('input-tipo-id').value),
        rendimiento_batch: parseFloat(document.getElementById('input-rendimiento').value),
        unidad_rendimiento: document.getElementById('input-unidad').value,
        insumo_asociado_id: parseInt(document.getElementById('input-insumo-asociado').value),
        elaboracion_instrucciones: "Ver pasos detallados en tabla relacional",
        indicaciones_almacenamiento: document.getElementById('input-almacenamiento').value,
        vida_util: document.getElementById('input-vidautil').value,
        control_mermas_economia_circular: document.getElementById('input-mermas').value
    };

    try {
        let subRecetaId = idInput;
        const urlCabecera = esEdicion ? 
            `${SUPABASE_URL}/rest/v1/sub_recetas_artesanales?id=eq.${idInput}` : 
            `${SUPABASE_URL}/rest/v1/sub_recetas_artesanales`;

        const resCabecera = await fetch(urlCabecera, {
            method: esEdicion ? 'PATCH' : 'POST',
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
        });

        if (!resCabecera.ok) throw new Error(await resCabecera.text());

        const dataCabecera = await resCabecera.json();
        if (!esEdicion && dataCabecera.length > 0) {
            subRecetaId = dataCabecera[0].id;
        }

        if (esEdicion) {
            await Promise.all([
                fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes?sub_receta_id=eq.${subRecetaId}`, {
                    method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
                }),
                fetch(`${SUPABASE_URL}/rest/v1/sub_receta_pasos_preparacion?sub_receta_id=eq.${subRecetaId}`, {
                    method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
                })
            ]);
        }

        const filasIng = document.querySelectorAll('#contenedor-filas-ingredientes > div');
        const payloadIngredientes = Array.from(filasIng).map(f => ({
            sub_receta_id: parseInt(subRecetaId),
            insumo_id: parseInt(f.querySelector('.select-insumo-bom').value),
            cantidad: parseFloat(f.querySelector('.input-cant-bom').value) || 0,
            unidad_medida: f.querySelector('.select-unidad-bom').value
        })).filter(i => i.insumo_id && i.cantidad > 0);

        if (payloadIngredientes.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadIngredientes)
            });
        }

        const filasPasos = document.querySelectorAll('#contenedor-filas-pasos > div');
        const payloadPasos = Array.from(filasPasos).map((f, idx) => ({
            sub_receta_id: parseInt(subRecetaId),
            numero_paso: idx + 1,
            descripcion: f.querySelector('.input-desc-paso').value,
            es_critico: false
        })).filter(p => p.descripcion.trim() !== '');

        if (payloadPasos.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/sub_receta_pasos_preparacion`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadPasos)
            });
        }

        document.getElementById('form-subreceta-completo').reset();
        document.getElementById('input-subreceta-id').value = '';
        await obtenerSubRecetasSupabase();
        window.cambiarVistaSubRecetas('listado');

    } catch (err) {
        console.error("Error guardando sub-receta completa:", err);
        alert("Ocurrió un error al guardar la sub-receta.");
    }
}

window.eliminarSubReceta = async function(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar la sub-receta "${nombre}"?`)) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/sub_recetas_artesanales?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });

        if (!res.ok) throw new Error("No se pudo eliminar");
        await obtenerSubRecetasSupabase();
        window.cambiarVistaSubRecetas('listado');
    } catch (err) {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar la sub-receta.");
    }
}

window.filtrarSubRecetas = function() {
    const inputBuscador = document.getElementById('buscador-subrecetas');
    if (!inputBuscador) return;
    const query = inputBuscador.value.toLowerCase();
    const filtradas = listaSubRecetasLocal.filter(s => s.nombre.toLowerCase().includes(query));
    renderizarListaSubRecetas(filtradas);
}

// ================= EXPORTACIONES GLOBALES Y DE MÓDULO =================
export { initSubRecetas };

window.initSubRecetas = initSubRecetas;
window.initSubrecetas = initSubRecetas;
window.initSubRec = initSubRecetas;
window.renderizarListaSubRecetas = renderizarListaSubRecetas;
window.verDetalleSubReceta = verDetalleSubReceta;
window.prepararCreacionSubReceta = prepararCreacionSubReceta;
window.prepararEdicionSubReceta = prepararEdicionSubReceta;
window.guardarSubRecetaCompleta = guardarSubRecetaCompleta;

export default {
    initSubRecetas,
    initSubrecetas: initSubRecetas,
    initSubRec: initSubRecetas
};