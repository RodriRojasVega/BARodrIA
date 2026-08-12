// src/modules/cartas.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

if (!window.supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabase = window.supabaseClient;

// --- ESTADO GLOBAL DEL MÓDULO ---
let state = {
    cartas: [],
    coctelesGlobales: [],
    cartaActiva: null,        // Carta seleccionada para ver detalle
    asignadosTempo: [],       // Array de IDs de cócteles seleccionados en el form
    filtrosListado: { q: '', estado: 'todas' },
    filtrosDual: {
        disp: { q: '', page: 1, limit: 10 },
        asig: { q: '', page: 1, limit: 10 }
    }
};

export async function initCartas() {
    console.log("Inicializando módulo: Cartas");

    // --- REFERENCIAS DOM ---
    const dom = {
        vistas: {
            listado: document.getElementById('cartas-listado'),
            detalle: document.getElementById('cartas-detalle'),
            formulario: document.getElementById('cartas-formulario')
        },
        listado: {
            contenedor: document.getElementById('contenedor-cartas'),
            buscador: document.getElementById('buscador-cartas'),
            filtroEstado: document.getElementById('filtro-estado-carta')
        },
        detalle: {
            nombre: document.getElementById('detalle-carta-nombre'),
            cliente: document.getElementById('detalle-carta-cliente'),
            tematica: document.getElementById('detalle-carta-tematica'),
            estado: document.getElementById('detalle-carta-estado'),
            descripcion: document.getElementById('detalle-carta-descripcion'),
            contenedorCocteles: document.getElementById('contenedor-detalle-cocteles')
        },
        form: {
            elemento: document.getElementById('form-carta'),
            id: document.getElementById('carta-id'),
            nombre: document.getElementById('carta-nombre'),
            cliente: document.getElementById('carta-cliente'),
            tematica: document.getElementById('carta-tematica'),
            estado: document.getElementById('carta-estado'),
            descripcion: document.getElementById('carta-descripcion'),
            titulo: document.getElementById('titulo-form-carta')
        },
        dual: {
            listaDisp: document.getElementById('lista-cocteles-disponibles'),
            listaAsig: document.getElementById('lista-cocteles-asignados'),
            buscarDisp: document.getElementById('buscar-disponibles'),
            buscarAsig: document.getElementById('buscar-asignados'),
            limiteDisp: document.getElementById('paginado-disponibles'),
            limiteAsig: document.getElementById('paginado-asignados'),
            contadorAsig: document.getElementById('contador-asignados')
        },
        botones: {
            nueva: document.getElementById('btn-nueva-carta'),
            volver: document.getElementById('btn-volver-listado'),
            editar: document.getElementById('btn-editar-carta'),
            eliminar: document.getElementById('btn-eliminar-carta'),
            cerrarForm: document.getElementById('btn-cerrar-form-carta'),
            cancelarForm: document.getElementById('btn-cancelar-form-abajo')
        }
    };

    // --- 1. NAVEGACIÓN Y VISTAS ---
    const cambiarVista = (vistaObjetivo) => {
        Object.values(dom.vistas).forEach(v => v.classList.add('hidden'));
        dom.vistas[vistaObjetivo].classList.remove('hidden');
    };

    // --- 2. CARGA DE DATOS MAESTROS ---
    const cargarDatosIniciales = async () => {
        try {
            // Cargar Cartas
            const { data: cartasData, error: errCartas } = await supabase
                .from('cartas').select('*').order('created_at', { ascending: false });
            if (errCartas) throw errCartas;
            state.cartas = cartasData || [];

            // Cargar Cócteles (Catálogo Global) para el selector dual
            const { data: coctelesData, error: errCocteles } = await supabase
                .from('cocteles').select('id, nombre, precio_venta_sugerido').order('nombre');
            if (errCocteles) throw errCocteles;
            state.coctelesGlobales = coctelesData || [];

            renderizarListado();
        } catch (error) {
            console.error("Error al cargar datos:", error);
            alert("Error de conexión: " + error.message);
        }
    };

    // --- 3. VISTA LISTADO ---
    const renderizarListado = () => {
        dom.listado.contenedor.innerHTML = '';
        const { q, estado } = state.filtrosListado;

        const filtradas = state.cartas.filter(c => {
            const matchTxt = c.nombre.toLowerCase().includes(q) || (c.cliente_institucion && c.cliente_institucion.toLowerCase().includes(q));
            const matchEst = estado === 'todas' || c.estado === estado;
            return matchTxt && matchEst;
        });

        if (filtradas.length === 0) {
            dom.listado.contenedor.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 mono-font border border-gray-800 rounded-xl">No hay cartas.</div>`;
            return;
        }

        filtradas.forEach(carta => {
            const colores = { activa: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/50', borrador: 'text-yellow-400 border-yellow-500/20 bg-yellow-950/50', archivada: 'text-gray-400 border-gray-700 bg-gray-800/50' };
            const div = document.createElement('div');
            div.className = 'bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg';
            div.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-bold text-gray-100 group-hover:text-emerald-400">${carta.nombre}</h3>
                    <span class="text-[10px] mono-font px-2 py-1 rounded border ${colores[carta.estado] || colores.borrador} uppercase tracking-wider">${carta.estado}</span>
                </div>
                <div class="space-y-2 text-sm text-gray-400">
                    <p class="truncate">📋 ${carta.tematica || 'General'}</p>
                    <p class="truncate">🏢 ${carta.cliente_institucion || 'Sin cliente'}</p>
                </div>
            `;
            div.addEventListener('click', () => abrirDetalleCarta(carta));
            dom.listado.contenedor.appendChild(div);
        });
    };

    // --- 4. VISTA DETALLE ---
    const abrirDetalleCarta = async (carta) => {
        state.cartaActiva = carta;
        dom.detalle.nombre.textContent = carta.nombre;
        dom.detalle.cliente.innerHTML = `🏢 ${carta.cliente_institucion || 'Sin cliente'}`;
        dom.detalle.tematica.innerHTML = `📋 ${carta.tematica || 'General'}`;
        dom.detalle.estado.textContent = carta.estado;
        dom.detalle.descripcion.textContent = carta.descripcion || 'Sin descripción conceptual.';
        
        dom.detalle.contenedorCocteles.innerHTML = '<div class="col-span-full py-8 text-emerald-500 animate-pulse mono-font text-center">Cargando recetas...</div>';
        cambiarVista('detalle');

        // Buscar cócteles asignados en la tabla puente
        try {
            const { data, error } = await supabase
                .from('carta_cocteles')
                .select(`coctel_id, orden_aparicion, cocteles(nombre, precio_venta_sugerido)`)
                .eq('carta_id', carta.id)
                .order('orden_aparicion');
            
            if (error) throw error;
            
            dom.detalle.contenedorCocteles.innerHTML = '';
            if (!data || data.length === 0) {
                dom.detalle.contenedorCocteles.innerHTML = '<div class="col-span-full py-8 text-gray-500 mono-font text-center">Esta carta no tiene cócteles asignados.</div>';
                return;
            }

            data.forEach(item => {
                const c = item.cocteles;
                const div = document.createElement('div');
                // Hacemos la tarjeta más interactiva con hover states
                div.className = 'bg-gray-950 border border-gray-800 rounded-lg p-4 flex flex-col justify-between group hover:border-emerald-500/40 transition-all';
                div.innerHTML = `
                    <div>
                        <h4 class="text-sm font-bold text-gray-100 mb-2 group-hover:text-emerald-400 transition-colors">${c.nombre}</h4>
                        <div class="text-emerald-400 font-mono text-xs flex justify-between">
                            <span>Sugerido:</span>
                            <span>$${window.formatearMonedaLocal ? window.formatearMonedaLocal(c.precio_venta_sugerido, 0) : c.precio_venta_sugerido}</span>
                        </div>
                    </div>
                    <button class="btn-ver-coctel mt-4 w-full bg-gray-900 hover:bg-emerald-950 text-emerald-500 hover:text-emerald-400 text-xs font-bold py-2 rounded border border-gray-800 hover:border-emerald-500/50 transition-all">
                        Ver Ficha Técnica
                    </button>
                `;

                // MAGIA INTERMODULAR: Al hacer clic, guardamos el "Boleto" y disparamos el router
                div.querySelector('.btn-ver-coctel').addEventListener('click', () => {
                    window.navegacionSPA = {
                        origen: 'cartas',
                        cartaIdOculta: carta.id,
                        coctelDestinoId: item.coctel_id
                    };
                    // Simulamos un clic en el menú lateral para que tu main.js haga el ruteo
                    document.querySelector('.btn-nav[data-view="cocteles"]').click();
                });

                dom.detalle.contenedorCocteles.appendChild(div);
            });
        } catch (error) {
            console.error("Error al cargar cócteles de la carta:", error);
        }
    };

    // --- 5. SELECTOR DUAL Y FORMULARIO ---
    const abrirFormulario = async (editando = false) => {
        if (editando && state.cartaActiva) {
            dom.form.titulo.textContent = 'Editar Carta';
            dom.form.id.value = state.cartaActiva.id;
            dom.form.nombre.value = state.cartaActiva.nombre;
            dom.form.cliente.value = state.cartaActiva.cliente_institucion || '';
            dom.form.tematica.value = state.cartaActiva.tematica || '';
            dom.form.estado.value = state.cartaActiva.estado;
            dom.form.descripcion.value = state.cartaActiva.descripcion || '';

            // Recuperar IDs de los cócteles para el selector dual
            const { data } = await supabase.from('carta_cocteles').select('coctel_id').eq('carta_id', state.cartaActiva.id);
            state.asignadosTempo = data ? data.map(d => d.coctel_id) : [];
        } else {
            dom.form.titulo.textContent = 'Crear Nueva Carta';
            dom.form.elemento.reset();
            dom.form.id.value = '';
            state.asignadosTempo = [];
        }
        
        renderizarDualList();
        cambiarVista('formulario');
    };

    // Funciones del Selector Dual
    const renderizarDualList = () => {
        // Filtrar arrays base
        let disp = state.coctelesGlobales.filter(c => !state.asignadosTempo.includes(c.id));
        let asig = state.asignadosTempo.map(id => state.coctelesGlobales.find(c => c.id === id)).filter(Boolean);

        // Búsqueda Textual local
        if (state.filtrosDual.disp.q) disp = disp.filter(c => c.nombre.toLowerCase().includes(state.filtrosDual.disp.q));
        if (state.filtrosDual.asig.q) asig = asig.filter(c => c.nombre.toLowerCase().includes(state.filtrosDual.asig.q));

        dom.dual.contadorAsig.textContent = state.asignadosTempo.length;

        // Limpiar contenedores
        dom.dual.listaDisp.innerHTML = '';
        dom.dual.listaAsig.innerHTML = '';

        // (Nota: Para simplificar el snippet visualizamos todos los filtrados, el paginador real requiere slice)
        const limitDisp = parseInt(state.filtrosDual.disp.limit);
        const limitAsig = parseInt(state.filtrosDual.asig.limit);
        const dispPaginados = disp.slice(0, limitDisp); 
        const asigPaginados = asig.slice(0, limitAsig);

        // Pintar Disponibles
        if (dispPaginados.length === 0) dom.dual.listaDisp.innerHTML = '<div class="text-xs text-gray-600 text-center py-4">No hay resultados.</div>';
        dispPaginados.forEach(c => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800 hover:border-emerald-500/30 transition';
            div.innerHTML = `<span class="text-xs text-gray-300 truncate pr-2">${c.nombre}</span>
                             <button type="button" class="btn-agregar text-emerald-500 hover:text-white bg-emerald-950/30 px-2 py-1 rounded text-xs font-bold transition">+</button>`;
            div.querySelector('.btn-agregar').addEventListener('click', () => moverCoctel(c.id, 'asignar'));
            dom.dual.listaDisp.appendChild(div);
        });

        // Pintar Asignados
        if (asigPaginados.length === 0) dom.dual.listaAsig.innerHTML = '<div class="text-xs text-gray-600 text-center py-4">Sin asignar.</div>';
        asigPaginados.forEach(c => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-emerald-950/20 p-2 rounded border border-emerald-900/30 hover:border-red-500/30 transition group';
            div.innerHTML = `<button type="button" class="btn-quitar text-red-500 opacity-50 group-hover:opacity-100 group-hover:text-white bg-red-950/30 px-2 py-1 rounded text-xs font-bold transition mr-2">-</button>
                             <span class="text-xs text-emerald-400 truncate w-full">${c.nombre}</span>`;
            div.querySelector('.btn-quitar').addEventListener('click', () => moverCoctel(c.id, 'quitar'));
            dom.dual.listaAsig.appendChild(div);
        });
    };

    const moverCoctel = (id, accion) => {
        if (accion === 'asignar') {
            if (!state.asignadosTempo.includes(id)) state.asignadosTempo.push(id);
        } else {
            state.asignadosTempo = state.asignadosTempo.filter(cid => cid !== id);
        }
        renderizarDualList();
    };

    // --- 6. GUARDAR (INSERT / UPDATE) ---
    dom.form.elemento.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idCarta = dom.form.id.value;
        const nombreSlug = dom.form.nombre.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const cartaData = {
            nombre: dom.form.nombre.value.trim(),
            cliente_institucion: dom.form.cliente.value.trim(),
            tematica: dom.form.tematica.value.trim(),
            estado: dom.form.estado.value,
            descripcion: dom.form.descripcion.value.trim(),
            slug: idCarta ? undefined : `${nombreSlug}-${Date.now()}` // Slug solo al crear
        };

        try {
            // 1. Guardar o Actualizar Carta
            let cartaGuardada;
            if (idCarta) {
                const { data, error } = await supabase.from('cartas').update(cartaData).eq('id', idCarta).select().single();
                if (error) throw error;
                cartaGuardada = data;
            } else {
                const { data, error } = await supabase.from('cartas').insert([cartaData]).select().single();
                if (error) throw error;
                cartaGuardada = data;
            }

            // 2. Actualizar Tabla Puente (Carta <-> Cócteles)
            // Primero borramos las relaciones viejas para esta carta
            await supabase.from('carta_cocteles').delete().eq('carta_id', cartaGuardada.id);

            // Insertamos el nuevo set
            if (state.asignadosTempo.length > 0) {
                const relaciones = state.asignadosTempo.map((coctelId, idx) => ({
                    carta_id: cartaGuardada.id,
                    coctel_id: coctelId,
                    orden_aparicion: idx + 1 // Para mantener el orden visual
                }));
                const { error: errPuente } = await supabase.from('carta_cocteles').insert(relaciones);
                if (errPuente) throw errPuente;
            }

            console.log("Carta y cócteles guardados!");
            await cargarDatosIniciales(); // Refrescar matriz
            cambiarVista('listado');

        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar la carta.");
        }
    });

    // --- 7. EVENTOS DE UI (LISTENERS) ---
    // Listado
    dom.listado.buscador.addEventListener('input', (e) => { state.filtrosListado.q = e.target.value.toLowerCase(); renderizarListado(); });
    dom.listado.filtroEstado.addEventListener('change', (e) => { state.filtrosListado.estado = e.target.value; renderizarListado(); });
    dom.botones.nueva.addEventListener('click', () => abrirFormulario(false));
    
    // Detalle
    dom.botones.volver.addEventListener('click', () => cambiarVista('listado'));
    dom.botones.editar.addEventListener('click', () => abrirFormulario(true));
    dom.botones.eliminar.addEventListener('click', async () => {
        if(confirm(`¿Estás seguro de eliminar la carta "${state.cartaActiva.nombre}"?`)) {
            await supabase.from('cartas').delete().eq('id', state.cartaActiva.id);
            await cargarDatosIniciales();
            cambiarVista('listado');
        }
    });

    // Formulario
    const cerrarForm = () => state.cartaActiva ? cambiarVista('detalle') : cambiarVista('listado');
    dom.botones.cerrarForm.addEventListener('click', cerrarForm);
    dom.botones.cancelarForm.addEventListener('click', cerrarForm);

    // Dual List Controles
    dom.dual.buscarDisp.addEventListener('input', (e) => { state.filtrosDual.disp.q = e.target.value.toLowerCase(); renderizarDualList(); });
    dom.dual.buscarAsig.addEventListener('input', (e) => { state.filtrosDual.asig.q = e.target.value.toLowerCase(); renderizarDualList(); });
    dom.dual.limiteDisp.addEventListener('change', (e) => { state.filtrosDual.disp.limit = e.target.value; renderizarDualList(); });
    dom.dual.limiteAsig.addEventListener('change', (e) => { state.filtrosDual.asig.limit = e.target.value; renderizarDualList(); });

    // BOOT
    await cargarDatosIniciales();

    // INTERCEPCIÓN (Si venimos de regreso desde Cócteles a una carta específica)
    if (window.navegacionSPA && window.navegacionSPA.retornarACartaId) {
        const cartaRebote = state.cartas.find(c => c.id === window.navegacionSPA.retornarACartaId);
        if (cartaRebote) {
            abrirDetalleCarta(cartaRebote);
        }
        window.navegacionSPA = null; // Rompemos el boleto al llegar a casa
    }
}