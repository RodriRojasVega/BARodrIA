// src/js/modules/insumos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaInsumosLocal = [];

export function initInsumos() {
    obtenerInsumosSupabase();
    
    const formInsumo = document.getElementById('form-insumo');
    if (formInsumo) {
        // Limpiamos listeners previos por seguridad y agregamos el unificado (Crear/Editar)
        formInsumo.replaceWith(formInsumo.cloneNode(true));
        document.getElementById('form-insumo').addEventListener('submit', guardarOActualizarInsumo);
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
        if (tabla) renderizarInsumos(listaInsumosLocal);
        
    } catch (error) {
        console.error(error);
        if (tabla) tabla.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error de conexión con Supabase.</td></tr>`;
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
                <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase ${insumo.tipo === 'compuesto' ? 'bg-purple-900/35 text-purple-400' : 'bg-blue-900/35 text-blue-400'}">
                    ${insumo.tipo}
                </span>
            </td>
            <td class="py-3.5 text-right font-mono text-gray-300">${Number(insumo.formato_envase).toFixed(0)} ${insumo.unidad_medida}</td>
            <td class="py-3.5 text-right font-mono text-emerald-400 font-bold">$${Number(insumo.costo_unitario).toFixed(2)}</td>
            <td class="py-3.5 text-right font-mono text-gray-500">$${Number(insumo.precio_compra).toFixed(0)}</td>
            <td class="py-3.5 text-right space-x-2">
                <button onclick="prepararEdicionInsumo(${insumo.id})" class="text-xs bg-gray-800 hover:bg-gray-750 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10 transition">Editar</button>
                <button onclick="eliminarInsumo(${insumo.id}, '${insumo.nombre}')" class="text-xs bg-red-950/20 hover:bg-red-900/40 text-red-400 px-2.5 py-1 rounded border border-red-500/20 transition">Eliminar</button>
            </td>
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

// ================= FUNCIONES CRUD REALES =================

// 1. Cargar datos en el formulario para Editar
window.prepararEdicionInsumo = function(id) {
    const insumo = listaInsumosLocal.find(x => x.id === id);
    if (!insumo) return;

    // Si no tenemos un input hidden para el ID, lo inyectamos dinámicamente en el formulario
    let idInput = document.getElementById('insumo-edit-id');
    if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'insumo-edit-id';
        document.getElementById('form-insumo').appendChild(idInput);
    }

    idInput.value = insumo.id;
    document.getElementById('insumo-nombre').value = insumo.nombre;
    document.getElementById('insumo-slug').value = insumo.slug;
    document.getElementById('insumo-slug').disabled = true; // El slug principal no debe cambiar por integridad
    document.getElementById('insumo-tipo').value = insumo.tipo;
    document.getElementById('insumo-unidad').value = insumo.unidad_medida;
    document.getElementById('insumo-formato').value = insumo.formato_envase;
    document.getElementById('insumo-precio').value = insumo.precio_compra;
    document.getElementById('insumo-abv').value = insumo.graduacion_alcohol_base;

    // Cambiar visualmente el botón para indicar edición
    const btnSubmit = document.querySelector('#form-insumo button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = "Actualizar Insumo";
        btnSubmit.className = "w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-lg transition uppercase tracking-wider";
    }

    // Scroll suave hacia el formulario de edición
    document.getElementById('form-insumo').scrollIntoView({ behavior: 'smooth' });
}

// 2. Función unificada para Guardar (POST) o Actualizar (PATCH)
async function guardarOActualizarInsumo(e) {
    e.preventDefault();
    
    const editId = document.getElementById('insumo-edit-id')?.value;
    const esEdicion = editId && editId !== "";

    const nombre = document.getElementById('insumo-nombre').value;
    const slug = document.getElementById('insumo-slug').value;
    const tipo = document.getElementById('insumo-tipo').value;
    const unidad = document.getElementById('insumo-unidad').value;
    const formato = parseFloat(document.getElementById('insumo-formato').value);
    const precio = parseFloat(document.getElementById('insumo-precio').value);
    const abv = parseFloat(document.getElementById('insumo-abv').value);
    
    // Matemática exacta según el DER (Costo por ml, g o unidad)
    const costo_unitario = precio / formato;

    const payload = {
        nombre: nombre,
        tipo: tipo,
        unidad_medida: unidad,
        formato_envase: formato,
        precio_compra: precio,
        costo_unitario: costo_unitario,
        graduacion_alcohol_base: abv
    };

    if (!esEdicion) {
        payload.slug = slug; // El slug solo se envía al crear
    }

    const url = esEdicion ? 
        `${SUPABASE_URL}/rest/v1/insumos?id=eq.${editId}` : 
        `${SUPABASE_URL}/rest/v1/insumos`;

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

        if (!response.ok) throw new Error("No se pudo procesar el insumo en la base de datos");
        
        // Resetear formulario y estados de edición
        resetearFormularioInsumo();
        await obtenerInsumosSupabase();
        
    } catch (error) {
        console.error("Fallo al guardar en BD:", error);
        alert("Error al guardar el insumo en Supabase.");
    }
}

// 3. Función Real para Eliminar (DELETE)
window.eliminarInsumo = async function(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el insumo "${nombre}"? Si está siendo utilizado en sub-recetas o cócteles, la base de datos rechazará la acción por seguridad.`)) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/insumos?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
            }
        });

        if (!response.ok) throw new Error("Error al eliminar");

        await obtenerInsumosSupabase();
    } catch (error) {
        console.error("Error al eliminar insumo:", error);
        alert("No se pudo eliminar el insumo. Es posible que existan recetas o sub-recetas que dependan de él (Restricción de Llave Foránea).");
    }
}

function resetearFormularioInsumo() {
    const form = document.getElementById('form-insumo');
    if (form) form.reset();

    const editId = document.getElementById('insumo-edit-id');
    if (editId) editId.value = "";

    const slugInput = document.getElementById('insumo-slug');
    if (slugInput) slugInput.disabled = false;

    const btnSubmit = document.querySelector('#form-insumo button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = "Guardar en Supabase";
        btnSubmit.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold py-2.5 rounded-lg transition uppercase tracking-wider";
    }
}