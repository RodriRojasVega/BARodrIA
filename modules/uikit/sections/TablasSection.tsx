// src/modules/uikit/sections/TablasSection.tsx
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';
import { FileText, Edit3, Trash2 } from 'lucide-react';

type TablaMock = 'insumos' | 'cocteles';

export function TablasSection() {
  const [activeTable, setActiveTable] = useState<TablaMock>('insumos');
  
  // Estados de control de tabla
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  // Mocks extendidos para probar ordenamiento y paginación
  const insumosMock = [
    { id: 1, nombre: 'Ron Blanco Superior', estado: 'Activo', control: true, stock: 12, ubicacion: 'Barra Piso 1' },
    { id: 2, nombre: 'Gin London Dry', estado: 'Activo', control: true, stock: 8, ubicacion: 'Bodega Central' },
    { id: 3, nombre: 'Vodka Premium', estado: 'Inactivo', control: false, stock: 3, ubicacion: 'Barra VIP' },
    { id: 4, nombre: 'Jarabe de Goma Artesanal', estado: 'Activo', control: true, stock: 25, ubicacion: 'Cocina / Batch' },
  ];

  const coctelesMock = [
    { id: 1, nombre: 'Negroni Clásico', categoria: 'Digestivo / Ancestral', abv: '26,3%', cogs: '$1.370', precio: '$10.960' },
    { id: 2, nombre: 'Penicillin', categoria: 'Sour / Especiado', abv: '18,5%', cogs: '$1.850', precio: '$12.500' },
    { id: 3, nombre: 'Old Fashioned', categoria: 'Clásico / Fuerte', abv: '32,1%', cogs: '$2.100', precio: '$11.800' },
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortDir(null); setSortField(null); }
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in py-2 overflow-hidden">
      <div className="flex items-center justify-between bg-slate-950 pb-3 border-b border-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{activeTable === 'insumos' ? '📦' : '🍸'}</span>
          <h1 className="text-base font-bold text-white tracking-wide">
            {activeTable === 'insumos' ? 'Gestión de Insumos Base' : 'Estandarización de Cócteles'}
          </h1>
        </div>
        <div className="flex gap-1.5">
          <Button 
            variant={activeTable === 'cocteles' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => { setActiveTable('cocteles'); setBusqueda(''); setPaginaActual(1); }}
          >
            Cócteles
          </Button>
          <Button 
            variant={activeTable === 'insumos' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => { setActiveTable('insumos'); setBusqueda(''); setPaginaActual(1); }}
          >
            Insumos
          </Button>
        </div>
      </div>

      {/* Barra de Herramientas Estándar del UI Kit */}
      <TableToolbar 
        busqueda={busqueda}
        onBusquedaChange={(val) => { setBusqueda(val); setPaginaActual(1); }}
        placeholder={activeTable === 'insumos' ? "Buscar insumo por nombre o ubicación..." : "Buscar cóctel..."}
        limite={limite}
        onLimiteChange={(val) => { setLimite(val); setPaginaActual(1); }}
      />

      {/* Contenedor de la Tabla */}
      {activeTable === 'insumos' ? (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell align="center" className="w-10">Sel</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={sortField === 'nombre' ? sortDir : null} onSort={() => handleSort('nombre')}>
                Insumo
              </TableHeaderCell>
              <TableHeaderCell align="center">Estado</TableHeaderCell>
              <TableHeaderCell align="center">Control Activo</TableHeaderCell>
              <TableHeaderCell align="center">Stock Lote</TableHeaderCell>
              <TableHeaderCell>Ubicación Física</TableHeaderCell>
              <TableHeaderCell align="right">Acciones</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {insumosMock.map((item) => (
              <TableRow key={item.id}>
                <TableCell align="center"><input type="checkbox" className="accent-emerald-500 cursor-pointer" /></TableCell>
                <TableCell className="font-semibold text-white">{item.nombre}</TableCell>
                <TableCell align="center"><Badge variant={item.estado === 'Activo' ? 'success' : 'danger'}>{item.estado}</Badge></TableCell>
                <TableCell align="center"><input type="checkbox" defaultChecked={item.control} className="accent-emerald-500 cursor-pointer" /></TableCell>
                <TableCell align="center"><Input type="number" defaultValue={item.stock} className="w-16 text-center h-7 py-0 font-mono" /></TableCell>
                <TableCell><Input defaultValue={item.ubicacion} className="w-32 h-7 py-0 text-xs" /></TableCell>
                <TableCell align="right">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="inline" icon={<Edit3 size={12}/>}>Editar</Button>
                    <Button variant="inline-danger" icon={<Trash2 size={12}/>}>Borrar</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell align="center" className="w-10">Sel</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={sortField === 'nombre' ? sortDir : null} onSort={() => handleSort('nombre')}>
                Nombre
              </TableHeaderCell>
              <TableHeaderCell>Categoría Técnica</TableHeaderCell>
              <TableHeaderCell align="center">ABV %</TableHeaderCell>
              <TableHeaderCell align="right">COGS</TableHeaderCell>
              <TableHeaderCell align="right">Precio Sugerido</TableHeaderCell>
              <TableHeaderCell align="right">Acciones</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {coctelesMock.map((item) => (
              <TableRow key={item.id}>
                <TableCell align="center"><input type="checkbox" className="accent-emerald-500 cursor-pointer" /></TableCell>
                <TableCell className="font-semibold text-white">{item.nombre}</TableCell>
                <TableCell className="font-mono text-[11px] text-slate-400">{item.categoria}</TableCell>
                <TableCell align="center" className="font-mono text-emerald-400">{item.abv}</TableCell>
                <TableCell align="right" className="font-mono text-slate-300">{item.cogs}</TableCell>
                <TableCell align="right" className="font-mono text-emerald-400 font-semibold">{item.precio}</TableCell>
                <TableCell align="right">
                  <div className="flex justify-end">
                    <Button variant="inline" icon={<FileText size={12}/>} className="text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/30">Ver Ficha</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Paginador Estándar del UI Kit */}
      <TablePagination 
        paginaActual={paginaActual}
        totalPaginas={1}
        onCambiarPagina={(p) => setPaginaActual(p)}
        elementosMostrados={activeTable === 'insumos' ? insumosMock.length : coctelesMock.length}
        totalElementos={activeTable === 'insumos' ? insumosMock.length : coctelesMock.length}
      />
    </div>
  );
}