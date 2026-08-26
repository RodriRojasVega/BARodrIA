import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { DataCard } from '@/components/ui/DataCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar } from '@/components/ui/Table';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { MapPin, Plus, Building, List, LayoutGrid, Map } from 'lucide-react';
import { useSpots } from '../hooks/useSpots';
import type { Spot } from '@/types/spots';

interface SpotListProps {
  onDetail: (spot: Spot) => void;
  onEdit: (spot: Spot) => void;
  onCreate: () => void;
}

type SortField = 'nombre' | 'tipo' | 'direccion' | 'ciudad' | 'salones';
type SortDirection = 'asc' | 'desc' | null;

export function SpotList({ onDetail, onCreate }: SpotListProps) {
  const { data: spots = [], isLoading } = useSpots();
  
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(10);
  const [vista, setVista] = useState('grid');
  const [selectedMapSpotId, setSelectedMapSpotId] = useState<number | null>(null);

  // Estados para el ordenamiento de la tabla
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('nombre');
      } else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredSpots = spots.filter(s => 
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (s.ciudad && s.ciudad.toLowerCase().includes(busqueda.toLowerCase())) ||
    (s.direccion && s.direccion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Lógica de ordenamiento aplicada a la lista filtrada
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    if (!sortDirection) return 0;
    
    let aVal: any = '';
    let bVal: any = '';

    if (sortField === 'nombre') {
      aVal = a.nombre; bVal = b.nombre;
    } else if (sortField === 'tipo') {
      aVal = a.tipo || ''; bVal = b.tipo || '';
    } else if (sortField === 'direccion') {
      aVal = a.direccion || ''; bVal = b.direccion || '';
    } else if (sortField === 'ciudad') {
      aVal = a.ciudad || ''; bVal = b.ciudad || '';
    } else if (sortField === 'salones') {
      aVal = a.salones_espacios?.length || 0; bVal = b.salones_espacios?.length || 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const selectedMapSpot = filteredSpots.find(s => s.id === selectedMapSpotId) || filteredSpots[0] || null;

  const viewOptions = [
    { id: 'table', label: 'Tabla', icon: <List size={16} /> },
    { id: 'grid', label: 'Tarjetas', icon: <LayoutGrid size={16} /> },
    { id: 'map', label: 'Mapa', icon: <Map size={16} /> },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <ModuleHeader
        title="Locaciones y Spots"
        icon={<MapPin size={20} className="text-primary" />}
        primaryAction={
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={onCreate} title="Nuevo Spot" />
        }
      />

      <div className="space-y-4">
        <TableToolbar 
          busqueda={busqueda} 
          onBusquedaChange={setBusqueda} 
          limite={limite} 
          onLimiteChange={setLimite} 
          placeholder="Buscar locación, dirección o ciudad..."
        >
          <ViewToggle activeId={vista} onChange={setVista} options={viewOptions} />
        </TableToolbar>

        {!isLoading && filteredSpots.length === 0 ? (
          <div className="pt-10">
            <EmptyState
              title="No hay locaciones registradas"
              description="Agrega tu primer Spot o Centro de Eventos para comenzar."
              icon={<Building size={48} />}
              action={<Button variant="primary" icon={<Plus size={16} />} onClick={onCreate} />}
            />
          </div>
        ) : (
          <>
            {vista === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                {sortedSpots.slice(0, limite).map((spot) => (
                  <DataCard
                    key={spot.id}
                    title={spot.nombre}
                    onClick={() => onDetail(spot)}
                    badge={<Badge variant="info" className="capitalize">{spot.tipo?.replace(/_/g, ' ') || 'N/A'}</Badge>}
                  >
                    <div className="space-y-3 mt-3 text-left relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted">Dirección y Ciudad</span>
                        <span className="text-sm font-medium text-foreground truncate">
                          {spot.direccion || 'Sin calle'}
                        </span>
                        <span className="text-xs text-muted truncate">{spot.ciudad || 'Sin ciudad'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-border/50 pt-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted">Aforo Total Mapeado</span>
                        <span className="font-bold text-primary text-sm">{spot.salones_espacios?.length || 0} Salones</span>
                      </div>
                    </div>
                  </DataCard>
                ))}
              </div>
            )}

            {vista === 'table' && (
              <div className="overflow-x-auto custom-scrollbar pb-10">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell 
                        isSortable 
                        sortDirection={sortField === 'nombre' ? sortDirection : null} 
                        onSort={() => handleSort('nombre')}
                      >
                        Nombre del Spot
                      </TableHeaderCell>
                      <TableHeaderCell 
                        isSortable 
                        sortDirection={sortField === 'tipo' ? sortDirection : null} 
                        onSort={() => handleSort('tipo')}
                      >
                        Tipo
                      </TableHeaderCell>
                      <TableHeaderCell 
                        isSortable 
                        sortDirection={sortField === 'direccion' ? sortDirection : null} 
                        onSort={() => handleSort('direccion')}
                      >
                        Dirección
                      </TableHeaderCell>
                      <TableHeaderCell 
                        isSortable 
                        sortDirection={sortField === 'ciudad' ? sortDirection : null} 
                        onSort={() => handleSort('ciudad')}
                      >
                        Ciudad
                      </TableHeaderCell>
                      <TableHeaderCell 
                        align="center"
                        isSortable 
                        sortDirection={sortField === 'salones' ? sortDirection : null} 
                        onSort={() => handleSort('salones')}
                      >
                        Salones
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedSpots.slice(0, limite).map((spot) => (
                      <TableRow key={spot.id} isClickable onClick={() => onDetail(spot)}>
                        <TableCell className="font-bold text-foreground">{spot.nombre}</TableCell>
                        <TableCell>
                          <Badge variant="info" className="capitalize">{spot.tipo?.replace(/_/g, ' ') || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">
                          {spot.direccion || 'Sin dirección'}
                        </TableCell>
                        <TableCell className="text-sm text-muted">
                          {spot.ciudad || 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                          <Badge variant="default">{spot.salones_espacios?.length || 0}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {vista === 'map' && (
              <div className="flex flex-col md:flex-row gap-4 h-[550px] pb-6">
                <div className="w-full md:w-1/3 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
                  {sortedSpots.map(spot => (
                    <SelectableCard
                      key={spot.id}
                      isActive={selectedMapSpot?.id === spot.id}
                      onClick={() => setSelectedMapSpotId(spot.id)}
                      title={spot.nombre}
                      subtitle={`${spot.direccion || ''} ${spot.ciudad ? `- ${spot.ciudad}` : ''}`}
                      icon={<MapPin size={16} />}
                    />
                  ))}
                </div>
                <div className="w-full md:w-2/3 h-full bg-surface-muted/20 border border-border/50 rounded-2xl overflow-hidden relative">
                  {selectedMapSpot && selectedMapSpot.direccion ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ border: 0, filter: 'contrast(1.1) opacity(0.9)' }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedMapSpot.direccion + ', ' + selectedMapSpot.ciudad)}&output=embed`} 
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <EmptyState 
                        title="Ubicación no trazable" 
                        description="Este spot no tiene una dirección registrada válida para dibujar en el mapa." 
                        icon={<Map size={48} />} 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}