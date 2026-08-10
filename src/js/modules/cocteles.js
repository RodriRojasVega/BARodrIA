// src/js/modules/cocteles.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaCoctelesLocal = [];
let listaCoctelIngredientesLocal = [];
let listaCoctelPasosLocal = [];
let coctelSeleccionadoId = null;

export async function initCocteles() {
    await obtenerCoctelesSupabase();

    const formCoctel = document.getElementById('form-coctel');
    if (formCoctel) {
        formCoctel.replaceWith(formCoctel.cloneNode(true));
        document.getElementById('form-coctel').addEventListener('submit', guardarCoctel);
    }
}

async function obtenerCoctelesSupabase() {
    const contenedorLista = document.getElementById('lista-cocteles-contenedor');
    if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-emerald-500 font-mono animate-pulse">Cargando la carta...</div>`;

    try {
        const resCocteles = await fetch(`${SUPABASE_URL}/rest/v1/cocteles?select=*&order=nombre.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resIngredientes = await fetch(`${SUPABASE_URL}/rest/v1/coctel_ingredientes?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resPasos = await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion?select=*&order=numero_paso.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});

        if (!resCocteles.ok) throw new Error("Error de conexión con la carta");

        listaCoctelesLocal = await resCocteles.json();
        listaCoctelIngredientesLocal = await resIngredientes.json();
        listaCoctelPasosLocal = await resPasos.json();
        
        renderizarListaCocteles(listaCoctelesLocal);
    } catch (e) {
        console.error(e);
        if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-red-500 font-mono">Sin conexión a Supabase.</div>`;
    }
}

function renderizarListaCocteles(datos) {
    const contenedor = document.getElementById('lista-cocteles-contenedor');
    if (!contenedor) return;

    if (datos.length === 0) {
        contenedor.innerHTML = `<div class="text-center py-8 text-gray-500 text-sm">No hay cócteles registrados.</div>`;
        return;
    }

    contenedor.innerHTML = datos.map(coctel => {
        const colorBorde = coctel.id == coctelSeleccionadoId ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-gray-850 bg-gray-800/40';
        return `
            <div onclick="verDetalleCoctel(${coctel.id})" class="p-4 rounded-lg border ${colorBorde} hover:bg-gray-800/80 cursor-pointer transition flex justify-between items-center group">
                <div class="space-y-1">
                    <h4 class="font-bold text-white group-hover:text-emerald-400 transition text-sm">${coctel.nombre}</h4>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">${coctel.grado_alcohol || 0}% ABV</span>
                        <span class="text-xs text-gray-500 font-mono">$${Number(coctel.costo_produccion || 0).toFixed(0)} COGS</span>
                    </div>
                </div>
                <span class="text-xs text-gray-500 font-mono group-hover:text-emerald-400">➔</span>
            </div>
        `;
    }).join('');

    if (datos.length > 0 && !coctelSeleccionadoId) {
        window.verDetalleCoctel(datos[0].id);
    } else if (coctelSeleccionadoId) {
        window.verDetalleCoctel(coctelSeleccionadoId);
    }
}

window.verDetalleCoctel = function(id) {
    coctelSeleccionadoId = id;
    const contenedor = document.getElementById('detalle-coctel-contenedor');
    const coctel = listaCoctelesLocal.find(x => x.id === id);
    if (!coctel || !contenedor) return;

    document.querySelectorAll('#lista-cocteles-contenedor > div').forEach(div => {
        div.classList.remove('border-emerald-500/60', 'bg-emerald-950/20');
        div.classList.add('border-gray-850', 'bg-gray-800/40');
    });

    const ingredientesHtml = listaCoctelIngredientesLocal.filter(ing => ing.coctel_id == id).map(ing => {
        const insumo = window.__local_db_insumos?.find(ins => ins.id == ing.insumo_id);
        const nombreIn = insumo ? insumo.nombre : 'Insumo de base';
        const costoIn = insumo ? parseFloat(insumo.costo_unitario) : 0;
        return `
            <tr class="hover:bg-gray-800/20 text-xs">
                <td class="py-2 font-medium text-gray-300">• ${nombreIn}</td>
                <td class="py-2 text-right font-mono text-gray-400">${Number(ing.cantidad).toFixed(1)} ${ing.unidad_medida}</td>
                <td class="py-2 text-right font-mono text-emerald-400">$${(parseFloat(ing.cantidad) * costoIn).toFixed(0)}</td>
            </tr>
        `;
    }).join('');

    const pasosHtml = listaCoctelPasosLocal.filter(paso => paso.coctel_id == id).sort((a,b) => a.numero_paso - b.numero_paso).map(paso => `
        <div class="p-2.5 rounded bg-gray-950 border ${paso.es_critico ? 'border-red-900/30 bg-red-950/5' : 'border-gray-850'} text-xs">
            <span class="font-mono text-[10px] ${paso.es_critico ? 'text-red-400 font-bold' : 'text-gray-500'}">PASO ${paso.numero_paso} ${paso.es_critico ? '[CRÍTICO]' : ''}</span>
            <p class="text-gray-300 mt-0.5">${paso.descripcion}</p>
        </div>
    `).join('');

    contenedor.innerHTML = `
        <div class="p-6 bg-gray-900 border-b border-gray-800 flex justify-between items-center animate-fade-in">
            <div>
                <span class="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded font-semibold uppercase tracking-wider">Carta BARodrIA</span>
                <h3 class="text-2xl font-bold text-white mt-1">${coctel.nombre}</h3>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="abrirModalCoctel(${coctel.id})" class="text-xs bg-gray-800 hover:bg-gray-750 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/10 transition uppercase tracking-wider font-semibold">Editar</button>
                <button onclick="eliminarCoctel(${coctel.id}, '${coctel.nombre}')" class="text-xs bg-red-950/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 uppercase tracking-wider font-semibold">Eliminar</button>
            </div>
        </div>

        <div class="flex border-b border-gray-800 bg-gray-900/50">
            <button onclick="cambiarTabFicha('tab-tecnica', this)" class="flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 border-emerald-500 text-emerald-400 transition" id="btn-tab-tecnica">Ingeniería & Receta</button>
            <button onclick="cambiarTabFicha('tab-sensorial', this)" class="flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-white transition">Cata & Maridaje</button>
        </div>

        <div class="p-6 space-y-6">
            <div id="coctel-tab-tecnica" class="tab-ficha-content space-y-6">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div class="bg-gray-800/30 p-4 rounded-xl border border-gray-850">
                        <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">% Alcohol</span>
                        <div class="text-lg font-bold text-emerald-400 mt-1 font-mono">${coctel.grado_alcohol}%</div>
                    </div>
                    <div class="bg-gray-800/30 p-4 rounded-xl border border-gray-850">
                        <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Azúcar</span>
                        <div class="text-lg font-bold text-amber-400 mt-1 font-mono">${coctel.porcentaje_azucar}%</div>
                    </div>
                    <div class="bg-gray-800/30 p-4 rounded-xl border border-gray-850">
                        <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Costo Copa</span>
                        <div class="text-lg font-bold text-purple-400 mt-1 font-mono">$${Number(coctel.costo_produccion).toFixed(0)}</div>
                    </div>
                    <div class="bg-gray-800/30 p-4 rounded-xl border border-gray-850">
                        <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Precio Carta</span>
                        <div class="text-lg font-bold text-white mt-1 font-mono">$${Number(coctel.precio_venta_sugerido).toFixed(0)}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-bold text-xs text-gray-400 uppercase tracking-widest mb-2">Balance Líquido</h4>
                        <div class="bg-gray-950 p-4 rounded-xl border border-gray-850"><table class="w-full text-left"><tbody class="divide-y divide-gray-850">${ingredientesHtml}</tbody></table></div>
                    </div>
                    <div>
                        <h4 class="font-bold text-xs text-gray-400 uppercase tracking-widest mb-2">Secuencia de Servicio</h4>
                        <div class="space-y-2 max-h-[220px] overflow-y-auto">${pasosHtml}</div>
                    </div>
                </div>
            </div>

            <div id="coctel-tab-sensorial" class="tab-ficha-content space-y-6 hidden">
                <div>
                    <h4 class="font-bold text-xs text-purple-400 uppercase tracking-widest mb-1">Storytelling & Inspiración</h4>
                    <p class="text-sm text-gray-300 italic bg-gray-850 p-4 rounded-lg leading-relaxed">${coctel.reseña_inspiracion || 'Sin inspiración registrada.'}</p>
                </div>
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-850 space-y-2 text-sm">
                    <div><span class="text-emerald-400 font-bold font-mono text-xs">👁️ VISTA:</span> <span class="text-gray-300">${coctel.reseña_vista || '-'}</span></div>
                    <div><span class="text-amber-400 font-bold font-mono text-xs">👃 NARIZ:</span> <span class="text-gray-300">${coctel.reseña_nariz || '-'}</span></div>
                    <div><span class="text-purple-400 font-bold font-mono text-xs">👄 BOCA:</span> <span class="text-gray-300">${coctel.reseña_boca || '-'}</span></div>
                </div>
                <div>
                    <h4 class="font-bold text-xs text-gray-400 uppercase tracking-widest mb-1">Maridaje</h4>
                    <p class="text-xs text-gray-300 bg-gray-850 p-3 rounded">${coctel.maridaje_propuesta || 'Sin propuesta'} — <span class="text-gray-400">${coctel.maridaje_justificacion || ''}</span></p>
                </div>
            </div>
        </div>
    `;
}

window.cambiarTabFicha = function(tabId, btn) {
    document.querySelectorAll('.tab-ficha-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(`coctel-${tabId}`).classList.remove('hidden');
    btn.closest('div').querySelectorAll('button').forEach(b => {
        b.classList.remove('border-emerald-500', 'text-emerald-400');
        b.classList.add('border-transparent', 'text-gray-500');
    });
    btn.classList.add('border-emerald-500', 'text-emerald-400');
}

window.filtrarCocteles = function() {
    const query = document.getElementById('buscador-cocteles').value.toLowerCase();
    const filtrados = listaCoctelesLocal.filter(c => c.nombre.toLowerCase().includes(query));
    renderizarListaCocteles(filtrados);
}

// ================= MODAL & CRUD CONEXIÓN SUPABASE =================

window.abrirModalCoctel = async function(id = null) {
    const modal = document.getElementById('modal-coctel');
    const titulo = document.getElementById('modal-coctel-titulo');
    modal.classList.remove('hidden');

    await cargarSelectoresFormularioCoctel();
    document.getElementById('coctel-ingredientes-filas').innerHTML = '';
    document.getElementById('coctel-pasos-filas').innerHTML = '';

    if (id) {
        titulo.textContent = "Editar Cóctel";
        const coctel = listaCoctelesLocal.find(x => x.id === id);
        document.getElementById('coctel-id').value = id;
        document.getElementById('coctel-nombre').value = coctel.nombre;
        document.getElementById('coctel-slug').value = coctel.slug;
        document.getElementById('coctel-slug').disabled = true;

        document.getElementById('coctel-categoria-id').value = coctel.categoria_id;
        document.getElementById('coctel-familia-id').value = coctel.familia_id;
        document.getElementById('coctel-soporte-id').value = coctel.soporte_id;
        document.getElementById('coctel-hielo-id').value = coctel.hielo_id;
        document.getElementById('coctel-tecnica-id').value = coctel.tecnica_id;

        document.getElementById('coctel-inspiracion').value = coctel.reseña_inspiracion || '';
        document.getElementById('coctel-vista').value = coctel.reseña_vista || '';
        document.getElementById('coctel-nariz').value = coctel.reseña_nariz || '';
        document.getElementById('coctel-boca').value = coctel.reseña_boca || '';
        document.getElementById('coctel-maridaje').value = coctel.maridaje_propuesta || '';
        document.getElementById('coctel-justificacion').value = coctel.maridaje_justificacion || '';
        document.getElementById('coctel-alternativa').value = coctel.maridaje_alternativa || '';
        document.getElementById('coctel-tips').value = coctel.tips || '';

        const ingreds = listaCoctelIngredientesLocal.filter(x => x.coctel_id == id);
        if (ingreds.length === 0) window.agregarFilaIngredienteCoctel(null);
        else ingreds.forEach(ing => window.agregarFilaIngredienteCoctel(ing));

        const pasos = listaCoctelPasosLocal.filter(x => x.coctel_id == id).sort((a,b) => a.numero_paso - b.numero_paso);
        if (pasos.length === 0) window.agregarFilaPasoCoctel(null);
        else pasos.forEach(paso => window.agregarFilaPasoCoctel(paso));
    } else {
        titulo.textContent = "Estandarizar Cóctel Nuevo";
        document.getElementById('coctel-id').value = '';
        document.getElementById('coctel-slug').disabled = false;
        document.getElementById('form-coctel').reset();
        window.agregarFilaIngredienteCoctel(null);
        window.agregarFilaPasoCoctel(null);
    }
    window.recalcularValoresFisicosCoctel();
}

window.cerrarModalCoctel = function() {
    document.getElementById('modal-coctel').classList.add('hidden');
}

window.generarSlugCoctel = function(valor) {
    if (document.getElementById('coctel-id').value !== '') return;
    document.getElementById('coctel-slug').value = valor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

async function cargarSelectoresFormularioCoctel() {
    try {
        // Asegurarnos de tener los insumos frescos directamente desde Supabase si el array global está vacío
        if (!window.__local_db_insumos || window.__local_db_insumos.length === 0) {
            const resInsumos = await fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*&order=nombre.asc`, { 
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } 
            });
            if (resInsumos.ok) {
                window.__local_db_insumos = await resInsumos.json();
            }
        }

        const [cat, fam, sop, hie, tec] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/categorias?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
            fetch(`${SUPABASE_URL}/rest/v1/familias?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
            fetch(`${SUPABASE_URL}/rest/v1/soportes?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
            fetch(`${SUPABASE_URL}/rest/v1/hielos?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
            fetch(`${SUPABASE_URL}/rest/v1/tecnicas?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json())
        ]);

        document.getElementById('coctel-categoria-id').innerHTML = cat.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        document.getElementById('coctel-familia-id').innerHTML = fam.map(f => `<option value="${f.id}">${f.nombre}</option>`).join('');
        document.getElementById('coctel-soporte-id').innerHTML = sop.map(s => `<option value="${s.id}">${s.nombre} (${s.capacidad_operativa_ml}ml)</option>`).join('');
        document.getElementById('coctel-hielo-id').innerHTML = hie.map(h => `<option value="${h.id}">${h.nombre}</option>`).join('');
        document.getElementById('coctel-tecnica-id').innerHTML = tec.map(t => `<option value="${t.id}" data-dilucion="${t.dilucion_estimada_porcentaje}">${t.nombre}</option>`).join('');
        
        // Refrescar las filas de ingredientes si ya hay alguna abierta
        document.querySelectorAll('.fila-coctel-ingrediente').forEach(fila => {
            const select = fila.querySelector('.coctel-ing-select');
            const valorActual = select.value;
            const insumosDb = window.__local_db_insumos || [];
            select.innerHTML = insumosDb.map(insumo => 
                `<option value="${insumo.id}" data-costo="${insumo.costo_unitario}" data-abv="${insumo.graduacion_alcohol_base}" data-unidad="${insumo.unidad_medida}" ${valorActual == insumo.id ? 'selected' : ''}>
                    ${insumo.nombre} (${insumo.graduacion_alcohol_base}% ABV)
                </option>`
            ).join('');
        });
    } catch (e) {
        console.error("Error cargando catálogos y selectores de cócteles", e);
    }
}

window.agregarFilaIngredienteCoctel = function(item = null) {
    const contenedor = document.getElementById('coctel-ingredientes-filas');
    const div = document.createElement('div');
    div.className = "fila-coctel-ingrediente flex items-center gap-2 bg-gray-850 p-1.5 rounded border border-gray-800 text-xs";

    const insumosDb = window.__local_db_insumos || [];
    const options = insumosDb.map(insumo => 
        `<option value="${insumo.id}" data-costo="${insumo.costo_unitario}" data-abv="${insumo.graduacion_alcohol_base}" data-unidad="${insumo.unidad_medida}" ${item && item.insumo_id == insumo.id ? 'selected' : ''}>
            ${insumo.nombre} (${insumo.graduacion_alcohol_base}% ABV)
        </option>`
    ).join('');

    div.innerHTML = `
        <select class="coctel-ing-select flex-1 bg-gray-800 text-white rounded p-1 focus:outline-none" onchange="recalcularValoresFisicosCoctel()">
            ${options}
        </select>
        <div class="flex items-center gap-1 w-24 shrink-0">
            <input type="number" step="0.01" value="${item ? item.cantidad : '30'}" class="coctel-ing-cantidad w-full bg-gray-800 text-right rounded p-1 text-white focus:outline-none" oninput="recalcularValoresFisicosCoctel()">
            <span class="coctel-ing-unidad text-gray-500 font-mono w-4">ml</span>
        </div>
        <button type="button" onclick="this.closest('.fila-coctel-ingrediente').remove(); recalcalcularValoresFisicosCoctel()" class="text-red-400 font-bold px-1 hover:bg-red-950 rounded">✕</button>
    `;
    contenedor.appendChild(div);
    window.recalcularValoresFisicosCoctel();
}

window.agregarFilaPasoCoctel = function(item = null) {
    const contenedor = document.getElementById('coctel-pasos-filas');
    const div = document.createElement('div');
    div.className = "fila-coctel-paso flex items-start gap-2 bg-gray-850 p-2 rounded border border-gray-800 text-xs";

    const pasoNum = contenedor.querySelectorAll('.fila-coctel-paso').length + 1;

    div.innerHTML = `
        <span class="paso-num-lbl font-mono text-[10px] text-gray-500 mt-2 shrink-0">P${pasoNum}</span>
        <textarea class="coctel-paso-desc flex-1 bg-gray-800 text-white rounded p-1 resize-none focus:outline-none" rows="1" required placeholder="Describe la acción operativa...">${item ? item.descripcion : ''}</textarea>
        <label class="flex items-center gap-1 shrink-0 mt-1 cursor-pointer">
            <input type="checkbox" class="coctel-paso-critico accent-red-500 h-3.5 w-3.5 bg-gray-800 rounded" ${item && item.es_critico ? 'checked' : ''}>
            <span class="text-[9px] text-red-400 font-semibold uppercase tracking-wider">Crítico</span>
        </label>
        <button type="button" onclick="this.closest('.fila-coctel-paso').remove(); reordenarPasosUI()" class="text-red-400 font-bold px-1 mt-1 hover:bg-red-950 rounded">✕</button>
    `;
    contenedor.appendChild(div);
}

window.reordenarPasosUI = function() {
    document.querySelectorAll('#coctel-pasos-filas .fila-coctel-paso').forEach((div, index) => {
        div.querySelector('.paso-num-lbl').textContent = `P${index + 1}`;
    });
}

window.recalcularValoresFisicosCoctel = function() {
    let costoTotalCopa = 0;
    let volumenLiquidoTotal = 0;
    let alcoholPuroTotal = 0;
    let azucarGramosTotal = 0;

    document.querySelectorAll('.fila-coctel-ingrediente').forEach(fila => {
        const select = fila.querySelector('.coctel-ing-select');
        const cantidadInput = fila.querySelector('.coctel-ing-cantidad');
        const unidadLbl = fila.querySelector('.coctel-ing-unidad');

        const optionActiva = select.options[select.selectedIndex];
        if (optionActiva) {
            const costoUnitario = parseFloat(optionActiva.getAttribute('data-costo')) || 0;
            const abv = parseFloat(optionActiva.getAttribute('data-abv')) || 0;
            const unidad = optionActiva.getAttribute('data-unidad') || 'ml';
            unidadLbl.textContent = unidad;

            const cantidad = parseFloat(cantidadInput.value) || 0;
            costoTotalCopa += cantidad * costoUnitario;

            if (unidad === 'ml') {
                volumenLiquidoTotal += cantidad;
                alcoholPuroTotal += cantidad * (abv / 100);
            }
        }
    });

    const tecnicaSelect = document.getElementById('coctel-tecnica-id');
    const opcionTecnica = tecnicaSelect?.options[tecnicaSelect.selectedIndex];
    const dilucionPorcentaje = opcionTecnica ? parseFloat(opcionTecnica.getAttribute('data-dilucion')) || 0 : 0;

    const volumenConDilucion = volumenLiquidoTotal * (1 + dilucionPorcentaje);
    const abvFinalCalculado = volumenConDilucion > 0 ? (alcoholPuroTotal / volumenConDilucion) * 100 : 0;

    document.getElementById('modal-coctel-costo').textContent = `$${costoTotalCopa.toFixed(0)}`;
    document.getElementById('modal-coctel-precio').textContent = `$${(costoTotalCopa * 8.0).toFixed(0)}`;
    document.getElementById('modal-coctel-abv').textContent = `${abvFinalCalculado.toFixed(1)}%`;
    document.getElementById('modal-coctel-azucar').textContent = `12.5%`; // Estimador estándar equilibrado
}

// Función Real de Guardado Multinivel para Cócteles
window.guardarCoctel = async function(e) {
    e.preventDefault();
    const idInput = document.getElementById('coctel-id').value;
    const esEdicion = idInput !== '';

    const costoFinalStr = document.getElementById('modal-coctel-costo').textContent.replace('$', '');
    const abvFinalStr = document.getElementById('modal-coctel-abv').textContent.replace('%', '');
    const azucarFinalStr = document.getElementById('modal-coctel-azucar').textContent.replace('%', '');

    const payloadCoctel = {
        slug: document.getElementById('coctel-slug').value,
        nombre: document.getElementById('coctel-nombre').value,
        categoria_id: parseInt(document.getElementById('coctel-categoria-id').value),
        familia_id: parseInt(document.getElementById('coctel-familia-id').value),
        soporte_id: parseInt(document.getElementById('coctel-soporte-id').value),
        hielo_id: parseInt(document.getElementById('coctel-hielo-id').value),
        tecnica_id: parseInt(document.getElementById('coctel-tecnica-id').value),
        reseña_inspiracion: document.getElementById('coctel-inspiracion').value,
        reseña_vista: document.getElementById('coctel-vista').value,
        reseña_nariz: document.getElementById('coctel-nariz').value,
        reseña_boca: document.getElementById('coctel-boca').value,
        maridaje_propuesta: document.getElementById('coctel-maridaje').value,
        maridaje_justificacion: document.getElementById('coctel-justificacion').value,
        maridaje_alternativa: document.getElementById('coctel-alternativa').value,
        tips: document.getElementById('coctel-tips').value,
        grado_alcohol: parseFloat(abvFinalStr),
        porcentaje_azucar: parseFloat(azucarFinalStr),
        costo_produccion: parseFloat(costoFinalStr),
        precio_venta_sugerido: parseFloat(costoFinalStr) * 8.0
    };

    const url = esEdicion ? `${SUPABASE_URL}/rest/v1/cocteles?id=eq.${idInput}` : `${SUPABASE_URL}/rest/v1/cocteles`;

    try {
        const resCoctel = await fetch(url, {
            method: esEdicion ? 'PATCH' : 'POST',
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' 
            },
            body: JSON.stringify(payloadCoctel)
        });

        if (!resCoctel.ok) throw new Error("Fallo al guardar el cóctel maestro");
        const dataCoctel = await resCoctel.json();
        const coctelIdReal = dataCoctel[0].id;

        if (esEdicion) {
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_ingredientes?coctel_id=eq.${coctelIdReal}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion?coctel_id=eq.${coctelIdReal}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        }

        const ingredientesPayload = [];
        document.querySelectorAll('.fila-coctel-ingrediente').forEach(fila => {
            const select = fila.querySelector('.coctel-ing-select');
            const cant = parseFloat(fila.querySelector('.coctel-ing-cantidad').value) || 0;
            const unidad = select.options[select.selectedIndex].getAttribute('data-unidad') || 'ml';
            ingredientesPayload.push({
                coctel_id: coctelIdReal,
                insumo_id: parseInt(select.value),
                cantidad: cant,
                unidad_medida: unidad
            });
        });

        if (ingredientesPayload.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_ingredientes`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(ingredientesPayload)
            });
        }

        const pasosPayload = [];
        document.querySelectorAll('#coctel-pasos-filas .fila-coctel-paso').forEach((fila, index) => {
            const desc = fila.querySelector('.coctel-paso-desc').value;
            const critico = fila.querySelector('.coctel-paso-critico').checked;
            pasosPayload.push({
                coctel_id: coctelIdReal,
                numero_paso: index + 1,
                descripcion: desc,
                es_critico: critico
            });
        });

        if (pasosPayload.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(pasosPayload)
            });
        }

        window.cerrarModalCoctel();
        await initCocteles();

    } catch (error) {
        console.error("Error guardando cóctel:", error);
        alert("Ocurrió un error al guardar el cóctel en Supabase.");
    }
}

window.eliminarCoctel = async function(id, nombre) {
    if(!confirm(`¿Estás seguro de eliminar el cóctel "${nombre}" de la carta?`)) return;
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/cocteles?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });

        if (!response.ok) throw new Error("Error al eliminar");

        await initCocteles();
        document.getElementById('detalle-coctel-contenedor').innerHTML = `
            <div class="text-center py-24 text-gray-500">
                <span class="text-5xl">🍸</span>
                <p class="mt-4 text-sm max-w-sm mx-auto">Selecciona un cóctel de la carta para auditar sus propiedades.</p>
            </div>`;
    } catch (error) {
        console.error("Error al eliminar cóctel:", error);
        alert("No se pudo eliminar el cóctel.");
    }
}