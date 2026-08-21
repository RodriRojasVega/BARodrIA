// src/modules/eventos/components/EventoForm.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Save } from 'lucide-react';
import type { ClienteEmpresa, TipoEvento, EstadoEvento } from '@/types';

interface EventoFormProps {
  onGuardado: () => void;
  onCancelar: () => void;
}

export function EventoForm({ onGuardado, onCancelar }: EventoFormProps) {
  const [clientes, setClientes] = useState<ClienteEmpresa[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('corporativo');
  const [mandanteId, setMandanteId] = useState<string>('');
  const [clienteFinalId, setClienteFinalId] = useState<string>('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [horaInicio, setHoraInicio] = useState('19:00');
  const [horaFin, setHoraFin] = useState('23:59');
  const [totalPax, setTotalPax] = useState<number>(100);
  const [estado, setEstado] = useState<EstadoEvento>('cotizacion');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    async function fetchClientes() {
      try {
        const { data, error } = await supabase
          .from('clientes_empresas')
          .select('*')
          .order('nombre', { ascending: true });
        
        if (error) throw error;
        setClientes(data || []);
      } catch (err) {
        console.error('Error al cargar clientes B2B:', err);
      } finally {
        setCargandoClientes(false);
      }
    }
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !fechaEvento) {
      setError('El nombre del evento y la fecha son obligatorios.');
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const slug = nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      const payload = {
        slug,
        nombre,
        tipo_evento: tipoEvento,
        mandante_id: mandanteId ? Number(mandanteId) : null,
        cliente_final_id: clienteFinalId ? Number(clienteFinalId) : null,
        fecha_evento: fechaEvento,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        total_pax: Number(totalPax),
        estado,
        observaciones_logistica: observaciones || null
      };

      const { error: insertError } = await supabase
        .from('eventos')
        .insert([payload]);

      if (insertError) throw insertError;

      onGuardado();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el evento';
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6 animate-fade-in max-w-4xl mx-auto w-full bg-background">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-wide">Nueva Cotización / Evento B2B</h2>
            <p className="text-xs text-muted mt-0.5">Definición de la Tríada Comercial, volumetría y parámetros logísticos iniciales.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={<Save size={14} />} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Evento'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-surface-muted border border-border rounded-xl text-xs text-danger font-mono">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Fila 1: Nombre y Tipología */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input 
                label="Nombre del Evento" 
                placeholder="Ej: Aniversario Corporativo TechCorp 2026"
                value={nombre}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <Select 
                label="Tipología de Evento"
                value={tipoEvento}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipoEvento(e.target.value as TipoEvento)}
              >
                <option value="corporativo">Corporativo</option>
                <option value="matrimonio">Matrimonio</option>
                <option value="cumpleanos">Cumpleaños</option>
                <option value="activacion_marca">Activación de Marca</option>
                <option value="festival_masivo">Festival Masivo</option>
                <option value="particular">Particular</option>
                <option value="otro">Otro</option>
              </Select>
            </div>
          </div>

          {/* Fila 2: Tríada Comercial (Mandante y Cliente Final) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <Select 
              label="Mandante Comercial (Empresa / Productora)"
              value={mandanteId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMandanteId(e.target.value)}
              disabled={cargandoClientes}
            >
              <option value="">Seleccionar mandante (opcional)...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.tipo || 'General'})</option>
              ))}
            </Select>

            <Select 
              label="Cliente Final (Marca / Patrocinador)"
              value={clienteFinalId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClienteFinalId(e.target.value)}
              disabled={cargandoClientes}
            >
              <option value="">Seleccionar cliente final (opcional)...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          </div>

          {/* Fila 3: Fechas, Horarios y PAX */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <Input 
                label="Fecha del Evento"
                type="date"
                value={fechaEvento}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaEvento(e.target.value)}
                required
              />
            </div>
            <div>
              <Input 
                label="Hora Inicio"
                type="time"
                value={horaInicio}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <Input 
                label="Hora Fin"
                type="time"
                value={horaFin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoraFin(e.target.value)}
                required
              />
            </div>
            <div>
              <Input 
                label="Volumen Total (PAX)"
                type="number"
                min={1}
                value={totalPax}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalPax(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Fila 4: Estado y Observaciones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <Select 
                label="Estado del Ciclo"
                value={estado}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEstado(e.target.value as EstadoEvento)}
              >
                <option value="cotizacion">Cotización</option>
                <option value="confirmado">Confirmado</option>
                <option value="en_produccion">En Producción</option>
                <option value="ejecutado">Ejecutado</option>
                <option value="cancelado">Cancelado</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Textarea 
                label="Observaciones Logísticas"
                placeholder="Notas especiales sobre acceso, restricciones de horario o requerimientos de barra..."
                value={observaciones}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservaciones(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}