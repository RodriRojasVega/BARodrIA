// src/modules/clientes/components/ClienteList.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { DataCard } from '@/components/ui/DataCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar } from '@/components/ui/Table';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Users, Plus, Building2, List, LayoutGrid, Phone, Mail, UserCheck } from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import type { ClienteEmpresa } from '@/types/clientes';

interface ClienteListProps {
  onDetail: (cliente: ClienteEmpresa) => void;
  onEdit: (cliente: ClienteEmpresa) => void;
  onCreate: () => void;
}

type SortField = 'nombre' | 'tipo' | 'contacto_nombre' | 'telefono' | 'email';
type SortDirection = 'asc' | 'desc' | null;

export function ClienteList({ onDetail, onCreate }: ClienteListProps) {
  const { data: clientes = [], isLoading } = useClientes();
  
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(10);
  const [vista, setVista] = useState('grid');

  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortDirection(null); setSortField('nombre'); }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (c.contacto_nombre && c.contacto_nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const sortedClientes = [...filteredClientes].sort((a, b) => {
    if (!sortDirection) return 0;
    let aVal: string | number = '';
    let bVal: string | number = '';

    if (sortField === 'nombre') { aVal = a.nombre; bVal = b.nombre; }
    else if (sortField === 'tipo') { aVal = a.tipos_clientes?.nombre || ''; bVal = b.tipos_clientes?.nombre || ''; }
    else if (sortField === 'contacto_nombre') { aVal = a.contacto_nombre || ''; bVal = b.contacto_nombre || ''; }
    else if (sortField === 'telefono') { aVal = a.telefono || ''; bVal = b.telefono || ''; }
    else if (sortField === 'email') { aVal = a.email || ''; bVal = b.email || ''; }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const viewOptions = [
    { id: 'table', label: 'Tabla', icon: <List size={16} /> },
    { id: 'grid', label: 'Tarjetas', icon: <LayoutGrid size={16} /> },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <ModuleHeader
        title="Clientes y Mandantes"
        icon={<Users size={20} className="text-primary" />}
        primaryAction={
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={onCreate} title="Nuevo Cliente" />
        }
      />

      <div className="space-y-4">
        <TableToolbar 
          busqueda={busqueda} 
          onBusquedaChange={setBusqueda} 
          limite={limite} 
          onLimiteChange={setLimite} 
          placeholder="Buscar cliente, contacto o email..."
        >
          <ViewToggle activeId={vista} onChange={setVista} options={viewOptions} />
        </TableToolbar>

        {!isLoading && filteredClientes.length === 0 ? (
          <div className="pt-10">
            <EmptyState
              title="No hay clientes registrados"
              description="Agrega tu primer mandante o empresa cliente para comenzar."
              icon={<Building2 size={48} />}
              action={<Button variant="primary" icon={<Plus size={16} />} onClick={onCreate} />}
            />
          </div>
        ) : (
          <>
            {vista === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                {sortedClientes.slice(0, limite).map((cliente) => (
                  <DataCard
                    key={cliente.id}
                    title={cliente.nombre}
                    onClick={() => onDetail(cliente)}
                    badge={<Badge variant="info">{cliente.tipos_clientes?.nombre || 'N/A'}</Badge>}
                  >
                    <div className="space-y-3 mt-3 text-left relative z-10">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted">Contacto Principal</span>
                        <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          <UserCheck size={14} className="text-primary shrink-0" />
                          {cliente.contacto_nombre || 'Sin contacto'}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1.5">
                          <Phone size={12} className="shrink-0" /> {cliente.telefono || 'Sin teléfono'}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1.5">
                          <Mail size={12} className="shrink-0" /> {cliente.email || 'Sin email'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-border/50 pt-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted">Spots Asociados</span>
                        <span className="font-bold text-primary text-sm">{cliente.cliente_spots?.length || 0} Spots</span>
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
                      <TableHeaderCell isSortable sortDirection={sortField === 'nombre' ? sortDirection : null} onSort={() => handleSort('nombre')}>
                        Nombre / Empresa
                      </TableHeaderCell>
                      <TableHeaderCell isSortable sortDirection={sortField === 'tipo' ? sortDirection : null} onSort={() => handleSort('tipo')}>
                        Tipo
                      </TableHeaderCell>
                      <TableHeaderCell isSortable sortDirection={sortField === 'contacto_nombre' ? sortDirection : null} onSort={() => handleSort('contacto_nombre')}>
                        Contacto
                      </TableHeaderCell>
                      <TableHeaderCell isSortable sortDirection={sortField === 'telefono' ? sortDirection : null} onSort={() => handleSort('telefono')}>
                        Teléfono
                      </TableHeaderCell>
                      <TableHeaderCell isSortable sortDirection={sortField === 'email' ? sortDirection : null} onSort={() => handleSort('email')}>
                        Email
                      </TableHeaderCell>
                      <TableHeaderCell align="center">Spots</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedClientes.slice(0, limite).map((cliente) => (
                      <TableRow key={cliente.id} isClickable onClick={() => onDetail(cliente)}>
                        <TableCell className="font-bold text-foreground">{cliente.nombre}</TableCell>
                        <TableCell>
                          <Badge variant="info">{cliente.tipos_clientes?.nombre || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">
                          {cliente.contacto_nombre || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-medium">
                          {cliente.telefono || 'Sin teléfono'}
                        </TableCell>
                        <TableCell className="text-xs text-muted">
                          {cliente.email || 'Sin email'}
                        </TableCell>
                        <TableCell align="center">
                          <Badge variant="default">{cliente.cliente_spots?.length || 0}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}