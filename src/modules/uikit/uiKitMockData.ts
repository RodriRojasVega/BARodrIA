// src/modules/uikit/uiKitMockData.ts
import { Edit3, Trash2, FileText, Check, Plus, Download, Save } from 'lucide-react';

export const MOCK_BADGES = [
  { label: 'Estado Activo', variant: 'success', text: 'Activo' },
  { label: 'Estado Proceso', variant: 'warning', text: 'Producción' },
  { label: 'Estado Crítico', variant: 'danger', text: 'Crítico Stock' },
  { label: 'Categoría Base', variant: 'info', text: 'Destilado' },
  { label: 'Tipo Artesanal', variant: 'purple', text: 'Sub-receta' },
  { label: 'Estado Inactivo', variant: 'default', text: 'Inactivo' },
];

export const MOCK_KPIS = [
  { label: 'Total Insumos', value: '142', color: 'text-white' },
  { label: 'Costo (COGS)', value: '$1.370', color: 'text-emerald-400' },
  { label: 'Precio Venta', value: '$10.960', color: 'text-amber-400' },
  { label: 'Graduación (ABV)', value: '26,3%', color: 'text-sky-400' },
  { label: 'Sub-recetas', value: '18', color: 'text-purple-400' },
  { label: 'Stock Crítico', value: '5', color: 'text-rose-400' },
];

export const MOCK_INVENTARIO_DISPONIBLE = [
  { id: 1, nombre: 'Azúcar Blanca Refinada', ref: 1000, unidad: 'g' },
  { id: 2, nombre: 'Bicarbonato de Sodio', ref: 1500, unidad: 'g' },
  { id: 3, nombre: 'Bourbon Jim Beam 40°', ref: 15990, unidad: 'ml' },
  { id: 4, nombre: 'Jugo de Limón Sutil', ref: 4500, unidad: 'ml' },
];

export const MOCK_BOTONES_PRINCIPALES = [
  { label: 'Guardar Cambios', variant: 'primary', icon: Save },
  { label: 'Cancelar', variant: 'secondary', icon: null },
  { label: 'Eliminar Elemento', variant: 'danger', icon: Trash2 },
  { label: 'Exportar Data', variant: 'primary', className: 'bg-sky-600 hover:bg-sky-500 border-sky-500/25', icon: Download },
];

export const MOCK_BOTONES_INLINE = [
  { label: 'Editar', variant: 'inline', icon: Edit3 },
  { label: 'Eliminar', variant: 'inline-danger', icon: Trash2 },
  { label: 'Ver Ficha', variant: 'inline', className: 'text-emerald-400 border-emerald-900/50 hover:border-emerald-500/50', icon: FileText },
  { label: 'Aprobar', variant: 'inline', className: 'text-sky-400 border-sky-900/50 hover:border-sky-500/50', icon: Check },
];

// src/modules/uikit/uiKitMockData.ts
export const MOCK_TABS = [
  { 
    id: 'ingenieria', 
    label: 'Escandallo & BOM', 
    activeColor: 'border-emerald-500 text-emerald-400' // Esmeralda
  },
  { 
    id: 'operacion', 
    label: 'Procesos & Mermas', 
    activeColor: 'border-purple-500 text-purple-400' // Púrpura
  },
  { 
    id: 'uso', 
    label: 'Uso en Cócteles', 
    activeColor: 'border-sky-500 text-sky-400' // Celeste / Azul
  },
];