export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      carta_cocteles: {
        Row: {
          carta_id: number
          coctel_id: number
          id: number
          orden_aparicion: number | null
          precio_venta_override: number | null
          seccion_personalizada: string | null
        }
        Insert: {
          carta_id: number
          coctel_id: number
          id?: never
          orden_aparicion?: number | null
          precio_venta_override?: number | null
          seccion_personalizada?: string | null
        }
        Update: {
          carta_id?: number
          coctel_id?: number
          id?: never
          orden_aparicion?: number | null
          precio_venta_override?: number | null
          seccion_personalizada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carta_cocteles_carta_id_fkey"
            columns: ["carta_id"]
            isOneToOne: false
            referencedRelation: "cartas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carta_cocteles_coctel_id_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
        ]
      }
      cartas: {
        Row: {
          cliente_institucion: string | null
          created_at: string
          descripcion: string | null
          estado: string
          id: number
          nombre: string
          slug: string
          tematica: string | null
        }
        Insert: {
          cliente_institucion?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: string
          id?: never
          nombre: string
          slug: string
          tematica?: string | null
        }
        Update: {
          cliente_institucion?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: string
          id?: never
          nombre?: string
          slug?: string
          tematica?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string
          slug: string
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre: string
          slug: string
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      clientes_empresas: {
        Row: {
          contacto_nombre: string | null
          email: string | null
          id: number
          nombre: string
          telefono: string | null
          tipo: string | null
        }
        Insert: {
          contacto_nombre?: string | null
          email?: string | null
          id?: never
          nombre: string
          telefono?: string | null
          tipo?: string | null
        }
        Update: {
          contacto_nombre?: string | null
          email?: string | null
          id?: never
          nombre?: string
          telefono?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      coctel_galeria_fotos: {
        Row: {
          coctel_id: number | null
          id: number
          pie_de_foto: string | null
          sub_receta_id: number | null
          tipo_imagen: string
          url_archivo: string
        }
        Insert: {
          coctel_id?: number | null
          id?: number
          pie_de_foto?: string | null
          sub_receta_id?: number | null
          tipo_imagen: string
          url_archivo: string
        }
        Update: {
          coctel_id?: number | null
          id?: number
          pie_de_foto?: string | null
          sub_receta_id?: number | null
          tipo_imagen?: string
          url_archivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "coctel_galeria_fotos_coctel_id_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coctel_galeria_fotos_sub_receta_id_fkey"
            columns: ["sub_receta_id"]
            isOneToOne: false
            referencedRelation: "sub_recetas_artesanales"
            referencedColumns: ["id"]
          },
        ]
      }
      coctel_garnishes: {
        Row: {
          cantidad: number
          coctel_id: number
          garnish_id: number
          id: number
        }
        Insert: {
          cantidad?: number
          coctel_id: number
          garnish_id: number
          id?: never
        }
        Update: {
          cantidad?: number
          coctel_id?: number
          garnish_id?: number
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "coctel_garnishes_coctel_id_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coctel_garnishes_garnish_id_fkey"
            columns: ["garnish_id"]
            isOneToOne: false
            referencedRelation: "garnishes"
            referencedColumns: ["id"]
          },
        ]
      }
      coctel_ingredientes: {
        Row: {
          cantidad: number
          coctel_id: number
          id: number
          insumo_id: number
          unidad_medida: string
        }
        Insert: {
          cantidad: number
          coctel_id: number
          id?: number
          insumo_id: number
          unidad_medida: string
        }
        Update: {
          cantidad?: number
          coctel_id?: number
          id?: number
          insumo_id?: number
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "coctel_ingredientes_coctel_id_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coctel_ingredientes_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      coctel_pasos_preparacion: {
        Row: {
          coctel_id: number
          descripcion: string
          es_critico: boolean
          id: number
          numero_paso: number
          tecnica_asociada_id: number | null
        }
        Insert: {
          coctel_id: number
          descripcion: string
          es_critico?: boolean
          id?: number
          numero_paso: number
          tecnica_asociada_id?: number | null
        }
        Update: {
          coctel_id?: number
          descripcion?: string
          es_critico?: boolean
          id?: number
          numero_paso?: number
          tecnica_asociada_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coctel_pasos_preparacion_coctel_id_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coctel_pasos_preparacion_tecnica_asociada_id_fkey"
            columns: ["tecnica_asociada_id"]
            isOneToOne: false
            referencedRelation: "tecnicas"
            referencedColumns: ["id"]
          },
        ]
      }
      cocteles: {
        Row: {
          categoria_id: number
          coctel_base_id: number | null
          costo_produccion: number
          familia_id: number
          grado_alcohol: number
          hielo_id: number
          id: number
          maridaje_alternativa: string | null
          maridaje_justificacion: string | null
          maridaje_propuesta: string | null
          nombre: string
          porcentaje_azucar: number
          precio_venta_sugerido: number
          reseña_boca: string | null
          reseña_inspiracion: string | null
          reseña_nariz: string | null
          reseña_vista: string | null
          slug: string
          soporte_id: number
          tecnica_id: number
          tips: string | null
        }
        Insert: {
          categoria_id: number
          coctel_base_id?: number | null
          costo_produccion?: number
          familia_id: number
          grado_alcohol?: number
          hielo_id: number
          id?: number
          maridaje_alternativa?: string | null
          maridaje_justificacion?: string | null
          maridaje_propuesta?: string | null
          nombre: string
          porcentaje_azucar?: number
          precio_venta_sugerido?: number
          reseña_boca?: string | null
          reseña_inspiracion?: string | null
          reseña_nariz?: string | null
          reseña_vista?: string | null
          slug: string
          soporte_id: number
          tecnica_id: number
          tips?: string | null
        }
        Update: {
          categoria_id?: number
          coctel_base_id?: number | null
          costo_produccion?: number
          familia_id?: number
          grado_alcohol?: number
          hielo_id?: number
          id?: number
          maridaje_alternativa?: string | null
          maridaje_justificacion?: string | null
          maridaje_propuesta?: string | null
          nombre?: string
          porcentaje_azucar?: number
          precio_venta_sugerido?: number
          reseña_boca?: string | null
          reseña_inspiracion?: string | null
          reseña_nariz?: string | null
          reseña_vista?: string | null
          slug?: string
          soporte_id?: number
          tecnica_id?: number
          tips?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cocteles_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cocteles_coctel_base_id_fkey"
            columns: ["coctel_base_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cocteles_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cocteles_hielo_id_fkey"
            columns: ["hielo_id"]
            isOneToOne: false
            referencedRelation: "hielos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cocteles_soporte_id_fkey"
            columns: ["soporte_id"]
            isOneToOne: false
            referencedRelation: "soportes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cocteles_tecnica_id_fkey"
            columns: ["tecnica_id"]
            isOneToOne: false
            referencedRelation: "tecnicas"
            referencedColumns: ["id"]
          },
        ]
      }
      comanda_items: {
        Row: {
          cantidad: number
          coctel_id: number | null
          comanda_id: number
          estado_item: string
          id: number
          insumo_id: number | null
          notas_especiales: string | null
          precio_unitario: number
        }
        Insert: {
          cantidad?: number
          coctel_id?: number | null
          comanda_id: number
          estado_item?: string
          id?: never
          insumo_id?: number | null
          notas_especiales?: string | null
          precio_unitario: number
        }
        Update: {
          cantidad?: number
          coctel_id?: number | null
          comanda_id?: number
          estado_item?: string
          id?: never
          insumo_id?: number | null
          notas_especiales?: string | null
          precio_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "comanda_items_coctel_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comanda_items_comanda_fkey"
            columns: ["comanda_id"]
            isOneToOne: false
            referencedRelation: "comandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comanda_items_insumo_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      comandas: {
        Row: {
          created_at: string
          estado: string
          id: number
          mesa_id: number
          metodo_pago: string | null
          observaciones: string | null
          propina: number
          subtotal: number
          total_venta: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: string
          id?: never
          mesa_id: number
          metodo_pago?: string | null
          observaciones?: string | null
          propina?: number
          subtotal?: number
          total_venta?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: string
          id?: never
          mesa_id?: number
          metodo_pago?: string | null
          observaciones?: string | null
          propina?: number
          subtotal?: number
          total_venta?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comandas_mesa_fkey"
            columns: ["mesa_id"]
            isOneToOne: false
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_etapa_items: {
        Row: {
          coctel_id: number | null
          etapa_id: number
          id: number
          insumo_id: number | null
          volumen_proyectado_total: number | null
        }
        Insert: {
          coctel_id?: number | null
          etapa_id: number
          id?: never
          insumo_id?: number | null
          volumen_proyectado_total?: number | null
        }
        Update: {
          coctel_id?: number | null
          etapa_id?: number
          id?: never
          insumo_id?: number | null
          volumen_proyectado_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_etapa_items_coctel_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_etapa_items_etapa_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "evento_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_etapa_items_insumo_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_etapa_salones: {
        Row: {
          etapa_id: number
          id: number
          salon_id: number
        }
        Insert: {
          etapa_id: number
          id?: never
          salon_id: number
        }
        Update: {
          etapa_id?: number
          id?: never
          salon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ev_etapa_salon_etapa_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "evento_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ev_etapa_salon_salon_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones_espacios"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_etapas: {
        Row: {
          evento_id: number
          hora_fin: string | null
          hora_inicio: string | null
          id: number
          modalidad_calculo: string | null
          nombre: string
          orden: number
          pax_etapa: number | null
          regla_consumo: number | null
        }
        Insert: {
          evento_id: number
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: never
          modalidad_calculo?: string | null
          nombre: string
          orden: number
          pax_etapa?: number | null
          regla_consumo?: number | null
        }
        Update: {
          evento_id?: number
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: never
          modalidad_calculo?: string | null
          nombre?: string
          orden?: number
          pax_etapa?: number | null
          regla_consumo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_etapas_evento_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_staff_asignacion: {
        Row: {
          etapa_id: number | null
          evento_id: number
          hora_citacion: string | null
          id: number
          punto_servicio_id: number | null
          staff_id: number
        }
        Insert: {
          etapa_id?: number | null
          evento_id: number
          hora_citacion?: string | null
          id?: never
          punto_servicio_id?: number | null
          staff_id: number
        }
        Update: {
          etapa_id?: number | null
          evento_id?: number
          hora_citacion?: string | null
          id?: never
          punto_servicio_id?: number | null
          staff_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "evento_staff_asignacion_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "evento_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_staff_asignacion_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_staff_asignacion_punto_servicio_id_fkey"
            columns: ["punto_servicio_id"]
            isOneToOne: false
            referencedRelation: "puntos_servicio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_staff_asignacion_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_empresa_id: number | null
          cliente_final_id: number | null
          created_at: string
          estado: string
          fecha_evento: string
          hora_fin: string
          hora_inicio: string
          id: number
          mandante_id: number | null
          nombre: string
          observaciones_logistica: string | null
          salon_id: number | null
          slug: string
          spot_id: number | null
          tipo_evento: string | null
          total_pax: number
        }
        Insert: {
          cliente_empresa_id?: number | null
          cliente_final_id?: number | null
          created_at?: string
          estado?: string
          fecha_evento: string
          hora_fin: string
          hora_inicio: string
          id?: never
          mandante_id?: number | null
          nombre: string
          observaciones_logistica?: string | null
          salon_id?: number | null
          slug: string
          spot_id?: number | null
          tipo_evento?: string | null
          total_pax: number
        }
        Update: {
          cliente_empresa_id?: number | null
          cliente_final_id?: number | null
          created_at?: string
          estado?: string
          fecha_evento?: string
          hora_fin?: string
          hora_inicio?: string
          id?: never
          mandante_id?: number | null
          nombre?: string
          observaciones_logistica?: string | null
          salon_id?: number | null
          slug?: string
          spot_id?: number | null
          tipo_evento?: string | null
          total_pax?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_final_id_fkey"
            columns: ["cliente_final_id"]
            isOneToOne: false
            referencedRelation: "clientes_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_cliente_fkey"
            columns: ["cliente_empresa_id"]
            isOneToOne: false
            referencedRelation: "clientes_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_mandante_id_fkey"
            columns: ["mandante_id"]
            isOneToOne: false
            referencedRelation: "clientes_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_salon_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones_espacios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_spot_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      familias: {
        Row: {
          formula_balance_sugerida: string | null
          id: number
          nombre: string
          slug: string
        }
        Insert: {
          formula_balance_sugerida?: string | null
          id?: number
          nombre: string
          slug: string
        }
        Update: {
          formula_balance_sugerida?: string | null
          id?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      garnishes: {
        Row: {
          id: number
          insumo_base_id: number
          nombre: string
          rendimiento_por_unidad: number
          tipo_corte: string
        }
        Insert: {
          id?: never
          insumo_base_id: number
          nombre: string
          rendimiento_por_unidad?: number
          tipo_corte: string
        }
        Update: {
          id?: never
          insumo_base_id?: number
          nombre?: string
          rendimiento_por_unidad?: number
          tipo_corte?: string
        }
        Relationships: [
          {
            foreignKeyName: "garnishes_insumo_base_id_fkey"
            columns: ["insumo_base_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      herramientas: {
        Row: {
          categoria: string | null
          id: number
          nombre: string
          proveedor_id: number | null
          slug: string
        }
        Insert: {
          categoria?: string | null
          id?: never
          nombre: string
          proveedor_id?: number | null
          slug: string
        }
        Update: {
          categoria?: string | null
          id?: never
          nombre?: string
          proveedor_id?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "herramientas_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      hielos: {
        Row: {
          dilucion_pasiva: string
          id: number
          nombre: string
          slug: string
        }
        Insert: {
          dilucion_pasiva: string
          id?: number
          nombre: string
          slug: string
        }
        Update: {
          dilucion_pasiva?: string
          id?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      insumo_precios_historicos: {
        Row: {
          costo_unitario: number
          created_at: string
          id: number
          insumo_id: number
          precio_compra: number
          proveedor_id: number | null
        }
        Insert: {
          costo_unitario?: number
          created_at?: string
          id?: number
          insumo_id: number
          precio_compra?: number
          proveedor_id?: number | null
        }
        Update: {
          costo_unitario?: number
          created_at?: string
          id?: number
          insumo_id?: number
          precio_compra?: number
          proveedor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insumo_precios_historicos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumo_precios_historicos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      insumo_proveedores: {
        Row: {
          insumo_id: number
          precio_oferta: number | null
          proveedor_id: number
        }
        Insert: {
          insumo_id: number
          precio_oferta?: number | null
          proveedor_id: number
        }
        Update: {
          insumo_id?: number
          precio_oferta?: number | null
          proveedor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "insumo_proveedores_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumo_proveedores_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
        Row: {
          costo_unitario: number
          es_artesanal: boolean | null
          formato_envase: number
          graduacion_alcohol_base: number
          id: number
          nombre: string
          precio_compra: number
          rendimiento_neto_porcentaje: number | null
          slug: string
          tipo_id: number | null
          unidad_medida: string
        }
        Insert: {
          costo_unitario: number
          es_artesanal?: boolean | null
          formato_envase: number
          graduacion_alcohol_base?: number
          id?: number
          nombre: string
          precio_compra: number
          rendimiento_neto_porcentaje?: number | null
          slug: string
          tipo_id?: number | null
          unidad_medida: string
        }
        Update: {
          costo_unitario?: number
          es_artesanal?: boolean | null
          formato_envase?: number
          graduacion_alcohol_base?: number
          id?: number
          nombre?: string
          precio_compra?: number
          rendimiento_neto_porcentaje?: number | null
          slug?: string
          tipo_id?: number | null
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "insumos_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      mesas: {
        Row: {
          capacidad_personas: number | null
          estado: string
          id: number
          numero_nombre: string
        }
        Insert: {
          capacidad_personas?: number | null
          estado?: string
          id?: never
          numero_nombre: string
        }
        Update: {
          capacidad_personas?: number | null
          estado?: string
          id?: never
          numero_nombre?: string
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          contacto: string | null
          email: string | null
          id: number
          nombre: string
          observaciones: string | null
          telefono: string | null
        }
        Insert: {
          contacto?: string | null
          email?: string | null
          id?: number
          nombre: string
          observaciones?: string | null
          telefono?: string | null
        }
        Update: {
          contacto?: string | null
          email?: string | null
          id?: number
          nombre?: string
          observaciones?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      punto_servicio_oferta: {
        Row: {
          coctel_id: number | null
          factor_ajuste_demanda: number | null
          id: number
          insumo_id: number | null
          punto_servicio_id: number
        }
        Insert: {
          coctel_id?: number | null
          factor_ajuste_demanda?: number | null
          id?: never
          insumo_id?: number | null
          punto_servicio_id: number
        }
        Update: {
          coctel_id?: number | null
          factor_ajuste_demanda?: number | null
          id?: never
          insumo_id?: number | null
          punto_servicio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "pto_srv_oferta_coctel_fkey"
            columns: ["coctel_id"]
            isOneToOne: false
            referencedRelation: "cocteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pto_srv_oferta_insumo_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pto_srv_oferta_punto_fkey"
            columns: ["punto_servicio_id"]
            isOneToOne: false
            referencedRelation: "puntos_servicio"
            referencedColumns: ["id"]
          },
        ]
      }
      puntos_servicio: {
        Row: {
          estado: string | null
          evento_etapa_salon_id: number
          id: number
          nombre: string
          pax_estimado_asignado: number | null
        }
        Insert: {
          estado?: string | null
          evento_etapa_salon_id: number
          id?: never
          nombre: string
          pax_estimado_asignado?: number | null
        }
        Update: {
          estado?: string | null
          evento_etapa_salon_id?: number
          id?: never
          nombre?: string
          pax_estimado_asignado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pto_srv_etapa_salon_fkey"
            columns: ["evento_etapa_salon_id"]
            isOneToOne: false
            referencedRelation: "evento_etapa_salones"
            referencedColumns: ["id"]
          },
        ]
      }
      salones_espacios: {
        Row: {
          capacidad_maxima_pax: number | null
          id: number
          nombre: string
          spot_id: number | null
          ubicacion_referencia: string | null
        }
        Insert: {
          capacidad_maxima_pax?: number | null
          id?: never
          nombre: string
          spot_id?: number | null
          ubicacion_referencia?: string | null
        }
        Update: {
          capacidad_maxima_pax?: number | null
          id?: never
          nombre?: string
          spot_id?: number | null
          ubicacion_referencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salones_espacios_spot_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      soportes: {
        Row: {
          capacidad_operativa_ml: number
          id: number
          nombre: string
          proveedor_id: number | null
          racks_por_pallet: number | null
          slug: string
          unidades_por_rack: number | null
        }
        Insert: {
          capacidad_operativa_ml: number
          id?: number
          nombre: string
          proveedor_id?: number | null
          racks_por_pallet?: number | null
          slug: string
          unidades_por_rack?: number | null
        }
        Update: {
          capacidad_operativa_ml?: number
          id?: number
          nombre?: string
          proveedor_id?: number | null
          racks_por_pallet?: number | null
          slug?: string
          unidades_por_rack?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "soportes_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      spots: {
        Row: {
          ciudad: string | null
          direccion: string | null
          id: number
          nombre: string
          tipo: string | null
        }
        Insert: {
          ciudad?: string | null
          direccion?: string | null
          id?: never
          nombre: string
          tipo?: string | null
        }
        Update: {
          ciudad?: string | null
          direccion?: string | null
          id?: never
          nombre?: string
          tipo?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          estado: string | null
          id: number
          nombre: string
          rol: string | null
          telefono: string | null
        }
        Insert: {
          estado?: string | null
          id?: never
          nombre: string
          rol?: string | null
          telefono?: string | null
        }
        Update: {
          estado?: string | null
          id?: never
          nombre?: string
          rol?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      sub_receta_ingredientes: {
        Row: {
          cantidad: number
          id: number
          insumo_id: number
          sub_receta_id: number
          unidad_medida: string
        }
        Insert: {
          cantidad: number
          id?: number
          insumo_id: number
          sub_receta_id: number
          unidad_medida: string
        }
        Update: {
          cantidad?: number
          id?: number
          insumo_id?: number
          sub_receta_id?: number
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_receta_ingredientes_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_receta_ingredientes_sub_receta_id_fkey"
            columns: ["sub_receta_id"]
            isOneToOne: false
            referencedRelation: "sub_recetas_artesanales"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_receta_pasos_preparacion: {
        Row: {
          descripcion: string
          es_critico: boolean
          id: number
          numero_paso: number
          sub_receta_id: number
        }
        Insert: {
          descripcion: string
          es_critico?: boolean
          id?: number
          numero_paso: number
          sub_receta_id: number
        }
        Update: {
          descripcion?: string
          es_critico?: boolean
          id?: number
          numero_paso?: number
          sub_receta_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sub_receta_pasos_sub_receta_id_fkey"
            columns: ["sub_receta_id"]
            isOneToOne: false
            referencedRelation: "sub_recetas_artesanales"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_recetas_artesanales: {
        Row: {
          control_mermas_economia_circular: string | null
          elaboracion_instrucciones: string
          garnish_relacionado_id: number | null
          id: number
          indicaciones_almacenamiento: string
          insumo_asociado_id: number
          nombre: string
          rendimiento_batch: number
          slug: string
          tipo_id: number
          unidad_rendimiento: string
          vida_util: string
        }
        Insert: {
          control_mermas_economia_circular?: string | null
          elaboracion_instrucciones: string
          garnish_relacionado_id?: number | null
          id?: number
          indicaciones_almacenamiento: string
          insumo_asociado_id: number
          nombre: string
          rendimiento_batch: number
          slug: string
          tipo_id: number
          unidad_rendimiento: string
          vida_util: string
        }
        Update: {
          control_mermas_economia_circular?: string | null
          elaboracion_instrucciones?: string
          garnish_relacionado_id?: number | null
          id?: number
          indicaciones_almacenamiento?: string
          insumo_asociado_id?: number
          nombre?: string
          rendimiento_batch?: number
          slug?: string
          tipo_id?: number
          unidad_rendimiento?: string
          vida_util?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sub_receta_tipo"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_sub_recetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_recetas_artesanales_garnish_relacionado_id_fkey"
            columns: ["garnish_relacionado_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_recetas_artesanales_insumo_asociado_id_fkey"
            columns: ["insumo_asociado_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      tecnicas: {
        Row: {
          dilucion_estimada_porcentaje: number
          herramienta_requerida: string
          id: number
          nombre: string
          slug: string
        }
        Insert: {
          dilucion_estimada_porcentaje: number
          herramienta_requerida: string
          id?: number
          nombre: string
          slug: string
        }
        Update: {
          dilucion_estimada_porcentaje?: number
          herramienta_requerida?: string
          id?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      tipos_insumos: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string
          slug: string
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre: string
          slug: string
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      tipos_sub_recetas: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string
          slug: string
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre: string
          slug: string
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
