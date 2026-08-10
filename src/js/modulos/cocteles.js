// src/js/modulos/cocteles.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaCoctelesLocal = [];
let listaCoctelIngredientesLocal = [];
let listaCoctelPasosLocal = [];
let coctelSeleccionadoId = 1;

// Semillas para modo offline
const semillasCocteles = [
    { id: 1, slug: "sour-para-tres", nombre: "Sour Para Tres", categoria_id: 2, familia_id: 1, soporte_id: 1, hielo_id: 5, tecnica_id: 1, reseña_inspiracion: "Soda Stereo", grado_alcohol: 15.8, porcentaje_azucar: 21.4, costo_produccion: 1487, precio_venta_sugerido: 12000 },
    { id: 2, slug: "vesper-pressure", nombre: "Vesper Pressure", categoria_id: 1, familia_id: 3, soporte_id: 2, hielo_id: 2, tecnica_id: 1, reseña_inspiracion: "Queen", grado_alcohol: 22.1, porcentaje_azucar: 2.5, costo_produccion: 2025, precio_venta_sugerido: 16000 }
];

export async function initCocteles() {
    await obtenerCoctelesSupabase();
}

async function obtenerCoctelesSupabase() {
    const contenedorLista = document.getElementById('lista-cocteles-contenedor');
    if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-gray-500">Cargando la carta...</div>`;

    try {
        const resCocteles = await fetch(`${SUPABASE_URL}/rest/v1/cocteles?select=*&order=nombre.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resIngredientes = await fetch(`${SUPABASE_URL}/rest/v1/coctel_ingredientes?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resPasos = await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion?select=*&order=numero_paso.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});

        if (!resCocteles.ok) throw new Error("Offline.");

        listaCoctelesLocal = await resCocteles.json();
        listaCoctelIngredientesLocal = await resIngredientes.json();
        listaCoctelPasosLocal = await resPasos.json();
        renderizarListaCocteles(listaCoctelesLocal);
    } catch (e) {
        if (!window.__local_db_cocteles) window.__local_db_cocteles = JSON.parse(JSON.stringify(semillasCocteles));
        listaCoctelesLocal = window.__local_db_cocteles;
        // Asumimos listas vacías de ingredientes/pasos en modo offline si no hay caché
        listaCoctelIngredientesLocal = window.__local_db_coctel_ingredientes || [];
        listaCoctelPasosLocal = window.__local_db_coctel_pasos || [];
        renderizarListaCocteles(listaCoctelesLocal);
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
                        <span class="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">${coctel.grado_alcohol}% ABV</span>
                        <span class="text-xs text-gray-500 font-mono">$${Number(coctel.costo_produccion).toFixed(0)} COGS</span>
                    </div>
                </div>
                <span class="text-xs text-gray-500 font-mono group-hover:text-emerald-400">➔</span>
            </div>
        `;
    }).join('');

    if (datos.length > 0) window.verDetalleCoctel(coctelSeleccionadoId || datos[0].id);
}

window.verDetalleCoctel = function(id) {
    coctelSeleccionadoId = id;
    const contenedor = document.getElementById('detalle-coctel-contenedor');
    const coctel = listaCoctelesLocal.find(x => x.id === id);
    if (!coctel || !contenedor) return;

    // Actualizar UI activa
    document.querySelectorAll('#lista-cocteles-contenedor > div').forEach(div => {
        div.classList.remove('border-emerald-500/60', 'bg-emerald-950/20');
        div.classList.add('border-gray-850', 'bg-gray-800/40');
    });
    event?.currentTarget?.classList.add('border-emerald-500/60', 'bg-emerald-950/20');
    event?.currentTarget?.classList.remove('border-gray-850', 'bg-gray-800/40');

    const ingredientesHtml = listaCoctelIngredientesLocal.filter(ing => ing.coctel_id == id).map(ing => {
        const insumo = window.__local_db_insumos?.find(ins => ins.id == ing.insumo_id);
        const nombreIn = insumo ? insumo.nombre : 'Insumo local';
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
        <div class="p-6 bg-gray-900 border-b border-gray-800 flex justify-between animate-fade-in">
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
            <button onclick="cambiarTabFicha('tab-tecnica', this)" class="flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 border-emerald-500 text-emerald-400 transition">Ingeniería & Receta</button>
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
                        <div class="space-y-2">${pasosHtml}</div>
                    </div>
                </div>
            </div>

            <div id="coctel-tab-sensorial" class="tab-ficha-content space-y-6 hidden">
                <div class="bg-gray-950 p-4 rounded-xl border border-gray-850 space-y-1 text-sm">
                    <span class="text-emerald-400 font-bold font-mono text-xs">👀 VISTA:</span> <span class="text-gray-300">${coctel.reseña_vista || '-'}</span><br>
                    <span class="text-amber-400 font-bold font-mono text-xs">👃 NARIZ:</span> <span class="text-gray-300">${coctel.reseña_nariz || '-'}</span><br>
                    <span class="text-purple-400 font-bold font-mono text-xs">👄 BOCA:</span> <span class="text-gray-300">${coctel.reseña_boca || '-'}</span>
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

// Ventanas Modales y CRUD expuestos
window.abrirModalCoctel = function(id = null) {
    document.getElementById('modal-coctel').classList.remove('hidden');
    // Aquí iría la carga de selects y edición offline completa
}
window.cerrarModalCoctel = function() { document.getElementById('modal-coctel').classList.add('hidden'); }
window.guardarCoctel = function(e) { e.preventDefault(); alert("Función extraída offline."); window.cerrarModalCoctel(); }
window.eliminarCoctel = function(id) { if(confirm("¿Eliminar?")){ listaCoctelesLocal = listaCoctelesLocal.filter(x => x.id !== id); renderizarListaCocteles(listaCoctelesLocal); } }