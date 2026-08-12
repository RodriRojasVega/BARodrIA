// src/modules/subrecetas.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabase = window.supabaseClient;

// --- ESTADO GLOBAL ---
let state = {
    subrecetas: [],
    insumosGlobales: [],
    tiposSubRecetas: [],
    todasRelacionesBOM: [], // Para calcular costos rápidos en grilla
    subActiva: null,
    ingredientesTempo: [], 
    pasosTempo: [],        
    tableParams: { search: '', page: 1, limit: 25, sortCol: 'nombre', sortAsc: true },
    filterInsumoDisp: ''
};

export async function initSubRecetas() {
    console.log("Inicializando Módulo Escalable: Sub-recetas");

    const dom = {
        vistas: {
            listado: document.getElementById('subrecetas-listado'),
            detalle: document.getElementById('subrecetas-detalle'),
            formulario: document.getElementById('subrecetas-formulario')
        },
        tabla: {
            body: document.getElementById('tabla-subrecetas-body'),
            buscador: document.getElementById('buscador-subrecetas'),
            limite: document.getElementById('paginado-limite-subrecetas'),
            infoPagi: document.getElementById('info-paginacion-subrecetas'),
            btnPrev: document.getElementById('btn-pagi-prev-sub'),
            btnNext: document.getElementById('btn-pagi-next-sub'),
            numPagi: document.getElementById('num-pagina-actual-sub'),
            thNombre: document.getElementById('th-nombre-sub')
        },
        detalle: {
            nombre: document.getElementById('det-sub-nombre'),
            badgeTipo: document.getElementById('det-sub-tipo-badge'),
            insumoEspejo: document.getElementById('det-sub-insumo-asociado'),
            kpiRendimiento: document.getElementById('det-kpi-rendimiento'),
            kpiCostoLote: document.getElementById('det-kpi-costo-lote'),
            kpiCostoUni: document.getElementById('det-kpi-costo-unitario'),
            tablaIngs: document.getElementById('det-tabla-sub-ingredientes-body'),
            pasos: document.getElementById('det-sub-pasos'),
            almacenaje: document.getElementById('det-sub-almacenamiento'),
            vidaUtil: document.getElementById('det-sub-vida-util'),
            mermas: document.getElementById('det-sub-mermas'),
            listaUso: document.getElementById('det-lista-cocteles-uso')
        },
        form: {
            elemento: document.getElementById('form-subreceta-completo'),
            id: document.getElementById('input-subreceta-id'),
            nombre: document.getElementById('input-nombre'),
            tipo: document.getElementById('input-tipo-id'),
            rendimiento: document.getElementById('input-rendimiento'),
            unidad: document.getElementById('input-unidad'),
            insumoAsc: document.getElementById('input-insumo-asociado'),
            almacenaje: document.getElementById('input-almacenamiento'),
            mermas: document.getElementById('input-mermas'),
            vidaUtil: document.getElementById('input-vidautil'),
            titulo: document.getElementById('titulo-form-sub'),
            listaDisp: document.getElementById('lista-insumos-sub-disp'),
            listaAsig: document.getElementById('lista-insumos-sub-asig'),
            contAsig: document.getElementById('contador-insumos-sub-asig'),
            buscarDisp: document.getElementById('buscar-insumos-sub-disp'),
            contPasos: document.getElementById('contenedor-pasos-sub-form'),
            btnAgregarPaso: document.getElementById('btn-agregar-paso-sub'),
            calcLote: document.getElementById('calc-sub-costo-lote'),
            calcUni: document.getElementById('calc-sub-costo-unitario')
        },
        botones: {
            nuevo: document.getElementById('btn-nueva-subreceta'),
            volver: document.getElementById('btn-volver-listado-subrecetas'),
            editar: document.getElementById('btn-editar-sub-act'),
            eliminar: document.getElementById('btn-eliminar-sub-act'),
            cancelarTop: document.getElementById('btn-cancelar-form-sub-top'),
            cancelarMid: document.getElementById('btn-cancelar-form-sub'),
            cancelarBot: document.getElementById('btn-cancelar-form-sub-bot')
        }
    };

    const cambiarVista = (target) => {
        Object.values(dom.vistas).forEach(v => v.classList.add('hidden'));
        dom.vistas[target].classList.remove('hidden');
    };

    const cargarMaestros = async () => {
        try {
            const [sData, iData, tData, bomData] = await Promise.all([
                supabase.from('sub_recetas_artesanales').select('*').order('nombre'),
                supabase.from('insumos').select('*').order('nombre'),
                supabase.from('tipos_sub_recetas').select('*'),
                supabase.from('sub_receta_ingredientes').select('*') // Extraemos todo para calcular rápido en grilla
            ]);

            state.subrecetas = sData.data || [];
            state.insumosGlobales = iData.data || [];
            state.tiposSubRecetas = tData.data || [];
            state.todasRelacionesBOM = bomData.data || [];

            poblarSelectores();
            renderizarTablaPrincipal();
        } catch (error) {
            console.error("Error al cargar maestros de sub-recetas:", error);
        }
    };

    const poblarSelectores = () => {
        dom.form.tipo.innerHTML = '<option value="">Seleccione tipo...</option>' + 
            state.tiposSubRecetas.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
        dom.form.insumoAsc.innerHTML = '<option value="">Vincular a insumo espejo...</option>' + 
            state.insumosGlobales.map(i => `<option value="${i.id}">${i.nombre} (${i.unidad_medida})</option>`).join('');
    };

    // Función Auxiliar para Costos
    const calcularCostoSubReceta = (subId, rendimiento) => {
        const ingredientes = state.todasRelacionesBOM.filter(i => i.sub_receta_id === subId);
        let costoLote = 0;
        ingredientes.forEach(ing => {
            const insumo = state.insumosGlobales.find(x => x.id === ing.insumo_id);
            if (insumo) costoLote += (parseFloat(ing.cantidad) * parseFloat(insumo.costo_unitario));
        });
        const costoUni = (rendimiento > 0) ? (costoLote / rendimiento) : 0;
        return { costoLote, costoUni };
    };

    // --- TABLA PRINCIPAL ---
    const renderizarTablaPrincipal = () => {
        const { search, page, limit, sortCol, sortAsc } = state.tableParams;

        let filtrados = state.subrecetas.filter(s => {
            const tipo = state.tiposSubRecetas.find(x => x.id === s.tipo_id)?.nombre || '';
            return s.nombre.toLowerCase().includes(search) || tipo.toLowerCase().includes(search);
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
            dom.tabla.body.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500 mono-font">No se encontraron preparaciones.</td></tr>`;
        } else {
            paginados.forEach(s => {
                const tipoObj = state.tiposSubRecetas.find(x => x.id === s.tipo_id);
                const costos = calcularCostoSubReceta(s.id, s.rendimiento_batch);
                
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-800/40 cursor-pointer transition border-b border-gray-800/60';
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-white group-hover:text-emerald-400">${s.nombre}</td>
                    <td class="py-3 px-4 text-xs font-mono text-purple-400 uppercase">${tipoObj ? tipoObj.nombre : '-'}</td>
                    <td class="py-3 px-4 text-right font-mono text-gray-300">${window.formatearMonedaLocal(s.rendimiento_batch, 1)} ${s.unidad_rendimiento}</td>
                    <td class="py-3 px-4 text-right font-mono text-pink-400">$${window.formatearMonedaLocal(costos.costoLote, 0)}</td>
                    <td class="py-3 px-4 text-right font-mono text-emerald-400 font-bold">$${window.formatearMonedaLocal(costos.costoUni, 4)}</td>
                    <td class="py-3 px-4 text-center">
                        <button class="text-xs bg-gray-800 hover:bg-emerald-950 hover:text-emerald-400 text-gray-300 px-2.5 py-1 rounded border border-gray-700 transition">Ver</button>
                    </td>
                `;
                tr.addEventListener('click', () => abrirDetalle(s));
                dom.tabla.body.appendChild(tr);
            });
        }

        dom.tabla.infoPagi.textContent = `Mostrando ${total === 0 ? 0 : start + 1} - ${Math.min(start + limit, total)} de ${total} sub-recetas`;
        dom.tabla.numPagi.textContent = `Pág ${currentPage} de ${totalPages}`;
        dom.tabla.btnPrev.disabled = currentPage === 1;
        dom.tabla.btnNext.disabled = currentPage === totalPages;
    };

    // --- VISTA DETALLE ---
    const abrirDetalle = async (sub) => {
        state.subActiva = sub;
        const tipoObj = state.tiposSubRecetas.find(x => x.id === sub.tipo_id);
        const insumoAsc = state.insumosGlobales.find(x => x.id === sub.insumo_asociado_id);
        const costos = calcularCostoSubReceta(sub.id, sub.rendimiento_batch);

        dom.detalle.nombre.textContent = sub.nombre;
        dom.detalle.badgeTipo.textContent = tipoObj ? tipoObj.nombre : 'S/T';
        dom.detalle.insumoEspejo.textContent = insumoAsc ? insumoAsc.nombre : 'No vinculado';

        // KPIs Formateados
        dom.detalle.kpiRendimiento.textContent = `${window.formatearMonedaLocal(sub.rendimiento_batch, 1)} ${sub.unidad_rendimiento}`;
        dom.detalle.kpiCostoLote.textContent = `$${window.formatearMonedaLocal(costos.costoLote, 0)}`;
        dom.detalle.kpiCostoUni.textContent = `$${window.formatearMonedaLocal(costos.costoUni, 4)}`;

        // Cargar Ingredientes
        const ingredientes = state.todasRelacionesBOM.filter(i => i.sub_receta_id === sub.id);
        dom.detalle.tablaIngs.innerHTML = '';
        ingredientes.forEach(ing => {
            const ins = state.insumosGlobales.find(x => x.id === ing.insumo_id);
            const costoParcial = (ins ? parseFloat(ins.costo_unitario) : 0) * parseFloat(ing.cantidad);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="py-2 font-medium text-gray-200">• ${ins ? ins.nombre : 'Insumo'}</td>
                <td class="py-2 text-right font-mono text-gray-400">${ing.cantidad} ${ing.unidad_medida}</td>
                <td class="py-2 text-right font-mono text-emerald-400">$${window.formatearMonedaLocal(costoParcial, 0)}</td>
            `;
            dom.detalle.tablaIngs.appendChild(tr);
        });

        // Cargar Pasos
        const { data: pasos } = await supabase.from('sub_receta_pasos_preparacion').select('*').eq('sub_receta_id', sub.id).order('numero_paso');
        dom.detalle.pasos.innerHTML = '';
        (pasos || []).forEach(p => {
            const div = document.createElement('div');
            div.className = "flex gap-3 text-xs text-gray-300 bg-gray-950 p-3 rounded-lg border border-gray-800";
            div.innerHTML = `<span class="font-mono font-bold text-purple-400">${p.numero_paso}.</span><p class="leading-relaxed">${p.descripcion}</p>`;
            dom.detalle.pasos.appendChild(div);
        });

        dom.detalle.almacenaje.textContent = sub.indicaciones_almacenamiento || 'Sin especificación.';
        dom.detalle.vidaUtil.textContent = sub.vida_util || 'N/A';
        dom.detalle.mermas.textContent = sub.control_mermas_economia_circular || 'Sin registro de manejo de mermas.';

        // Cargar Uso en Cócteles
        dom.detalle.listaUso.innerHTML = '<li class="text-center py-4 text-emerald-500 animate-pulse">Buscando dependencias...</li>';
        if (sub.insumo_asociado_id) {
            const { data: usos } = await supabase.from('coctel_ingredientes').select('cocteles(nombre)').eq('insumo_id', sub.insumo_asociado_id);
            if (usos && usos.length > 0) {
                const coctelesUnicos = [...new Set(usos.map(u => u.cocteles.nombre))];
                dom.detalle.listaUso.innerHTML = coctelesUnicos.map(cNombre => 
                    `<li class="bg-gray-800/40 p-2 rounded border border-gray-800 text-emerald-400 flex items-center gap-2"><span>🍸</span> ${cNombre}</li>`
                ).join('');
            } else {
                dom.detalle.listaUso.innerHTML = '<li class="text-gray-500 text-center py-4">No se utiliza en ningún cóctel actualmente.</li>';
            }
        } else {
            dom.detalle.listaUso.innerHTML = '<li class="text-gray-500 text-center py-4">Sin insumo espejo asociado.</li>';
        }

        cambiarVista('detalle');
    };

    // --- FORMULARIO Y SELECTOR DUAL ---
    const abrirFormulario = async (editando = false) => {
        if (editando && state.subActiva) {
            const s = state.subActiva;
            dom.form.titulo.textContent = "Editar Sub-receta";
            dom.form.id.value = s.id;
            dom.form.nombre.value = s.nombre;
            dom.form.tipo.value = s.tipo_id || '';
            dom.form.rendimiento.value = s.rendimiento_batch;
            dom.form.unidad.value = s.unidad_rendimiento;
            dom.form.insumoAsc.value = s.insumo_asociado_id || '';
            dom.form.almacenaje.value = s.indicaciones_almacenamiento || '';
            dom.form.mermas.value = s.control_mermas_economia_circular || '';
            dom.form.vidaUtil.value = s.vida_util || '';

            const ings = state.todasRelacionesBOM.filter(i => i.sub_receta_id === s.id);
            state.ingredientesTempo = ings.map(i => ({ insumo_id: i.insumo_id, cantidad: i.cantidad, unidad_medida: i.unidad_medida }));

            const { data: pasos } = await supabase.from('sub_receta_pasos_preparacion').select('*').eq('sub_receta_id', s.id).order('numero_paso');
            state.pasosTempo = (pasos || []).map(p => ({ descripcion: p.descripcion }));
        } else {
            dom.form.titulo.textContent = "Nueva Sub-receta";
            dom.form.elemento.reset();
            dom.form.id.value = '';
            state.ingredientesTempo = [];
            state.pasosTempo = [{descripcion: ''}]; // Un paso vacío por defecto
        }

        renderizarDualInsumos();
        renderizarPasosForm();
        recalcularCostosFormulario();
        cambiarVista('formulario');
    };

    const renderizarDualInsumos = () => {
        const query = state.filterInsumoDisp;
        const seleccionadosIds = state.ingredientesTempo.map(i => i.insumo_id);

        const disponibles = state.insumosGlobales.filter(ins => 
            !seleccionadosIds.includes(ins.id) && ins.nombre.toLowerCase().includes(query)
        );

        dom.form.listaDisp.innerHTML = '';
        if (disponibles.length === 0) dom.form.listaDisp.innerHTML = `<div class="text-xs text-gray-600 text-center py-4">No hay resultados.</div>`;
        disponibles.forEach(ins => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800 hover:border-emerald-500/30 transition';
            div.innerHTML = `
                <div><p class="text-xs text-gray-200 font-medium">${ins.nombre}</p><p class="text-[10px] text-gray-500 font-mono">$${ins.costo_unitario}/${ins.unidad_medida}</p></div>
                <button type="button" class="btn-add-ins text-emerald-500 hover:text-white bg-emerald-950/40 px-2 py-1 rounded text-xs font-bold">+</button>`;
            div.querySelector('.btn-add-ins').addEventListener('click', () => {
                state.ingredientesTempo.push({ insumo_id: ins.id, cantidad: 100, unidad_medida: ins.unidad_medida || 'g' });
                renderizarDualInsumos();
                recalcularCostosFormulario();
            });
            dom.form.listaDisp.appendChild(div);
        });

        dom.form.contAsig.textContent = state.ingredientesTempo.length;
        dom.form.listaAsig.innerHTML = '';
        if (state.ingredientesTempo.length === 0) dom.form.listaAsig.innerHTML = `<div class="text-xs text-gray-600 text-center py-10">Sin insumos asignados.</div>`;
        
        state.ingredientesTempo.forEach((item, index) => {
            const ins = state.insumosGlobales.find(x => x.id === item.insumo_id);
            if (!ins) return;
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between gap-2 bg-emerald-950/20 p-2 rounded border border-emerald-900/30';
            div.innerHTML = `
                <div class="flex-1 min-w-0"><p class="text-xs text-emerald-400 font-bold truncate">${ins.nombre}</p></div>
                <div class="flex items-center gap-1 w-36 shrink-0">
                    <input type="number" step="0.1" value="${item.cantidad}" class="inp-cant w-16 bg-gray-900 border border-gray-800 text-right rounded px-1.5 py-1 text-xs text-white font-mono outline-none">
                    <select class="sel-unit bg-gray-900 border border-gray-800 text-xs text-gray-300 rounded p-1 font-mono outline-none">
                        <option value="ml" ${item.unidad_medida === 'ml' ? 'selected' : ''}>ml</option>
                        <option value="g" ${item.unidad_medida === 'g' ? 'selected' : ''}>g</option>
                        <option value="unit" ${item.unidad_medida === 'unit' ? 'selected' : ''}>unit</option>
                    </select>
                </div>
                <button type="button" class="btn-del-ins text-red-400 hover:bg-red-950 px-1.5 py-0.5 rounded font-bold">✕</button>
            `;
            div.querySelector('.inp-cant').addEventListener('input', (e) => { item.cantidad = parseFloat(e.target.value) || 0; recalcularCostosFormulario(); });
            div.querySelector('.sel-unit').addEventListener('change', (e) => { item.unidad_medida = e.target.value; });
            div.querySelector('.btn-del-ins').addEventListener('click', () => { state.ingredientesTempo.splice(index, 1); renderizarDualInsumos(); recalcularCostosFormulario(); });
            dom.form.listaAsig.appendChild(div);
        });
    };

    const renderizarPasosForm = () => {
        dom.form.contPasos.innerHTML = '';
        state.pasosTempo.forEach((paso, index) => {
            const div = document.createElement('div');
            div.className = "flex items-center gap-2 bg-gray-950 p-2 rounded border border-gray-800 text-xs";
            div.innerHTML = `
                <span class="font-mono text-purple-400 font-bold w-6 text-center">${index + 1}.</span>
                <input type="text" class="inp-paso-desc flex-1 bg-gray-900 border border-gray-800 text-white rounded p-1.5 outline-none" placeholder="Acción..." value="${paso.descripcion}">
                <button type="button" class="btn-del-paso text-red-400 font-bold px-2 py-1 hover:bg-red-950 rounded">✕</button>
            `;
            div.querySelector('.inp-paso-desc').addEventListener('input', (e) => paso.descripcion = e.target.value);
            div.querySelector('.btn-del-paso').addEventListener('click', () => { state.pasosTempo.splice(index, 1); renderizarPasosForm(); });
            dom.form.contPasos.appendChild(div);
        });
    };

const recalcularCostosFormulario = () => {
        let costoLote = 0;
        state.ingredientesTempo.forEach(item => {
            const ins = state.insumosGlobales.find(x => x.id === item.insumo_id);
            if (ins) costoLote += (parseFloat(item.cantidad) * parseFloat(ins.costo_unitario));
        });
        const rendimiento = parseFloat(dom.form.rendimiento.value) || 0;
        const costoUni = rendimiento > 0 ? (costoLote / rendimiento) : 0;

        // Visual
        dom.form.calcLote.textContent = `$${window.formatearMonedaLocal(costoLote, 0)}`;
        dom.form.calcUni.textContent = `$${window.formatearMonedaLocal(costoUni, 4)}`;
        
        // Guardado Crudo
        dom.form.calcLote.dataset.raw = costoLote;
    };

    // --- GUARDAR DB ---
    dom.form.elemento.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idInput = dom.form.id.value;
        const rendimientoVal = parseFloat(dom.form.rendimiento.value);

        const payload = {
            nombre: dom.form.nombre.value.trim(),
            slug: dom.form.nombre.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, '-'),
            tipo_id: parseInt(dom.form.tipo.value),
            rendimiento_batch: rendimientoVal,
            unidad_rendimiento: dom.form.unidad.value,
            insumo_asociado_id: parseInt(dom.form.insumoAsc.value),
            elaboracion_instrucciones: "Ver tabla de pasos",
            indicaciones_almacenamiento: dom.form.almacenaje.value.trim(),
            vida_util: dom.form.vidaUtil.value.trim(),
            control_mermas_economia_circular: dom.form.mermas.value.trim()
        };

        try {
            let subReal;
            if (idInput) {
                const { data, error } = await supabase.from('sub_recetas_artesanales').update(payload).eq('id', idInput).select().single();
                if (error) throw error; subReal = data;
            } else {
                const { data, error } = await supabase.from('sub_recetas_artesanales').insert([payload]).select().single();
                if (error) throw error; subReal = data;
            }

            await supabase.from('sub_receta_ingredientes').delete().eq('sub_receta_id', subReal.id);
            if (state.ingredientesTempo.length > 0) {
                const ingsPayload = state.ingredientesTempo.map(i => ({ sub_receta_id: subReal.id, insumo_id: i.insumo_id, cantidad: i.cantidad, unidad_medida: i.unidad_medida }));
                await supabase.from('sub_receta_ingredientes').insert(ingsPayload);
            }

            await supabase.from('sub_receta_pasos_preparacion').delete().eq('sub_receta_id', subReal.id);
            const pasosLimpios = state.pasosTempo.filter(p => p.descripcion.trim() !== '');
            if (pasosLimpios.length > 0) {
                const pasosPayload = pasosLimpios.map((p, idx) => ({ sub_receta_id: subReal.id, numero_paso: idx + 1, descripcion: p.descripcion, es_critico: false }));
                await supabase.from('sub_receta_pasos_preparacion').insert(pasosPayload);
            }

            // Actualizar costo del insumo asociado automáticamente (Crucial para el ecosistema)
            const costoLoteTotal = state.ingredientesTempo.reduce((acc, i) => {
                const ins = state.insumosGlobales.find(x => x.id === i.insumo_id);
                return acc + (ins ? parseFloat(i.cantidad) * parseFloat(ins.costo_unitario) : 0);
            }, 0);
            const nuevoCostoInsumo = rendimientoVal > 0 ? (costoLoteTotal / rendimientoVal) : 0;
            await supabase.from('insumos').update({ costo_unitario: nuevoCostoInsumo }).eq('id', payload.insumo_asociado_id);

            console.log("Sub-receta e insumo espejo actualizados!");
            await cargarMaestros();
            cambiarVista('listado');

        } catch (error) {
            console.error("Error al guardar sub-receta:", error);
            alert("Error al guardar: " + error.message);
        }
    });

    // --- EVENTOS (LISTENERS) ---
    document.querySelectorAll('.tab-sub-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-sub-btn').forEach(b => { b.classList.remove('border-emerald-500', 'text-emerald-400'); b.classList.add('border-transparent', 'text-gray-400'); });
            document.querySelectorAll('.tab-sub-content').forEach(c => c.classList.add('hidden'));
            e.currentTarget.classList.add('border-emerald-500', 'text-emerald-400');
            if (e.currentTarget.id === 'tab-btn-sub-ingenieria') document.getElementById('tab-sub-content-ingenieria').classList.remove('hidden');
            if (e.currentTarget.id === 'tab-btn-sub-operacion') document.getElementById('tab-sub-content-operacion').classList.remove('hidden');
            if (e.currentTarget.id === 'tab-btn-sub-uso') document.getElementById('tab-sub-content-uso').classList.remove('hidden');
        });
    });

    dom.tabla.buscador.addEventListener('input', (e) => { state.tableParams.search = e.target.value.toLowerCase(); state.tableParams.page = 1; renderizarTablaPrincipal(); });
    dom.tabla.limite.addEventListener('change', (e) => { state.tableParams.limit = parseInt(e.target.value); state.tableParams.page = 1; renderizarTablaPrincipal(); });
    dom.tabla.btnPrev.addEventListener('click', () => { if (state.tableParams.page > 1) { state.tableParams.page--; renderizarTablaPrincipal(); } });
    dom.tabla.btnNext.addEventListener('click', () => { state.tableParams.page++; renderizarTablaPrincipal(); });
    dom.tabla.thNombre.addEventListener('click', () => { state.tableParams.sortAsc = !state.tableParams.sortAsc; renderizarTablaPrincipal(); });

    dom.form.buscarDisp.addEventListener('input', (e) => { state.filterInsumoDisp = e.target.value.toLowerCase(); renderizarDualInsumos(); });
    dom.form.btnAgregarPaso.addEventListener('click', () => { state.pasosTempo.push({ descripcion: '' }); renderizarPasosForm(); });
    dom.form.rendimiento.addEventListener('input', recalcularCostosFormulario);

    dom.botones.nuevo.addEventListener('click', () => abrirFormulario(false));
    dom.botones.volver.addEventListener('click', () => cambiarVista('listado'));
    dom.botones.editar.addEventListener('click', () => abrirFormulario(true));
    dom.botones.eliminar.addEventListener('click', async () => {
        if (confirm(`¿Estás seguro de eliminar la sub-receta "${state.subActiva.nombre}"?`)) {
            await supabase.from('sub_recetas_artesanales').delete().eq('id', state.subActiva.id);
            await cargarMaestros();
            cambiarVista('listado');
        }
    });

    const cerrarForm = () => state.subActiva ? cambiarVista('detalle') : cambiarVista('listado');
    dom.botones.cancelarTop.addEventListener('click', cerrarForm);
    dom.botones.cancelarMid.addEventListener('click', cerrarForm);
    dom.botones.cancelarBot.addEventListener('click', cerrarForm);

    await cargarMaestros();
}