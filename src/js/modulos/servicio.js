// src/js/modulos/servicio.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listaCoctelesLocal = [];
let listaCoctelPasosLocal = [];
let intervaloReloj;

export async function initServicio() {
    await obtenerDatosServicio();
    poblarSelectorServicio();
}

async function obtenerDatosServicio() {
    try {
        const resCocteles = await fetch(`${SUPABASE_URL}/rest/v1/cocteles?select=*&order=nombre.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});
        const resPasos = await fetch(`${SUPABASE_URL}/rest/v1/coctel_pasos_preparacion?select=*&order=numero_paso.asc`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }});

        if (!resCocteles.ok) throw new Error("Offline");
        listaCoctelesLocal = await resCocteles.json();
        listaCoctelPasosLocal = await resPasos.json();
    } catch (e) {
        // Fallback a los datos en caché de las otras pestañas o semillas quemadas
        listaCoctelesLocal = window.__local_db_cocteles || [
            { id: 1, nombre: "Sour Para Tres" },
            { id: 2, nombre: "Vesper Pressure" }
        ];
        listaCoctelPasosLocal = window.__local_db_coctel_pasos || [
            { id: 1, coctel_id: 1, numero_paso: 1, descripcion: "Pre-enfriar la copa Coupette.", es_critico: false },
            { id: 2, coctel_id: 1, numero_paso: 2, descripcion: "Dry Shake sin hielo por 20 segundos.", es_critico: true },
            { id: 3, coctel_id: 1, numero_paso: 3, descripcion: "Shake térmico con hielo roca 15 segundos.", es_critico: true },
            { id: 7, coctel_id: 2, numero_paso: 1, descripcion: "Refrescar ingredientes en vaso Collins.", es_critico: false }
        ];
    }
}

function poblarSelectorServicio() {
    const selector = document.getElementById('selector-coctel-servicio');
    if (!selector) return;

    selector.innerHTML = `<option value="" disabled selected>-- Selecciona un cóctel para iniciar --</option>` + 
        listaCoctelesLocal.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    // Autocargar el primero si existe
    if (listaCoctelesLocal.length > 0) {
        selector.value = listaCoctelesLocal[0].id;
        window.cargarModoServicio(listaCoctelesLocal[0].id);
    }
}

// Expuestas globalmente para los botones HTML
window.cargarModoServicio = function(coctelId) {
    window.cancelarCronometro(); // Limpiar reloj si se cambia de trago
    const coctel = listaCoctelesLocal.find(x => x.id == coctelId);
    if (!coctel) return;

    document.getElementById('modo-servicio-nombre').textContent = coctel.nombre;
    const pasos = listaCoctelPasosLocal.filter(p => p.coctel_id == coctelId).sort((a,b) => a.numero_paso - b.numero_paso);
    const checklist = document.getElementById('checklist-servicio');

    if (pasos.length === 0) {
        checklist.innerHTML = `<div class="text-center text-gray-500 text-sm py-8 bg-gray-800/20 rounded-lg border border-gray-850">Este cóctel no tiene pasos operativos registrados en la matriz.</div>`;
        return;
    }

    checklist.innerHTML = pasos.map(paso => {
        const colorFondo = paso.es_critico ? 'bg-red-950/20 border-red-900/30 hover:bg-red-950/30' : 'bg-gray-800/30 border-gray-850 hover:bg-gray-800/60';
        const textPaso = paso.es_critico ? 'text-red-400 font-bold' : 'text-gray-500';
        const accentColor = paso.es_critico ? 'accent-red-500' : 'accent-emerald-500';
        
        let timerBtn = '';
        if (paso.es_critico && paso.descripcion.toLowerCase().includes('dry shake')) {
            timerBtn = `<button onclick="event.stopPropagation(); iniciarCronometro(20)" class="mt-2 inline-flex bg-red-500 hover:bg-red-600 text-gray-950 font-bold px-3 py-1.5 rounded text-xs transition uppercase font-mono tracking-wider">⏱ Iniciar 20s Dry</button>`;
        } else if (paso.es_critico && paso.descripcion.toLowerCase().includes('shake')) {
            timerBtn = `<button onclick="event.stopPropagation(); iniciarCronometro(15)" class="mt-2 inline-flex bg-red-500 hover:bg-red-600 text-gray-950 font-bold px-3 py-1.5 rounded text-xs transition uppercase font-mono tracking-wider">⏱ Iniciar 15s Shake</button>`;
        }

        return `
            <div class="flex gap-4 items-start p-4 rounded-lg border ${colorFondo} transition cursor-pointer" onclick="togglePaso(this)">
                <input type="checkbox" class="mt-1 h-5 w-5 ${accentColor} rounded bg-gray-800 border-gray-700">
                <div class="flex-1">
                    <span class="text-[10px] ${textPaso} font-mono uppercase tracking-widest block mb-1">PASO ${paso.numero_paso} ${paso.es_critico ? '⚠️ ALERTA CRÍTICA' : ''}</span>
                    <p class="text-sm ${paso.es_critico ? 'text-red-200' : 'text-gray-200'} leading-relaxed">${paso.descripcion}</p>
                    ${timerBtn}
                </div>
            </div>
        `;
    }).join('');
}

window.togglePaso = function(elemento) {
    const checkbox = elemento.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) elemento.classList.add('opacity-40', 'bg-gray-950');
    else elemento.classList.remove('opacity-40', 'bg-gray-950');
}

window.reiniciarChecklist = function() {
    document.querySelectorAll('#checklist-servicio input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.flex').classList.remove('opacity-40', 'bg-gray-950');
    });
}

// Lógica del Temporizador de Barra
window.iniciarCronometro = function(segundos) {
    clearInterval(intervaloReloj);
    const reloj = document.getElementById('reloj-pantalla');
    const etiqueta = document.getElementById('reloj-etiqueta');
    
    etiqueta.textContent = segundos === 20 ? "🔥 AGITANDO EN SECO (DRY SHAKE)" : "❄️ ENFRIAMIENTO (SHAKE TÉRMICO)";
    etiqueta.className = "text-xs text-red-400 font-bold uppercase tracking-widest mt-2";
    reloj.className = "text-6xl font-bold font-mono text-red-500 animate-pulse";

    let tiempoRestante = segundos;
    reloj.textContent = `00:${tiempoRestante.toString().padStart(2, '0')}`;

    intervaloReloj = setInterval(() => {
        tiempoRestante--;
        if (tiempoRestante >= 0) {
            reloj.textContent = `00:${tiempoRestante.toString().padStart(2, '0')}`;
        } else {
            clearInterval(intervaloReloj);
            const audio = document.getElementById('sonido-alarma');
            if (audio) audio.play().catch(() => console.log("Interacción de usuario requerida para reproducir audio."));
            
            reloj.textContent = "LISTO!";
            reloj.className = "text-6xl font-bold font-mono text-emerald-400";
            etiqueta.textContent = "⏱️ TIEMPO DE COPA COMPLETADO";
            etiqueta.className = "text-xs text-emerald-400 font-semibold uppercase tracking-widest mt-2";
        }
    }, 1000);
}

window.cancelarCronometro = function() {
    clearInterval(intervaloReloj);
    const reloj = document.getElementById('reloj-pantalla');
    const etiqueta = document.getElementById('reloj-etiqueta');
    if (reloj) {
        reloj.textContent = "00:00";
        reloj.className = "text-6xl font-bold font-mono text-emerald-400";
    }
    if (etiqueta) {
        etiqueta.textContent = "Reloj Libre";
        etiqueta.className = "text-xs text-gray-500 uppercase tracking-widest mt-2";
    }
}