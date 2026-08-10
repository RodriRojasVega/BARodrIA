// src/js/modules/servicio.js
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
        console.error("Error al cargar datos para Modo Servicio");
        listaCoctelesLocal = [];
        listaCoctelPasosLocal = [];
    }
}

function poblarSelectorServicio() {
    const selector = document.getElementById('selector-coctel-servicio');
    if (!selector) return;

    if (listaCoctelesLocal.length === 0) {
        selector.innerHTML = `<option value="">No hay cócteles en la base de datos</option>`;
        return;
    }

    selector.innerHTML = `<option value="" disabled selected>-- Selecciona un cóctel --</option>` + 
        listaCoctelesLocal.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

window.cargarModoServicio = function(coctelId) { alert("Servicio listo para conectarse a Supabase"); }
window.togglePaso = function(elemento) { /* Lógica de checkbox visual */ }
window.reiniciarChecklist = function() { /* Limpieza de checklist */ }

// Lógica del Temporizador de Barra Intacta
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
            if (audio) audio.play().catch(() => {});
            
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