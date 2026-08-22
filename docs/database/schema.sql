-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias (
  id integer NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.familias (
  id integer NOT NULL DEFAULT nextval('familias_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  formula_balance_sugerida character varying,
  CONSTRAINT familias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.soportes (
  id integer NOT NULL DEFAULT nextval('soportes_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  capacidad_operativa_ml integer NOT NULL,
  unidades_por_rack integer DEFAULT 25,
  racks_por_pallet integer DEFAULT 4,
  proveedor_id integer,
  CONSTRAINT soportes_pkey PRIMARY KEY (id),
  CONSTRAINT soportes_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id)
);
CREATE TABLE public.hielos (
  id integer NOT NULL DEFAULT nextval('hielos_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  dilucion_pasiva character varying NOT NULL,
  CONSTRAINT hielos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tecnicas (
  id integer NOT NULL DEFAULT nextval('tecnicas_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  herramienta_requerida character varying NOT NULL,
  dilucion_estimada_porcentaje numeric NOT NULL,
  CONSTRAINT tecnicas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.insumos (
  id integer NOT NULL DEFAULT nextval('insumos_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  unidad_medida character varying NOT NULL CHECK (unidad_medida::text = ANY (ARRAY['ml'::character varying, 'g'::character varying, 'unit'::character varying]::text[])),
  formato_envase numeric NOT NULL,
  precio_compra numeric NOT NULL,
  costo_unitario numeric NOT NULL,
  graduacion_alcohol_base numeric NOT NULL DEFAULT 0.00,
  tipo_id integer,
  es_artesanal boolean DEFAULT false,
  rendimiento_neto_porcentaje numeric DEFAULT 1.00,
  CONSTRAINT insumos_pkey PRIMARY KEY (id),
  CONSTRAINT insumos_tipo_id_fkey FOREIGN KEY (tipo_id) REFERENCES public.tipos_insumos(id)
);
CREATE TABLE public.cocteles (
  id integer NOT NULL DEFAULT nextval('cocteles_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  coctel_base_id integer,
  categoria_id integer NOT NULL,
  familia_id integer NOT NULL,
  soporte_id integer NOT NULL,
  hielo_id integer NOT NULL,
  tecnica_id integer NOT NULL,
  reseña_inspiracion text,
  reseña_vista character varying,
  reseña_nariz character varying,
  reseña_boca character varying,
  maridaje_propuesta character varying,
  maridaje_justificacion text,
  maridaje_alternativa character varying,
  tips text,
  grado_alcohol numeric NOT NULL DEFAULT 0.00,
  porcentaje_azucar numeric NOT NULL DEFAULT 0.00,
  costo_produccion numeric NOT NULL DEFAULT 0.00,
  precio_venta_sugerido numeric NOT NULL DEFAULT 0.00,
  CONSTRAINT cocteles_pkey PRIMARY KEY (id),
  CONSTRAINT cocteles_coctel_base_id_fkey FOREIGN KEY (coctel_base_id) REFERENCES public.cocteles(id),
  CONSTRAINT cocteles_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id),
  CONSTRAINT cocteles_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES public.familias(id),
  CONSTRAINT cocteles_soporte_id_fkey FOREIGN KEY (soporte_id) REFERENCES public.soportes(id),
  CONSTRAINT cocteles_hielo_id_fkey FOREIGN KEY (hielo_id) REFERENCES public.hielos(id),
  CONSTRAINT cocteles_tecnica_id_fkey FOREIGN KEY (tecnica_id) REFERENCES public.tecnicas(id)
);
CREATE TABLE public.coctel_ingredientes (
  id integer NOT NULL DEFAULT nextval('coctel_ingredientes_id_seq'::regclass),
  coctel_id integer NOT NULL,
  insumo_id integer NOT NULL,
  cantidad numeric NOT NULL,
  unidad_medida character varying NOT NULL CHECK (unidad_medida::text = ANY (ARRAY['ml'::character varying, 'g'::character varying, 'unit'::character varying, 'dash'::character varying]::text[])),
  CONSTRAINT coctel_ingredientes_pkey PRIMARY KEY (id),
  CONSTRAINT coctel_ingredientes_coctel_id_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id),
  CONSTRAINT coctel_ingredientes_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id)
);
CREATE TABLE public.coctel_pasos_preparacion (
  id integer NOT NULL DEFAULT nextval('coctel_pasos_preparacion_id_seq'::regclass),
  coctel_id integer NOT NULL,
  numero_paso integer NOT NULL,
  descripcion text NOT NULL,
  es_critico boolean NOT NULL DEFAULT false,
  tecnica_asociada_id integer,
  CONSTRAINT coctel_pasos_preparacion_pkey PRIMARY KEY (id),
  CONSTRAINT coctel_pasos_preparacion_coctel_id_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id),
  CONSTRAINT coctel_pasos_preparacion_tecnica_asociada_id_fkey FOREIGN KEY (tecnica_asociada_id) REFERENCES public.tecnicas(id)
);
CREATE TABLE public.sub_recetas_artesanales (
  id integer NOT NULL DEFAULT nextval('sub_recetas_artesanales_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  rendimiento_batch numeric NOT NULL,
  unidad_rendimiento character varying NOT NULL CHECK (unidad_rendimiento::text = ANY (ARRAY['ml'::character varying, 'g'::character varying, 'unit'::character varying]::text[])),
  elaboracion_instrucciones text NOT NULL,
  indicaciones_almacenamiento text NOT NULL,
  vida_util character varying NOT NULL,
  control_mermas_economia_circular text,
  garnish_relacionado_id integer,
  insumo_asociado_id integer NOT NULL,
  tipo_id integer NOT NULL,
  CONSTRAINT sub_recetas_artesanales_pkey PRIMARY KEY (id),
  CONSTRAINT sub_recetas_artesanales_garnish_relacionado_id_fkey FOREIGN KEY (garnish_relacionado_id) REFERENCES public.insumos(id),
  CONSTRAINT sub_recetas_artesanales_insumo_asociado_id_fkey FOREIGN KEY (insumo_asociado_id) REFERENCES public.insumos(id),
  CONSTRAINT fk_sub_receta_tipo FOREIGN KEY (tipo_id) REFERENCES public.tipos_sub_recetas(id)
);
CREATE TABLE public.sub_receta_ingredientes (
  id integer NOT NULL DEFAULT nextval('sub_receta_ingredientes_id_seq'::regclass),
  sub_receta_id integer NOT NULL,
  insumo_id integer NOT NULL,
  cantidad numeric NOT NULL,
  unidad_medida character varying NOT NULL CHECK (unidad_medida::text = ANY (ARRAY['ml'::character varying, 'g'::character varying, 'unit'::character varying, 'dash'::character varying]::text[])),
  CONSTRAINT sub_receta_ingredientes_pkey PRIMARY KEY (id),
  CONSTRAINT sub_receta_ingredientes_sub_receta_id_fkey FOREIGN KEY (sub_receta_id) REFERENCES public.sub_recetas_artesanales(id),
  CONSTRAINT sub_receta_ingredientes_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id)
);
CREATE TABLE public.coctel_galeria_fotos (
  id integer NOT NULL DEFAULT nextval('coctel_galeria_fotos_id_seq'::regclass),
  coctel_id integer,
  sub_receta_id integer,
  url_archivo character varying NOT NULL,
  tipo_imagen character varying NOT NULL CHECK (tipo_imagen::text = ANY (ARRAY['real_carta'::character varying, 'paso_a_paso'::character varying, 'boceto_ia_concepto'::character varying]::text[])),
  pie_de_foto character varying,
  CONSTRAINT coctel_galeria_fotos_pkey PRIMARY KEY (id),
  CONSTRAINT coctel_galeria_fotos_coctel_id_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id),
  CONSTRAINT coctel_galeria_fotos_sub_receta_id_fkey FOREIGN KEY (sub_receta_id) REFERENCES public.sub_recetas_artesanales(id)
);
CREATE TABLE public.tipos_sub_recetas (
  id integer NOT NULL DEFAULT nextval('tipos_sub_recetas_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  CONSTRAINT tipos_sub_recetas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tipos_insumos (
  id integer NOT NULL DEFAULT nextval('tipos_insumos_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  CONSTRAINT tipos_insumos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.proveedores (
  id integer NOT NULL DEFAULT nextval('proveedores_id_seq'::regclass),
  nombre character varying NOT NULL,
  contacto character varying,
  telefono character varying,
  email character varying,
  observaciones text,
  CONSTRAINT proveedores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.insumo_proveedores (
  insumo_id integer NOT NULL,
  proveedor_id integer NOT NULL,
  precio_oferta numeric,
  CONSTRAINT insumo_proveedores_pkey PRIMARY KEY (insumo_id, proveedor_id),
  CONSTRAINT insumo_proveedores_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id),
  CONSTRAINT insumo_proveedores_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id)
);
CREATE TABLE public.sub_receta_pasos_preparacion (
  id integer NOT NULL DEFAULT nextval('sub_receta_pasos_preparacion_id_seq'::regclass),
  sub_receta_id integer NOT NULL,
  numero_paso integer NOT NULL,
  descripcion text NOT NULL,
  es_critico boolean NOT NULL DEFAULT false,
  CONSTRAINT sub_receta_pasos_preparacion_pkey PRIMARY KEY (id),
  CONSTRAINT sub_receta_pasos_sub_receta_id_fkey FOREIGN KEY (sub_receta_id) REFERENCES public.sub_recetas_artesanales(id)
);
CREATE TABLE public.insumo_precios_historicos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  insumo_id bigint NOT NULL,
  precio_compra numeric NOT NULL DEFAULT 0.00,
  costo_unitario numeric NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  proveedor_id bigint,
  CONSTRAINT insumo_precios_historicos_pkey PRIMARY KEY (id),
  CONSTRAINT insumo_precios_historicos_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id),
  CONSTRAINT insumo_precios_historicos_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id)
);
CREATE TABLE public.cartas (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  tematica character varying,
  cliente_institucion character varying,
  descripcion text,
  estado character varying NOT NULL DEFAULT 'activa'::character varying CHECK (estado::text = ANY (ARRAY['activa'::character varying, 'archivada'::character varying, 'borrador'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT cartas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.carta_cocteles (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  carta_id integer NOT NULL,
  coctel_id integer NOT NULL,
  orden_aparicion integer DEFAULT 0,
  seccion_personalizada character varying,
  precio_venta_override numeric,
  CONSTRAINT carta_cocteles_pkey PRIMARY KEY (id),
  CONSTRAINT carta_cocteles_carta_id_fkey FOREIGN KEY (carta_id) REFERENCES public.cartas(id),
  CONSTRAINT carta_cocteles_coctel_id_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id)
);
CREATE TABLE public.clientes_empresas (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['empresa_final'::text, 'productora'::text, 'banquetera'::text, 'centro_eventos'::text, 'particular'::text])),
  contacto_nombre character varying,
  telefono character varying,
  email character varying,
  CONSTRAINT clientes_empresas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.salones_espacios (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  ubicacion_referencia character varying,
  capacidad_maxima_pax integer,
  spot_id integer,
  CONSTRAINT salones_espacios_pkey PRIMARY KEY (id),
  CONSTRAINT salones_espacios_spot_fkey FOREIGN KEY (spot_id) REFERENCES public.spots(id)
);
CREATE TABLE public.eventos (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  cliente_empresa_id integer,
  salon_id integer,
  fecha_evento date NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  total_pax integer NOT NULL,
  estado character varying NOT NULL DEFAULT 'cotizacion'::character varying CHECK (estado::text = ANY (ARRAY['cotizacion'::character varying, 'confirmado'::character varying, 'en_produccion'::character varying, 'ejecutado'::character varying, 'cancelado'::character varying]::text[])),
  observaciones_logistica text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  spot_id integer,
  tipo_evento character varying CHECK (tipo_evento::text = ANY (ARRAY['corporativo'::text, 'matrimonio'::text, 'cumpleanos'::text, 'activacion_marca'::text, 'festival_masivo'::text, 'particular'::text, 'otro'::text])),
  mandante_id integer,
  cliente_final_id integer,
  CONSTRAINT eventos_pkey PRIMARY KEY (id),
  CONSTRAINT eventos_cliente_fkey FOREIGN KEY (cliente_empresa_id) REFERENCES public.clientes_empresas(id),
  CONSTRAINT eventos_salon_fkey FOREIGN KEY (salon_id) REFERENCES public.salones_espacios(id),
  CONSTRAINT eventos_spot_fkey FOREIGN KEY (spot_id) REFERENCES public.spots(id),
  CONSTRAINT eventos_mandante_id_fkey FOREIGN KEY (mandante_id) REFERENCES public.clientes_empresas(id),
  CONSTRAINT eventos_cliente_final_id_fkey FOREIGN KEY (cliente_final_id) REFERENCES public.clientes_empresas(id)
);
CREATE TABLE public.evento_etapas (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  evento_id integer NOT NULL,
  orden integer NOT NULL,
  nombre character varying NOT NULL,
  hora_inicio time without time zone,
  hora_fin time without time zone,
  modalidad_calculo character varying CHECK (modalidad_calculo::text = ANY (ARRAY['paquete_fijo'::character varying, 'barra_libre'::character varying, 'tickets'::character varying]::text[])),
  pax_etapa integer,
  regla_consumo numeric,
  CONSTRAINT evento_etapas_pkey PRIMARY KEY (id),
  CONSTRAINT evento_etapas_evento_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id)
);
CREATE TABLE public.evento_etapa_items (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  etapa_id integer NOT NULL,
  coctel_id integer,
  volumen_proyectado_total numeric,
  concepto_id integer,
  CONSTRAINT evento_etapa_items_pkey PRIMARY KEY (id),
  CONSTRAINT evento_etapa_items_etapa_fkey FOREIGN KEY (etapa_id) REFERENCES public.evento_etapas(id),
  CONSTRAINT evento_etapa_items_coctel_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id),
  CONSTRAINT evento_etapa_items_concepto_fkey FOREIGN KEY (concepto_id) REFERENCES public.conceptos_oferta(id)
);
CREATE TABLE public.spots (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['centro_eventos'::character varying, 'hotel'::character varying, 'casino'::character varying, 'centro_convenciones'::character varying, 'otro'::character varying]::text[])),
  direccion character varying,
  ciudad character varying DEFAULT 'Santiago'::character varying,
  CONSTRAINT spots_pkey PRIMARY KEY (id)
);
CREATE TABLE public.evento_etapa_salones (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  etapa_id integer NOT NULL,
  salon_id integer NOT NULL,
  CONSTRAINT evento_etapa_salones_pkey PRIMARY KEY (id),
  CONSTRAINT ev_etapa_salon_etapa_fkey FOREIGN KEY (etapa_id) REFERENCES public.evento_etapas(id),
  CONSTRAINT ev_etapa_salon_salon_fkey FOREIGN KEY (salon_id) REFERENCES public.salones_espacios(id)
);
CREATE TABLE public.puntos_servicio (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  estado character varying DEFAULT 'activo'::character varying,
  CONSTRAINT puntos_servicio_pkey PRIMARY KEY (id)
);
CREATE TABLE public.punto_servicio_oferta (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  punto_servicio_id integer NOT NULL,
  coctel_id integer,
  factor_ajuste_demanda numeric DEFAULT 1.00,
  concepto_id integer,
  CONSTRAINT punto_servicio_oferta_pkey PRIMARY KEY (id),
  CONSTRAINT pto_srv_oferta_punto_fkey FOREIGN KEY (punto_servicio_id) REFERENCES public.puntos_servicio(id),
  CONSTRAINT pto_srv_oferta_coctel_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id),
  CONSTRAINT pto_srv_oferta_concepto_fkey FOREIGN KEY (concepto_id) REFERENCES public.conceptos_oferta(id)
);
CREATE TABLE public.mesas (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  numero_nombre character varying NOT NULL UNIQUE,
  capacidad_personas integer DEFAULT 4,
  estado character varying NOT NULL DEFAULT 'libre'::character varying CHECK (estado::text = ANY (ARRAY['libre'::character varying, 'ocupada'::character varying, 'reservada'::character varying, 'mantenimiento'::character varying]::text[])),
  CONSTRAINT mesas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.comandas (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  mesa_id integer NOT NULL,
  estado character varying NOT NULL DEFAULT 'abierta'::character varying CHECK (estado::text = ANY (ARRAY['abierta'::character varying, 'en_preparacion'::character varying, 'lista'::character varying, 'pagada'::character varying, 'anulada'::character varying]::text[])),
  subtotal numeric NOT NULL DEFAULT 0.00,
  propina numeric NOT NULL DEFAULT 0.00,
  total_venta numeric NOT NULL DEFAULT 0.00,
  metodo_pago character varying CHECK (metodo_pago::text = ANY (ARRAY['efectivo'::character varying, 'tarjeta_debito'::character varying, 'tarjeta_credito'::character varying, 'transferencia'::character varying, 'cortesia'::character varying]::text[])),
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comandas_pkey PRIMARY KEY (id),
  CONSTRAINT comandas_mesa_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id)
);
CREATE TABLE public.comanda_items (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  comanda_id integer NOT NULL,
  coctel_id integer,
  insumo_id integer,
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario numeric NOT NULL,
  estado_item character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado_item::text = ANY (ARRAY['pendiente'::character varying, 'preparando'::character varying, 'listo'::character varying, 'entregado'::character varying, 'cancelado'::character varying]::text[])),
  notas_especiales text,
  CONSTRAINT comanda_items_pkey PRIMARY KEY (id),
  CONSTRAINT comanda_items_comanda_fkey FOREIGN KEY (comanda_id) REFERENCES public.comandas(id),
  CONSTRAINT comanda_items_coctel_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id),
  CONSTRAINT comanda_items_insumo_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id)
);
CREATE TABLE public.herramientas (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  categoria character varying CHECK (categoria::text = ANY (ARRAY['preparacion'::character varying, 'servicio'::character varying, 'montaje'::character varying]::text[])),
  proveedor_id integer,
  CONSTRAINT herramientas_pkey PRIMARY KEY (id),
  CONSTRAINT herramientas_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id)
);
CREATE TABLE public.garnishes (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  insumo_base_id integer NOT NULL,
  nombre character varying NOT NULL,
  tipo_corte character varying NOT NULL,
  rendimiento_por_unidad numeric NOT NULL DEFAULT 1,
  CONSTRAINT garnishes_pkey PRIMARY KEY (id),
  CONSTRAINT garnishes_insumo_base_id_fkey FOREIGN KEY (insumo_base_id) REFERENCES public.insumos(id)
);
CREATE TABLE public.coctel_garnishes (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  coctel_id integer NOT NULL,
  garnish_id integer NOT NULL,
  cantidad numeric NOT NULL DEFAULT 1,
  CONSTRAINT coctel_garnishes_pkey PRIMARY KEY (id),
  CONSTRAINT coctel_garnishes_coctel_id_fkey FOREIGN KEY (coctel_id) REFERENCES public.cocteles(id),
  CONSTRAINT coctel_garnishes_garnish_id_fkey FOREIGN KEY (garnish_id) REFERENCES public.garnishes(id)
);
CREATE TABLE public.staff (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  rol character varying CHECK (rol::text = ANY (ARRAY['produccion'::character varying, 'barback'::character varying, 'bartender'::character varying, 'capitan'::character varying]::text[])),
  telefono character varying,
  estado character varying DEFAULT 'activo'::character varying,
  CONSTRAINT staff_pkey PRIMARY KEY (id)
);
CREATE TABLE public.evento_staff_asignacion (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  staff_id integer NOT NULL,
  evento_id integer NOT NULL,
  etapa_id integer,
  punto_servicio_id integer,
  hora_citacion time without time zone,
  CONSTRAINT evento_staff_asignacion_pkey PRIMARY KEY (id),
  CONSTRAINT evento_staff_asignacion_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id),
  CONSTRAINT evento_staff_asignacion_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id),
  CONSTRAINT evento_staff_asignacion_etapa_id_fkey FOREIGN KEY (etapa_id) REFERENCES public.evento_etapas(id),
  CONSTRAINT evento_staff_asignacion_punto_servicio_id_fkey FOREIGN KEY (punto_servicio_id) REFERENCES public.puntos_servicio(id)
);
CREATE TABLE public.punto_servicio_asignaciones (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  punto_servicio_id integer NOT NULL,
  evento_etapa_salon_id integer NOT NULL,
  pax_estimado_asignado integer,
  CONSTRAINT punto_servicio_asignaciones_pkey PRIMARY KEY (id),
  CONSTRAINT psa_etapa_salon_fkey FOREIGN KEY (evento_etapa_salon_id) REFERENCES public.evento_etapa_salones(id),
  CONSTRAINT psa_punto_fkey FOREIGN KEY (punto_servicio_id) REFERENCES public.puntos_servicio(id)
);
CREATE TABLE public.categorias_servicio (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  estado character varying DEFAULT 'activo'::character varying,
  CONSTRAINT categorias_servicio_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conceptos_oferta (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  slug character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  unidad_medida_base character varying NOT NULL CHECK (unidad_medida_base::text = ANY (ARRAY['ml'::text, 'g'::text, 'unit'::text])),
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['destilado'::text, 'mixer'::text, 'cristaleria'::text, 'garnish'::text, 'otro'::text])),
  estado character varying DEFAULT 'activo'::character varying,
  CONSTRAINT conceptos_oferta_pkey PRIMARY KEY (id)
);
CREATE TABLE public.concepto_insumo_equivalencias (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  concepto_id integer NOT NULL,
  categoria_servicio_id integer NOT NULL,
  insumo_id integer NOT NULL,
  prioridad integer NOT NULL DEFAULT 1,
  estado character varying DEFAULT 'activo'::character varying,
  CONSTRAINT concepto_insumo_equivalencias_pkey PRIMARY KEY (id),
  CONSTRAINT cie_concepto_fkey FOREIGN KEY (concepto_id) REFERENCES public.conceptos_oferta(id),
  CONSTRAINT cie_categoria_fkey FOREIGN KEY (categoria_servicio_id) REFERENCES public.categorias_servicio(id),
  CONSTRAINT cie_insumo_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id)
);