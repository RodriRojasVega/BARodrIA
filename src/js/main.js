// src/js/main.js
import './utils.js'; // Esto asegura que las utilidades globales estén listas en todo el sistema

const MODULO_PATHS = {
    dashboard: './modules/dashboard.js',
    catalogos: './modules/catalogos.js',
    insumos: './modules/insumos.js',
    subrecetas: './modules/subrecetas.js',
    cocteles: './modules/cocteles.js',
    servicio: './modules/servicio.js',
    proveedores: './modules/proveedores.js',
};

const INIT_MODULOS = {
    dashboard: 'initDashboard',
    catalogos: 'initCatalogos',
    insumos: 'initInsumos',
    subrecetas: 'initSubRecetas',
    cocteles: 'initCocteles',
    servicio: 'initServicio',
    proveedores: 'initProveedores',
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("Motor Modular SPA Iniciado");

    const appContent = document.getElementById('app-content');
    
    function inicializarClicksNav() {
        const navButtons = document.querySelectorAll('.btn-nav');
        navButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        document.querySelectorAll('.btn-nav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vista = e.currentTarget.getAttribute('data-view');
                if (vista) cargarVista(vista);
            });
        });
    }

    async function cargarModulo(vista) {
        const ruta = MODULO_PATHS[vista];
        if (!ruta) return;

        try {
            const modulo = await import(ruta);
            const initFn = modulo[INIT_MODULOS[vista]] ?? modulo.default;
            if (typeof initFn === 'function') {
                await initFn();
            }
        } catch (err) {
            console.error(`Error al importar o inicializar el módulo [${vista}]:`, err);
            throw new Error(`No se pudo cargar el script del módulo ${vista}. Verifique rutas relativas o red.`);
        }
    }

    async function cargarVista(vista) {
        try {
            appContent.innerHTML = `<div class="text-center mt-20 text-emerald-500 font-mono animate-pulse">Cargando módulo ${vista}...</div>`;

            // CORRECCIÓN CRÍTICA: Usar la variable ${vista} de forma dinámica, no hardcodeada
            const response = await fetch(`./src/views/view-${vista}.html?v=${Date.now()}`);
            if (!response.ok) throw new Error(`Módulo no encontrado: view-${vista}.html`);

            appContent.innerHTML = await response.text();
            
            // Damos un respiro al DOM para que pinte las etiquetas antes de inicializar el JS
            await new Promise(resolve => setTimeout(resolve, 50));

            await cargarModulo(vista);
            actualizarMenuActivo(vista);

        } catch (error) {
            console.error("Error de ruteo:", error);
            appContent.innerHTML = `<div class="text-red-400 p-6 bg-red-950/20 border border-red-900 rounded text-center mt-10 font-mono">Error 404: ${error.message}</div>`;
        }
    }

    function actualizarMenuActivo(vistaActiva) {
        const actualNavButtons = document.querySelectorAll('.btn-nav');
        actualNavButtons.forEach(btn => {
            if (btn.getAttribute('data-view') === vistaActiva) {
                btn.className = "btn-nav w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition bg-emerald-500/10 text-emerald-400";
            } else {
                btn.className = "btn-nav w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition";
            }
        });
    }

    inicializarClicksNav();
    cargarVista('dashboard');
});