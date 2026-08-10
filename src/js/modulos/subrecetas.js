// src/js/modulos/subrecetas.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaSubRecetasLocal = [];
let listaSubRecetaIngredientesLocal = [];
let listaInsumosLocal = []; // Necesaria para cruzar costos

// Semillas para modo offline
const semillasSubRecetas = [
    { id: 1, slug: "cheong-manzana-miel", nombre: "Cheong de Manzana Roja y Miel", tipo: "cheong", rendimiento_batch: 470, unidad_rendimiento: "ml", vida_util: "7 a 14 días", elaboracion_instrucciones: "Macerar manzanas con miel y vinagre de arroz.", indicaciones_almacenamiento: "Vidrio refrigerado 2ºC-4ºC", control_mermas_economia_circular: "Descarte para pastelería", insumo_asociado_id: 101 },
    { id: 2, slug: "pisco-ceylon-black-tea", nombre: "Pisco Ceylon Black Tea", tipo: "licor", rendimiento_batch: 100, unidad_rendimiento: "ml", vida_util: "3 a 6 meses", elaboracion_instrucciones: "Roner a 60ºC por 90 min.", indicaciones_almacenamiento: "Vidrio a temperatura ambiente", control_mermas_economia_circular: "Hebras para compost", insumo_asociado_id: 102 }
];

const semillasSubRecetaIngredientes = [
    { id: 1, sub_receta_id: 1, insumo_id: 10, cantidad: 500, unidad_medida: "g" },
    { id: 2, sub_receta_id: 1, insumo_id: 11, cantidad: 450, unidad_medida: "g" },
    { id: 3, sub_receta_id: 1, insumo_id: 12, cantidad: 10,  unidad_medida: "ml" }
];

export async function initSubrecetas() {
    await asegurarInsumosCargados();
    await obtenerSubRecetasSupabase();
}

async function asegurarInsumosCargados() {
    if (window.__local_db_insumos && window.__local_db_insumos.length > 0) {
        listaInsumosLocal = window.__local_db_insumos;
        return;
    }
    // Si no existen, los pedimos a Supabase o cargamos semillas genéricas
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        if (response.ok) {
            listaInsumosLocal = await response.json();
            window.__local_db_insumos = listaInsumosLocal;
        } else throw new Error();
    } catch {
        listaInsumosLocal = [
            { id: 10, nombre: "Manzana Roja", costo_unitario: 1.20, unidad_medida: "g" },
            { id: 11, nombre: "Azúcar Blanca", costo_unitario: 1.00, unidad_medida: "g" },
            { id: 12, nombre: "Miel Pura", costo_unitario: 6.50, unidad_medida: "ml" }
        ];
        window.__local_db_insumos = listaInsumosLocal;
    }
}

async function obtenerSubRecetasSupabase() {
    const contenedorLista = document.getElementById('lista-subrecetas-contenedor');
    if (contenedorLista) contenedorLista.innerHTML = `<div class="text-center py-8 text-gray-500">Cargando sub-recetas...</div>`;

    try {
        const resRecetas = await fetch(`${SUPABASE_URL}/rest/v1/sub_recetas_artesanales?select=*&order=nombre.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resIngredientes = await fetch(`${SUPABASE_URL}/rest/v1/sub_receta_ingredientes?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});

        if (!resRecetas.ok || !resIngredientes.ok) throw new Error("Offline.");
        listaSubRecetasLocal = await resRecetas.json();
        listaSubRecetaIngredientesLocal = await resIngredientes.json();
        renderizarListaSubRecetas(listaSubRecetasLocal);
    } catch (e) {
        if (!window.__local_db_subrecetas) window.__local_db_subrecetas = JSON.parse(JSON.stringify(semillasSubRecetas));
        if (!window.__local_db_subreceta_ingredientes) window.__local_db_subreceta_ingredientes = JSON.parse(JSON.stringify(semillasSubRecetaIngredientes));
        
        listaSubRecetasLocal = window.__local_db_subrecetas;
        listaSubRecetaIngredientesLocal = window.__local_db_subreceta_ingredientes;
        renderizarListaSubRecetas(listaSubRecetasLocal);
    }
}

function renderizarListaSubRecetas(datos) {
    const contenedor = document.getElementById('lista-subrecetas-contenedor');
    if (!contenedor) return;

    if (datos.length === 0) {
        contenedor.innerHTML = `<div class="text-center py-8 text-gray-500 text-sm">No hay sub-recetas creadas.</div>`;
        return;
    }

    contenedor.innerHTML = datos.map(receta => {
        const ingredientes = listaSubRecetaIngredientesLocal.filter(ing => ing.sub_receta_id == receta.id || ing.sub_rec_id == receta.id);
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

window.verDetalleSubReceta = function(id) {
    const contenedor = document.getElementById('detalle-subreceta-contenedor');
    const receta = listaSubRecetasLocal.find(x => x.id === id);
    if (!receta || !contenedor) return;

    const ingredientes = listaSubRecetaIngredientesLocal.filter(ing => ing.sub_receta_id == id || ing.sub_rec_id == id);
    let costoTotalBatch = 0;
    const ingredientesHtml = ingredientes.map(ing => {
        const insumo = listaInsumosLocal.find(ins => ins.id == ing.insumo_id);
        let nombreInsumo = insumo ? insumo.nombre : "Insumo desconocido";
        let costoUnitInsumo = insumo ? parseFloat(insumo.costo_unitario) : 0;
        let costoProporcional = parseFloat(ing.cantidad) * costoUnitInsumo;
        costoTotalBatch += costoProporcional;
        return `
            <tr class="hover:bg-gray-800/20 text-sm">
                <td class="py-2.5 font-medium text-gray-300">• ${nombreInsumo}</td>
                <td class="py-2.5 text-right font-mono text-gray-400">${Number(ing.cantidad).toFixed(1)} ${ing.unidad_medida || 'g'}</td>
                <td class="py-2.5 text-right font-mono text-purple-400 font-semibold">$${costoProporcional.toFixed(0)}</td>
            </tr>
        `;
    }).join('');

    contenedor.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                <div>
                    <span class="bg-purple-500/10 text-purple-400 text-xs px-2.5 py-1 rounded font-semibold uppercase tracking-wider">${receta.tipo}</span>
                    <h3 class="text-2xl font-bold text-white mt-1">${receta.nombre}</h3>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="abrirModalSubReceta(${receta.id})" class="text-xs bg-gray-800 hover:bg-gray-750 text-purple-400 px-3 py-1.5 rounded border border-purple-500/10 transition uppercase tracking-wider font-semibold">Editar</button>
                    <button onclick="eliminarSubReceta(${receta.id}, '${receta.nombre}')" class="text-xs bg-red-950/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded border border-red-500/20 transition uppercase tracking-wider font-semibold">Eliminar</button>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div class="bg-gray-800/30 p-4 rounded-xl">
                    <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Rendimiento Batch</span>
                    <div class="text-xl font-bold text-white mt-1 font-mono">${Number(receta.rendimiento_batch).toFixed(0)} ${receta.unidad_rendimiento}</div>
                </div>
                <div class="bg-gray-800/30 p-4 rounded-xl">
                    <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Costo Lote</span>
                    <div class="text-xl font-bold text-purple-400 mt-1 font-mono">$${costoTotalBatch.toFixed(0)}</div>
                </div>
                <div class="bg-gray-800/30 p-4 rounded-xl">
                    <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Costo Unitario</span>
                    <div class="text-xl font-bold text-emerald-400 mt-1 font-mono">$${(costoTotalBatch / parseFloat(receta.rendimiento_batch || 1)).toFixed(2)} / ${receta.unidad_rendimiento}</div>
                </div>
            </div>
            <div class="space-y-2">
                <h4 class="font-bold text-sm text-gray-300 uppercase tracking-wider">Composición (BOM)</h4>
                <table class="w-full text-left">
                    <tbody class="divide-y divide-gray-800/50">${ingredientesHtml}</tbody>
                </table>
            </div>
        </div>
    `;
}

window.abrirModalSubReceta = function(id = null) {
    const modal = document.getElementById('modal-subreceta');
    const titulo = document.getElementById('modal-subreceta-titulo');
    document.getElementById('ingredientes-subreceta-filas').innerHTML = '';
    modal.classList.remove('hidden');

    if (id) {
        const receta = listaSubRecetasLocal.find(x => x.id === id);
        titulo.textContent = `Editar Sub-receta`;
        document.getElementById('subreceta-id').value = id;
        document.getElementById('subreceta-nombre').value = receta.nombre;
        document.getElementById('subreceta-slug').value = receta.slug;
        document.getElementById('subreceta-tipo').value = receta.tipo;
        document.getElementById('subreceta-rendimiento').value = receta.rendimiento_batch;
        document.getElementById('subreceta-unidad').value = receta.unidad_rendimiento;
        
        const ingredientes = listaSubRecetaIngredientesLocal.filter(ing => ing.sub_receta_id == id || ing.sub_rec_id == id);
        if (ingredientes.length === 0) window.agregarFilaIngredienteSubReceta(null);
        else ingredientes.forEach(ing => window.agregarFilaIngredienteSubReceta(ing));
    } else {
        titulo.textContent = "Nueva Sub-receta";
        document.getElementById('subreceta-id').value = '';
        document.getElementById('form-subreceta').reset();
        window.agregarFilaIngredienteSubReceta(null);
    }
}

window.generarSlugSubReceta = function(valor) {
    if (document.getElementById('subreceta-id').value !== '') return;
    document.getElementById('subreceta-slug').value = valor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

window.agregarFilaIngredienteSubReceta = function(item = null) {
    const contenedor = document.getElementById('ingredientes-subreceta-filas');
    const div = document.createElement('div');
    div.className = "fila-ingrediente-row flex items-center gap-2 bg-gray-850 p-2 rounded border border-gray-800";
    
    const options = listaInsumosLocal.map(insumo => 
        `<option value="${insumo.id}" data-costo="${insumo.costo_unitario}" data-unidad="${insumo.unidad_medida}" ${item && item.insumo_id == insumo.id ? 'selected' : ''}>
            ${insumo.nombre} ($${Number(insumo.costo_unitario).toFixed(2)}/${insumo.unidad_medida})
        </option>`
    ).join('');

    div.innerHTML = `
        <select class="ingrediente-select flex-1 bg-gray-800 text-white rounded p-1" onchange="recalcularCostosFormularioSubReceta()">
            ${options}
        </select>
        <div class="flex items-center gap-1 w-24">
            <input type="number" step="0.01" value="${item ? item.cantidad : '10'}" class="ingrediente-cantidad w-full bg-gray-800 text-right rounded p-1" oninput="recalcularCostosFormularioSubReceta()">
        </div>
        <button type="button" onclick="this.closest('.fila-ingrediente-row').remove(); recalcularCostosFormularioSubReceta()" class="text-red-400 font-bold p-1">✕</button>
    `;
    contenedor.appendChild(div);
    window.recalcularCostosFormularioSubReceta();
}

window.recalcularCostosFormularioSubReceta = function() {
    let costoTotalBatch = 0;
    document.querySelectorAll('.fila-ingrediente-row').forEach(fila => {
        const select = fila.querySelector('.ingrediente-select');
        const cantidadInput = fila.querySelector('.ingrediente-cantidad');
        const optionActiva = select.options[select.selectedIndex];
        if (optionActiva) {
            const costoUnitario = parseFloat(optionActiva.getAttribute('data-costo')) || 0;
            costoTotalBatch += (parseFloat(cantidadInput.value) || 0) * costoUnitario;
        }
    });
    const rendimiento = parseFloat(document.getElementById('subreceta-rendimiento').value) || 1;
    document.getElementById('form-sub-costo-total').textContent = `$${costoTotalBatch.toFixed(0)}`;
    document.getElementById('form-sub-costo-unitario').textContent = `$${(costoTotalBatch/rendimiento).toFixed(2)} / ${document.getElementById('subreceta-unidad').value}`;
}

window.cerrarModalSubReceta = function() {
    document.getElementById('modal-subreceta').classList.add('hidden');
}

window.filtrarSubRecetas = function() {
    const query = document.getElementById('buscador-subrecetas').value.toLowerCase();
    const filtrados = listaSubRecetasLocal.filter(c => c.nombre.toLowerCase().includes(query));
    renderizarListaSubRecetas(filtrados);
}

// Simulador de guardado local
window.guardarSubReceta = function(e) {
    e.preventDefault();
    alert('Función de guardado extraída para modo offline. En producción esto conectará a Supabase.');
    window.cerrarModalSubReceta();
}
window.eliminarSubReceta = function(id, nombre) {
    if (confirm(`¿Eliminar ${nombre}?`)) {
        listaSubRecetasLocal = listaSubRecetasLocal.filter(x => x.id !== id);
        renderizarListaSubRecetas(listaSubRecetasLocal);
        document.getElementById('detalle-subreceta-contenedor').innerHTML = '';
    }
}