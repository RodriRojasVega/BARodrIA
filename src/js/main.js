// src/js/main.js
import './utils.js'; // Esto asegura que las utilidades globales estén listas en todo el sistema

document.addEventListener("DOMContentLoaded", () => {
    console.log("Motor Modular SPA Iniciado");

    const appContent = document.getElementById('app-content');
    const navButtons = document.querySelectorAll('.btn-nav');

    async function cargarVista(vista) {
        try {
            appContent.innerHTML = `<div class="text-center mt-20 text-emerald-500 font-mono animate-pulse">Cargando módulo ${vista}...</div>`;
            
            // 1. Buscamos en la nueva carpeta 'views'
            const response = await fetch(`./src/views/view-${vista}.html`);
            if (!response.ok) throw new Error(`Módulo no encontrado: view-${vista}.html`);
            
            appContent.innerHTML = await response.text();

            // 2. Buscamos la lógica en la nueva carpeta 'modules'
            if (vista === 'catalogos') {
                const modulo = await import('./modules/catalogos.js');
                modulo.initCatalogos();
            } else if (vista === 'insumos') {
                const modulo = await import('./modules/insumos.js');
                modulo.initInsumos();
            } else if (vista === 'subrecetas') {
                const modulo = await import('./modules/subrecetas.js');
                modulo.initSubRecetas();
            } else if (vista === 'cocteles') {
                const modulo = await import('./modules/cocteles.js');
                modulo.initCocteles();
            } else if (vista === 'servicio') {
                const modulo = await import('./modules/servicio.js');
                modulo.initServicio();
            } else if (vista === 'proveedores') { // <--- AÑADIDO AQUÍ
                const modulo = await import('./modules/proveedores.js');
                if (typeof modulo.inicializarModuloProveedores === 'function') {
                    modulo.inicializarModuloProveedores();
                } else if (typeof modulo.default === 'function') {
                    modulo.default();
                }
            }

            actualizarMenuActivo(vista);

        } catch (error) {
            console.error("Error de ruteo:", error);
            appContent.innerHTML = `<div class="text-red-400 p-6 bg-red-950/20 border border-red-900 rounded text-center mt-10 font-mono">Error 404: ${error.message}</div>`;
        }
    }

    function actualizarMenuActivo(vistaActiva) {
        // Seleccionamos dinámicamente los botones por si se actualizó el DOM
        const actualNavButtons = document.querySelectorAll('.btn-nav');
        actualNavButtons.forEach(btn => {
            if (btn.getAttribute('data-view') === vistaActiva) {
                btn.className = "btn-nav w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition bg-emerald-500/10 text-emerald-400";
            } else {
                btn.className = "btn-nav w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition";
            }
        });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => cargarVista(e.currentTarget.getAttribute('data-view')));
    });

    cargarVista('dashboard');
});