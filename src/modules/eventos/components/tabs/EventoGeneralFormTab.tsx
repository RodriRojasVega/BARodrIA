import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { DateInput, TimeInput } from '@/components/ui/DateTimeInput'; // Usando nuestros nuevos componentes pro
import { EventoFormData } from '../../hooks/useEventoMutations';
import { supabase } from '@/lib/supabase';

interface EventoGeneralFormTabProps {
  formData: EventoFormData;
  onChange: <K extends keyof EventoFormData>(field: K, value: EventoFormData[K]) => void;
}

export function EventoGeneralFormTab({ formData, onChange }: EventoGeneralFormTabProps) {
  const [tiposEvento, setTiposEvento] = useState<{ id: number; nombre: string }[]>([]);
  const [estadosEvento, setEstadosEvento] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    async function cargarCatalogos() {
      const [resTipos, resEstados] = await Promise.all([
        supabase.from('tipos_evento').select('id, nombre'),
        supabase.from('estados_evento').select('id, nombre')
      ]);

      if (resTipos.data) setTiposEvento(resTipos.data);
      if (resEstados.data) setEstadosEvento(resEstados.data);
    }
    cargarCatalogos();
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      
      {/* Columna Izquierda: Datos Base, Tiempos y Staff */}
      <div className="space-y-4">
        <Input 
          label="Nombre del Evento" 
          placeholder="Ej: Fiesta Corporativa Fin de Año" 
          value={formData.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select 
            label="Tipología"
            value={formData.tipo_evento ?? ''}
            onChange={(e) => onChange('tipo_evento', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Seleccionar tipo...</option>
            {tiposEvento.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </Select>

          <Select 
            label="Estado del Evento"
            value={formData.estado || 1}
            onChange={(e) => onChange('estado', Number(e.target.value))}
          >
            {estadosEvento.map((est) => (
              <option key={est.id} value={est.id}>{est.nombre}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            label="Volumen Estimado (PAX)" 
            type="number" 
            placeholder="Ej: 150" 
            value={formData.total_pax || ''}
            onChange={(e) => onChange('total_pax', parseInt(e.target.value) || 0)}
          />
          <Input 
            label="Staff Proyectado (Personas)" 
            type="number" 
            placeholder="Ej: 8" 
            value={formData.staff_proyectado || ''}
            onChange={(e) => onChange('staff_proyectado', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DateInput 
            label="Fecha Operativa" 
            value={formData.fecha_evento}
            onChange={(e) => onChange('fecha_evento', e.target.value)}
          />
          <TimeInput 
            label="Hora Inicio" 
            value={formData.hora_inicio}
            onChange={(e) => onChange('hora_inicio', e.target.value)}
          />
          <TimeInput 
            label="Hora Fin" 
            value={formData.hora_fin}
            onChange={(e) => onChange('hora_fin', e.target.value)}
          />
        </div>
      </div>

      {/* Columna Derecha: Entidades Comerciales y Logística */}
      <div className="space-y-4">
        <Select 
          label="Mandante Comercial"
          value={formData.mandante_id ?? ''}
          onChange={(e) => onChange('mandante_id', e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Seleccionar mandante...</option>
        </Select>

        <Select 
          label="Cliente Final / Institución"
          value={formData.cliente_final_id ?? ''}
          onChange={(e) => onChange('cliente_final_id', e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Seleccionar cliente final...</option>
        </Select>

        <div className="pt-2">
          <Textarea 
            label="Observaciones Logísticas"
            placeholder="Escribe métodos de acceso, restricciones de montaje o notas especiales..." 
            rows={5} 
            value={formData.observaciones_logistica || ''}
            onChange={(e) => onChange('observaciones_logistica', e.target.value)}
          />
        </div>
      </div>

    </div>
  );
}