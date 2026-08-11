// Módulo de Catálogos y Tablas Maestras (Con celdas multilínea y CRUD completo)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let tablaActualActiva = 'categorias';

export async function initCatalogos() {
    await renderizarModuloCatalogos();
}

async function renderizarModuloCatalogos() {
    const contenedor = document.getElementById('catalogos-container');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-4 border-b border-gray-800">
            <div class="flex flex-wrap gap-2" id="catalogos-tabs">
                <button data-tabla="categorias" class="tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-emerald-500 text-gray-950">Categorías</button>
                <button data-tabla="familias" class="tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-gray-800 text-gray-400 hover:text-white">Familias</button>
                <button data-tabla="soportes" class="tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-gray-800 text-gray-400 hover:text-white">Soportes</button>
                <button data-tabla="hielos" class="tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-gray-800 text-gray-400 hover:text-white">Hielos</button>
                <button data-tabla="tecnicas" class="tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-gray-800 text-gray-400 hover:text-white">Técnicas</button>
                <button data-tabla="tipos_insumos" class="tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-gray-800 text-gray-400 hover:text-white">Tipos Insumos</button>
                <button data-tabla="tipos_sub_recetas" class="tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-gray-800 text-gray-400 hover:text-white">Tipos Sub-recetas</button>
            </div>
            <button id="btn-nuevo-registro" class="bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg">
                <span>+ Nuevo Registro</span>
            </button>
        </div>
        <div id="catalogo-tabla-content" class="overflow-x-auto">
            <div class="text-center py-8 text-gray-500 font-mono text-xs animate-pulse">Cargando registros...</div>
        </div>
    `;

    const botones = contenedor.querySelectorAll('.tab-catalogo');
    botones.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            botones.forEach(b => {
                b.className = "tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-gray-800 text-gray-400 hover:text-white";
            });
            e.currentTarget.className = "tab-catalogo px-4 py-2 rounded-xl text-xs font-mono font-bold transition bg-emerald-500 text-gray-950";
            
            tablaActualActiva = e.currentTarget.getAttribute('data-tabla');
            await cargarDatosTabla(tablaActualActiva);
        });
    });

    document.getElementById('btn-nuevo-registro').addEventListener('click', () => {
        abrirModalRegistro(tablaActualActiva);
    });

    await cargarDatosTabla(tablaActualActiva);
}

async function cargarDatosTabla(nombreTabla) {
    const contenidoTabla = document.getElementById('catalogo-tabla-content');
    if (!contenidoTabla) return;

    contenidoTabla.innerHTML = `<div class="text-center py-8 text-gray-500 font-mono text-xs animate-pulse">Consultando ${nombreTabla}...</div>`;

    try {
        const { data, error } = await window.supabaseClient
            .from(nombreTabla)
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            contenidoTabla.innerHTML = `<div class="text-center py-8 text-gray-500 font-mono text-xs">No hay registros en esta tabla. Usa el botón "+ Nuevo Registro" para agregar uno.</div>`;
            return;
        }

        const columnas = Object.keys(data[0]);

        let html = `
            <table class="w-full text-left border-collapse table-auto">
                <thead>
                    <tr class="border-b border-gray-800 text-gray-400 font-mono text-[10px] uppercase tracking-wider">
                        ${columnas.map(col => `<th class="py-3 px-4">${col}</th>`).join('')}
                        <th class="py-3 px-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800/60 text-sm text-gray-300 font-sans">
        `;

        data.forEach(row => {
            html += `<tr class="hover:bg-gray-800/40 transition">`;
            columnas.forEach(col => {
                let valor = row[col];
                if (typeof valor === 'boolean') {
                    valor = valor ? '<span class="text-emerald-400 font-mono text-xs font-bold">Sí</span>' : '<span class="text-gray-500 font-mono text-xs">No</span>';
                } else if (valor === null || valor === undefined) {
                    valor = '<span class="text-gray-600 italic">null</span>';
                } else {
                    // Convertir a string y aplicar clases multilínea para preservar proporciones
                    valor = `<div class="whitespace-normal break-words max-w-xs md:max-w-md">${valor}</div>`;
                }
                html += `<td class="py-3 px-4 align-top">${valor}</td>`;
            });
            
            // Botones de Editar y Eliminar por fila
            html += `
                <td class="py-3 px-4 text-right space-x-2 align-top whitespace-nowrap">
                    <button onclick="window.editarRegistro('${nombreTabla}', ${row.id}, '${encodeURIComponent(JSON.stringify(row))}')" class="text-xs font-mono bg-gray-800 hover:bg-gray-700 text-emerald-400 px-2.5 py-1 rounded-lg transition">Editar</button>
                    <button onclick="window.eliminarRegistro('${nombreTabla}', ${row.id})" class="text-xs font-mono bg-red-950/40 hover:bg-red-900/60 text-red-400 px-2.5 py-1 rounded-lg transition">Eliminar</button>
                </td>
            `;
            html += `</tr>`;
        });

        html += `
                </tbody>
            </table>
        `;

        contenidoTabla.innerHTML = html;

    } catch (e) {
        console.error(`Error cargando la tabla ${nombreTabla}:`, e);
        contenidoTabla.innerHTML = `<div class="text-red-400 p-4 font-mono text-xs bg-red-950/20 border border-red-900 rounded">Error al cargar los datos: ${e.message}</div>`;
    }
}

window.eliminarRegistro = async (nombreTabla, id) => {
    if (!confirm(`¿Estás seguro de eliminar el registro #${id} de ${nombreTabla}?`)) return;

    try {
        const { error } = await window.supabaseClient
            .from(nombreTabla)
            .delete()
            .eq('id', id);

        if (error) throw error;
        await cargarDatosTabla(nombreTabla);
    } catch (e) {
        alert(`Error al eliminar: ${e.message}`);
    }
};

window.editarRegistro = (nombreTabla, id, rowJsonStr) => {
    const rowData = JSON.parse(decodeURIComponent(rowJsonStr));
    abrirModalRegistro(nombreTabla, rowData);
};

function abrirModalRegistro(nombreTabla, datosExistentes = null) {
    const esEdicion = datosExistentes !== null;
    const camposPermitidos = Object.keys(datosExistentes || { nombre: '', descripcion: '' }).filter(k => k !== 'id' && k !== 'created_at');

    const modalExistente = document.getElementById('modal-catalogo');
    if (modalExistente) modalExistente.remove();

    const modalHTML = `
        <div id="modal-catalogo" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
                <div class="flex justify-between items-center border-b border-gray-800 pb-3">
                    <h3 class="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider">
                        ${esEdicion ? `Editar en ${nombreTabla} (ID: ${datosExistentes.id})` : `Nuevo registro en ${nombreTabla}`}
                    </h3>
                    <button id="cerrar-modal" class="text-gray-400 hover:text-white font-mono text-xs">✕</button>
                </div>
                <form id="form-catalogo" class="space-y-4">
                    ${camposPermitidos.map(campo => {
                        const valorActual = datosExistentes ? (datosExistentes[campo] ?? '') : '';
                        const esTextoLargo = campo.includes('descripcion') || campo.includes('observaciones') || campo.includes('resena') || campo.includes('formula');
                        
                        return `
                            <div class="space-y-1">
                                <label class="text-[10px] uppercase font-mono font-bold text-gray-400 block">${campo}</label>
                                ${esTextoLargo ? `
                                    <textarea name="${campo}" rows="3"
                                        class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans resize-y">${valorActual}</textarea>
                                ` : `
                                    <input type="text" name="${campo}" value="${valorActual}"
                                        class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans">
                                `}
                            </div>
                        `;
                    }).join('')}
                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" id="btn-cancelar" class="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-xs font-mono transition">Cancelar</button>
                        <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-4 py-2 rounded-xl text-xs font-mono font-bold transition">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('cerrar-modal').onclick = () => document.getElementById('modal-catalogo').remove();
    document.getElementById('btn-cancelar').onclick = () => document.getElementById('modal-catalogo').remove();

    document.getElementById('form-catalogo').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {};
        formData.forEach((val, key) => { payload[key] = val; });

        try {
            let error;
            if (esEdicion) {
                const { error: err } = await window.supabaseClient
                    .from(nombreTabla)
                    .update(payload)
                    .eq('id', datosExistentes.id);
                error = err;
            } else {
                const { error: err } = await window.supabaseClient
                    .from(nombreTabla)
                    .insert([payload]);
                error = err;
            }

            if (error) throw error;

            document.getElementById('modal-catalogo').remove();
            await cargarDatosTabla(nombreTabla);
        } catch (err) {
            alert(`Error al guardar: ${err.message}`);
        }
    };
}

export default initCatalogos;