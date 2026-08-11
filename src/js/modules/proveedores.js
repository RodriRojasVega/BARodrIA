// Módulo de Proveedores y Asociación de Insumos (Supabase / Many-to-Many)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let listaProveedoresLocal = [];
let listaInsumosGlobal = [];
let insumosAsociadosActuales = new Set();

export async function inicializarModuloProveedores() {
    await window.cargarInsumosGlobales();
    await window.cargarDatosProveedores();
    window.cambiarVistaProveedores('listado');
}

window.cambiarVistaProveedores = function(vista) {
    document.getElementById('vista-proveedores-listado').classList.add('hidden');
    document.getElementById('vista-proveedores-detalle').classList.add('hidden');
    document.getElementById('vista-proveedores-formulario').classList.add('hidden');

    if (vista === 'listado') {
        document.getElementById('vista-proveedores-listado').classList.remove('hidden');
        window.renderizarTarjetasProveedores(listaProveedoresLocal);
    } else if (vista === 'detalle') {
        document.getElementById('vista-proveedores-detalle').classList.remove('hidden');
    } else if (vista === 'formulario') {
        document.getElementById('vista-proveedores-formulario').classList.remove('hidden');
    }
}

window.cargarInsumosGlobales = async function() {
    try {
        if (!window.supabaseClient) return;
        const { data, error } = await window.supabaseClient
            .from('insumos')
            .select('id, nombre, unidad_medida')
            .order('nombre', { ascending: true });

        if (error) throw error;
        listaInsumosGlobal = data || [];
    } catch (e) {
        console.error("Error al cargar insumos globales:", e);
        listaInsumosGlobal = [];
    }
}

window.cargarDatosProveedores = async function() {
    try {
        if (!window.supabaseClient) {
            console.error("Cliente de Supabase no disponible.");
            return;
        }

        const { data: proveedores, error: errProv } = await window.supabaseClient
            .from('proveedores')
            .select('*')
            .order('nombre', { ascending: true });

        if (errProv) throw errProv;

        const { data: relaciones, error: errRel } = await window.supabaseClient
            .from('insumo_proveedores')
            .select('proveedor_id, insumo_id');

        if (errRel) {
            console.warn("Aviso al consultar insumo_proveedores:", errRel);
        }

        listaProveedoresLocal = (proveedores || []).map(p => {
            const insumosIds = (relaciones || [])
                .filter(r => r.proveedor_id === p.id)
                .map(r => r.insumo_id);
            
            return {
                ...p,
                insumos: insumosIds,
                insumos_count: insumosIds.length
            };
        });

    } catch (e) {
        console.error("Error crítico al cargar proveedores desde Supabase:", e);
        listaProveedoresLocal = [];
    }
}

window.renderizarTarjetasProveedores = function(proveedores) {
    const contenedor = document.getElementById('contenedor-tarjetas-proveedores');
    if (!contenedor) return;

    if (proveedores.length === 0) {
        contenedor.innerHTML = `<div class="text-center py-12 text-gray-500 font-mono col-span-full">No hay proveedores registrados.</div>`;
        return;
    }

    contenedor.innerHTML = proveedores.map(p => `
        <div onclick="window.verDetalleProveedor(${p.id})" class="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/50 cursor-pointer transition group">
            <div class="space-y-2">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-white text-base group-hover:text-emerald-400 transition">${p.nombre}</h3>
                    <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono border border-emerald-500/20">${p.insumos_count || 0} insumos</span>
                </div>
                <div class="text-xs text-gray-400 space-y-1">
                    <p>👤 <strong>Contacto:</strong> ${p.contacto || 'No especificado'}</p>
                    <p>📞 <strong>Teléfono:</strong> ${p.telefono || 'No especificado'}</p>
                    <p>✉️ <strong>Email:</strong> ${p.email || 'No especificado'}</p>
                </div>
            </div>
            <div class="text-[11px] text-emerald-500/80 font-semibold pt-2 border-t border-gray-800 flex items-center justify-between">
                <span>Ver detalles e insumos</span>
                <span class="group-hover:translate-x-1 transition">→</span>
            </div>
        </div>
    `).join('');
}

window.prepararCreacionProveedor = function() {
    document.getElementById('form-proveedor-titulo').innerText = "Nuevo Proveedor";
    document.getElementById('form-proveedor-completo').reset();
    document.getElementById('input-proveedor-id').value = '';
    insumosAsociadosActuales.clear();
    window.renderizarCheckboxesInsumos();
    window.cambiarVistaProveedores('formulario');
}

window.prepararEdicionProveedor = async function(id) {
    const prov = listaProveedoresLocal.find(p => p.id == id);
    if (!prov) return;

    document.getElementById('form-proveedor-titulo').innerText = "Editar Proveedor: " + prov.nombre;
    document.getElementById('input-proveedor-id').value = prov.id;
    document.getElementById('prov-nombre').value = prov.nombre || '';
    document.getElementById('prov-contacto').value = prov.contacto || '';
    document.getElementById('prov-telefono').value = prov.telefono || '';
    document.getElementById('prov-email').value = prov.email || '';
    document.getElementById('prov-observaciones').value = prov.observaciones || '';

    insumosAsociadosActuales.clear();
    if (prov.insumos && Array.isArray(prov.insumos)) {
        prov.insumos.forEach(iId => insumosAsociadosActuales.add(iId));
    }

    window.renderizarCheckboxesInsumos();
    window.cambiarVistaProveedores('formulario');
}

window.renderizarCheckboxesInsumos = function(filtro = '') {
    const contenedor = document.getElementById('contenedor-checkboxes-insumos');
    if (!contenedor) return;

    const filtrados = listaInsumosGlobal.filter(i => i.nombre.toLowerCase().includes(filtro.toLowerCase()));

    if (filtrados.length === 0) {
        contenedor.innerHTML = `<div class="text-xs text-gray-500 text-center py-2">No se encontraron insumos.</div>`;
        return;
    }

    contenedor.innerHTML = filtrados.map(i => {
        const isChecked = insumosAsociadosActuales.has(i.id) ? 'checked' : '';
        return `
            <label class="flex items-center justify-between p-2 rounded-xl hover:bg-gray-900 cursor-pointer transition border border-transparent hover:border-gray-800">
                <div class="flex items-center gap-3">
                    <input type="checkbox" value="${i.id}" ${isChecked} onchange="window.toggleInsumoAsociacion(${i.id}, this.checked)" class="w-4 h-4 rounded bg-gray-850 border-gray-700 text-emerald-600 focus:ring-emerald-500">
                    <span class="text-xs text-white font-medium">${i.nombre}</span>
                </div>
                <span class="text-[10px] font-mono text-gray-400 bg-gray-850 px-2 py-0.5 rounded">${i.unidad_medida || 'unit'}</span>
            </label>
        `;
    }).join('');
}

window.toggleInsumoAsociacion = function(insumoId, isChecked) {
    if (isChecked) {
        insumosAsociadosActuales.add(insumoId);
    } else {
        insumosAsociadosActuales.delete(insumoId);
    }
}

window.filtrarInsumosAsociacion = function(texto) {
    window.renderizarCheckboxesInsumos(texto);
}

window.guardarProveedor = async function(e) {
    e.preventDefault();
    if (!window.supabaseClient) return;

    const id = document.getElementById('input-proveedor-id').value;
    const payload = {
        nombre: document.getElementById('prov-nombre').value,
        contacto: document.getElementById('prov-contacto').value,
        telefono: document.getElementById('prov-telefono').value,
        email: document.getElementById('prov-email').value,
        observaciones: document.getElementById('prov-observaciones').value
    };

    try {
        let proveedorId = id;
        const esEdicion = id !== '';

        const urlCabecera = esEdicion ? 
            `${SUPABASE_URL}/rest/v1/proveedores?id=eq.${id}` : 
            `${SUPABASE_URL}/rest/v1/proveedores`;

        const resCabecera = await fetch(urlCabecera, {
            method: esEdicion ? 'PATCH' : 'POST',
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
        });

        if (!resCabecera.ok) throw new Error(await resCabecera.text());

        const dataCabecera = await resCabecera.json();
        if (!esEdicion && dataCabecera.length > 0) {
            proveedorId = dataCabecera[0].id;
        }

        if (esEdicion) {
            await fetch(`${SUPABASE_URL}/rest/v1/insumo_proveedores?proveedor_id=eq.${proveedorId}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
        }

        if (insumosAsociadosActuales.size > 0) {
            const nuevasRelaciones = Array.from(insumosAsociadosActuales).map(insumoId => ({
                proveedor_id: parseInt(proveedorId),
                insumo_id: parseInt(insumoId)
            }));

            await fetch(`${SUPABASE_URL}/rest/v1/insumo_proveedores`, {
                method: 'POST',
                headers: { 
                    'apikey': SUPABASE_ANON_KEY, 
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(nuevasRelaciones)
            });
        }

        await window.inicializarModuloProveedores();
    } catch (err) {
        console.error("Error crítico guardando proveedor:", err);
        alert("Ocurrió un error al guardar el proveedor. Revisa la consola.");
    }
}

window.eliminarProveedor = async function(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        if (!window.supabaseClient) return;

        const { error } = await window.supabaseClient
            .from('proveedores')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await window.inicializarModuloProveedores();
        window.cambiarVistaProveedores('listado');
    } catch (err) {
        console.error("Error al eliminar el proveedor:", err);
        alert("Ocurrió un error al intentar eliminar el proveedor.");
    }
}

window.verDetalleProveedor = function(id) {
    const prov = listaProveedoresLocal.find(p => p.id == id);
    if (!prov) return;

    document.getElementById('detalle-proveedor-acciones').innerHTML = `
        <button type="button" onclick="window.eliminarProveedor(${prov.id})" class="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition border border-red-900/50">Eliminar</button>
        <button type="button" onclick="window.prepararEdicionProveedor(${prov.id})" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow">Editar</button>
    `;

    const insumosDelProveedor = listaInsumosGlobal.filter(i => prov.insumos && prov.insumos.includes(i.id));

    document.getElementById('panel-proveedor-contenido').innerHTML = `
        <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div>
                <h2 class="text-xl font-bold text-white">${prov.nombre}</h2>
                <p class="text-xs text-gray-400 mt-1">${prov.observaciones || 'Sin observaciones registradas.'}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div class="bg-gray-850 p-3 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Contacto</span>
                    <span class="text-xs text-white font-medium">${prov.contacto || 'N/A'}</span>
                </div>
                <div class="bg-gray-850 p-3 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Teléfono</span>
                    <span class="text-xs text-white font-medium">${prov.telefono || 'N/A'}</span>
                </div>
                <div class="bg-gray-850 p-3 rounded-xl border border-gray-800">
                    <span class="text-[10px] uppercase font-bold text-gray-400 block">Email</span>
                    <span class="text-xs text-white font-medium">${prov.email || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="space-y-3">
            <h3 class="text-sm font-bold text-emerald-400 uppercase tracking-wider">Insumos Suministrados (${insumosDelProveedor.length})</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${insumosDelProveedor.length > 0 ? insumosDelProveedor.map(i => `
                    <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                        <span class="text-xs text-white font-semibold">${i.nombre}</span>
                        <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">${i.unidad_medida}</span>
                    </div>
                `).join('') : `<div class="text-xs text-gray-500 col-span-full py-4">Este proveedor no tiene insumos asociados actualmente.</div>`}
            </div>
        </div>
    `;

    window.cambiarVistaProveedores('detalle');
}

window.filtrarProveedores = function() {
    const texto = document.getElementById('buscador-proveedores').value.toLowerCase();
    const filtrados = listaProveedoresLocal.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(texto)) || 
        (p.contacto && p.contacto.toLowerCase().includes(texto)) || 
        (p.email && p.email.toLowerCase().includes(texto))
    );
    window.renderizarTarjetasProveedores(filtrados);
}

window.inicializarModuloProveedores = inicializarModuloProveedores;
window.prepararCreacionProveedor = prepararCreacionProveedor;
window.prepararEdicionProveedor = prepararEdicionProveedor;
window.cambiarVistaProveedores = cambiarVistaProveedores;
window.guardarProveedor = guardarProveedor;
window.eliminarProveedor = eliminarProveedor;
window.verDetalleProveedor = verDetalleProveedor;
window.filtrarProveedores = filtrarProveedores;
window.toggleInsumoAsociacion = toggleInsumoAsociacion;
window.filtrarInsumosAsociacion = filtrarInsumosAsociacion;

export default inicializarModuloProveedores;