// src/modules/insumos/components/InsumosForm.tsx
import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Search, Edit3 } from 'lucide-react';
import { calcularCostoUnitarioInsumo } from '@/lib/calculos';

// Tipos desde la fuente de verdad
import type { Insumo, TipoInsumo } from '@/types/insumos';
import type { Proveedor } from '@/types/proveedores';

// Componentes del UI Kit Maestro 2.0
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DualAsignador } from '@/components/ui/DualAsignador';

export interface InsumoPayload {
  nombre: string;
  tipo_id: string;
  unidad_medida: string;
  formato_envase: number;
  precio_compra: number;
  graduacion_alcohol_base: number;
  rendimiento_neto_porcentaje: number;
  es_artesanal: boolean;
}

interface Props {
  insumoAEditar: Insumo | null;
  tipos: TipoInsumo[];
  proveedores: Proveedor[];
  guardando: boolean;
  onVolver: () => void;
  onGuardar: (payload: InsumoPayload, provsAsociados: Map<number, number | null>) => void;
}

export function InsumosForm({ insumoAEditar, tipos, proveedores, guardando, onVolver, onGuardar }: Props) {
  const [formData, setFormData] = useState({
    nombre: '', 
    tipo_id: tipos[0]?.id.toString() || '', 
    unidad_medida: 'ml',
    formato_envase: 750 as number | string, 
    precio_compra: 0 as number | string, 
    graduacion_alcohol_base: 0 as number | string, 
    rendimiento_neto_porcentaje: 100 as number | string, 
    es_artesanal: false
  });
  
  const [proveedoresAsociados, setProveedoresAsociados] = useState<Map<number, number | null>>(new Map());
  const [busquedaDisponibles, setBusquedaDisponibles] = useState('');
  const [busquedaAsignados, setBusquedaAsignados] = useState('');

  useEffect(() => {
    if (insumoAEditar) {
      setFormData({
        nombre: insumoAEditar.nombre, 
        tipo_id: insumoAEditar.tipo_id?.toString() || '',
        unidad_medida: insumoAEditar.unidad_medida || 'ml', 
        formato_envase: insumoAEditar.formato_envase, 
        precio_compra: insumoAEditar.precio_compra, 
        graduacion_alcohol_base: insumoAEditar.graduacion_alcohol_base,
        rendimiento_neto_porcentaje: insumoAEditar.rendimiento_neto_porcentaje ? Number(insumoAEditar.rendimiento_neto_porcentaje) * 100 : 100,
        es_artesanal: !!insumoAEditar.es_artesanal
      });
      const mapaProv = new Map<number, number | null>();
      insumoAEditar.proveedores?.forEach(p => mapaProv.set(p.proveedor_id, p.precio_oferta ? Number(p.precio_oferta) : null));
      setProveedoresAsociados(mapaProv);
    }
  }, [insumoAEditar]);

  const costoCalculadoActual = useMemo(() => {
    const pCompra = Number(formData.precio_compra) || 0;
    const fEnvase = Number(formData.formato_envase) || 1;
    const rPorcentaje = Number(formData.rendimiento_neto_porcentaje) || 100;
    const costoBase = calcularCostoUnitarioInsumo(pCompra, fEnvase);
    return costoBase / ((rPorcentaje / 100) > 0 ? (rPorcentaje / 100) : 1);
  }, [formData.precio_compra, formData.formato_envase, formData.rendimiento_neto_porcentaje]);

  const proveedoresDisponibles = useMemo(() => proveedores
      .filter(p => !proveedoresAsociados.has(p.id))
      .filter(p => p.nombre.toLowerCase().includes(busquedaDisponibles.toLowerCase())), 
  [proveedores, proveedoresAsociados, busquedaDisponibles]);

  const proveedoresAsignados = useMemo(() => proveedores
      .filter(p => proveedoresAsociados.has(p.id))
      .filter(p => p.nombre.toLowerCase().includes(busquedaAsignados.toLowerCase())), 
  [proveedores, proveedoresAsociados, busquedaAsignados]);

  const agregarProveedor = (id: number) => { 
    setProveedoresAsociados(prev => new Map(prev).set(id, null)); 
  };
  
  const removerProveedor = (id: number) => { 
    const mapa = new Map(proveedoresAsociados); 
    mapa.delete(id); 
    setProveedoresAsociados(mapa); 
  };
  
  const actualizarPrecioProveedor = (id: number, val: string) => { 
    setProveedoresAsociados(prev => new Map(prev).set(id, val === '' ? null : Number(val))); 
  };

  /*const aplicarMejorOferta = () => {
    let mejorPrecio: number | null = null;
    proveedoresAsociados.forEach(oferta => {
      if (oferta !== null && !isNaN(oferta) && oferta > 0) {
        if (mejorPrecio === null || oferta < mejorPrecio) mejorPrecio = oferta;
      }
    });
    if (mejorPrecio === null) {
      alert("Ninguno de los proveedores asignados tiene un precio válido definido.");
      return;
    }
    setFormData(prev => ({ ...prev, precio_compra: mejorPrecio! }));
  };*/

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      ...formData,
      formato_envase: Number(formData.formato_envase),
      precio_compra: Number(formData.precio_compra),
      graduacion_alcohol_base: Number(formData.graduacion_alcohol_base),
      rendimiento_neto_porcentaje: Number(formData.rendimiento_neto_porcentaje),
    }, proveedoresAsociados);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-full w-full bg-background p-4 md:p-6 animate-fade-in space-y-6">
      <ModuleHeader 
        icon={<Edit3 size={20} />}
        title={insumoAEditar ? `Editar Insumo: ${insumoAEditar.nombre}` : 'Nuevo Insumo'}
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onVolver}>Volver</Button>
            <Button type="submit" variant="primary" size="sm" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Insumo'}
            </Button>
          </div>
        }
      />

      <div className="space-y-6 flex-1">
        <Input 
          label="Nombre del Insumo"
          type="text" 
          required 
          value={formData.nombre} 
          onChange={(e: any) => setFormData({...formData, nombre: e.target.value})}
          placeholder="Ej. Gin London Dry"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select 
            label="Tipo de Insumo"
            value={formData.tipo_id} 
            onChange={(e: any) => setFormData({...formData, tipo_id: e.target.value})}
          >
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Select>

          <Input 
            label="Graduación (% ABV)"
            type="number" 
            step="0.1" 
            value={formData.graduacion_alcohol_base} 
            onChange={(e: any) => setFormData({...formData, graduacion_alcohol_base: e.target.value})}
          />

          <div className="bg-primary/5 border border-primary/20 px-4 rounded-xl flex items-center gap-3 h-[42px]">
            <input 
              type="checkbox" 
              disabled={!!insumoAEditar} 
              checked={formData.es_artesanal} 
              onChange={e => setFormData({...formData, es_artesanal: e.target.checked})} 
              className="w-4 h-4 rounded bg-surface border-border accent-primary cursor-pointer shrink-0" 
            />
            <label className="text-xs text-primary font-bold uppercase tracking-wider truncate">
              ¿Producción Propia? {!!insumoAEditar && <span className="text-muted italic ml-1">(Inmutable)</span>}
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">Formato de Compra y Costeo</span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <Input 
              label="Total Compra ($)"
              type="number" 
              step="any" 
              required 
              value={formData.precio_compra} 
              onChange={(e: any) => setFormData({...formData, precio_compra: e.target.value})}
            />
            <Select 
              label="Unidad Base"
              value={formData.unidad_medida} 
              onChange={(e: any) => setFormData({...formData, unidad_medida: e.target.value})}
            >
              <option value="ml">Mililitros (ml)</option>
              <option value="g">Gramos (g)</option>
              <option value="unit">Unidades (unit)</option>
            </Select>
            <Input 
              label="Formato / Envase"
              type="number" 
              step="any" 
              required 
              value={formData.formato_envase} 
              onChange={(e: any) => setFormData({...formData, formato_envase: e.target.value})}
            />
            <Input 
              label="Rendimiento (%)"
              type="number" 
              step="1" 
              value={formData.rendimiento_neto_porcentaje} 
              onChange={(e: any) => setFormData({...formData, rendimiento_neto_porcentaje: e.target.value})} 
            />
          </div>

          <div className="flex justify-between items-center text-xs bg-surface p-3 rounded-lg border border-border mt-2">
            <span className="text-muted uppercase font-bold tracking-wider">Costo Unitario Resultante:</span>
            <span className="font-mono font-bold text-primary text-sm">${costoCalculadoActual.toFixed(4)} / {formData.unidad_medida}</span>
          </div>
        </div>

        {!formData.es_artesanal && (
          <DualAsignador
            tituloIzq="Proveedores Asignados"
            contadorIzq={proveedoresAsignados.length}
            valorBusquedaIzq={busquedaAsignados}
            onChangeBusquedaIzq={setBusquedaAsignados}
            valorBusquedaDer={busquedaDisponibles}
            onChangeBusquedaDer={setBusquedaDisponibles}
            tituloDer="Proveedores Disponibles"
            childrenDer={
              proveedoresDisponibles.map(p => (
                <div key={p.id} className="flex justify-between items-center p-2">
                  <span className="text-sm">{p.nombre}</span>
                  <Button type="button" variant="secondary" size="sm" onClick={() => agregarProveedor(p.id)}>Añadir</Button>
                </div>
              ))
            }
            childrenIzq={
              proveedoresAsignados.map(p => (
                <div key={p.id} className="flex gap-2">
                   <Input 
                    placeholder="Precio" 
                    value={(proveedoresAsignados as any).get?.(p.id) ?? ''}
                    onChange={(e: any) => actualizarPrecioProveedor(p.id, e.target.value)}
                   />
                   <Button type="button" variant="inline-danger" onClick={() => removerProveedor(p.id)}><Trash2 size={16}/></Button>
                </div>
              ))
            }
          />
        )}
      </div>
    </form>
  );
}