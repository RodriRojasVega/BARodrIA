// src/js/modules/catalogos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let tablaCatalogoActiva = 'categorias';
let datosCatalogoLocal = [];

const configCatalogos = {
    categorias: { endpoint: "categorias", headers: ["Slug", "Nombre Comercial", "Descripción", "Acciones"], fields: [{ name: "slug", label: "Slug Único", type: "text", required: true }, { name: "nombre", label: "Nombre de Categoría", type: "text", required: true }, { name: "descripcion", label: "Descripción", type: "textarea", required: true }] },
    familias: { endpoint: "familias", headers: ["Slug", "Nombre", "Fórmula de Balance", "Acciones"], fields: [{ name: "slug", label: "Slug Único", type: "text", required: true }, { name: "nombre", label: "Nombre de Familia", type: "text", required: true }, { name: "formula_balance_sugerida", label: "Fórmula Sugerida", type: "text", required: false }] },
    soportes: { endpoint: "soportes", headers: ["Slug", "Nombre", "Capacidad Operativa", "Acciones"], fields: [{ name: "slug", label: "Slug Único", type: "text", required: true }, { name: "nombre", label: "Nombre de Vajilla", type: "text", required: true }, { name: "capacidad_operativa_ml", label: "Capacidad (ml)", type: "number", required: true }] },
    hielos: { endpoint: "hielos", headers: ["Slug", "Nombre", "Dilución Pasiva", "Acciones"], fields: [{ name: "slug", label: "Slug Único", type: "text", required: true }, { name: "nombre", label: "Nombre de Hielo", type: "text", required: true }, { name: "dilucion_pasiva", label: "Perfil de Dilución", type: "text", required: true }] },
    tecnicas: { endpoint: "tecnicas", headers: ["Slug", "Nombre", "Herramientas", "Dilución (%)", "Acciones"], fields: [{ name: "slug", label: "Slug Único", type: "text", required: true }, { name: "nombre", label: "Nombre de Técnica", type: "text", required: true }, { name: "herramienta_requerida", label: "Herramientas", type: "text", required: true }, { name: "dilucion_estimada_porcentaje", label: "Dilución (0 a 1)", type: "number", step: "0.01", required: true }] }
};

export function initCatalogos() {
    const selector = document.getElementById('selector-tabla-catalogo');
    if (selector) window.cambiarTablaCatalogo(selector.value);
}

window.cambiarTablaCatalogo = async function(nuevaTabla) {
    tablaCatalogoActiva = nuevaTabla;
    await cargarDatosCatalogo();
}

async function cargarDatosCatalogo() {
    const config = configCatalogos[tablaCatalogoActiva];
    const cabecera = document.getElementById('cabecera-catalogo');
    const cuerpo = document.getElementById('tabla-catalogo');

    cabecera.innerHTML = `<tr>${config.headers.map(h => `<th class="pb-3">${h}</th>`).join('')}</tr>`;
    cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-gray-500 animate-pulse">Buscando registros en Supabase...</td></tr>`;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.endpoint}?select=*&order=id.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (!response.ok) throw new Error("Error de conexión");
        datosCatalogoLocal = await response.json();
        renderizarTablaCatalogo();
    } catch (error) {
        cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-red-500 font-mono">Error al conectar con la base de datos.</td></tr>`;
    }
}

function renderizarTablaCatalogo() {
    const config = configCatalogos[tablaCatalogoActiva];
    const cuerpo = document.getElementById('tabla-catalogo');

    if (datosCatalogoLocal.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-gray-500">No hay elementos creados en la base de datos.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = datosCatalogoLocal.map(item => {
        let celdasHtml = config.fields.map(field => {
            let val = item[field.name];
            if (field.name === 'dilucion_estimada_porcentaje' && val !== undefined) val = `${(Number(val) * 100).toFixed(0)}%`;
            if (field.name === 'capacidad_operativa_ml' && val !== undefined) val = `${val} ml`;
            return `<td class="py-3.5 text-white ${field.name === 'slug' ? 'font-mono text-xs text-gray-400' : ''}">${val || '—'}</td>`;
        }).join('');

        let accionesHtml = `
            <td class="py-3.5 text-right space-x-2 shrink-0">
                <button onclick="abrirModalCatalogo(${item.id})" class="text-xs bg-gray-800 hover:bg-gray-750 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10 transition">Editar</button>
                <button onclick="eliminarElementoCatalogo(${item.id}, '${item.slug}')" class="text-xs bg-red-950/20 hover:bg-red-900/40 text-red-400 px-2.5 py-1 rounded border border-red-500/20 transition">Eliminar</button>
            </td>
        `;
        return `<tr class="hover:bg-gray-800/40 transition">${celdasHtml}${accionesHtml}</tr>`;
    }).join('');
}

// (Las funciones de los modales se mantienen idénticas para cuando programemos los POST/DELETE reales)
window.abrirModalCatalogo = function(id = null) { alert("Formulario listo para conectar a Supabase"); }
window.cerrarModalCatalogo = function() { document.getElementById('modal-catalogo').classList.add('hidden'); }
// Función Real para Crear (POST) o Actualizar (PATCH)
window.guardarElementoCatalogo = async function(e) {
    e.preventDefault();
    const config = configCatalogos[tablaCatalogoActiva];
    const id = document.getElementById('catalogo-item-id').value;
    
    // Recopilar los datos del formulario basándonos en la configuración
    const payload = {};
    config.fields.forEach(field => {
        const input = document.getElementById(`input-${field.name}`);
        if (input) {
            payload[field.name] = field.type === 'number' ? parseFloat(input.value) : input.value;
        }
    });

    const esEdicion = id !== '';
    const url = esEdicion ? 
        `${SUPABASE_URL}/rest/v1/${config.endpoint}?id=eq.${id}` : 
        `${SUPABASE_URL}/rest/v1/${config.endpoint}`;

    try {
        const headers = { 
            'apikey': SUPABASE_ANON_KEY, 
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
            'Content-Type': 'application/json' 
        };
        // Supabase requiere este header para los POST simples
        if (!esEdicion) headers['Prefer'] = 'return=minimal'; 

        const response = await fetch(url, {
            method: esEdicion ? 'PATCH' : 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error en la petición a Supabase");

        // Si todo sale bien, cerramos el modal y recargamos la tabla
        window.cerrarModalCatalogo();
        await window.cambiarTablaCatalogo(tablaCatalogoActiva);

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Ocurrió un error al guardar. Revisa la consola para más detalles.");
    }
}

// Función Real para Eliminar (DELETE)
window.eliminarElementoCatalogo = async function(id, slug) {
    if (!confirm(`¿Estás seguro de eliminar "${slug}" definitivamente de la base de datos?`)) return;
    
    const config = configCatalogos[tablaCatalogoActiva];
    const url = `${SUPABASE_URL}/rest/v1/${config.endpoint}?id=eq.${id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        
        if (!response.ok) throw new Error("Error de Supabase");
        
        await window.cambiarTablaCatalogo(tablaCatalogoActiva);
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar. Es posible que este elemento esté siendo usado en un cóctel (Restricción de Llave Foránea).");
    }
}