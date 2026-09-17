import { type ReactNode } from 'react';

export type NombreTabla = 
  | 'categorias' 
  | 'familias' 
  | 'soportes' 
  | 'hielos' 
  | 'tecnicas' 
  | 'tipos_insumos' 
  | 'tipos_sub_recetas';

export interface GrupoTaxonomia {
  id: string;
  nombre: string;
  icon: ReactNode;
  tablas: {
    id: NombreTabla;
    label: string;
    descripcion: string;
    icon: ReactNode;
  }[];
}
