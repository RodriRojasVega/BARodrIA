// src/modules/uxui.js

export function initUxUi() {
    console.log("Inicializando UX/UI...");
    
    // VERIFICACIÓN: ¿Existen los elementos en el DOM?
    const secciones = ['tabla', 'asignador', 'inputs', 'kpi', 'badges', 'botones'];
    secciones.forEach(sec => {
        const el = document.getElementById(`lab-seccion-${sec}`);
        console.log(`Elemento lab-seccion-${sec}:`, el ? "Encontrado" : "NO ENCONTRADO");
    });

    window.cambiarTabLab = function(tabName) {
        secciones.forEach(sec => {
            const el = document.getElementById(`lab-seccion-${sec}`);
            const btn = document.getElementById(`tab-btn-${sec}`);
            if (el && btn) {
                if (sec === tabName) {
                    el.classList.remove('hidden');
                    // Estilo activo (verde)
                    btn.className = "px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold transition whitespace-nowrap";
                } else {
                    el.classList.add('hidden');
                    // Estilo inactivo (gris)
                    btn.className = "px-2.5 py-1 rounded bg-gray-800 text-gray-300 hover:text-white transition whitespace-nowrap";
                }
            }
        });
    };
    
    // Inicializar estado inicial de pestañas
    window.cambiarTabLab('tabla');

    // 2. Definición Dinámica de Tablas
    const mockTablas = {
        insumos: {
            titulo: 'Inventario y Edición en Línea (Demo de Controles)',
            icono: '📦',
            thead: `
                <tr>
                    <th class="py-3 px-3 font-bold text-center w-10">Sel</th>
                    <th class="py-3 px-3 font-bold">Insumo ↕</th>
                    <th class="py-3 px-3 font-bold text-center">Badge</th>
                    <th class="py-3 px-3 font-bold text-center">Activo</th>
                    <th class="py-3 px-3 font-bold text-center">Stock (Núm)</th>
                    <th class="py-3 px-3 font-bold">Ubicación / Nota (Texto)</th>
                    <th class="py-3 px-3 font-bold text-right">Acciones</th>
                </tr>
            `,
            filas: `
                <tr class="hover:bg-gray-900/80 transition">
                    <td class="py-2 px-3 text-center"><input type="checkbox" class="w-3.5 h-3.5 rounded bg-gray-900 border-gray-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"></td>
                    <td class="py-2 px-3 font-semibold text-white">Ron Blanco Superior</td>
                    <td class="py-2 px-3 text-center"><span class="text-[9px] px-2 py-0.5 rounded font-bold border bg-emerald-950 text-emerald-400 border-emerald-900/40 uppercase">Activo</span></td>
                    <td class="py-2 px-3 text-center">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked class="sr-only peer">
                            <div class="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 border border-gray-700"></div>
                        </label>
                    </td>
                    <td class="py-2 px-3 text-center">
                        <input type="number" value="12" class="w-16 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-xs text-center text-white font-mono focus:outline-none focus:border-emerald-500 transition shadow-inner">
                    </td>
                    <td class="py-2 px-3">
                        <input type="text" placeholder="Ej: Barra Principal" value="Barra Piso 1" class="w-32 sm:w-40 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 transition shadow-inner placeholder-gray-600">
                    </td>
                    <td class="py-2 px-3">
                        <div class="flex items-center justify-end gap-1.5">
                            <button class="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded text-[10px] font-bold uppercase tracking-wider px-2 py-1 transition" title="Editar">Editar</button>
                            <button class="bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/50 hover:border-rose-500/50 rounded text-[10px] font-bold uppercase tracking-wider px-2 py-1 transition" title="Eliminar">Borrar</button>
                        </div>
                    </td>
                </tr>
            `,
            info: 'Mostrando 1 - 1 de 1 registros'
        },
        cocteles: {
            titulo: 'Estandarización de Cócteles',
            icono: '🍸',
            thead: `
                <tr>
                    <th class="py-3 px-3 font-bold text-center w-10">Sel</th>
                    <th class="py-3 px-3 font-bold">Nombre ↕</th>
                    <th class="py-3 px-3 font-bold">Categoría ↕</th>
                    <th class="py-3 px-3 font-bold text-center">ABV % ↕</th>
                    <th class="py-3 px-3 font-bold text-right">COGS ↕</th>
                    <th class="py-3 px-3 font-bold text-right">Precio Sugerido ↕</th>
                    <th class="py-3 px-3 font-bold text-right">Acciones</th>
                </tr>
            `,
            filas: `
                <tr class="hover:bg-gray-900/80 transition">
                    <td class="py-2.5 px-3 text-center"><input type="checkbox" class="w-3.5 h-3.5 rounded bg-gray-900 border-gray-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"></td>
                    <td class="py-2.5 px-3 font-semibold text-white">Negroni Clásico</td>
                    <td class="py-2.5 px-3 text-gray-400 font-mono text-[11px]">Digestivo / Ancestral</td>
                    <td class="py-2.5 px-3 text-center font-mono text-emerald-400">26,3%</td>
                    <td class="py-2.5 px-3 text-right font-mono text-gray-300">$1.370</td>
                    <td class="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">$10.960</td>
                    <td class="py-2.5 px-3 text-right">
                        <button class="bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/50 hover:border-emerald-500/50 rounded text-[10px] font-bold uppercase tracking-wider px-2 py-1 transition flex items-center justify-end gap-1 ml-auto">
                            Ver Ficha
                        </button>
                    </td>
                </tr>
            `,
            info: 'Mostrando 1 - 1 de 1 cócteles'
        }
    };

    // 3. Conmutador Dinámico Blindado contra nulos
    window.cambiarTipoTabla = function(tipo) {
        const datos = mockTablas[tipo];
        if (!datos) return;

        const iconEl = document.getElementById('lab-table-icon');
        const titleEl = document.getElementById('lab-table-title');
        const theadEl = document.getElementById('lab-thead-content');
        const tbodyEl = document.getElementById('lab-tbody-content');
        const infoEl = document.getElementById('lab-table-info');

        if (iconEl) iconEl.textContent = datos.icono;
        if (titleEl) titleEl.textContent = datos.titulo;
        if (theadEl) theadEl.innerHTML = datos.thead;
        if (tbodyEl) tbodyEl.innerHTML = datos.filas;
        if (infoEl) infoEl.textContent = datos.info;

        ['cocteles', 'insumos'].forEach(t => {
            const b = document.getElementById(`btn-t-${t}`);
            if (b) {
                if (t === tipo) {
                    b.className = "px-2.5 py-1 rounded bg-gray-800 text-emerald-400 text-xs font-mono font-bold transition";
                } else {
                    b.className = "px-2.5 py-1 rounded bg-gray-900 text-gray-400 text-xs font-mono hover:text-white transition";
                }
            }
        });
    };

    // Inicializar mostrando la tabla de Insumos con seguridad
    setTimeout(() => {
        window.cambiarTipoTabla('insumos');
    }, 10);
}