// src/js/modules/catalogos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let tablaCatalogoActiva = 'categorias';
let datosCatalogoLocal = [];

const configCatalogos = {
    categorias: { 
        endpoint: "categorias", 
        headers: ["Slug", "Nombre Comercial", "Descripción", "Acciones"], 
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true }, 
            { name: "nombre", label: "Nombre Comercial", type: "text", required: true }, 
            { name: "descripcion", label: "Descripción", type: "textarea", required: true }
        ] 
    },
    familias: { 
        endpoint: "familias", 
        headers: ["Slug", "Nombre", "Fórmula de Balance", "Acciones"], 
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true }, 
            { name: "nombre", label: "Nombre de Familia", type: "text", required: true }, 
            { name: "formula_balance_sugerida", label: "Fórmula Sugerida", type: "text", required: false }
        ] 
    },
    soportes: { 
        endpoint: "soportes", 
        headers: ["Slug", "Nombre", "Capacidad Operativa", "Acciones"], 
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true }, 
            { name: "nombre", label: "Nombre de Vajilla", type: "text", required: true }, 
            { name: "capacidad_operativa_ml", label: "Capacidad (ml)", type: "number", required: true }
        ] 
    },
    hielos: { 
        endpoint: "hielos", 
        headers: ["Slug", "Nombre", "Dilución Pasiva", "Acciones"], 
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true }, 
            { name: "nombre", label: "Nombre de Hielo", type: "text", required: true }, 
            { name: "dilucion_pasiva", label: "Perfil de Dilución", type: "text", required: true }
        ] 
    },
    tecnicas: { 
        endpoint: "tecnicas", 
        headers: ["Slug", "Nombre", "Herramientas", "Dilución (%)", "Acciones"], 
        fields: [
            { name: "slug", label: "Slug Único", type: "text", required: true }, 
            { name: "nombre", label: "Nombre de Técnica", type: "text", required: true }, 
            { name: "herramienta_requerida", label: "Herramientas", type: "text", required: true }, 
            { name: "dilucion_estimada_porcentaje", label: "Dilución (0 a 1)", type: "number", step: "0.01", required: true }
        ] 
    },
    // Agrega esto dentro del objeto configCatalogos en insumos/catalogos.js
    tipos_sub_recetas: { 
    endpoint: "tipos_sub_recetas", 
    headers: ["Slug", "Nombre del Tipo", "Descripción", "Acciones"], 
    fields: [
        { name: "slug", label: "Slug Único (ej. syrup)", type: "text", required: true }, 
        { name: "nombre", label: "Nombre Visible", type: "text", required: true }, 
        { name: "descripcion", label: "Descripción", type: "textarea", required: false }
    ] 
    }
};

export function initCatalogos() {
    const selector = document.getElementById('selector-tabla-catalogo');
    if (selector) {
        selector.value = tablaCatalogoActiva;
        selector.onchange = (e) => cambiarTablaCatalogo(e.target.value);
    }

    const btnNuevo = document.getElementById('btn-nuevo-catalogo');
    if (btnNuevo) {
        btnNuevo.onclick = () => abrirModalCatalogo(null);
    }

    cambiarTablaCatalogo(tablaCatalogoActiva);
}

async function cambiarTablaCatalogo(nuevaTabla) {
    tablaCatalogoActiva = nuevaTabla;
    await cargarDatosCatalogo();
}

async function cargarDatosCatalogo() {
    const config = configCatalogos[tablaCatalogoActiva];
    const cabecera = document.getElementById('cabecera-catalogo');
    const cuerpo = document.getElementById('tabla-catalogo');
    if (!cabecera || !cuerpo) return;

    cabecera.innerHTML = `<tr>${config.headers.map((h, index) => {
        const alineacion = index === config.headers.length - 1 ? 'text-right' : 'text-left';
        return `<th class="pb-3 ${alineacion} text-gray-400 font-semibold">${h}</th>`;
    }).join('')}</tr>`;
    
    cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-emerald-500 font-mono animate-pulse">Cargando registros...</td></tr>`;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.endpoint}?select=*&order=id.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (!response.ok) throw new Error("Error de conexión");
        datosCatalogoLocal = await response.json();
        renderizarTablaCatalogo();
    } catch (error) {
        console.error(error);
        cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-red-500 font-mono">Error al conectar con la base de datos.</td></tr>`;
    }
}

function renderizarTablaCatalogo() {
    const config = configCatalogos[tablaCatalogoActiva];
    const cuerpo = document.getElementById('tabla-catalogo');
    if (!cuerpo) return;

    if (datosCatalogoLocal.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="${config.headers.length}" class="text-center py-8 text-gray-500">No hay elementos registrados en esta tabla.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = datosCatalogoLocal.map(item => {
        let celdasHtml = config.fields.map(field => {
            let val = item[field.name];
            if (field.name === 'dilucion_estimada_porcentaje' && val !== undefined) val = `${(Number(val) * 100).toFixed(0)}%`;
            if (field.name === 'capacidad_operativa_ml' && val !== undefined) val = `${val} ml`;
            
            // Si es un campo largo (como descripción), le damos un ancho máximo y permitimos multilíneas ordenadas
            const esTextoLargo = field.type === 'textarea' || field.name === 'descripcion' || field.name === 'formula_balance_sugerida';
            const estilosCelda = esTextoLargo ? 
                'max-w-xs md:max-w-md whitespace-normal break-words text-gray-300 text-xs leading-relaxed' : 
                'text-white';
            const estiloSlug = field.name === 'slug' ? 'font-mono text-xs text-gray-400' : '';

            return `<td class="py-3.5 px-3 ${estilosCelda} ${estiloSlug}">${val || '—'}</td>`;
        }).join('');

        let accionesHtml = `
            <td class="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                <button type="button" data-action="editar" data-id="${item.id}" class="text-xs bg-gray-800 hover:bg-gray-750 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10 transition">Editar</button>
                <button type="button" data-action="eliminar" data-id="${item.id}" data-slug="${item.slug}" class="text-xs bg-red-950/20 hover:bg-red-900/40 text-red-400 px-2.5 py-1 rounded border border-red-500/20 transition">Eliminar</button>
            </td>
        `;
        return `<tr class="hover:bg-gray-800/40 transition border-b border-gray-850 align-top">${celdasHtml}${accionesHtml}</tr>`;
    }).join('');

    cuerpo.querySelectorAll('button[data-action="editar"]').forEach(btn => {
        btn.onclick = () => abrirModalCatalogo(parseInt(btn.getAttribute('data-id')));
    });
    cuerpo.querySelectorAll('button[data-action="eliminar"]').forEach(btn => {
        btn.onclick = () => eliminarElementoCatalogo(parseInt(btn.getAttribute('data-id')), btn.getAttribute('data-slug'));
    });
}

function abrirModalCatalogo(id = null) {
    const modal = document.getElementById('modal-catalogo');
    const contenedorForm = document.getElementById('catalogo-formulario-contenedor') || document.getElementById('catalopo-formulario-contenedor');
    const titulo = document.getElementById('modal-catalogo-titulo');
    
    if (!modal || !contenedorForm) return;

    modal.classList.remove('hidden');
    const config = configCatalogos[tablaCatalogoActiva];
    if (titulo) titulo.textContent = id ? `Editar registro en ${tablaCatalogoActiva}` : `Nuevo registro en ${tablaCatalogoActiva}`;

    let itemEdicion = id ? datosCatalogoLocal.find(x => x.id === id) : null;

    contenedorForm.innerHTML = `
        <form id="form-catalogo-dinamico" class="space-y-4 text-sm">
            <input type="hidden" id="catalogo-item-id" value="${id || ''}">
            ${config.fields.map(field => {
                const valorActual = itemEdicion ? (itemEdicion[field.name] || '') : '';
                const esSlug = field.name === 'slug';
                return `
                    <div>
                        <label class="block text-gray-400 mb-1 font-medium">${field.label}</label>
                        ${field.type === 'textarea' ? 
                            `<textarea id="input-${field.name}" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500" rows="2" ${field.required ? 'required' : ''}>${valorActual}</textarea>` :
                            `<input type="${field.type}" id="input-${field.name}" value="${valorActual}" ${field.step ? `step="${field.step}"` : ''} class="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500" ${esSlug && id ? 'disabled' : ''} ${field.required ? 'required' : ''}>`
                        }
                    </div>
                `;
            }).join('')}
            <div class="flex gap-3 pt-4 border-t border-gray-800">
                <button type="button" id="btn-cancelar-catalogo" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg font-bold transition">Cancelar</button>
                <button type="submit" class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-gray-950 py-2.5 rounded-lg font-bold transition uppercase tracking-wider">Guardar</button>
            </div>
        </form>
    `;

    document.getElementById('btn-cancelar-catalogo').onclick = cerrarModalCatalogo;
    document.getElementById('form-catalogo-dinamico').onsubmit = guardarElementoCatalogo;
}

function cerrarModalCatalogo() {
    const modal = document.getElementById('modal-catalogo');
    if (modal) modal.classList.add('hidden');
}

async function guardarElementoCatalogo(e) {
    e.preventDefault();
    const config = configCatalogos[tablaCatalogoActiva];
    const id = document.getElementById('catalogo-item-id').value;
    
    const payload = {};
    config.fields.forEach(field => {
        const input = document.getElementById(`input-${field.name}`);
        if (input && !input.disabled) {
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
        if (!esEdicion) headers['Prefer'] = 'return=minimal';

        const response = await fetch(url, {
            method: esEdicion ? 'PATCH' : 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error al guardar");

        cerrarModalCatalogo();
        await cambiarTablaCatalogo(tablaCatalogoActiva);

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Ocurrió un error al guardar el registro.");
    }
}

async function eliminarElementoCatalogo(id, slug) {
    if (!confirm(`¿Estás seguro de eliminar "${slug}"?`)) return;
    
    const config = configCatalogos[tablaCatalogoActiva];
    const url = `${SUPABASE_URL}/rest/v1/${config.endpoint}?id=eq.${id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        
        if (!response.ok) throw new Error("Error de Supabase");
        
        await cambiarTablaCatalogo(tablaCatalogoActiva);
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar. El elemento podría estar vinculado.");
    }
}

// Vincular de forma global la "x" y los cierres de este modal específicos
window.cambiarTablaCatalogo = cambiarTablaCatalogo;
window.abrirModalCatalogo = abrirModalCatalogo;
window.cerrarModalCatalogo = cerrarModalCatalogo;