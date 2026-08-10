// src/js/modules/insumos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaInsumosLocal = [];

export function initInsumos() {
    obtenerInsumosSupabase();
    
    const formInsumo = document.getElementById('form-insumo');
    if (formInsumo) formInsumo.addEventListener('submit', guardarInsumo);
}

async function obtenerInsumosSupabase() {
    const tabla = document.getElementById('tabla-insumos');
    if (tabla) tabla.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-400">Consultando datos a Supabase...</td></tr>`;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*&order=nombre.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        
        if (!response.ok) throw new Error("Error conectando con la base de datos");
        
        listaInsumosLocal = await response.json();
        if (tabla) renderizarInsumos(listaInsumosLocal);
        
    } catch (error) {
        console.error(error);
        if (tabla) tabla.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error de conexión con Supabase. Verifica tus credenciales en config.js.</td></tr>`;
    }
}

function renderizarInsumos(datos) {
    const tabla = document.getElementById('tabla-insumos');
    if (!tabla) return;
    
    if (datos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No hay insumos registrados en la base de datos.</td></tr>`;
        return;
    }

    tabla.innerHTML = datos.map(insumo => `
        <tr class="hover:bg-gray-800/40 transition">
            <td class="py-3.5 font-medium text-white">
                <div>${insumo.nombre}</div>
                <span class="text-[10px] text-gray-500 font-mono">${insumo.slug}</span>
            </td>
            <td class="py-3.5 text-center">
                <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase ${insumo.tipo === 'compuesto' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}">
                    ${insumo.tipo}
                </span>
            </td>
            <td class="py-3.5 text-right font-mono text-gray-300">${Number(insumo.formato_envase).toFixed(0)} ${insumo.unidad_medida}</td>
            <td class="py-3.5 text-right font-mono text-emerald-400 font-bold">$${Number(insumo.costo_unitario).toFixed(2)}</td>
            <td class="py-3.5 text-right font-mono text-gray-500">$${Number(insumo.precio_compra).toFixed(0)}</td>
        </tr>
    `).join('');
}

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
    
    // Capturar valores
    const nombre = document.getElementById('insumo-nombre').value;
    const slug = document.getElementById('insumo-slug').value;
    const tipo = document.getElementById('insumo-tipo').value;
    const unidad = document.getElementById('insumo-unidad').value;
    const formato = parseFloat(document.getElementById('insumo-formato').value);
    const precio = parseFloat(document.getElementById('insumo-precio').value);
    const abv = parseFloat(document.getElementById('insumo-abv').value);
    
    // Calcular costo unitario (La matemática se hace antes de subir a la DB)
    const costo_unitario = precio / formato;

    const payload = {
        slug: slug,
        nombre: nombre,
        tipo: tipo,
        unidad_medida: unidad,
        formato_envase: formato,
        precio_compra: precio,
        costo_unitario: costo_unitario,
        graduacion_alcohol_base: abv
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/insumos`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("No se pudo guardar el insumo");
        
        // Limpiar el formulario y recargar la tabla visualmente
        document.getElementById('form-insumo').reset();
        await obtenerInsumosSupabase();
        
    } catch (error) {
        console.error("Fallo al guardar en BD:", error);
        alert("Error al guardar el insumo en Supabase.");
    }
}