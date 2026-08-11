// src/js/modules/insumos.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaInsumosLocal = [];
let listaTiposInsumosLocal = [];

export async function initInsumos() {
    await cargarTiposInsumos();
    await obtenerInsumosSupabase();

    const formInsumo = document.getElementById('form-insumo');
    if (formInsumo) {
        formInsumo.replaceWith(formInsumo.cloneNode(true));
        document.getElementById('form-insumo').addEventListener('submit', guardarInsumo);
    }
}

async function cargarTiposInsumos() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tipos_insumos?select=*`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (res.ok) {
            listaTiposInsumosLocal = await res.json();
        }
    } catch (e) {
        console.warn("No se pudieron cargar los tipos de insumos:", e);
    }
}

async function obtenerInsumosSupabase() {
    const cuerpo = document.getElementById('tabla-insumos-cuerpo') || document.getElementById('lista-insumos-contenedor');
    if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-emerald-500 font-mono animate-pulse">Cargando insumos...</td></tr>`;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/insumos?select=*&order=nombre.asc`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        
        if (!res.ok) throw new Error("Error HTTP al obtener insumos");
        
        listaInsumosLocal = await res.json();
        renderizarTablaInsumos(listaInsumosLocal);
    } catch (e) {
        console.error("Error crítico obteniendo insumos:", e);
        if (cuerpo) {
            cuerpo.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-400 font-mono text-xs">Error al conectar con Supabase.</td></tr>`;
        }
    }
}

function renderizarTablaInsumos(datos) {
    const cuerpo = document.getElementById('tabla-insumos-cuerpo') || document.getElementById('lista-insumos-contenedor');
    if (!cuerpo) return;

    if (!Array.isArray(datos) || datos.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-gray-500 text-sm">No hay insumos registrados.</td></tr>`;
        return;
    }

    cuerpo.innerHTML = datos.map(insumo => {
        const tipoObj = listaTiposInsumosLocal.find(t => t.id == insumo.tipo_id);
        const nombreTipo = tipoObj ? tipoObj.nombre : 'General';
        
        const badgeArtesanal = insumo.es_artesanal ? 
            `<span class="bg-purple-950 text-purple-400 border border-purple-900/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Sí</span>` : 
            `<span class="text-gray-500 text-xs">No</span>`;

        const graduacionTexto = insumo.graduacion_alcohol_base > 0 ? 
            `<span class="text-amber-400 font-semibold">${insumo.graduacion_alcohol_base}%</span>` : 
            `<span class="text-gray-500">-</span>`;

        const rendimientoPorcentaje = insumo.rendimiento_neto_porcentaje ? 
            `${(insumo.rendimiento_neto_porcentaje * 100).toFixed(0)}%` : '100%';

        return `
            <tr class="hover:bg-gray-800/40 transition border-b border-gray-800/40 text-sm">
                <td class="py-3.5 px-3 font-medium text-white">${insumo.nombre}</td>
                <td class="py-3.5 px-3 text-gray-400 text-xs font-mono">${nombreTipo}</td>
                <td class="py-3.5 px-3 text-center">${badgeArtesanal}</td>
                <td class="py-3.5 px-3 text-center">${graduacionTexto}</td>
                <td class="py-3.5 px-3 text-right font-mono text-gray-200">$${window.formatearMonedaLocal(insumo.precio_compra, 0)}</td>
                <td class="py-3.5 px-3 text-center font-mono text-gray-300 text-xs">${insumo.formato_envase || 1}</td>
                <td class="py-3.5 px-3 text-center font-mono text-gray-400 text-xs">${insumo.unidad_medida || 'ml'}</td>
                <td class="py-3.5 px-3 text-center font-mono text-gray-300 text-xs">${rendimientoPorcentaje}</td>
                <td class="py-3.5 px-3 text-right font-mono text-emerald-400 font-bold">$${window.formatearMonedaLocal(insumo.costo_unitario, 4)}</td>
                <td class="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                    <button type="button" onclick="abrirModalInsumo(${insumo.id})" class="text-xs bg-gray-800 hover:bg-gray-750 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10 transition">Editar</button>
                    <button type="button" onclick="eliminarInsumo(${insumo.id}, '${insumo.nombre}')" class="text-xs bg-red-950/20 hover:bg-red-900/40 text-red-400 px-2.5 py-1 rounded border border-red-500/20 transition">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Función global para calcular el costo unitario en vivo mientras el usuario escribe en el modal
window.calcularCostoUnitarioAutomatico = function() {
    const precioCompra = parseFloat(document.getElementById('insumo-precio-compra')?.value) || 0;
    const formatoEnvase = parseFloat(document.getElementById('insumo-formato-envase')?.value) || 1;
    const rendimiento = (parseFloat(document.getElementById('insumo-rendimiento')?.value) || 100) / 100;

    if (formatoEnvase <= 0) return;

    // Fórmula: Costo por unidad base = (Precio Compra / Formato Envase) / Rendimiento
    const costoCalculado = (precioCompra / formatoEnvase) / (rendimiento > 0 ? rendimiento : 1);

    const labelCosto = document.getElementById('label-costo-calculado');
    const inputCosto = document.getElementById('insumo-costo-unitario');
    
    if (labelCosto) labelCosto.textContent = `$${formatearMonedaLocal(costoCalculado, 4)}`;
    if (inputCosto) inputCosto.value = costoCalculado.toFixed(4);
}

window.abrirModalInsumo = async function(id = null) {
    const modal = document.getElementById('modal-insumo');
    const titulo = document.getElementById('modal-insumo-titulo');
    if (!modal) return;

    await cargarTiposInsumos();

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
        document.getElementById('insumo-unidad').value = insumo.unidad_medida || 'ml';
        document.getElementById('insumo-formato-envase').value = insumo.formato_envase || 1;
        document.getElementById('insumo-precio-compra').value = insumo.precio_compra || 0;
        document.getElementById('insumo-costo-unitario').value = insumo.costo_unitario || 0;
        document.getElementById('insumo-graduacion').value = insumo.graduacion_alcohol_base || 0;
        document.getElementById('insumo-rendimiento').value = insumo.rendimiento_neto_porcentaje ? insumo.rendimiento_neto_porcentaje * 100 : 100;
        
        const checkArtesanal = document.getElementById('insumo-es-artesanal');
        if (checkArtesanal) checkArtesanal.checked = !!insumo.es_artesanal;

        window.calcularCostoUnitarioAutomatico();
    } else {
        titulo.textContent = "Nuevo Insumo";
        document.getElementById('insumo-id').value = '';
        document.getElementById('form-insumo').reset();
        document.getElementById('insumo-rendimiento').value = 100;
        document.getElementById('insumo-formato-envase').value = 1;
        const checkArtesanal = document.getElementById('insumo-es-artesanal');
        if (checkArtesanal) checkArtesanal.checked = false;
        window.calcularCostoUnitarioAutomatico();
    }
}

window.cerrarModalInsumo = function() {
    document.getElementById('modal-insumo').classList.add('hidden');
}

async function generarSlugUnico(nombre, idActual = null) {
    let slugBase = nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, '-');

    if (!slugBase) slugBase = 'insumo';

    let slugFinal = slugBase;
    let contador = 1;

    while (true) {
        let urlCheck = `${SUPABASE_URL}/rest/v1/insumos?slug=eq.${slugFinal}&select=id`;
        if (idActual) {
            urlCheck += `&id=neq.${idActual}`;
        }

        try {
            const res = await fetch(urlCheck, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            const existing = await res.json();
            if (!existing || existing.length === 0) break;
            slugFinal = `${slugBase}-${contador}`;
            contador++;
        } catch (e) {
            break;
        }
    }
    return slugFinal;
}

async function guardarInsumo(e) {
    e.preventDefault();
    const idInput = document.getElementById('insumo-id').value;
    const esEdicion = idInput !== '';

    const nombreInsumo = document.getElementById('insumo-nombre').value;
    const slugUnico = await generarSlugUnico(nombreInsumo, esEdicion ? idInput : null);

    const precioCompra = parseFloat(document.getElementById('insumo-precio-compra').value) || 0;
    const formatoEnvase = parseFloat(document.getElementById('insumo-formato-envase').value) || 1;
    const rendimiento = (parseFloat(document.getElementById('insumo-rendimiento').value) || 100) / 100;
    const costoUnitarioCalculado = (precioCompra / formatoEnvase) / (rendimiento > 0 ? rendimiento : 1);

    const insumoPayload = {
        nombre: nombreInsumo,
        slug: slugUnico,
        tipo_id: parseInt(document.getElementById('insumo-tipo-id').value) || null,
        unidad_medida: document.getElementById('insumo-unidad').value,
        formato_envase: formatoEnvase,
        precio_compra: precioCompra,
        costo_unitario: costoUnitarioCalculado,
        graduacion_alcohol_base: parseFloat(document.getElementById('insumo-graduacion').value) || 0.00,
        rendimiento_neto_porcentaje: rendimiento,
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

        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Error al guardar: ${errorBody}`);
        }

        const dataGuardada = await res.json();
        const insumoIdReal = esEdicion ? idInput : dataGuardada[0].id;

        // Registrar en histórico de precios si cambió el costo
        if (!esEdicion || costoAnterior !== costoUnitarioCalculado) {
            await fetch(`${SUPABASE_URL}/rest/v1/insumo_precios_historicos`, {
                method: 'POST',
                headers: { 
                    'apikey': SUPABASE_ANON_KEY, 
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    insumo_id: insumoIdReal,
                    precio: costoUnitarioCalculado,
                    fecha_vigencia: new Date().toISOString()
                })
            });
        }

        window.cerrarModalInsumo();
        await initInsumos();
    } catch (err) {
        console.error("Error al procesar insumo:", err);
        alert("Ocurrió un error al guardar el insumo en Supabase. Revisa la consola.");
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