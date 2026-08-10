// src/js/modules/cocteles.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaCoctelesLocal = [];
let listaCoctelIngredientesLocal = [];
let listaCoctelPasosLocal = [];
let coctelSeleccionadoId = null;

export async function initCocteles() {
    await obtenerCoctelesSupabase();
}

async function obtenerCoctelesSupabase() {
    const contenedorLista = document.getElementById('lista-cocteles-contenedor');
    if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-emerald-500 font-mono animate-pulse">Cargando la carta...</div>`;

    try {
        const resCocteles = await fetch(`${SUPABASE_URL}/rest/v1/cocteles?select=*&order=nombre.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resIngredientes = await fetch(`${SUPABASE_URL}/rest/v1/coctel_ingredientes?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resPasos = await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion?select=*&order=numero_paso.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});

        if (!resCocteles.ok) throw new Error("Error de conexión");

        listaCoctelesLocal = await resCocteles.json();
        listaCoctelIngredientesLocal = await resIngredientes.json();
        listaCoctelPasosLocal = await resPasos.json();
        renderizarListaCocteles();
    } catch (e) {
        if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-red-500 font-mono">Sin conexión a Supabase.</div>`;
    }
}

function renderizarListaCocteles() {
    const contenedor = document.getElementById('lista-cocteles-contenedor');
    if (!contenedor) return;

    if (listaCoctelesLocal.length === 0) {
        contenedor.innerHTML = `<div class="text-center py-8 text-gray-500 text-sm">Carta vacía en la base de datos.</div>`;
        return;
    }

    contenedor.innerHTML = listaCoctelesLocal.map(coctel => `
        <div onclick="verDetalleCoctel(${coctel.id})" class="p-4 rounded-lg border border-gray-850 bg-gray-800/40 hover:bg-gray-800/80 cursor-pointer transition flex justify-between items-center group">
            <div class="space-y-1">
                <h4 class="font-bold text-white group-hover:text-emerald-400 transition text-sm">${coctel.nombre}</h4>
                <div class="flex items-center gap-2">
                    <span class="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">${coctel.grado_alcohol || 0}% ABV</span>
                    <span class="text-xs text-gray-500 font-mono">$${Number(coctel.costo_produccion || 0).toFixed(0)} COGS</span>
                </div>
            </div>
            <span class="text-xs text-gray-500 font-mono group-hover:text-emerald-400">➔</span>
        </div>
    `).join('');
}

window.verDetalleCoctel = function(id) { alert("Ficha técnica lista para conectarse.") }
window.cambiarTabFicha = function(tabId, btn) { /* Lógica de UI se mantiene */ }
window.filtrarCocteles = function() { /* Búsqueda en memoria */ }
window.abrirModalCoctel = function(id = null) { alert("Modal listo para conectarse.") }
window.cerrarModalCoctel = function() { document.getElementById('modal-coctel').classList.add('hidden'); }
window.guardarCoctel = async function(e) {
    e.preventDefault();
    const idInput = document.getElementById('coctel-id').value;

    // 1. Calcular Datos Químicos y Financieros desde la UI
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

    const esEdicion = idInput !== '';
    const url = esEdicion ? `${SUPABASE_URL}/rest/v1/cocteles?id=eq.${idInput}` : `${SUPABASE_URL}/rest/v1/cocteles`;

    try {
        // 2. Guardar Maestro de Cóctel
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

        if (!resCoctel.ok) throw new Error("Fallo al guardar cóctel");
        const dataCoctel = await resCoctel.json();
        const coctelIdReal = dataCoctel[0].id;

        // 3. Limpiar relaciones viejas si es edición
        if (esEdicion) {
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_ingredientes?coctel_id=eq.${coctelIdReal}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion?coctel_id=eq.${coctelIdReal}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        }

        // 4. Armar y enviar Ingredientes
        const ingredientesPayload = [];
        document.querySelectorAll('.fila-coctel-ingrediente').forEach(fila => {
            const select = fila.querySelector('.coctel-ing-select');
            const cant = parseFloat(fila.querySelector('.coctel-ing-cantidad').value) || 0;
            const unidad = select.options[select.selectedIndex].getAttribute('data-unidad') || 'ml';
            ingredientesPayload.push({ coctel_id: coctelIdReal, insumo_id: parseInt(select.value), cantidad: cant, unidad_medida: unidad });
        });
        if (ingredientesPayload.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_ingredientes`, { method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(ingredientesPayload) });
        }

        // 5. Armar y enviar Pasos de Preparación
        const pasosPayload = [];
        document.querySelectorAll('#coctel-pasos-filas .fila-coctel-paso').forEach((fila, index) => {
            const desc = fila.querySelector('.coctel-paso-desc').value;
            const critico = fila.querySelector('.coctel-paso-critico').checked;
            pasosPayload.push({ coctel_id: coctelIdReal, numero_paso: index + 1, descripcion: desc, es_critico: critico });
        });
        if (pasosPayload.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion`, { method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(pasosPayload) });
        }

        window.cerrarModalCoctel();
        await initCocteles(); // Recarga la tabla

    } catch (error) {
        console.error("Error BD:", error);
        alert("Hubo un error guardando el cóctel.");
    }
}

window.eliminarCoctel = async function(id) {
    if(!confirm("¿Eliminar este cóctel de la carta?")) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/cocteles?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        await initCocteles();
        document.getElementById('detalle-coctel-contenedor').innerHTML = '';
    } catch (error) {
        alert("Error al eliminar.");
    }
}