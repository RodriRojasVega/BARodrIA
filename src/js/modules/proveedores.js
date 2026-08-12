// src/modules/proveedores.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabase = window.supabaseClient;

// --- ÚNICA FUENTE DE VERDAD ---
let state = {
    proveedores: [],
    insumosGlobales: [],
    provActivo: null,
    historicoProvActual: [],
    insumosTempo: [], // Array de { insumo_id, precio_oferta } para el form dual
    tableParams: { search: '', page: 1, limit: 25, sortCol: 'nombre', sortAsc: true },
    filterInsumoDisp: ''
};

export async function initProveedores() {
    console.log("Inicializando Módulo Escalable: Proveedores");

    const dom = {
        vistas: {
            listado: document.getElementById('proveedores-listado'),
            detalle: document.getElementById('proveedores-detalle'),
            formulario: document.getElementById('proveedores-formulario')
        },
        tabla: {
            body: document.getElementById('tabla-prov-body'),
            buscador: document.getElementById('buscador-prov'),
            limite: document.getElementById('paginado-limite-prov'),
            infoPagi: document.getElementById('info-paginacion-prov'),
            btnPrev: document.getElementById('btn-pagi-prev-prov'),
            btnNext: document.getElementById('btn-pagi-next-prov'),
            numPagi: document.getElementById('num-pagina-actual-prov'),
            thNombre: document.getElementById('th-nombre-prov')
        },
        detalle: {
            nombre: document.getElementById('det-prov-nombre'),
            contacto: document.getElementById('det-prov-contacto'),
            telefono: document.getElementById('det-prov-telefono'),
            email: document.getElementById('det-prov-email'),
            tablaCatalogo: document.getElementById('det-tabla-catalogo-body'),
            tablaHistorico: document.getElementById('det-tabla-hist-prov-body')
        },
        form: {
            elemento: document.getElementById('form-prov'),
            id: document.getElementById('prov-id'),
            nombre: document.getElementById('prov-nombre'),
            contacto: document.getElementById('prov-contacto'),
            telefono: document.getElementById('prov-telefono'),
            email: document.getElementById('prov-email'),
            obs: document.getElementById('prov-obs'),
            titulo: document.getElementById('titulo-form-prov'),
            listaDisp: document.getElementById('lista-insumos-prov-disp'),
            listaAsig: document.getElementById('lista-insumos-prov-asig'),
            contAsig: document.getElementById('contador-insumos-prov-asig'),
            buscarDisp: document.getElementById('buscar-insumo-prov-disp')
        },
        botones: {
            nuevo: document.getElementById('btn-nuevo-prov'),
            volver: document.getElementById('btn-volver-listado-prov'),
            editar: document.getElementById('btn-editar-prov-act'),
            eliminar: document.getElementById('btn-eliminar-prov-act'),
            cancelarTop: document.getElementById('btn-cancelar-form-prov-top'),
            cancelarMid: document.getElementById('btn-cancelar-form-prov'),
            cancelarBot: document.getElementById('btn-cancelar-form-prov-bot')
        }
    };

    const cambiarVista = (target) => {
        Object.values(dom.vistas).forEach(v => v.classList.add('hidden'));
        dom.vistas[target].classList.remove('hidden');
    };

    const cargarMaestros = async () => {
        try {
            const [pData, iData, relData] = await Promise.all([
                supabase.from('proveedores').select('*').order('nombre'),
                supabase.from('insumos').select('id, nombre, unidad_medida, formato_envase, precio_compra, es_artesanal').order('nombre'),
                supabase.from('insumo_proveedores').select('*')
            ]);

            state.insumosGlobales = (iData.data || []).filter(i => !i.es_artesanal); // No mostramos artesanales a proveedores externos
            
            // Unimos los proveedores con sus insumos asignados
            state.proveedores = (pData.data || []).map(prov => {
                const misInsumos = (relData.data || []).filter(r => r.proveedor_id === prov.id);
                return { ...prov, insumos: misInsumos };
            });

            renderizarTablaPrincipal();
        } catch (error) {
            console.error("Error al cargar maestros:", error);
        }
    };

    // --- 1. TABLA PRINCIPAL ---
    const renderizarTablaPrincipal = () => {
        const { search, page, limit, sortCol, sortAsc } = state.tableParams;
        let filtrados = state.proveedores.filter(p => {
            const n = p.nombre ? p.nombre.toLowerCase() : '';
            const c = p.contacto ? p.contacto.toLowerCase() : '';
            const e = p.email ? p.email.toLowerCase() : '';
            return n.includes(search) || c.includes(search) || e.includes(search);
        });

        filtrados.sort((a, b) => {
            let valA = a[sortCol] || ''; let valB = b[sortCol] || '';
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
            return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });

        const total = filtrados.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * limit;
        const paginados = filtrados.slice(start, start + limit);

        dom.tabla.body.innerHTML = '';
        if (paginados.length === 0) {
            dom.tabla.body.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500 mono-font">No se encontraron proveedores.</td></tr>`;
        } else {
            paginados.forEach(p => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-800/40 cursor-pointer transition border-b border-gray-800/60';
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-white group-hover:text-emerald-400">${p.nombre}</td>
                    <td class="py-3 px-4 text-xs text-gray-300">${p.contacto || '-'}</td>
                    <td class="py-3 px-4 text-xs font-mono text-gray-400">${p.telefono || '-'}</td>
                    <td class="py-3 px-4 text-center text-xs font-mono text-emerald-400 font-bold">${p.insumos.length} insumos</td>
                    <td class="py-3 px-4 text-center"><button class="text-xs bg-gray-800 hover:bg-emerald-950 text-gray-300 px-2.5 py-1 rounded border border-gray-700 transition">Ver</button></td>
                `;
                tr.addEventListener('click', () => abrirDetalle(p));
                dom.tabla.body.appendChild(tr);
            });
        }
        dom.tabla.infoPagi.textContent = `Mostrando ${total === 0 ? 0 : start + 1} - ${Math.min(start + limit, total)} de ${total}`;
        dom.tabla.numPagi.textContent = `Pág ${currentPage} de ${totalPages}`;
        dom.tabla.btnPrev.disabled = currentPage === 1;
        dom.tabla.btnNext.disabled = currentPage === totalPages;
    };

    // --- 2. DETALLE ---
    const abrirDetalle = async (prov) => {
        state.provActivo = prov;
        dom.detalle.nombre.textContent = prov.nombre;
        dom.detalle.contacto.innerHTML = `👤 ${prov.contacto || 'Sin definir'}`;
        dom.detalle.telefono.innerHTML = `📱 ${prov.telefono || 'Sin definir'}`;
        dom.detalle.email.innerHTML = `✉️ ${prov.email || 'Sin definir'}`;

        // Llenar Catálogo
        dom.detalle.tablaCatalogo.innerHTML = '';
        if (prov.insumos.length === 0) {
            dom.detalle.tablaCatalogo.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500 font-mono text-xs">Sin insumos asignados.</td></tr>`;
        } else {
            prov.insumos.forEach(rel => {
                const ins = state.insumosGlobales.find(i => i.id === rel.insumo_id);
                if (!ins) return;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="py-2 font-medium text-gray-200 text-xs">${ins.nombre}</td>
                    <td class="py-2 text-center text-xs text-gray-400 font-mono">${ins.formato_envase} ${ins.unidad_medida}</td>
                    <td class="py-2 text-right font-mono text-emerald-400 font-bold text-xs">$${window.formatearMonedaLocal(rel.precio_oferta, 0)}</td>
                `;
                dom.detalle.tablaCatalogo.appendChild(tr);
            });
        }

        // Llenar Histórico de este proveedor
        const { data: hist } = await supabase.from('insumo_precios_historicos').select('*').eq('proveedor_id', prov.id).order('created_at', { ascending: false });
        dom.detalle.tablaHistorico.innerHTML = '';
        if (!hist || hist.length === 0) {
            dom.detalle.tablaHistorico.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500 font-mono text-xs">Sin cambios registrados.</td></tr>`;
        } else {
            hist.forEach(h => {
                const ins = state.insumosGlobales.find(i => i.id === h.insumo_id);
                const fecha = new Date(h.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="py-2 text-gray-400 text-xs">${fecha}</td>
                    <td class="py-2 text-gray-200 text-xs">${ins ? ins.nombre : 'Insumo Eliminado'}</td>
                    <td class="py-2 text-right font-mono text-pink-400 text-xs">$${window.formatearMonedaLocal(h.precio_compra, 0)}</td>
                `;
                dom.detalle.tablaHistorico.appendChild(tr);
            });
        }
        cambiarVista('detalle');
    };

    // --- 3. FORMULARIO Y SELECTOR DUAL ---
    const abrirFormulario = (editando = false) => {
        if (editando && state.provActivo) {
            const p = state.provActivo;
            dom.form.titulo.textContent = "Editar Proveedor";
            dom.form.id.value = p.id;
            dom.form.nombre.value = p.nombre;
            dom.form.contacto.value = p.contacto || '';
            dom.form.telefono.value = p.telefono || '';
            dom.form.email.value = p.email || '';
            dom.form.obs.value = p.observaciones || '';
            
            // Clonamos los insumos asociados al array temporal
            state.insumosTempo = p.insumos.map(r => ({ insumo_id: r.insumo_id, precio_oferta: r.precio_oferta || 0 }));
        } else {
            dom.form.titulo.textContent = "Nuevo Proveedor";
            dom.form.elemento.reset();
            dom.form.id.value = '';
            state.insumosTempo = [];
        }
        renderizarDualInsumos();
        cambiarVista('formulario');
    };

    const renderizarDualInsumos = () => {
        const query = state.filterInsumoDisp;
        const seleccionadosIds = state.insumosTempo.map(i => i.insumo_id);

        const disponibles = state.insumosGlobales.filter(ins => !seleccionadosIds.includes(ins.id) && ins.nombre.toLowerCase().includes(query));

        dom.form.listaDisp.innerHTML = '';
        if (disponibles.length === 0) dom.form.listaDisp.innerHTML = `<div class="text-xs text-gray-600 text-center py-4">No hay resultados.</div>`;
        
        disponibles.forEach(ins => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800 hover:border-emerald-500/30 transition';
            div.innerHTML = `
                <div><p class="text-xs text-gray-200 font-medium">${ins.nombre}</p><p class="text-[10px] text-gray-500 font-mono">Ref: $${window.formatearMonedaLocal(ins.precio_compra, 0)}</p></div>
                <button type="button" class="btn-add text-emerald-500 hover:text-white bg-emerald-950/40 px-2 py-1 rounded font-bold">+</button>`;
            div.querySelector('.btn-add').addEventListener('click', () => {
                state.insumosTempo.push({ insumo_id: ins.id, precio_oferta: ins.precio_compra }); // Por defecto el precio global
                renderizarDualInsumos();
            });
            dom.form.listaDisp.appendChild(div);
        });

        dom.form.contAsig.textContent = state.insumosTempo.length;
        dom.form.listaAsig.innerHTML = '';
        if (state.insumosTempo.length === 0) dom.form.listaAsig.innerHTML = `<div class="text-xs text-gray-600 text-center py-10">Sin insumos distribuidos.</div>`;
        
        state.insumosTempo.forEach((item, index) => {
            const ins = state.insumosGlobales.find(x => x.id === item.insumo_id);
            if (!ins) return;
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between gap-2 bg-emerald-950/20 p-2 rounded border border-emerald-900/30';
            div.innerHTML = `
                <div class="flex-1 min-w-0"><p class="text-xs text-emerald-400 font-bold truncate">${ins.nombre}</p></div>
                <div class="flex items-center gap-1 shrink-0">
                    <span class="text-[10px] text-gray-400 font-mono">$</span>
                    <input type="number" step="1" value="${item.precio_oferta}" class="inp-precio w-20 bg-gray-900 border border-gray-800 text-right rounded px-1.5 py-1 text-xs text-white font-mono outline-none">
                </div>
                <button type="button" class="btn-del text-red-400 hover:bg-red-950 px-1.5 py-0.5 rounded font-bold">✕</button>
            `;
            div.querySelector('.inp-precio').addEventListener('input', (e) => item.precio_oferta = parseFloat(e.target.value) || 0);
            div.querySelector('.btn-del').addEventListener('click', () => { state.insumosTempo.splice(index, 1); renderizarDualInsumos(); });
            dom.form.listaAsig.appendChild(div);
        });
    };

    // --- 4. GUARDAR ---
    dom.form.elemento.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idProv = dom.form.id.value;
        const payload = {
            nombre: dom.form.nombre.value.trim(),
            contacto: dom.form.contacto.value.trim(),
            telefono: dom.form.telefono.value.trim(),
            email: dom.form.email.value.trim(),
            observaciones: dom.form.obs.value.trim()
        };

        try {
            let provIdReal;
            if (idProv) {
                const { data, error } = await supabase.from('proveedores').update(payload).eq('id', idProv).select().single();
                if (error) throw error; provIdReal = data.id;
            } else {
                const { data, error } = await supabase.from('proveedores').insert([payload]).select().single();
                if (error) throw error; provIdReal = data.id;
            }

            // 1. Obtener relaciones antiguas para saber si cambió el precio (para el histórico)
            const { data: relsAnteriores } = await supabase.from('insumo_proveedores').select('*').eq('proveedor_id', provIdReal);
            const mapaViejos = new Map((relsAnteriores || []).map(r => [r.insumo_id, r.precio_oferta]));

            // 2. Limpiar e Insertar nuevo catálogo de ofertas
            await supabase.from('insumo_proveedores').delete().eq('proveedor_id', provIdReal);
            if (state.insumosTempo.length > 0) {
                const arrInsert = state.insumosTempo.map(i => ({ proveedor_id: provIdReal, insumo_id: i.insumo_id, precio_oferta: i.precio_oferta }));
                await supabase.from('insumo_proveedores').insert(arrInsert);
            }

            // 3. Auditoría de Histórico
            let registrosHist = [];
            state.insumosTempo.forEach(i => {
                const viejoPrecio = mapaViejos.get(i.insumo_id);
                if (viejoPrecio !== i.precio_oferta) {
                    const insObj = state.insumosGlobales.find(x => x.id === i.insumo_id);
                    const formato = insObj ? parseFloat(insObj.formato_envase) || 1 : 1;
                    const rend = insObj ? parseFloat(insObj.rendimiento_neto_porcentaje) || 1 : 1;
                    const nuevoCosto = (i.precio_oferta / formato) / rend;
                    
                    registrosHist.push({ insumo_id: i.insumo_id, proveedor_id: provIdReal, precio_compra: i.precio_oferta, costo_unitario: nuevoCosto });
                }
            });

            if (registrosHist.length > 0) {
                await supabase.from('insumo_precios_historicos').insert(registrosHist);
            }

            await cargarMaestros();
            cambiarVista('listado');
        } catch (error) {
            console.error("Error guardando proveedor:", error);
            alert("Error al guardar.");
        }
    });

    // --- 5. EVENTOS ---
    // Pestañas
    document.querySelectorAll('.tab-prov-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-prov-btn').forEach(b => { b.classList.remove('border-emerald-500', 'text-emerald-400'); b.classList.add('border-transparent', 'text-gray-400'); });
            document.querySelectorAll('.tab-prov-content').forEach(c => c.classList.add('hidden'));
            e.currentTarget.classList.add('border-emerald-500', 'text-emerald-400');
            if (e.currentTarget.id === 'tab-btn-catalogo') document.getElementById('tab-content-catalogo').classList.remove('hidden');
            if (e.currentTarget.id === 'tab-btn-hist-prov') document.getElementById('tab-content-hist-prov').classList.remove('hidden');
        });
    });

    dom.tabla.buscador.addEventListener('input', (e) => { state.tableParams.search = e.target.value.toLowerCase(); state.tableParams.page = 1; renderizarTablaPrincipal(); });
    dom.tabla.limite.addEventListener('change', (e) => { state.tableParams.limit = parseInt(e.target.value); state.tableParams.page = 1; renderizarTablaPrincipal(); });
    dom.tabla.btnPrev.addEventListener('click', () => { if (state.tableParams.page > 1) { state.tableParams.page--; renderizarTablaPrincipal(); } });
    dom.tabla.btnNext.addEventListener('click', () => { state.tableParams.page++; renderizarTablaPrincipal(); });
    dom.tabla.thNombre.addEventListener('click', () => { state.tableParams.sortAsc = !state.tableParams.sortAsc; renderizarTablaPrincipal(); });
    dom.form.buscarDisp.addEventListener('input', (e) => { state.filterInsumoDisp = e.target.value.toLowerCase(); renderizarDualInsumos(); });

    dom.botones.nuevo.addEventListener('click', () => abrirFormulario(false));
    dom.botones.volver.addEventListener('click', () => cambiarVista('listado'));
    dom.botones.editar.addEventListener('click', () => abrirFormulario(true));
    dom.botones.eliminar.addEventListener('click', async () => {
        if (confirm(`¿Eliminar proveedor "${state.provActivo.nombre}"?`)) {
            await supabase.from('proveedores').delete().eq('id', state.provActivo.id);
            await cargarMaestros();
            cambiarVista('listado');
        }
    });

    const cerrarForm = () => state.provActivo ? cambiarVista('detalle') : cambiarVista('listado');
    dom.botones.cancelarTop.addEventListener('click', cerrarForm);
    dom.botones.cancelarMid.addEventListener('click', cerrarForm);
    dom.botones.cancelarBot.addEventListener('click', cerrarForm);

    await cargarMaestros();
}