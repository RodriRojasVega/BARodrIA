// src/js/modules/subrecetas.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaSubRecetasLocal = [];
let listaSubRecetaIngredientesLocal = [];
let listaInsumosLocal = []; 

export async function initSubrecetas() {
    await asegurarInsumosCargados();
    await obtenerSubRecetasSupabase();
}

async function asegurarInsumosCargados() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        if (response.ok) listaInsumosLocal = await response.json();
    } catch (e) {
        console.error("Error al cargar insumos previos para costeo", e);
    }
}

async function obtenerSubRecetasSupabase() {
    const contenedorLista = document.getElementById('lista-subrecetas-contenedor');
    if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-emerald-500 animate-pulse font-mono">Cargando sub-recetas de Supabase...</div>`;

    try {
        const resRecetas = await fetch(`${SUPABASE_URL}/rest/v1/sub_recetas_artesanales?select=*&order=nombre.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resIngredientes = await fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});

        if (!resRecetas.ok) throw new Error("Error de conexión");
        listaSubRecetasLocal = await resRecetas.json();
        listaSubRecetaIngredientesLocal = await resIngredientes.json();
        renderizarListaSubRecetas();
    } catch (e) {
        if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-red-500 font-mono">Sin conexión a la Base de Datos.</div>`;
    }
}

function renderizarListaSubRecetas() {
    const contenedor = document.getElementById('lista-subrecetas-contenedor');
    if (!contenedor) return;

    if (listaSubRecetasLocal.length === 0) {
        contenedor.innerHTML = `<div class="text-center py-8 text-gray-500 text-sm">No hay sub-recetas registradas.</div>`;
        return;
    }

    contenedor.innerHTML = listaSubRecetasLocal.map(receta => {
        const ingredientes = listaSubRecetaIngredientesLocal.filter(ing => ing.sub_receta_id == receta.id);
        let costoTotal = 0;
        ingredientes.forEach(ing => {
            const insumo = listaInsumosLocal.find(ins => ins.id == ing.insumo_id);
            if (insumo) costoTotal += parseFloat(ing.cantidad) * parseFloat(insumo.costo_unitario);
        });
        const costoUnitario = costoTotal / parseFloat(receta.rendimiento_batch || 1);

        return `
            <div onclick="verDetalleSubReceta(${receta.id})" class="p-4 rounded-lg bg-gray-800/40 border border-gray-850 hover:bg-gray-800/80 cursor-pointer transition flex justify-between items-center group">
                <div class="space-y-1">
                    <h4 class="font-bold text-white group-hover:text-purple-400 transition text-sm">${receta.nombre}</h4>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] bg-purple-950 text-purple-400 border border-purple-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">${receta.tipo}</span>
                        <span class="text-xs text-gray-500 font-mono">${Number(receta.rendimiento_batch).toFixed(0)} ${receta.unidad_rendimiento}</span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-mono text-xs text-purple-400 font-bold">$${costoUnitario.toFixed(2)}/${receta.unidad_rendimiento}</span>
                </div>
            </div>
        `;
    }).join('');
}

window.verDetalleSubReceta = function(id) { alert("Ficha técnica lista para conectar.") }
window.abrirModalSubReceta = function(id = null) { alert("Formulario listo para conectar.") }
window.filtrarSubRecetas = function() { /* Lógica de filtrado en vivo se mantiene igual */ }
// Función Real de Guardado Multinivel
window.guardarSubReceta = async function(e) {
    e.preventDefault();
    const idInput = document.getElementById('subreceta-id').value;
    
    // 1. Recopilar datos maestros de la sub-receta
    const payloadSubReceta = {
        slug: document.getElementById('subreceta-slug').value,
        nombre: document.getElementById('subreceta-nombre').value,
        tipo: document.getElementById('subreceta-tipo').value,
        rendimiento_batch: parseFloat(document.getElementById('subreceta-rendimiento').value) || 1,
        unidad_rendimiento: document.getElementById('subreceta-unidad').value,
        elaboracion_instrucciones: document.getElementById('subreceta-instrucciones').value,
        indicaciones_almacenamiento: document.getElementById('subreceta-almacenamiento').value,
        vida_util: document.getElementById('subreceta-vidautil').value,
        control_mermas_economia_circular: document.getElementById('subreceta-mermas').value
    };

    const esEdicion = idInput !== '';
    const url = esEdicion ? `${SUPABASE_URL}/rest/v1/sub_recetas_artesanales?id=eq.${idInput}` : `${SUPABASE_URL}/rest/v1/sub_recetas_artesanales`;

    try {
        // 2. Guardar la Sub-receta Maestra y pedir que nos devuelva el ID generado
        const resSubReceta = await fetch(url, {
            method: esEdicion ? 'PATCH' : 'POST',
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // Crucial para obtener el ID
            },
            body: JSON.stringify(payloadSubReceta)
        });

        if (!resSubReceta.ok) throw new Error("Fallo al guardar sub-receta");
        const dataSubReceta = await resSubReceta.json();
        const subRecetaIdReal = dataSubReceta[0].id;

        // 3. Si es edición, primero borramos los ingredientes viejos para poner los nuevos
        if (esEdicion) {
            await fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes?sub_receta_id=eq.${subRecetaIdReal}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
        }

        // 4. Recopilar y guardar los ingredientes (BOM)
        const ingredientesPayload = [];
        document.querySelectorAll('.fila-ingrediente-row').forEach(fila => {
            const select = fila.querySelector('.ingrediente-select');
            const cantidadInput = fila.querySelector('.ingrediente-cantidad');
            
            const insId = parseInt(select.value);
            const cant = parseFloat(cantidadInput.value) || 0;
            const unidad = select.options[select.selectedIndex].getAttribute('data-unidad') || 'g';

            ingredientesPayload.push({
                sub_receta_id: subRecetaIdReal,
                insumo_id: insId,
                cantidad: cant,
                unidad_medida: unidad
            });
        });

        if (ingredientesPayload.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(ingredientesPayload)
            });
        }

        window.cerrarModalSubReceta();
        await initSubrecetas(); // Recargar la vista completa

    } catch (error) {
        console.error("Error en BD:", error);
        alert("Hubo un problema de conexión al guardar.");
    }
}

// Función Real para Eliminar
window.eliminarSubReceta = async function(id, nombre) {
    if (!confirm(`¿Eliminar la sub-receta "${nombre}" de forma permanente?`)) return;
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/sub_recetas_artesanales?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (!response.ok) throw new Error("Fallo al eliminar");
        
        await initSubrecetas();
        document.getElementById('detalle-subreceta-contenedor').innerHTML = '';
    } catch (error) {
        alert("Error al eliminar. Revisa restricciones de base de datos.");
    }
}