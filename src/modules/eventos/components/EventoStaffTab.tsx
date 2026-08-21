// src/modules/eventos/components/EventoStaffTab.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InfoCard } from '@/components/ui/InfoCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserPlus, Trash2, Users } from 'lucide-react';
import type { Staff, EventoStaffAsignacion } from '@/types';

interface EventoStaffTabProps {
  eventoId: number;
}

export function EventoStaffTab({ eventoId }: EventoStaffTabProps) {
  const [staffGlobal, setStaffGlobal] = useState<Staff[]>([]);
  const [asignaciones, setAsignaciones] = useState<EventoStaffAsignacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchStaffData() {
      try {
        setCargando(true);
        const [{ data: staffData }, { data: asigData }] = await Promise.all([
          supabase.from('staff' as any).select('*').order('nombre'),
          supabase.from('evento_staff_asignaciones' as any).select('*').eq('evento_id', eventoId)
        ]);
        setStaffGlobal((staffData as any) || []);
        setAsignaciones((asigData as any) || []);
      } catch (err) {
        console.error('Error cargando staff:', err);
      } finally {
        setCargando(false);
      }
    }
    fetchStaffData();
  }, [eventoId]);

  const asignarStaff = async (staffId: number) => {
    try {
      const { data, error } = await supabase
        .from('evento_staff_asignaciones' as any)
        .insert([{ evento_id: eventoId, staff_id: staffId }])
        .select();

      if (error) throw error;
      if (data) setAsignaciones(prev => [...prev, (data as any)[0]]);
    } catch (err) {
      console.error('Error al asignar staff:', err);
    }
  };

  const removerAsignacion = async (id: number) => {
    try {
      const { error } = await supabase
        .from('evento_staff_asignaciones' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAsignaciones(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error al remover staff:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera del Módulo de Staff utilizando InfoCard y tokens semánticos */}
      <InfoCard variant="success" title="Gestión de Capital Humano">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <p className="text-xs text-muted">
            Asignación táctica de bartenders, barbacks y capitanes de barra para el evento.
          </p>
          <Badge variant="success">{asignaciones.length} Operativos Asignados</Badge>
        </div>
      </InfoCard>

      {/* Asignador Dual basado puramente en tokens semánticos de superficie y bordes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna Izquierda: Staff Disponible */}
        <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col h-[400px] shadow-xl">
          <h4 className="text-xs font-bold text-foreground mb-3 uppercase font-mono flex items-center gap-2">
            <Users size={14} className="text-primary" /> Staff Registrado (Disponibles)
          </h4>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {cargando ? (
              <div className="text-xs text-muted text-center py-20 font-mono animate-pulse">Cargando personal...</div>
            ) : (
              staffGlobal.map(st => {
                const yaAsignado = asignaciones.some(a => a.staff_id === st.id);
                if (yaAsignado) return null;
                return (
                  <div key={st.id} className="flex justify-between items-center bg-surface-muted p-2.5 rounded-xl border border-border hover:border-border-hover transition">
                    <div>
                      <p className="text-xs text-foreground font-bold">{st.nombre}</p>
                      <span className="text-[10px] font-mono text-primary uppercase">{st.rol || 'Bartender'}</span>
                    </div>
                    <Button variant="secondary" size="sm" icon={<UserPlus size={14} />} onClick={() => asignarStaff(st.id)}>
                      Asignar
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Staff Asignado al Evento */}
        <div className="bg-surface border border-primary/40 rounded-2xl p-4 flex flex-col h-[400px] shadow-xl">
          <h4 className="text-xs font-bold text-primary mb-3 uppercase font-mono flex items-center gap-2">
            ✅ Equipo en Operación
          </h4>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {asignaciones.length === 0 ? (
              <div className="text-xs text-muted text-center py-20 font-mono">Sin personal asignado a este evento.</div>
            ) : (
              asignaciones.map(asig => {
                const st = staffGlobal.find(s => s.id === asig.staff_id);
                if (!st) return null;
                return (
                  <div key={asig.id} className="flex items-center justify-between bg-surface-muted p-2.5 rounded-xl border border-primary/20">
                    <div>
                      <p className="text-xs text-foreground font-bold">{st.nombre}</p>
                      <span className="text-[10px] font-mono text-muted uppercase">{st.rol || 'General'}</span>
                    </div>
                    <Button variant="inline-danger" onClick={() => removerAsignacion(asig.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}