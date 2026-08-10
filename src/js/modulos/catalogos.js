// src/js/modulos/catalogos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let tablaCatalogoActiva = 'categorias';
let datosCatalogoLocal = [];

const configCatalogos = {
    categorias: {
        endpoint: "categorias",
        headers: ["Slug", "Nombre Comercial", "Descripción", "Acciones"],
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true, placeholder: "ej: aperitivo" },
            { name: "nombre", label: "Nombre de Categoría", type: "text", required: true, placeholder: "Ej: Aperitivo" },
            { name: "descripcion", label: "Descripción de Catálogo", type: "textarea", required: true, placeholder: "Describe el propósito..." }
        ]
    },
    familias: {
        endpoint: "familias",
        headers: ["Slug", "Nombre", "Fórmula de Balance", "Acciones"],
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true, placeholder: "ej: sour" },
            { name: "nombre", label: "Nombre de Familia", type: "text", required: true, placeholder: "Ej: Sour" },
            { name: "formula_balance_sugerida", label: "Fórmula de Balance Sugerida", type: "text", required: false, placeholder: "Ej: 2:1:1" }
        ]
    },
    soportes: {
        endpoint: "soportes",
        headers: ["Slug", "Nombre", "Capacidad Operativa", "Acciones"],
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true, placeholder: "ej: copa-coupette" },
            { name: "nombre", label: "Nombre de Vajilla", type: "text", required: true, placeholder: "Ej: Copa Coupette fría" },
            { name: "capacidad_operativa_ml", label: "Capacidad Operativa (ml)", type: "number", required: true, placeholder: "Ej: 180" }
        ]
    },
    hielos: {
        endpoint: "hielos",
        headers: ["Slug", "Nombre", "Dilución Pasiva", "Acciones"],
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true, placeholder: "ej: cubo-5x5" },
            { name: "nombre", label: "Nombre de Hielo", type: "text", required: true, placeholder: "Ej: Cubo Tallado 5x5 cm" },
            { name: "dilucion_pasiva", label: "Perfil de Dilución Pasiva", type: "text", required: true, placeholder: "Ej: Lenta, Rápida, Media" }
        ]
    },
    tecnicas: {
        endpoint: "tecnicas",
        headers: ["Slug", "Nombre", "Herramientas Requeridas", "Dilución Estimada (%)", "Acciones"],
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true, placeholder: "ej: refrescado" },
            { name: "nombre", label: "Nombre de Técnica", type: "text", required: true, placeholder: "Ej: Refrescado" },
            { name: "herramienta_requerida", label: "Herramientas de Barra", type: "text", required: true, placeholder: "Ej: Vaso mezclador, colador Julep..." },
            { name: "dilucion_estimada_porcentaje", label: "Dilución Estimada (Decimal entre 0 y 1)", type: "number", step: "0.01", min: "0", max: "1", required: true, placeholder: "Ej: 0.30 para 30%" }
        ]
    }
};

const semillasCatalogos = {
    categorias: [
        { id: 1, slug: "aperitivo", nombre: "Aperitivo", descripcion: "Cócteles secos, cítricos o amargos diseñados para abrir el apetito." },
        { id: 2, slug: "digestivo", nombre: "Digestivo", descripcion: "Tragos complejos, dulces o espirituosos ideales para cerrar la noche." }
    ],
    familias: [
        { id: 1, slug: "sour", nombre: "Sour", formula_balance_sugerida: "2 partes Destilado : 1 parte Ácido : 1 parte Dulce" },
        { id: 3, slug: "highball", nombre: "Highball / Tonic Style", formula_balance_sugerida: "1 parte Destilado : 3 partes Relleno Carbonatado" }
    ],
    soportes: [
        { id: 1, slug: "copa-coupette", nombre: "Copa Coupette fría", capacidad_operativa_ml: 180 },
        { id: 2, slug: "vaso-collins", nombre: "Vaso Collins largo", capacidad_operativa_ml: 320 }
    ],
    hielos: [
        { id: 1, slug: "cubo-5x5", nombre: "Cubo Tallado 5x5 cm", dilucion_pasiva: "Lenta (Premium)" },
        { id: 2, slug: "cubo-collins", nombre: "Cubo Collins Transparente", dilucion_pasiva: "Lenta (Estética)" }
    ],
    tecnicas: [
        { id: 1, slug: "doble-agitado", nombre: "Doble Agitado", herramienta_requerida: "Coctelería de 2 piezas", dilucion_estimada_porcentaje: 0.30 },
        { id: 2, slug: "refrescado", nombre: "Refrescado", herramienta_requerida: "Vaso mezclador, colador Julep", dilucion_estimada_porcentaje: 0.15 }
    ]
};

// Esta función se llama desde main.js cuando se abre la vista
export function initCatalogos() {
    const selector = document.getElementById('selector-tabla-catalogo');
    if (selector) {
        window.cambiarTablaCatalogo(selector.value);
    }
}

// ================= FUNCIONES CRUD EXPUESTAS GLOBALMENTE =================
window.cambiarTablaCatalogo = async function(nuevaTabla) {
    tablaCatalogoActiva = nuevaTabla;
    await cargarDatosCatalogo();
}

async function cargarDatosCatalogo() {
    const config = configCatalogos[tablaCatalogoActiva];
    const cabecera = document.getElementById('cabecera-catalogo');
    const cuerpo = document.getElementById('tabla-catalogo');

    cabecera.innerHTML = `<tr>${config.headers.map(h => `<th class="pb-3">${h}</th>`).join('')}</tr>`;
    cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-gray-500">Buscando registros en Supabase...</td></tr>`;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.endpoint}?select=*&order=id.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (!response.ok) throw new Error("Error de conexión");
        datosCatalogoLocal = await response.json();
        renderizarTablaCatalogo(datosCatalogoLocal, false);
    } catch (e) {
        if (!window[`__local_db_${tablaCatalogoActiva}`]) {
            window[`__local_db_${tablaCatalogoActiva}`] = JSON.parse(JSON.stringify(semillasCatalogos[tablaCatalogoActiva]));
        }
        datosCatalogoLocal = window[`__local_db_${tablaCatalogoActiva}`];
        renderizarTablaCatalogo(datosCatalogoLocal, true);
    }
}

function renderizarTablaCatalogo(datos, esFallback = false) {
    const config = configCatalogos[tablaCatalogoActiva];
    const cuerpo = document.getElementById('tabla-catalogo');

    if (datos.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-gray-500">No hay elementos creados.</td></tr>`;
        return;
    }

    let filasHtml = datos.map(item => {
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

    if (esFallback) {
        filasHtml += `<tr><td colspan="${config.headers.length}" class="text-center py-3 bg-amber-950/20 border-t border-amber-500/10 text-xs text-amber-400 font-mono tracking-wide">⚠️ MODO SIMULACIÓN OFFLINE ACTIVO.</td></tr>`;
    }
    cuerpo.innerHTML = filasHtml;
}

window.abrirModalCatalogo = function(id = null) {
    const modal = document.getElementById('modal-catalogo');
    const titulo = document.getElementById('modal-titulo');
    const itemIdInput = document.getElementById('catalogo-item-id');
    const contenedorCampos = document.getElementById('campos-dinamicos-modal');
    const config = configCatalogos[tablaCatalogoActiva];

    contenedorCampos.innerHTML = '';
    modal.classList.remove('hidden');

    let item = null;
    if (id) {
        titulo.textContent = `Editar en ${tablaCatalogoActiva.charAt(0).toUpperCase() + tablaCatalogoActiva.slice(1)}`;
        itemIdInput.value = id;
        item = datosCatalogoLocal.find(x => x.id === id);
    } else {
        titulo.textContent = `Nuevo en ${tablaCatalogoActiva.charAt(0).toUpperCase() + tablaCatalogoActiva.slice(1)}`;
        itemIdInput.value = '';
    }

    config.fields.forEach(field => {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.className = "block text-gray-400 mb-1 font-medium";
        label.textContent = field.label;

        let input;
        const valorActual = item ? item[field.name] : '';

        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 3;
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }
        input.className = "w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none";
        input.id = `input-${field.name}`;
        input.name = field.name;
        input.required = field.required;
        input.placeholder = field.placeholder;
        input.value = valorActual;

        if (field.name === 'slug' && item) {
            input.disabled = true;
            input.className += " opacity-50 cursor-not-allowed";
        }

        div.appendChild(label);
        div.appendChild(input);
        contenedorCampos.appendChild(div);
    });
}

window.cerrarModalCatalogo = function() {
    document.getElementById('modal-catalogo').classList.add('hidden');
}

window.guardarElementoCatalogo = async function(e) {
    e.preventDefault();
    const config = configCatalogos[tablaCatalogoActiva];
    const id = document.getElementById('catalogo-item-id').value;
    
    const payload = {};
    config.fields.forEach(field => {
        const input = document.getElementById(`input-${field.name}`);
        if (input) payload[field.name] = field.type === 'number' ? parseFloat(input.value) : input.value;
    });

    const esEdicion = id !== '';
    const url = esEdicion ? `${SUPABASE_URL}/rest/v1/${config.endpoint}?id=eq.${id}` : `${SUPABASE_URL}/rest/v1/${config.endpoint}`;

    try {
        const headers = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };
        if (!esEdicion) headers['Prefer'] = 'return=minimal';
        const response = await fetch(url, { method: esEdicion ? 'PATCH' : 'POST', headers, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("Rechazado");
        window.cerrarModalCatalogo();
        await cargarDatosCatalogo();
    } catch (error) {
        if (esEdicion) {
            const idx = datosCatalogoLocal.findIndex(x => x.id == id);
            if (idx !== -1) datosCatalogoLocal[idx] = { ...datosCatalogoLocal[idx], ...payload };
        } else {
            const nuevoId = Math.max(...datosCatalogoLocal.map(x => x.id), 0) + 1;
            datosCatalogoLocal.push({ id: nuevoId, ...payload });
        }
        window[`__local_db_${tablaCatalogoActiva}`] = datosCatalogoLocal;
        window.cerrarModalCatalogo();
        renderizarTablaCatalogo(datosCatalogoLocal, true);
    }
}

window.eliminarElementoCatalogo = async function(id, slug) {
    if (!confirm(`¿Eliminar "${slug}" de ${tablaCatalogoActiva}?`)) return;
    const config = configCatalogos[tablaCatalogoActiva];
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.endpoint}?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        if (!response.ok) throw new Error("Fallo");
        await cargarDatosCatalogo();
    } catch (error) {
        datosCatalogoLocal = datosCatalogoLocal.filter(x => x.id !== id);
        window[`__local_db_${tablaCatalogoActiva}`] = datosCatalogoLocal;
        renderizarTablaCatalogo(datosCatalogoLocal, true);
    }
}