// src/modules/uikit/sections/AsignadorSection.tsx
import { useState } from 'react';
import { DualAsignador } from '@/components/ui/DualAsignador';

export function AsignadorSection() {
  const [buscadorAsig, setBuscadorAsig] = useState('');
  const [buscadorDisp, setBuscadorDisp] = useState('');

  return (
    <div className="p-4 space-y-4">
      <DualAsignador
        tituloIzq="Asignados"
        contadorIzq={0}
        valorBusquedaIzq={buscadorAsig}
        onChangeBusquedaIzq={val => setBuscadorAsig(val)} // Corregido el nombre y el parámetro val
        tituloDer="Disponibles"
        valorBusquedaDer={buscadorDisp}
        onChangeBusquedaDer={val => setBuscadorDisp(val)}  // Corregido el nombre y el parámetro val
        childrenIzq={<div className="p-4 text-xs text-muted">Sin datos</div>}
        childrenDer={<div className="p-4 text-xs text-muted">Sin datos</div>}
      />
    </div>
  );
}