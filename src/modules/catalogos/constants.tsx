import { Tag, Layers, Sliders, Coffee, Sparkles, Database, Box, Truck } from 'lucide-react';
import type { GrupoTaxonomia } from './types';

export const GRUPOS_TAXONOMIAS: GrupoTaxonomia[] = [
  {
    id: 'organoleptica',
    nombre: 'Clasificación Organoléptica',
    icon: <Tag size={16} className="text-primary" />,
    tablas: [
      { id: 'categorias', label: 'Categorías', descripcion: 'Categorías principales', icon: <Tag size={14} /> },
      { id: 'familias', label: 'Familias', descripcion: 'Familias taxonómicas', icon: <Layers size={14} /> },
    ]
  },
  {
    id: 'fisico_quimica',
    nombre: 'Propiedades Físico-Químicas y Soportes',
    icon: <Sliders size={16} className="text-primary" />,
    tablas: [
      { id: 'soportes', label: 'Soportes', descripcion: 'Cristalería y vajilla', icon: <Coffee size={14} /> },
      { id: 'hielos', label: 'Hielos y Formatos', descripcion: 'Tipos de hielo', icon: <Sparkles size={14} /> },
      { id: 'tecnicas', label: 'Técnicas', descripcion: 'Técnicas de preparación', icon: <Database size={14} /> },
    ]
  },
  {
    id: 'logistica',
    nombre: 'Logística y Eventos',
    icon: <Truck size={16} className="text-primary" />,
    tablas: [
      { id: 'tipos_insumos', label: 'Tipos Insumos', descripcion: 'Clasificación logística', icon: <Box size={14} /> },
      { id: 'tipos_sub_recetas', label: 'Tipos Sub-recetas', descripcion: 'Preparaciones intermedias', icon: <Layers size={14} /> },
    ]
  }
];

export const TABLAS_CONFIG = GRUPOS_TAXONOMIAS.flatMap(g => g.tablas);
