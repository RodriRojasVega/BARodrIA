// src/modules/uxui.js

export function initUxUi() {
    console.log("Módulo UX/UI Inicializado (Sin barra de prototipo)");

    const datosMock = [
        { id: 1, nombre: 'Ron Blanco Superior', tipo: 'Destilado', estado: 'Activo', costo: 14500 },
        { id: 2, nombre: 'Jarabe de Goma Artesanal', tipo: 'Sub-receta', estado: 'Producción', costo: 1200 },
        { id: 3, nombre: 'Gin London Dry', tipo: 'Destilado', estado: 'Activo', costo: 18900 },
        { id: 4, nombre: 'Jugo de Limón Sutil', tipo: 'Fruta Fresca', estado: 'Crítico', costo: 2500 },
        { id: 5, nombre: 'Vermouth Rosso', tipo: 'Licor / Vino', estado: 'Activo', costo: 9800 },
        { id: 6, nombre: 'Bitter Angostura', tipo: 'Modificador', estado: 'Activo', costo: 22000 },
        { id: 7, nombre: 'Puré de Maracuyá', tipo: 'Sub-receta', estado: 'Producción', costo: 4500 },
        { id: 8, nombre: 'Vodka Premium', tipo: 'Destilado', estado: 'Activo', costo: 16000 }
    ];

    let estadoTabla = {
        busqueda: '',
        limite: 10,
        pagina: 1,
        columnaOrden: 'nombre',
        ascendente: true
    };

    const cuerpoTabla = document.getElementById('uxui-tabla-cuerpo');
    const infoPaginador = document.getElementById('uxui-info-paginacion');
    const numPaginaEl = document.getElementById('uxui-num-pagina');
    const inputBuscador = document.getElementById('uxui-buscador');
    const selectLimite = document.getElementById('uxui-limite');
    const btnPrev = document.getElementById('uxui-btn-prev');
    const btnNext = document.getElementById('uxui-btn-next');

    function renderizarTabla() {
        let filtrados = datosMock.filter(item => 
            item.nombre.toLowerCase().includes(estadoTabla.busqueda) || 
            item.tipo.toLowerCase().includes(estadoTabla.busqueda)
        );

        filtrados.sort((a, b) => {
            let valA = a[estadoTabla.columnaOrden];
            let valB = b[estadoTabla.columnaOrden];
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
            return estadoTabla.ascendente ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });

        const total = filtrados.length;
        const totalPaginas = Math.ceil(total / estadoTabla.limite) || 1;
        if (estadoTabla.pagina > totalPaginas) estadoTabla.pagina = totalPaginas;
        if (estadoTabla.pagina < 1) estadoTabla.pagina = 1;
        
        const inicio = (estadoTabla.pagina - 1) * estadoTabla.limite;
        const paginaItems = filtrados.slice(inicio, inicio + estadoTabla.limite);

        cuerpoTabla.innerHTML = '';
        if (paginaItems.length === 0) {
            cuerpoTabla.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500 font-mono">No se encontraron registros.</td></tr>`;
        } else {
            paginaItems.forEach(item => {
                const badgeColor = item.estado === 'Activo' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/30' : 'bg-amber-950 text-amber-400 border-amber-900/30';
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-900/80 transition border-b border-gray-900 cursor-pointer';
                tr.innerHTML = `
                    <td class="py-2.5 px-3 font-semibold text-white">${item.nombre}</td>
                    <td class="py-2.5 px-3 text-gray-400 font-mono text-[11px]">${item.tipo}</td>
                    <td class="py-2.5 px-3 text-center">
                        <span class="text-[9px] px-2 py-0.5 rounded font-bold border uppercase tracking-wider ${badgeColor}">${item.estado}</span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">$${item.costo.toLocaleString('es-CL')}</td>
                    <td class="py-2.5 px-3 text-center">
                        <button class="px-2 py-1 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded text-[10px] font-mono transition">Ver</button>
                    </td>
                `;
                cuerpoTabla.appendChild(tr);
            });
        }

        infoPaginador.textContent = `Mostrando ${total === 0 ? 0 : inicio + 1} - ${Math.min(inicio + estadoTabla.limite, total)} de ${total}`;
        numPaginaEl.textContent = `${estadoTabla.pagina} / ${totalPaginas}`;
        btnPrev.disabled = estadoTabla.pagina === 1;
        btnNext.disabled = estadoTabla.pagina === totalPaginas;
    }

    inputBuscador.addEventListener('input', (e) => {
        estadoTabla.busqueda = e.target.value.toLowerCase();
        estadoTabla.pagina = 1;
        renderizarTabla();
    });

    selectLimite.addEventListener('change', (e) => {
        estadoTabla.limite = parseInt(e.target.value);
        estadoTabla.pagina = 1;
        renderizarTabla();
    });

    btnPrev.addEventListener('click', () => {
        if (estadoTabla.pagina > 1) {
            estadoTabla.pagina--;
            renderizarTabla();
        }
    });

    btnNext.addEventListener('click', () => {
        const totalPaginas = Math.ceil(datosMock.length / estadoTabla.limite) || 1;
        if (estadoTabla.pagina < totalPaginas) {
            estadoTabla.pagina++;
            renderizarTabla();
        }
    });

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', (e) => {
            const col = e.currentTarget.getAttribute('data-sort');
            if (estadoTabla.columnaOrden === col) {
                estadoTabla.ascendente = !estadoTabla.ascendente;
            } else {
                estadoTabla.columnaOrden = col;
                estadoTabla.ascendente = true;
            }
            renderizarTabla();
        });
    });

    renderizarTabla();
}