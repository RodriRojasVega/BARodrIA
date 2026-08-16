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
    cartas: './modules/cartas.js', // <-- NUEVA LÍNEA
    uxui: './modules/uxui.js', // <-- NUEVA RUTA
};

const INIT_MODULOS = {
    dashboard: 'initDashboard',
    catalogos: 'initCatalogos',
    insumos: 'initInsumos',
    subrecetas: 'initSubRecetas',
    cocteles: 'initCocteles',
    servicio: 'initServicio',
    proveedores: 'initProveedores',
    cartas: 'initCartas', // <-- NUEVA LÍNEA
    uxui: 'initUxUi', // <-- NUEVA FUNCIÓN INICIALIZADORA
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

            // Forzamos al navegador a no usar caché local
            const response = await fetch(`./src/views/view-${vista}.html?v=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Módulo no encontrado: view-${vista}.html`);

            let textoHTML = await response.text();
            
            // LA MAGIA: Filtramos y eliminamos el script intrusivo de Live Server si existe
            textoHTML = textoHTML.replace(/<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi, '');
            
            appContent.innerHTML = textoHTML; // Inyectamos el código 100% puro
            
            // Esperamos a que el navegador dibuje el DOM completo
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

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