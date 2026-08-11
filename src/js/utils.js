// src/js/utils.js
export function formatearMonedaLocal(valor, decimales = 4) {
    const numero = Number(valor || 0);
    const partes = numero.toFixed(decimales).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return partes.join(',');
}
window.formatearMonedaLocal = formatearMonedaLocal;