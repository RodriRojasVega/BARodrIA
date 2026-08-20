// src/modules/proveedores/components/ProveedoresForm.tsx
import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import type { Proveedor, InsumoGlobal } from '../types';

// Componentes del UI Kit Maestro 2.0
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DualAsignador } from '@/components/ui/DualAsignador';

interface Props {
  provAEditar: Proveedor | null;
  insumosGlobales: InsumoGlobal[];
  guardando: boolean;
  onVolver: () => void;
  onGuardar: (payload: any, insumosTempo: { insumo_id: number; precio_oferta: number }[]) => void;
}

export function ProveedoresForm({ provAEditar, insumosGlobales, guardando, onVolver, onGuardar }: Props) {
  const [formData, setFormData] = useState({
    nombre: '', contacto: '', telefono: '', email: '', observaciones: ''
  });
  
  // Solución UX numérica: permitimos string temporalmente para evitar el bloqueo del 0 al borrar
  const [insumosTempo, setInsumosTempo] = useState<{ insumo_id: number; precio_oferta: number | string }[]>([]);
  const [buscadorDisp, setBuscadorDisp] = useState('');
  const [buscadorAsig, setBuscadorAsig] = useState('');

  useEffect(() => {
    if (provAEditar) {
      setFormData({
        nombre: provAEditar.nombre,
        contacto: provAEditar.contacto || '',
        telefono: provAEditar.telefono || '',
        email: provAEditar.email || '',
        observaciones: provAEditar.observaciones || ''
      });
      setInsumosTempo(provAEditar.insumos.map(r => ({ 
        insumo_id: r.insumo_id, 
        precio_oferta: r.precio_oferta !== null ? r.precio_oferta : 0 
      })));
    }
  }, [provAEditar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Conversión final estricta a Number antes de enviar al hook
    const payloadLimpio = insumosTempo.map(item => ({
      insumo_id: item.insumo_id,
      precio_oferta: item.precio_oferta === '' || isNaN(Number(item.precio_oferta)) ? 0 : Number(item.precio_oferta)
    }));
    onGuardar(formData, payloadLimpio);
  };

  const insumosDisponibles = useMemo(() => {
    const seleccionadosIds = new Set(insumosTempo.map(i => i.insumo_id));
    return insumosGlobales
      .filter(ins => !seleccionadosIds.has(ins.id))
      .filter(ins => ins.nombre.toLowerCase().includes(buscadorDisp.toLowerCase()));
  }, [insumosGlobales, insumosTempo, buscadorDisp]);

  const insumosAsignadosList = useMemo(() => {
    return insumosTempo
      .map(item => {
        const ins = insumosGlobales.find(x => x.id === item.insumo_id);
        return { ...item, ins };
      })
      .filter(x => x.ins && x.ins.nombre.toLowerCase().includes(buscadorAsig.toLowerCase()));
  }, [insumosGlobales, insumosTempo, buscadorAsig]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-full w-full bg-background p-4 md:p-6 animate-fade-in space-y-6">
      
      {/* CABECERA MAESTRA UNIFICADA */}
      <ModuleHeader 
        icon={<Users size={20} />}
        title={provAEditar ? `Editar Proveedor: ${provAEditar.nombre}` : 'Nuevo Proveedor'}
        //subtitle="Configura los datos comerciales y gestiona el catálogo de ofertas."
        primaryAction={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onVolver}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Proveedor'}
            </Button>
          </div>
        }
      />

      <div className="space-y-6 flex-1">
        
        {/* SECCIÓN 1: DATOS COMERCIALES */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block font-mono">
            1. Datos Comerciales
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Razón Social / Nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ej. Distribuidora de Bebidas S.A."
            />

            <Input 
              label="Contacto Comercial"
              type="text"
              value={formData.contacto}
              onChange={e => setFormData({...formData, contacto: e.target.value})}
              placeholder="Ej. Juan Pérez"
            />

            <Input 
              label="Teléfono"
              type="text"
              value={formData.telefono}
              onChange={e => setFormData({...formData, telefono: e.target.value})}
              placeholder="Ej. +56912345678"
            />

            <Input 
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="Ej. contacto@distribuidora.cl"
            />

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Observaciones</label>
              <textarea 
                rows={2} 
                value={formData.observaciones} 
                onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:border-primary outline-none shadow-inner custom-scrollbar" 
                placeholder="Notas adicionales, plazos de entrega, condiciones comerciales..."
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: ASIGNACIÓN DE INSUMOS (DUAL ASIGNADOR) */}
        <div className="space-y-4 pt-4 border-t border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block font-mono">
            2. Asignación de Insumos y Precios de Oferta
          </span>

          <DualAsignador
            tituloIzq="Insumos Asociados"
            contadorIzq={insumosTempo.length}
            placeholderBusquedaIzq="Buscar asignado..."
            valorBusquedaIzq={buscadorAsig}
            onChangeBusquedaIzq={setBuscadorAsig}

            tituloDer="Catálogo General de Insumos"
            placeholderBusquedaDer="Buscar en catálogo..."
            valorBusquedaDer={buscadorDisp}
            onChangeBusquedaDer={setBuscadorDisp}

            childrenDer={
              insumosDisponibles.length === 0 ? (
                <div className="text-xs text-muted p-4 text-center">No hay insumos disponibles para añadir.</div>
              ) : (
                insumosDisponibles.map(ins => (
                  <div key={ins.id} className="flex justify-between items-center p-2 hover:bg-surface-muted rounded-lg transition-colors border border-transparent hover:border-border">
                    <div>
                      <span className="text-sm font-medium text-foreground block">{ins.nombre}</span>
                      <span className="text-[10px] text-muted font-mono">Ref: ${ins.precio_compra?.toLocaleString('es-CL')}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm" 
                      icon={<Plus size={14}/>} 
                      onClick={() => setInsumosTempo(prev => [...prev, { insumo_id: ins.id, precio_oferta: ins.precio_compra || 0 }])}
                    >
                      Añadir
                    </Button>
                  </div>
                ))
              )
            }

            childrenIzq={
              insumosTempo.length === 0 ? (
                <div className="text-xs text-muted p-4 text-center">Aún no has asignado insumos a este proveedor.</div>
              ) : (
                insumosAsignadosList.map(item => (
                  <div key={item.insumo_id} className="flex flex-col xl:flex-row xl:items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-foreground flex-1 truncate">{item.ins?.nombre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="Precio oferta"
                          value={item.precio_oferta}
                          onChange={e => {
                            const val = e.target.value;
                            setInsumosTempo(prev => prev.map(t => t.insumo_id === item.insumo_id ? { ...t, precio_oferta: val } : t));
                          }}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="inline-danger" 
                        size="sm" 
                        onClick={() => setInsumosTempo(prev => prev.filter(t => t.insumo_id !== item.insumo_id))} 
                        className="text-muted hover:text-danger"
                      >
                        <Trash2 size={16}/>
                      </Button>
                    </div>
                  </div>
                ))
              )
            }
          />
        </div>

      </div>
    </form>
  );
}