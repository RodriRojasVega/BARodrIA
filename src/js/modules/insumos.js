// src/js/modules/insumos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaInsumosLocal = [];
let listaTiposInsumosLocal = [];
let listaProveedoresLocal = [];

export async function initInsumos() {
    await cargarDatosAuxiliaresInsumos();
    await obtenerInsumosSupabase();

    const formInsumo = document.getElementById('form-insumo');
    if (formInsumo) {
        formInsumo.replaceWith(formInsumo.cloneNode(true));
        document.getElementById('form-insumo').addEventListener('submit', guardarInsumo);
    }
}

async function cargarDatosAuxiliaresInsumos() {
    try {
        const resTipos = await fetch(`${SUPABASE_URL}/rest/v1/tipos_insumos?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        if (resTipos.ok) listaTiposInsumosLocal = await resTipos.json();
    } catch (e) {
        console.warn("No se pudieron cargar los tipos de insumos:", e);
    }

    try {
        const resProveedores = await fetch(`${SUPABASE_URL}/rest/v1/proveedores?select=*`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        if (resProveedores.ok) listaProveedoresLocal = await resProveedores.json();
    } catch (e) {
        console.warn("No se pudieron cargar los proveedores:", e);
    }
}

async function obtenerInsumosSupabase() {
    const contenedor = document.getElementById('lista-insumos-contenedor') || document.getElementById('tabla-insumos-cuerpo');
    if (contenedor) contenedor.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-emerald-500 font-mono animate-pulse">Cargando insumos...</td></tr>`;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*&order=nombre.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Error HTTP ${res.status}: ${errText}`);
        }
        
        listaInsumosLocal = await res.json();
        renderizarTablaInsumos(listaInsumosLocal);
    } catch (e) {
        console.error("Error crítico obteniendo insumos:", e);
        if (contenedor) {
            contenedor.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-400 font-mono text-xs">Error al conectar con Supabase. Revisa la consola (F12).</td></tr>`;
        }
    }
}

function renderizarTablaInsumos(datos) {
    const cuerpo = document.getElementById('tabla-insumos-cuerpo') || document.getElementById('lista-insumos-contenedor');
    if (!cuerpo) return;

    if (!Array.isArray(datos) || datos.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500 text-sm">No hay insumos registrados.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = datos.map(insumo => {
        const tipoObj = listaTiposInsumosLocal.find(t => t.id == insumo.tipo_id);
        const nombreTipo = tipoObj ? tipoObj.nombre : 'General';
        const badgeArtesanal = insumo.es_artesanal ? 
            `<span class="ml-2 bg-purple-950 text-purple-400 border border-purple-900/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Artesanal</span>` : '';

        return `
            <tr class="hover:bg-gray-800/40 transition border-b border-gray-800/40 text-sm">
                <td class="py-3.5 px-3 font-medium text-white">
                    ${insumo.nombre}
                    ${badgeArtesanal}
                </td>
                <td class="py-3.5 px-3 text-gray-400 text-xs font-mono">${nombreTipo}</td>
                <td class="py-3.5 px-3 text-right font-mono text-emerald-400 font-semibold">$${Number(insumo.costo_unitario || 0).toFixed(2)}</td>
                <td class="py-3.5 px-3 text-gray-400 text-xs font-mono text-center">${insumo.unidad_medida || 'g'}</td>
                <td class="py-3.5 px-3 text-gray-400 text-xs font-mono text-center">${insumo.rendimiento_neto_porcentaje ? (insumo.rendimiento_neto_porcentaje * 100).toFixed(0) + '%' : '100%'}</td>
                <td class="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                    <button type="button" onclick="abrirModalInsumo(${insumo.id})" class="text-xs bg-gray-800 hover:bg-gray-750 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10 transition">Editar</button>
                    <button type="button" onclick="eliminarInsumo(${insumo.id}, '${insumo.nombre}')" class="text-xs bg-red-950/20 hover:bg-red-900/40 text-red-400 px-2.5 py-1 rounded border border-red-500/20 transition">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.abrirModalInsumo = async function(id = null) {
    const modal = document.getElementById('modal-insumo');
    const titulo = document.getElementById('modal-insumo-titulo');
    if (!modal) return;

    await cargarDatosAuxiliaresInsumos();

    const selectTipo = document.getElementById('insumo-tipo-id');
    if (selectTipo) {
        selectTipo.innerHTML = listaTiposInsumosLocal.length > 0 ? 
            listaTiposInsumosLocal.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('') :
            `<option value="">Sin tipos registrados</option>`;
    }

    modal.classList.remove('hidden');

    if (id) {
        const insumo = listaInsumosLocal.find(x => x.id === id);
        if (!insumo) return;
        titulo.textContent = "Editar Insumo";
        document.getElementById('insumo-id').value = id;
        document.getElementById('insumo-nombre').value = insumo.nombre;
        if (selectTipo) selectTipo.value = insumo.tipo_id || '';
        document.getElementById('insumo-costo').value = insumo.costo_unitario;
        document.getElementById('insumo-unidad').value = insumo.unidad_medida;
        document.getElementById('insumo-rendimiento').value = insumo.rendimiento_neto_porcentaje ? insumo.rendimiento_neto_porcentaje * 100 : 100;
        
        const checkArtesanal = document.getElementById('insumo-es-artesanal');
        if (checkArtesanal) checkArtesanal.checked = !!insumo.es_artesanal;
    } else {
        titulo.textContent = "Nuevo Insumo";
        document.getElementById('insumo-id').value = '';
        document.getElementById('form-insumo').reset();
        const checkArtesanal = document.getElementById('insumo-es-artesanal');
        if (checkArtesanal) checkArtesanal.checked = false;
    }
}

window.cerrarModalInsumo = function() {
    document.getElementById('modal-insumo').classList.add('hidden');
}

async function guardarInsumo(e) {
    e.preventDefault();
    const idInput = document.getElementById('insumo-id').value;
    const esEdicion = idInput !== '';

    const nuevoCosto = parseFloat(document.getElementById('insumo-costo').value) || 0;
    const insumoPayload = {
        nombre: document.getElementById('insumo-nombre').value,
        tipo_id: parseInt(document.getElementById('insumo-tipo-id').value) || null,
        costo_unitario: nuevoCosto,
        unidad_medida: document.getElementById('insumo-unidad').value,
        rendimiento_neto_porcentaje: (parseFloat(document.getElementById('insumo-rendimiento').value) || 100) / 100,
        es_artesanal: document.getElementById('insumo-es-artesanal')?.checked || false
    };

    const url = esEdicion ? 
        `${SUPABASE_URL}/rest/v1/insumos?id=eq.${idInput}` : 
        `${SUPABASE_URL}/rest/v1/insumos`;

    try {
        let costoAnterior = null;
        if (esEdicion) {
            const insumoActual = listaInsumosLocal.find(x => x.id == idInput);
            if (insumoActual) costoAnterior = insumoActual.costo_unitario;
        }

        const res = await fetch(url, {
            method: esEdicion ? 'PATCH' : 'POST',
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(insumoPayload)
        });

        if (!res.ok) throw new Error("Error al guardar el insumo");
        const dataGuardada = await res.json();
        const insumoIdReal = esEdicion ? idInput : dataGuardada[0].id;

        if (!esEdicion || costoAnterior !== nuevoCosto) {
            await fetch(`${SUPABASE_URL}/rest/v1/insumo_precios_historicos`, {
                method: 'POST',
                headers: { 
                    'apikey': SUPABASE_ANON_KEY, 
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    insumo_id: insumoIdReal,
                    precio: nuevoCosto,
                    fecha_vigencia: new Date().toISOString()
                })
            });
        }

        window.cerrarModalInsumo();
        await initInsumos();
    } catch (err) {
        console.error("Error al procesar insumo:", err);
        alert("Ocurrió un error al guardar el insumo en Supabase.");
    }
}

window.eliminarInsumo = async function(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el insumo "${nombre}"?`)) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/insumos?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });

        if (!res.ok) throw new Error("No se pudo eliminar");
        await initInsumos();
    } catch (err) {
        console.error("Error al eliminar insumo:", err);
        alert("No se pudo eliminar el insumo.");
    }
}

window.filtrarInsumos = function() {
    const query = document.getElementById('buscador-insumos').value.toLowerCase();
    const filtrados = listaInsumosLocal.filter(i => i.nombre.toLowerCase().includes(query));
    renderizarTablaInsumos(filtrados);
}

window.abrirModalInsumo = abrirModalInsumo;
window.cerrarModalInsumo = cerrarModalInsumo;