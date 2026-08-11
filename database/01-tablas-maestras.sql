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
  CONSTRAINT soportes_pkey PRIMARY KEY (id)
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