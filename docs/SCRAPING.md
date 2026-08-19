# Especificación de Arquitectura: Motor de Scraping de Proveedores

## 1. Visión General
El objetivo de este módulo es automatizar la ingesta y actualización de catálogos y precios desde los sitios web de los distribuidores de Barodria. 
Para eludir restricciones de CORS, protecciones anti-bots y no comprometer el rendimiento de la PWA, **el scraping no se ejecutará en el cliente (navegador)**, sino mediante un modelo de Workers asíncronos apoyados en Supabase.

## 2. Arquitectura de Ejecución (Desacoplada)

El sistema operará bajo una arquitectura de 3 capas:
1. **PWA (Frontend):** Actúa como panel de control. Dispara los trabajos (Jobs) de escaneo, escucha el progreso mediante Supabase Realtime y permite al usuario vincular (*mapear*) productos externos con insumos locales.
2. **Supabase (BaaS):** Almacena la cola de trabajos (`scraping_jobs`), el catálogo temporal y mantiene el historial de precios vinculados.
3. **Worker Scraper (Backend Externo):** Scripts en Node.js (usando Cheerio o Playwright) alojados en plataformas Serverless (GitHub Actions, Railway o Supabase Edge Functions) que ejecutan la extracción real de datos.

## 3. Flujo Operativo en Dos Fases

Para optimizar recursos y evitar baneos de IP por parte de los proveedores, el proceso se divide en dos estrategias distintas:

### Fase 1: Discovery (Escaneo de Catálogo Completo)
Se ejecuta bajo demanda (manualmente) cuando se agrega un nuevo proveedor o se busca actualizar su catálogo completo.
- **Flujo:** La PWA inserta un registro en `scraping_jobs`. El Worker lo detecta, escanea toda la tienda del proveedor y vuelca los resultados en la tabla `catalogo_externo_proveedor`.
- **UI:** La PWA lee esta tabla y muestra un "Asignador Dual" donde el usuario selecciona qué productos externos le interesan y los vincula a sus propios Insumos.

### Fase 2: Sync Puntual (Actualización de Precios)
Se ejecuta de forma automatizada (Cron) de manera semanal o diaria.
- **Flujo:** El Worker lee la tabla `insumos_proveedores_vinculados`. Solo extrae información de las URLs específicas de los productos ya mapeados.
- **Beneficio:** Reduce el tráfico en un 95%. En lugar de escanear 1,000 productos, el bot hace 15 peticiones directas y actualiza los costos operativos instantáneamente.

## 4. Diseño del Modelo de Datos (Esquema SQL)

El motor requerirá las siguientes estructuras integradas a la base de datos transaccional:

```sql
-- Extensión a tabla existente
ALTER TABLE proveedores 
ADD COLUMN url_sitio_web TEXT,
ADD COLUMN tipo_motor_scraper VARCHAR(50); -- 'shopify_api', 'woocommerce', 'html_custom'

-- Tabla de control asíncrono
CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proveedor_id UUID REFERENCES proveedores(id),
    tipo_job VARCHAR(50) NOT NULL, -- 'discovery_completo' | 'sync_precios'
    estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'procesando', 'completado', 'error'
    resultado_resumen JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla caché del catálogo total del proveedor
CREATE TABLE catalogo_externo_proveedor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proveedor_id UUID REFERENCES proveedores(id),
    sku_externo VARCHAR(255),
    url_producto TEXT NOT NULL,
    nombre_original_proveedor TEXT NOT NULL,
    precio_detectado NUMERIC,
    estado_stock VARCHAR(50) DEFAULT 'disponible',
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla relacional: Lo que realmente monitorea Barodria
CREATE TABLE insumos_proveedores_vinculados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insumo_id UUID REFERENCES insumos(id),
    proveedor_id UUID REFERENCES proveedores(id),
    url_especifica_producto TEXT NOT NULL,
    ultimo_precio_registrado NUMERIC,
    ultima_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(insumo_id, proveedor_id)
);