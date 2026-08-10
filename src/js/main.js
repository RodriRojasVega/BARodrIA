// src/js/main.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("Motor Modular Iniciado");

    const appContent = document.getElementById('app-content');
    const navButtons = document.querySelectorAll('.btn-nav');

    // Función principal de enrutamiento
    async function cargarVista(vista) {
        try {
            // Mostrar estado de carga
            appContent.innerHTML = `<div class="text-center mt-20 text-emerald-500 font-mono animate-pulse">Cargando módulo ${vista}...</div>`;
            
            // Petición del archivo físico HTML
            const response = await fetch(`./src/vistas/vista-${vista}.html`);
            
            if (!response.ok) throw new Error('Módulo no encontrado en desarrollo');
            
            // Inyectar el HTML
            const html = await response.text();
            appContent.innerHTML = html;

            // ---> NUEVO: Lógica de carga condicional
            if (vista === 'catalogos') {
                const modulo = await import('./modulos/catalogos.js');
                modulo.initCatalogos();
            } else if (vista === 'insumos') {
                const modulo = await import('./modulos/insumos.js');
                modulo.initInsumos();
            } else if (vista === 'subrecetas') {
                const modulo = await import('./modulos/subrecetas.js');
                modulo.initSubrecetas();
            } else if (vista === 'cocteles') {
                const modulo = await import('./modulos/cocteles.js');
                modulo.initCocteles();
            } else if (vista === 'servicio') {
                const modulo = await import('./modulos/servicio.js');
                modulo.initServicio();
            }

            // Actualizar estilos visuales del menú
            actualizarMenuActivo(vista);

        } catch (error) {
            console.error("Error real capturado:", error); // Esto lo enviará a tu consola
            appContent.innerHTML = `
                <div class="bg-red-950/20 border border-red-500/50 p-6 rounded-xl text-red-400 text-center mt-10">
                    <span class="text-3xl block mb-2">⚠️</span>
                    <h2 class="font-bold font-mono text-lg mb-2">Error de Ejecución</h2>
                    <p class="text-sm text-gray-300">El sistema encontró el archivo HTML, pero falló al cargar su lógica.</p>
                    <p class="text-xs text-red-300 mt-4 bg-red-950/40 p-2 rounded border border-red-900/50 font-mono">${error.message}</p>
                </div>`;
        }
    }

    // Cambiar clases CSS del menú activo
    function actualizarMenuActivo(vistaActiva) {
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-view') === vistaActiva) {
                btn.className = "btn-nav w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition bg-emerald-500/10 text-emerald-400";
            } else {
                btn.className = "btn-nav w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition";
            }
        });
    }

    // Escuchar los clics del menú
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vista = e.currentTarget.getAttribute('data-view');
            cargarVista(vista);
        });
    });

    // Cargar Dashboard por defecto al entrar
    cargarVista('dashboard');
});