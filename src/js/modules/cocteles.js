// src/modules/cocteles.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabase = window.supabaseClient;

// --- ESTADO GLOBAL DEL MÓDULO ---
let state = {
    cocteles: [],
    insumosGlobales: [],
    catalogos: { categorias: [], familias: [], soportes: [], hielos: [], tecnicas: [] },
    coctelActivo: null,
    ingredientesTempo: [], // Array de { insumo_id, cantidad, unidad_medida }
    pasosTempo: [],        // Array de { numero_paso, descripcion, es_critico }
    tableParams: {
        search: '',
        page: 1,
        limit: 25,
        sortCol: 'nombre',
        sortAsc: true
    },
    filterInsumoDisp: '',
    // NUEVA FUENTE DE VERDAD:
    calculosActivos: { costo: 0, abv: 0 }
};

export async function initCocteles() {
    console.log("Inicializando Módulo Escalable: Cócteles");

    // --- REFERENCIAS DOM ---
    const dom = {
        vistas: {
            listado: document.getElementById('cocteles-listado'),
            detalle: document.getElementById('cocteles-detalle'),
            formulario: document.getElementById('cocteles-formulario')
        },
        tabla: {
            body: document.getElementById('tabla-cocteles-body'),
            buscador: document.getElementById('buscador-cocteles'),
            limite: document.getElementById('paginado-limite-cocteles'),
            infoPagi: document.getElementById('info-paginacion-cocteles'),
            btnPrev: document.getElementById('btn-pagi-prev'),
            btnNext: document.getElementById('btn-pagi-next'),
            numPagi: document.getElementById('num-pagina-actual'),
            thNombre: document.getElementById('th-nombre')
        },
        detalle: {
            nombre: document.getElementById('det-coctel-nombre'),
            abvBadge: document.getElementById('det-coctel-abv-badge'),
            subtitulo: document.getElementById('det-coctel-subtitulo'),
            kpiAbv: document.getElementById('det-kpi-abv'),
            kpiAzucar: document.getElementById('det-kpi-azucar'),
            kpiCosto: document.getElementById('det-kpi-costo'),
            kpiPrecio: document.getElementById('det-kpi-precio'),
            tablaIngs: document.getElementById('det-tabla-ingredientes-body'),
            pasos: document.getElementById('det-contenedor-pasos'),
            inspiracion: document.getElementById('det-sensorial-inspiracion'),
            vista: document.getElementById('det-sensorial-vista'),
            nariz: document.getElementById('det-sensorial-nariz'),
            boca: document.getElementById('det-sensorial-boca'),
            propuesta: document.getElementById('det-maridaje-propuesta'),
            justificacion: document.getElementById('det-maridaje-justificacion'),
            alternativa: document.getElementById('det-maridaje-alternativa'),
            tips: document.getElementById('det-maridaje-tips'),
            tablaCartas: document.getElementById('det-tabla-cartas-body')
        },
        form: {
            elemento: document.getElementById('form-coctel'),
            id: document.getElementById('coctel-id'),
            nombre: document.getElementById('coctel-nombre'),
            slug: document.getElementById('coctel-slug'),
            categoria: document.getElementById('coctel-categoria-id'),
            familia: document.getElementById('coctel-familia-id'),
            soporte: document.getElementById('coctel-soporte-id'),
            hielo: document.getElementById('coctel-hielo-id'),
            tecnica: document.getElementById('coctel-tecnica-id'),
            inspiracion: document.getElementById('coctel-inspiracion'),
            vista: document.getElementById('coctel-vista'),
            nariz: document.getElementById('coctel-nariz'),
            boca: document.getElementById('coctel-boca'),
            maridaje: document.getElementById('coctel-maridaje'),
            justificacion: document.getElementById('coctel-justificacion'),
            alternativa: document.getElementById('coctel-alternativa'),
            tips: document.getElementById('coctel-tips'),
            titulo: document.getElementById('titulo-form-coctel'),
            listaInsumosDisp: document.getElementById('lista-insumos-disponibles'),
            listaInsumosAsig: document.getElementById('lista-insumos-seleccionados'),
            contadorInsumos: document.getElementById('contador-insumos-asig'),
            buscarDisp: document.getElementById('buscar-insumos-disp'),
            contenedorPasos: document.getElementById('contenedor-pasos-form'),
            btnAgregarPaso: document.getElementById('btn-agregar-paso'),
            calcCosto: document.getElementById('calc-coctel-costo'),
            calcPrecio: document.getElementById('calc-coctel-precio'),
            calcAbv: document.getElementById('calc-coctel-abv'),
            calcAzucar: document.getElementById('calc-coctel-azucar')
        },
        botones: {
            nuevo: document.getElementById('btn-nuevo-coctel'),
            volverDetalle: document.getElementById('btn-volver-listado-cocteles'),
            editarAct: document.getElementById('btn-editar-coctel-act'),
            eliminarAct: document.getElementById('btn-eliminar-coctel-act'),
            cancelarTop: document.getElementById('btn-cancelar-form-coctel-top'),
            cancelarMid: document.getElementById('btn-cancelar-form-coctel'),
            cancelarBot: document.getElementById('btn-cancelar-form-coctel-bot')
        }
    };

    // --- CAMBIO DE VISTAS ---
    const cambiarVista = (target) => {
        Object.values(dom.vistas).forEach(v => v.classList.add('hidden'));
        dom.vistas[target].classList.remove('hidden');
    };

    // ⚡ PASO CLAVE 1: Detectar la intención de viaje ANTES de cargar datos a la base de datos
    const vieneDeCartas = window.navegacionSPA && window.navegacionSPA.coctelDestinoId;

    if (vieneDeCartas) {
        // Mostramos al instante la vista Detalle con un texto de carga (Cero parpadeo del listado)
        dom.botones.volverDetalle.innerHTML = '← Volver a la Carta';
        dom.detalle.nombre.textContent = "Cargando ficha técnica...";
        cambiarVista('detalle');
    } else {
        // Si es navegación normal desde el menú lateral, mostramos el listado
        cambiarVista('listado');
    }

    // --- 2. CARGA DE DATOS ---
    const cargarMaestros = async () => {
        try {
            const [cData, iData, cat, fam, sop, hie, tec] = await Promise.all([
                supabase.from('cocteles').select('*').order('nombre'),
                supabase.from('insumos').select('*').order('nombre'),
                supabase.from('categorias').select('*'),
                supabase.from('familias').select('*'),
                supabase.from('soportes').select('*'),
                supabase.from('hielos').select('*'),
                supabase.from('tecnicas').select('*')
            ]);

            state.cocteles = cData.data || [];
            state.insumosGlobales = iData.data || [];
            state.catalogos = { categorias: cat.data || [], familias: fam.data || [], soportes: sop.data || [], hielos: hie.data || [], tecnicas: tec.data || [] };

            poblarSelectoresForm();
            renderizarTablaPrincipal();
        } catch (error) {
            console.error("Error al cargar maestros:", error);
        }
    };

    const poblarSelectoresForm = () => {
        dom.form.categoria.innerHTML = state.catalogos.categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        dom.form.familia.innerHTML = state.catalogos.familias.map(f => `<option value="${f.id}">${f.nombre}</option>`).join('');
        dom.form.soporte.innerHTML = state.catalogos.soportes.map(s => `<option value="${s.id}">${s.nombre} (${s.capacidad_operativa_ml}ml)</option>`).join('');
        dom.form.hielo.innerHTML = state.catalogos.hielos.map(h => `<option value="${h.id}">${h.nombre}</option>`).join('');
        dom.form.tecnica.innerHTML = state.catalogos.tecnicas.map(t => `<option value="${t.id}" data-dilucion="${t.dilucion_estimada_porcentaje}">${t.nombre}</option>`).join('');
    };

    // --- 3. TABLA PRINCIPAL Y PAGINACIÓN ---
    const renderizarTablaPrincipal = () => {
        const { search, page, limit, sortCol, sortAsc } = state.tableParams;

        let filtrados = state.cocteles.filter(c => {
            const cat = state.catalogos.categorias.find(x => x.id === c.categoria_id)?.nombre || '';
            const fam = state.catalogos.familias.find(x => x.id === c.familia_id)?.nombre || '';
            return c.nombre.toLowerCase().includes(search) || cat.toLowerCase().includes(search) || fam.toLowerCase().includes(search);
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
            dom.tabla.body.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500 mono-font">No se encontraron cócteles.</td></tr>`;
        } else {
            paginados.forEach(c => {
                const cat = state.catalogos.categorias.find(x => x.id === c.categoria_id)?.nombre || '-';
                const fam = state.catalogos.familias.find(x => x.id === c.familia_id)?.nombre || '-';
                const sop = state.catalogos.soportes.find(x => x.id === c.soporte_id)?.nombre || '-';
                const hie = state.catalogos.hielos.find(x => x.id === c.hielo_id)?.nombre || '-';

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-800/40 cursor-pointer transition border-b border-gray-800/60';
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-white group-hover:text-emerald-400">${c.nombre}</td>
                    <td class="py-3 px-4 text-xs text-gray-400">${cat} <span class="text-gray-600">/</span> ${fam}</td>
                    <td class="py-3 px-4 text-xs text-gray-400">${sop} (${hie})</td>
                    <td class="py-3 px-4 text-center font-mono text-emerald-400 font-bold">${window.formatearMonedaLocal(c.grado_alcohol, 1)}%</td>
                    <td class="py-3 px-4 text-right font-mono text-purple-400">$${window.formatearMonedaLocal(c.costo_produccion, 0)}</td>
                    <td class="py-3 px-4 text-right font-mono text-white font-bold">$${window.formatearMonedaLocal(c.precio_venta_sugerido, 0)}</td>
                    <td class="py-3 px-4 text-center">
                        <button class="btn-ver-coctel text-xs bg-gray-800 hover:bg-emerald-950 hover:text-emerald-400 text-gray-300 px-2.5 py-1 rounded border border-gray-700 transition">Ver</button>
                    </td>
                `;
                tr.addEventListener('click', () => abrirDetalle(c));
                dom.tabla.body.appendChild(tr);
            });
        }

        dom.tabla.infoPagi.textContent = `Mostrando ${total === 0 ? 0 : start + 1} - ${Math.min(start + limit, total)} de ${total} cócteles`;
        dom.tabla.numPagi.textContent = `Pág ${currentPage} de ${totalPages}`;
        dom.tabla.btnPrev.disabled = currentPage === 1;
        dom.tabla.btnNext.disabled = currentPage === totalPages;
    };

    // --- 4. DETALLE Y PESTAÑAS ---
    const abrirDetalle = async (coctel) => {
        state.coctelActivo = coctel;

        // MAGIA VISUAL: Cambiamos el texto del botón si venimos desde Cartas
        if (window.navegacionSPA && window.navegacionSPA.origen === 'cartas') {
            dom.botones.volverDetalle.innerHTML = '← Volver a la Carta';
        } else {
            dom.botones.volverDetalle.innerHTML = '← Volver a la Grilla';
        }

        const cat = state.catalogos.categorias.find(x => x.id === coctel.categoria_id)?.nombre || '-';
        const fam = state.catalogos.familias.find(x => x.id === coctel.familia_id)?.nombre || '-';
        const sop = state.catalogos.soportes.find(x => x.id === coctel.soporte_id)?.nombre || '-';
        const tec = state.catalogos.tecnicas.find(x => x.id === coctel.tecnica_id)?.nombre || '-';

        dom.detalle.nombre.textContent = coctel.nombre;
        dom.detalle.abvBadge.textContent = `${window.formatearMonedaLocal(coctel.grado_alcohol, 1)}% ABV`;
        dom.detalle.subtitulo.textContent = `${cat} | ${fam} | ${sop} | ${tec}`;

        // KPIs Formateados
        dom.detalle.kpiAbv.textContent = `${window.formatearMonedaLocal(coctel.grado_alcohol, 1)}%`;
        dom.detalle.kpiAzucar.textContent = `${window.formatearMonedaLocal(coctel.porcentaje_azucar, 1)}%`;
        dom.detalle.kpiCosto.textContent = `$${window.formatearMonedaLocal(coctel.costo_produccion, 0)}`;
        dom.detalle.kpiPrecio.textContent = `$${window.formatearMonedaLocal(coctel.precio_venta_sugerido, 0)}`;

        // Tab Cata
        dom.detalle.inspiracion.textContent = coctel.reseña_inspiracion || 'Sin receta histórica/storytelling.';
        dom.detalle.vista.textContent = coctel.reseña_vista || '-';
        dom.detalle.nariz.textContent = coctel.reseña_nariz || '-';
        dom.detalle.boca.textContent = coctel.reseña_boca || '-';
        dom.detalle.propuesta.textContent = coctel.maridaje_propuesta || '-';
        dom.detalle.justificacion.textContent = coctel.maridaje_justificacion || '-';
        dom.detalle.alternativa.textContent = coctel.maridaje_alternativa || '-';
        dom.detalle.tips.textContent = coctel.tips || '-';

        // Cargar Ingredientes
        const { data: ings } = await supabase.from('coctel_ingredientes').select('*').eq('coctel_id', coctel.id);
        dom.detalle.tablaIngs.innerHTML = '';
        (ings || []).forEach(ing => {
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
        const { data: pasos } = await supabase.from('coctel_pasos_preparacion').select('*').eq('coctel_id', coctel.id).order('numero_paso');
        dom.detalle.pasos.innerHTML = '';
        (pasos || []).forEach(p => {
            const div = document.createElement('div');
            div.className = `p-3 rounded-lg bg-gray-950 border ${p.es_critico ? 'border-red-900/40 bg-red-950/10' : 'border-gray-800'} text-xs space-y-1`;
            div.innerHTML = `
                <div class="flex justify-between items-center font-mono">
                    <span class="font-bold ${p.es_critico ? 'text-red-400' : 'text-gray-500'}">PASO ${p.numero_paso}</span>
                    ${p.es_critico ? '<span class="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Crítico</span>' : ''}
                </div>
                <p class="text-gray-300">${p.descripcion}</p>
            `;
            dom.detalle.pasos.appendChild(div);
        });

        // Cargar Presencia en Cartas
        const { data: cartasData } = await supabase
            .from('carta_cocteles')
            .select(`precio_venta_override, cartas(nombre, cliente_institucion, tematica, estado)`)
            .eq('coctel_id', coctel.id);

        dom.detalle.tablaCartas.innerHTML = '';
        if (!cartasData || cartasData.length === 0) {
            dom.detalle.tablaCartas.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-500 mono-font">Este cóctel no está asignado a ninguna carta activa.</td></tr>`;
        } else {
            cartasData.forEach(item => {
                const c = item.cartas;
                if (!c) return;
                const precioFinal = item.precio_venta_override || coctel.precio_venta_sugerido;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-gray-100">${c.nombre}</td>
                    <td class="py-3 px-4 text-gray-400">${c.cliente_institucion || 'General'}</td>
                    <td class="py-3 px-4 text-gray-400">${c.tematica || '-'}</td>
                    <td class="py-3 px-4 text-center"><span class="text-[10px] mono-font px-2 py-0.5 rounded bg-gray-800 uppercase">${c.estado}</span></td>
                    <td class="py-3 px-4 text-right font-mono text-emerald-400 font-bold">$${window.formatearMonedaLocal(precioFinal, 0)}</td>
                `;
                dom.detalle.tablaCartas.appendChild(tr);
            });
        }

        cambiarVista('detalle');
    };

    // --- 5. FORMULARIO Y SELECTOR DUAL DE INSUMOS ---
    const abrirFormulario = async (editando = false) => {
        if (editando && state.coctelActivo) {
            const c = state.coctelActivo;
            dom.form.titulo.textContent = "Editar Cóctel";
            dom.form.id.value = c.id;
            dom.form.nombre.value = c.nombre;
            dom.form.slug.value = c.slug;
            dom.form.categoria.value = c.categoria_id;
            dom.form.familia.value = c.familia_id;
            dom.form.soporte.value = c.soporte_id;
            dom.form.hielo.value = c.hielo_id;
            dom.form.tecnica.value = c.tecnica_id;

            dom.form.inspiracion.value = c.reseña_inspiracion || '';
            dom.form.vista.value = c.reseña_vista || '';
            dom.form.nariz.value = c.reseña_nariz || '';
            dom.form.boca.value = c.reseña_boca || '';
            dom.form.maridaje.value = c.maridaje_propuesta || '';
            dom.form.justificacion.value = c.maridaje_justificacion || '';
            dom.form.alternativa.value = c.maridaje_alternativa || '';
            dom.form.tips.value = c.tips || '';

            // Cargar Ingredientes del Cóctel
            const { data: ings } = await supabase.from('coctel_ingredientes').select('*').eq('coctel_id', c.id);
            state.ingredientesTempo = (ings || []).map(i => ({ insumo_id: i.insumo_id, cantidad: i.cantidad, unidad_medida: i.unidad_medida }));

            // Cargar Pasos
            const { data: pasos } = await supabase.from('coctel_pasos_preparacion').select('*').eq('coctel_id', c.id).order('numero_paso');
            state.pasosTempo = (pasos || []).map(p => ({ numero_paso: p.numero_paso, descripcion: p.descripcion, es_critico: p.es_critico }));

        } else {
            dom.form.titulo.textContent = "Estandarizar Nuevo Cóctel";
            dom.form.elemento.reset();
            dom.form.id.value = '';
            state.ingredientesTempo = [];
            state.pasosTempo = [];
        }

        renderizarDualInsumos();
        renderizarPasosForm();
        recalcularValoresFisicos();
        cambiarVista('formulario');
    };

    // Render Selector Dual de Insumos
    const renderizarDualInsumos = () => {
        const query = state.filterInsumoDisp;
        const seleccionadosIds = state.ingredientesTempo.map(i => i.insumo_id);

        // Disponibles
        const disponibles = state.insumosGlobales.filter(ins => 
            !seleccionadosIds.includes(ins.id) && ins.nombre.toLowerCase().includes(query)
        );

        dom.form.listaInsumosDisp.innerHTML = '';
        if (disponibles.length === 0) {
            dom.form.listaInsumosDisp.innerHTML = `<div class="text-xs text-gray-600 text-center py-4">No hay insumos.</div>`;
        } else {
            disponibles.forEach(ins => {
                const div = document.createElement('div');
                div.className = 'flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800 hover:border-emerald-500/30 transition';
                div.innerHTML = `
                    <div>
                        <p class="text-xs text-gray-200 font-medium">${ins.nombre}</p>
                        <p class="text-[10px] text-gray-500 font-mono">${ins.graduacion_alcohol_base}% ABV | $${ins.costo_unitario}/${ins.unidad_medida}</p>
                    </div>
                    <button type="button" class="btn-add-ins text-emerald-500 hover:text-white bg-emerald-950/40 px-2 py-1 rounded text-xs font-bold">+</button>
                `;
                div.querySelector('.btn-add-ins').addEventListener('click', () => {
                    state.ingredientesTempo.push({ insumo_id: ins.id, cantidad: 30, unidad_medida: ins.unidad_medida || 'ml' });
                    renderizarDualInsumos();
                    recalcularValoresFisicos();
                });
                dom.form.listaInsumosDisp.appendChild(div);
            });
        }

        // Seleccionados (Con Inputs de Cantidad y Unidad)
        dom.form.contadorInsumos.textContent = state.ingredientesTempo.length;
        dom.form.listaInsumosAsig.innerHTML = '';

        if (state.ingredientesTempo.length === 0) {
            dom.form.listaInsumosAsig.innerHTML = `<div class="text-xs text-gray-600 text-center py-10">Sin insumos agregados a la receta.</div>`;
        } else {
            state.ingredientesTempo.forEach((item, index) => {
                const ins = state.insumosGlobales.find(x => x.id === item.insumo_id);
                if (!ins) return;

                const div = document.createElement('div');
                div.className = 'flex items-center justify-between gap-2 bg-emerald-950/20 p-2 rounded border border-emerald-900/30';
                div.innerHTML = `
                    <div class="flex-1 min-w-0">
                        <p class="text-xs text-emerald-400 font-bold truncate">${ins.nombre}</p>
                    </div>
                    <div class="flex items-center gap-1 w-36 shrink-0">
                        <input type="number" step="0.1" value="${item.cantidad}" class="inp-cant w-16 bg-gray-900 border border-gray-800 text-right rounded px-1.5 py-1 text-xs text-white font-mono outline-none">
                        <select class="sel-unit bg-gray-900 border border-gray-800 text-xs text-gray-300 rounded p-1 font-mono outline-none">
                            <option value="ml" ${item.unidad_medida === 'ml' ? 'selected' : ''}>ml</option>
                            <option value="g" ${item.unidad_medida === 'g' ? 'selected' : ''}>g</option>
                            <option value="unit" ${item.unidad_medida === 'unit' ? 'selected' : ''}>unit</option>
                            <option value="dash" ${item.unidad_medida === 'dash' ? 'selected' : ''}>dash</option>
                            <option value="barspoon" ${item.unidad_medida === 'barspoon' ? 'selected' : ''}>spoon</option>
                        </select>
                    </div>
                    <button type="button" class="btn-del-ins text-red-400 hover:bg-red-950 px-1.5 py-0.5 rounded font-bold">✕</button>
                `;

                div.querySelector('.inp-cant').addEventListener('input', (e) => {
                    item.cantidad = parseFloat(e.target.value) || 0;
                    recalcularValoresFisicos();
                });
                div.querySelector('.sel-unit').addEventListener('change', (e) => {
                    item.unidad_medida = e.target.value;
                    recalcularValoresFisicos();
                });
                div.querySelector('.btn-del-ins').addEventListener('click', () => {
                    state.ingredientesTempo.splice(index, 1);
                    renderizarDualInsumos();
                    recalcularValoresFisicos();
                });

                dom.form.listaInsumosAsig.appendChild(div);
            });
        }
    };

    // Render Pasos Formulario
    const renderizarPasosForm = () => {
        dom.form.contenedorPasos.innerHTML = '';
        state.pasosTempo.forEach((paso, index) => {
            const div = document.createElement('div');
            div.className = "flex items-start gap-2 bg-gray-950 p-2 rounded border border-gray-800 text-xs";
            div.innerHTML = `
                <span class="font-mono text-[10px] text-gray-500 mt-2">P${index + 1}</span>
                <textarea class="inp-paso-desc flex-1 bg-gray-900 border border-gray-800 text-white rounded p-1.5 resize-none outline-none" rows="1" placeholder="Descripción de la acción...">${paso.descripcion}</textarea>
                <label class="flex items-center gap-1 shrink-0 mt-1 cursor-pointer">
                    <input type="checkbox" class="chk-paso-critico accent-red-500 h-3.5 w-3.5" ${paso.es_critico ? 'checked' : ''}>
                    <span class="text-[9px] text-red-400 font-semibold uppercase">Crítico</span>
                </label>
                <button type="button" class="btn-del-paso text-red-400 font-bold px-1 hover:bg-red-950 rounded mt-1">✕</button>
            `;

            div.querySelector('.inp-paso-desc').addEventListener('input', (e) => paso.descripcion = e.target.value);
            div.querySelector('.chk-paso-critico').addEventListener('change', (e) => paso.es_critico = e.target.checked);
            div.querySelector('.btn-del-paso').addEventListener('click', () => {
                state.pasosTempo.splice(index, 1);
                renderizarPasosForm();
            });

            dom.form.contenedorPasos.appendChild(div);
        });
    };

    const recalcularValoresFisicos = () => {
        let costoTotal = 0;
        let volLiquidoTotal = 0;
        let alcPuroTotal = 0;

        state.ingredientesTempo.forEach(item => {
            const ins = state.insumosGlobales.find(x => x.id === item.insumo_id);
            if (!ins) return;

            const cant = parseFloat(item.cantidad) || 0;
            const cu = parseFloat(ins.costo_unitario) || 0;
            const abv = parseFloat(ins.graduacion_alcohol_base) || 0;

            costoTotal += cant * cu;

            if (item.unidad_medida === 'ml') {
                volLiquidoTotal += cant;
                alcPuroTotal += cant * (abv / 100);
            }
        });

        const tecId = parseInt(dom.form.tecnica.value);
        const tecObj = state.catalogos.tecnicas.find(t => t.id === tecId);
        const dilucion = tecObj ? (parseFloat(tecObj.dilucion_estimada_porcentaje) || 0) : 0;

        const volConDilucion = volLiquidoTotal * (1 + dilucion);
        const abvFinal = volConDilucion > 0 ? (alcPuroTotal / volConDilucion) * 100 : 0;

        // 1. Guardamos en nuestra única fuente de verdad (Memoria JS)
        state.calculosActivos.costo = costoTotal;
        state.calculosActivos.abv = abvFinal;

        // 2. Renderizamos la versión visual bonita (HTML)
        dom.form.calcCosto.textContent = `$${window.formatearMonedaLocal(costoTotal, 0)}`;
        dom.form.calcPrecio.textContent = `$${window.formatearMonedaLocal(costoTotal * 8.0, 0)}`;
        dom.form.calcAbv.textContent = `${window.formatearMonedaLocal(abvFinal, 1)}%`;
        dom.form.calcAzucar.textContent = `12,5%`;
    };

    // --- 6. GUARDAR CÓCTEL MULTINIVEL ---
    dom.form.elemento.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idCoctel = dom.form.id.value;

        // Lógica limpia: Tomamos los datos crudos directamente de la memoria (state)
        const costoCrudo = state.calculosActivos.costo;
        const abvCrudo = state.calculosActivos.abv;

        const payload = {
            nombre: dom.form.nombre.value.trim(),
            slug: dom.form.slug.value.trim(),
            categoria_id: parseInt(dom.form.categoria.value),
            familia_id: parseInt(dom.form.familia.value),
            soporte_id: parseInt(dom.form.soporte.value),
            hielo_id: parseInt(dom.form.hielo.value),
            tecnica_id: parseInt(dom.form.tecnica.value),
            reseña_inspiracion: dom.form.inspiracion.value.trim(),
            reseña_vista: dom.form.vista.value.trim(),
            reseña_nariz: dom.form.nariz.value.trim(),
            reseña_boca: dom.form.boca.value.trim(),
            maridaje_propuesta: dom.form.maridaje.value.trim(),
            maridaje_justificacion: dom.form.justificacion.value.trim(),
            maridaje_alternativa: dom.form.alternativa.value.trim(),
            tips: dom.form.tips.value.trim(),
            grado_alcohol: abvCrudo,
            porcentaje_azucar: 12.5,
            costo_produccion: costoCrudo,
            precio_venta_sugerido: costoCrudo * 8.0
        };

        try {
            let coctelReal;
            if (idCoctel) {
                const { data, error } = await supabase.from('cocteles').update(payload).eq('id', idCoctel).select().single();
                if (error) throw error;
                coctelReal = data;
            } else {
                const { data, error } = await supabase.from('cocteles').insert([payload]).select().single();
                if (error) throw error;
                coctelReal = data;
            }

            // Guardar Ingredientes
            await supabase.from('coctel_ingredientes').delete().eq('coctel_id', coctelReal.id);
            if (state.ingredientesTempo.length > 0) {
                const ingsPayload = state.ingredientesTempo.map(i => ({
                    coctel_id: coctelReal.id,
                    insumo_id: i.insumo_id,
                    cantidad: i.cantidad,
                    unidad_medida: i.unidad_medida
                }));
                await supabase.from('coctel_ingredientes').insert(ingsPayload);
            }

            // Guardar Pasos
            await supabase.from('coctel_pasos_preparacion').delete().eq('coctel_id', coctelReal.id);
            if (state.pasosTempo.length > 0) {
                const pasosPayload = state.pasosTempo.map((p, idx) => ({
                    coctel_id: coctelReal.id,
                    numero_paso: idx + 1,
                    descripcion: p.descripcion,
                    es_critico: p.es_critico
                }));
                await supabase.from('coctel_pasos_preparacion').insert(pasosPayload);
            }

            console.log("Cóctel guardado exitosamente!");
            await cargarMaestros();
            cambiarVista('listado');

        } catch (error) {
            console.error("Error al guardar el cóctel:", error);
            alert("Error al guardar: " + error.message);
        }
    });

    // --- 7. EVENTOS Y NAVEGACIÓN DE PESTAÑAS ---
    // Pestañas Ficha Técnica
    document.querySelectorAll('.tab-coctel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-coctel-btn').forEach(b => {
                b.classList.remove('border-emerald-500', 'text-emerald-400');
                b.classList.add('border-transparent', 'text-gray-400');
            });
            document.querySelectorAll('.tab-coctel-content').forEach(c => c.classList.add('hidden'));

            e.currentTarget.classList.add('border-emerald-500', 'text-emerald-400');
            
            if (e.currentTarget.id === 'tab-btn-ingenieria') document.getElementById('tab-content-ingenieria').classList.remove('hidden');
            if (e.currentTarget.id === 'tab-btn-sensorial') document.getElementById('tab-content-sensorial').classList.remove('hidden');
            if (e.currentTarget.id === 'tab-btn-cartas') document.getElementById('tab-content-cartas').classList.remove('hidden');
        });
    });

    // Búsqueda y Paginado
    dom.tabla.buscador.addEventListener('input', (e) => {
        state.tableParams.search = e.target.value.toLowerCase();
        state.tableParams.page = 1;
        renderizarTablaPrincipal();
    });
    dom.tabla.limite.addEventListener('change', (e) => {
        state.tableParams.limit = parseInt(e.target.value);
        state.tableParams.page = 1;
        renderizarTablaPrincipal();
    });
    dom.tabla.btnPrev.addEventListener('click', () => {
        if (state.tableParams.page > 1) { state.tableParams.page--; renderizarTablaPrincipal(); }
    });
    dom.tabla.btnNext.addEventListener('click', () => {
        state.tableParams.page++; renderizarTablaPrincipal();
    });
    dom.tabla.thNombre.addEventListener('click', () => {
        state.tableParams.sortAsc = !state.tableParams.sortAsc;
        renderizarTablaPrincipal();
    });

    // Slug Auto
    dom.form.nombre.addEventListener('input', (e) => {
        if (!dom.form.id.value) {
            dom.form.slug.value = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
        }
    });

    // Dual Insumos Búsqueda
    dom.form.buscarDisp.addEventListener('input', (e) => {
        state.filterInsumoDisp = e.target.value.toLowerCase();
        renderizarDualInsumos();
    });

    // Pasos Agregar Button
    dom.form.btnAgregarPaso.addEventListener('click', () => {
        state.pasosTempo.push({ numero_paso: state.pasosTempo.length + 1, descripcion: '', es_critico: false });
        renderizarPasosForm();
    });

    // Técnica Change recalcula
    dom.form.tecnica.addEventListener('change', recalcularValoresFisicos);

    // Botones Acción
    dom.botones.nuevo.addEventListener('click', () => abrirFormulario(false));
    
    // MAGIA DE RETORNO: Decidimos a dónde vuelve según el boleto
    dom.botones.volverDetalle.addEventListener('click', () => {
        if (window.navegacionSPA && window.navegacionSPA.origen === 'cartas') {
            // Le decimos al boleto que ahora queremos volver
            window.navegacionSPA.retornarACartaId = window.navegacionSPA.cartaIdOculta;
            document.querySelector('.btn-nav[data-view="cartas"]').click();
        } else {
            cambiarVista('listado');
        }
    });

    dom.botones.editarAct.addEventListener('click', () => abrirFormulario(true));
    dom.botones.eliminarAct.addEventListener('click', async () => {
        if (confirm(`¿Estás seguro de eliminar el cóctel "${state.coctelActivo.nombre}"?`)) {
            await supabase.from('cocteles').delete().eq('id', state.coctelActivo.id);
            await cargarMaestros();
            cambiarVista('listado');
        }
    });

    const cerrarForm = () => state.coctelActivo ? cambiarVista('detalle') : cambiarVista('listado');
    dom.botones.cancelarTop.addEventListener('click', cerrarForm);
    dom.botones.cancelarMid.addEventListener('click', cerrarForm);
    dom.botones.cancelarBot.addEventListener('click', cerrarForm);

// ⚡ PASO CLAVE 2: En la sección // BOOT al final del archivo
    await cargarMaestros();

    // INTERCEPCIÓN (Poblamos los datos reales del cóctel una vez listos los maestros)
    if (vieneDeCartas) {
        const coctelObjetivo = state.cocteles.find(c => c.id === window.navegacionSPA.coctelDestinoId);
        if (coctelObjetivo) {
            await abrirDetalle(coctelObjetivo);
        } else {
            cambiarVista('listado');
        }
    }
}