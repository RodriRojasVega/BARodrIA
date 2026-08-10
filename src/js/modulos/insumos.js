// src/js/modulos/insumos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaInsumosLocal = [];

const semillasInsumos = [
    { id: 10, slug: "manzana-roja", nombre: "Manzana Roja", tipo: "simple", unidad_medida: "g", formato_envase: 1000, precio_compra: 1200, costo_unitario: 1.20, graduacion_alcohol_base: 0 },
    { id: 13, slug: "jugo-limon-fresco", nombre: "Jugo de Limón Fresco", tipo: "simple", unidad_medida: "ml", formato_envase: 1000, precio_compra: 2500, costo_unitario: 2.50, graduacion_alcohol_base: 0 },
    { id: 20, slug: "pisco-valle-luna", nombre: "Pisco Valle Luna Transparente 40º", tipo: "simple", unidad_medida: "ml", formato_envase: 750, precio_compra: 9900, costo_unitario: 13.20, graduacion_alcohol_base: 40 },
    { id: 101, slug: "cheong-manzana-miel", nombre: "Cheong de Manzana Roja y Miel", tipo: "compuesto", unidad_medida: "ml", formato_envase: 470, precio_compra: 1240, costo_unitario: 2.64, graduacion_alcohol_base: 0 }
];

export function initInsumos() {
    obtenerInsumosSupabase();
    
    // Conectar el evento del formulario ahora que el HTML está inyectado
    const formInsumo = document.getElementById('form-insumo');
    if (formInsumo) {
        formInsumo.addEventListener('submit', guardarInsumo);
    }
}

async function obtenerInsumosSupabase() {
    const tabla = document.getElementById('tabla-insumos');
    if (tabla) tabla.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-400">Consultando datos a Supabase...</td></tr>`;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*&order=nombre.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (!response.ok) throw new Error("Error en la descarga de insumos.");
        listaInsumosLocal = await response.json();
        
        // Guardar globalmente para que lo usen las recetas más adelante
        window.__local_db_insumos = listaInsumosLocal; 
        if (tabla) renderizarInsumos(listaInsumosLocal);
    } catch (e) {
        if (!window.__local_db_insumos) {
            window.__local_db_insumos = JSON.parse(JSON.stringify(semillasInsumos));
        }
        listaInsumosLocal = window.__local_db_insumos;
        if (tabla) renderizarInsumos(listaInsumosLocal);
    }
}

function renderizarInsumos(datos) {
    const tabla = document.getElementById('tabla-insumos');
    if (!tabla) return;
    
    if (datos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No hay registros cargados.</td></tr>`;
        return;
    }

    tabla.innerHTML = datos.map(insumo => `
        <tr class="hover:bg-gray-800/40 transition">
            <td class="py-3.5 font-medium text-white">
                <div>${insumo.nombre}</div>
                <span class="text-[10px] text-gray-500 font-mono">${insumo.slug}</span>
            </td>
            <td class="py-3.5 text-center">
                <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase ${insumo.tipo === 'compuesto' ? 'bg-purple-900/30 text-purple-400 border border-purple-800/30' : 'bg-blue-900/30 text-blue-400 border border-blue-800/30'}">
                    ${insumo.tipo}
                </span>
            </td>
            <td class="py-3.5 text-right font-mono text-gray-300">${Number(insumo.formato_envase).toFixed(0)} ${insumo.unidad_medida}</td>
            <td class="py-3.5 text-right font-mono text-emerald-400 font-bold">$${Number(insumo.costo_unitario).toFixed(2)}</td>
            <td class="py-3.5 text-right font-mono text-gray-500">$${Number(insumo.precio_compra).toFixed(0)}</td>
        </tr>
    `).join('');
}

// Expuesta globalmente para el evento oninput del buscador HTML
window.filtrarInsumos = function() {
    const query = document.getElementById('buscador-insumos').value.toLowerCase();
    const filtrados = listaInsumosLocal.filter(insumo => 
        insumo.nombre.toLowerCase().includes(query) || 
        insumo.slug.toLowerCase().includes(query)
    );
    renderizarInsumos(filtrados);
}

async function guardarInsumo(e) {
    e.preventDefault();
    const nombre = document.getElementById('insumo-nombre').value;
    const slug = document.getElementById('insumo-slug').value;
    const tipo = document.getElementById('insumo-tipo').value;
    const unidad = document.getElementById('insumo-unidad').value;
    const formato = parseFloat(document.getElementById('insumo-formato').value);
    const precio = parseFloat(document.getElementById('insumo-precio').value);
    const abv = parseFloat(document.getElementById('insumo-abv').value);
    const costo_unitario = precio / formato;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/insumos`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json', 'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ slug, nombre, tipo, unidad_medida: unidad, formato_envase: formato, precio_compra: precio, costo_unitario, graduacion_alcohol_base: abv })
        });
        if (!response.ok) throw new Error("Error en Supabase");
        document.getElementById('form-insumo').reset();
        obtenerInsumosSupabase();
    } catch (error) {
        // Fallback local
        const nuevoId = Math.max(...listaInsumosLocal.map(x => x.id), 0) + 1;
        listaInsumosLocal.push({ id: nuevoId, slug, nombre, tipo, unidad_medida: unidad, formato_envase: formato, precio_compra: precio, costo_unitario, graduacion_alcohol_base: abv });
        window.__local_db_insumos = listaInsumosLocal;
        document.getElementById('form-insumo').reset();
        renderizarInsumos(listaInsumosLocal);
    }
}