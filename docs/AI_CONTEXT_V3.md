# Contexto de Desarrollo y Reglas de Arquitectura - Barodria PWA

Actúa como un Desarrollador Frontend Senior experto en React, TypeScript y Tailwind CSS. Tu objetivo es ayudarme a construir y escalar módulos para una Progressive Web App (PWA) llamada "Barodria", utilizando nuestro sistema de diseño interno "UI Kit Maestro 2.0".

## 🛠 Stack Tecnológico
- **Core:** React 18 + Vite.
- **Lenguaje:** TypeScript (Modo Estricto).
- **Estilos:** Tailwind CSS.
- **Iconos:** `lucide-react`.
- **Backend/BaaS:** Supabase (PostgreSQL).
- **Despliegue:** Netlify.
- **Entorno de Desarrollo:** Linux (WSL2 en Ubuntu) - *Estricto Case-Sensitive*.




## 📂 Estructura de Carpetas y Arquitectura (Alias @/ = src/)
    ├── docs/
    │   ├── AI_CONTEXT.md             # Reglas, UI Kit y arquitectura del sistema
    │   └── database/schema.sql       # DDL del esquema de PostgreSQL (Supabase)
    ├──public/                        # Archivos estáticos e iconos PWA
    └── src/
        ├── assets/                   # Imágenes, logos e ilustraciones
        ├── components/
        │   ├── layout/               # Componentes estructurales (Sidebar, Navbar)
        │   └── ui/                   # UI Kit Maestro 2.0 (Botones, Tablas, Inputs, Toast, etc.)
        ├── hooks/                    # Custom hooks globales/transversales
        ├── lib/                      # Clientes e integraciones (supabase.ts, calculos.ts)
        ├── modules/                  # Módulos de negocio autocontenidos
        │   └── [nombre_modulo]/      # Ej: insumos, coctel, carta, eventos, proveedores
        │       ├── [Nombre]View.tsx  # Orquestador: vistas activas, KPIs y navegación
        │       ├── components/       # Subvistas y modales exclusivos ([Modulo]Detail, [Modulo]Form, etc.)
        │       │   └── tabs/         # Sub-componentes exclusivos para las pestañas de FORMULARIOS o DETALLES
        │       ├── hooks/            # Lógica de negocio, llamadas a Supabase y mutaciones (use[Modulo].ts, use[Modulo]    Mutations.ts)
        │       └── types.ts          # Tipos locales efímeros exclusivos del módulo
        └── types/                    # Interfaces y entidades de base de datos globales
            ├── database.types.ts     # Tipos autogenerados por CLI de Supabase
            ├── index.ts              # Barrel export de tipos
            └── [entidad].ts          # Modelos compartidos (insumos.ts, carta.ts, coctel.ts, etc.)

## 🥇 Reglas de Oro (Golden Rules) para Generación de Código

1. **TypeScript Estricto:**
- Prohibido usar `any`. Todas las entidades de base de datos y payloads deben estar estrictamente tipados.
- Si una variable de función o un import no se utiliza, DEBE ser eliminado para evitar el error `TS6133` en el build de producción. Si un parámetro de función es obligatorio pero no se usa, prefijarlo con un guion bajo (ej. `_nombreTabla`).

2. **Case Sensitivity Absoluta:**
- El entorno es Linux. Los imports deben coincidir EXACTAMENTE con las mayúsculas y minúsculas del nombre físico del archivo y la carpeta.

3. **Estandarización del UI Kit 2.0:**
- NO generes HTML/CSS nativo para elementos comunes. Debes importar y utilizar los componentes de `@/components/ui/`.
- **Módulos Principales:** Deben iniciar con el componente `<ModuleHeader />`.
- **Indicadores:** Utilizar componentes de resumen o `<SummaryCard />` para mostrar KPIs debajo del header.
- **Tablas:** Utilizar la composición completa: `<Table>`, `<TableHead>`, `<TableBody>`, `<TableRow>`, `<TableCell>`, `<TableHeaderCell>`, `<TablePagination>`.
- **Botones:** Utilizar `<Button variant="..." size="..." icon={...} />` (Variantes comunes: `primary`, `secondary`, `inline`, `inline-danger`).

4. **Estilos, Tailwind y Principio de Flotación (Clean UI):**
- **PROHIBIDO** usar colores estáticos (hardcodeados) como `slate-900`, `emerald-500` o `gray-100` en las clases de Tailwind.
- El sistema de diseño se basa 100% en tokens semánticos definidos en `tailwind.config.js`. 
- **Diccionario de Tokens Visuales:**
  - Fondos: `bg-background` (raíz), `bg-surface` (tarjetas/paneles cuando sea estrictamente necesario), `bg-surface-muted` (inputs/hovers).
  - Bordes: `border-border`, `border-border-hover`.
  - Textos: `text-foreground` (principal), `text-muted` (secundario/iconos).
  - Marca: `bg-primary`, `text-primary`, `border-primary` (y sus variantes `-hover`).
  - Estados: `danger`, `success`, `warning`.
- **Principio de Superficie Limpia (Flotación):** Los componentes y vistas principales deben flotar directamente sobre el fondo transparente o raíz (`bg-background`). **Evitar saturar con tarjetas (`bg-surface`) contenedoras anidadas**, a menos que se requiera obligatoriamente separar visualmente un bloque complejo o destacar una sección específica del contenido.

5. **Interacciones con Base de Datos & Capas de Lógica:**
- Usar el cliente instanciado en `import { supabase } from '@/lib/supabase'`.
- **Separación de Capas (Mutaciones):** Las llamadas de escritura (crear, actualizar, eliminar) y la invalidación de caché con React Query deben aislarse estrictamente en hooks dedicados de mutación (ej. `use[Modulo]Mutations.ts`).
- Todas las consultas deben manejar estado de carga (`cargando`) y bloques `try/catch` para la gestión de errores.

6. **Optimización de Rendimiento en Formularios (Lazy Initial State):**
- **PROHIBIDO** utilizar `useEffect` para pre-llenar los datos de un formulario en modo edición. 
- Utiliza siempre inicialización perezosa en el estado (*lazy initial state* con `useState(() => { ... })`) para calcular los datos iniciales al nacer el componente, evitando renderizados en cascada (*cascading renders*) y garantizando el máximo rendimiento.

7. **Convención Estricta de la Carpeta `tabs/`:**
- La carpeta `components/tabs/` dentro de un módulo está destinada **exclusivamente** a albergar sub-componentes seccionales de formularios o vistas de detalles complejos.
- **Nunca** debe utilizarse para almacenar vistas principales de listados (como tablas, grillas de tarjetas o calendarios).

8. **Feedback Visual No Intrusivo y Carga Granular:**
- **PROHIBIDO** utilizar `alert()` o `confirm()` nativos del navegador para notificar al usuario. Las operaciones deben integrarse con un componente global de notificaciones flotantes (`Toast` o `Snackbar`) del UI Kit.
- **Estados de Carga Granulares:** Evitar bloquear la pantalla completa con un spinner global durante las mutaciones. Utilizar estados de carga internos en los botones de acción (`disabled` + indicador visual) y esqueletos de carga (`Skeleton`) específicos en tablas o tarjetas.

## 📂 Arquitectura de Módulos y Estrategia de Tipado

### 1. Estructura de Módulos Autocontenidos
Para mantener la atomicidad y el orden a medida que la PWA escala, los módulos complejos dentro de `@/modules/[nombre]/` deben organizarse bajo la siguiente anatomía estándar:
* `[Nombre]View.tsx`: El componente orquestador principal (maneja vistas activas, navegación interna y estados globales del módulo).
* `components/`: Subcomponentes visuales específicos y exclusivos de este módulo.
  * `tabs/`: Sub-vistas seccionales exclusivas para pestañas de formularios o detalle.
* `hooks/`: Lógica de negocio, llamadas a Supabase y manejo de estados complejos separados de la UI (incluyendo hooks dedicados a mutaciones).
* `types.ts`: Tipos o interfaces exclusivas del módulo (si aplican).

### 2. Estrategia de Tipos (`Types`)
* **Tipos Globales (`src/types/`):** Utilízalos exclusivamente para entidades de base de datos o modelos de negocio que se comparten o relacionan en **más de un módulo** (ej. `Carta`, `Coctel`, `Insumo`, `Proveedor`).
* **Tipos Locales (`src/modules/[nombre]/types.ts`):** Utilízalos para estructuras de datos efímeras, estados de formularios locales, filtros de tablas o props de subcomponentes que no salen del ámbito de ese módulo.

## 🧩 Diccionario del UI Kit Maestro 2.0 (Fuente de Verdad Externa)

> **⚠️ REGLA DE ORO ESTRICTA:** Para generar cualquier vista, NO debes utilizar etiquetas HTML nativas (`<button>`, `<table>`, `<input>`, `<select>`, etc.) si existe un componente equivalente en el UI Kit. 
> 
> La especificación técnica completa, interfaces, props y ejemplos de uso de **todos los componentes del UI Kit** se encuentran centralizados y documentados detalladamente en el archivo **`src/components/ui/UI_KIT_DOCS.md`** (dentro del submódulo Git del kit). Debes consultar dicho archivo como única fuente de verdad para el uso de átomos, moléculas y organismos.

> ⚠️ **REGLA ARQUITECTÓNICA DE FORMULARIOS Y DETALLES:**
> Las vistas de detalle y los formularios (`FormView`, `DetailView`) **NO DEBEN** estar envueltos en tarjetas principales con fondo (`bg-surface`) ni bordes. Deben usar un contenedor transparente (`bg-background`) permitiendo que los elementos floten, y dejar que únicamente las secciones internas clave (como `InfoCard` o `SummaryCard`) dibujen cajas cuando sea necesario destacar información.

## 🔮 Roadmap Técnico & Servicios Futuros (Directivas de Diseño)

Estas funcionalidades están planificadas para fases posteriores. El código actual debe diseñarse desacoplado, previendo la integración directa con los siguientes estándares:

1. **Autenticación y Gestión de Usuarios:**
 - **Proveedor:** Supabase Auth exclusivamente (Google OAuth + Email).
 - **Modelo:**
   - Perfiles de usuario vinculados a `auth.users` mediante tabla pública `perfiles` (`user_id`, `rol`).
   - Roles previstos: `admin` (acceso total), `bartender` (solo vista operativa/recetas) y `cliente` (solo lectura de cartas).
 - **Regla actual:** Diseñar las consultas asumiendo que en el futuro las tablas principales llevarán una columna `user_id` o `empresa_id` protegida por RLS.

2. **Gestión Multimedia y Storage:**
 - **Proveedor:** Supabase Storage (Buckets para cartas, fichas técnicas y fotos de cócteles).
 - **Ubicación:** Las funciones utilitarias de subida y compresión residirán en `@/lib/storage.ts`.
 - **Regla actual:** Las entidades de base de datos solo almacenan rutas o URLs relativas (`url_archivo` en `coctel_galeria_fotos`). No embeber imágenes en Base64 dentro de la base de datos.

3. **Importación y Exportación de Datos (Data Exchange):**
 - **Formatos:** CSV, Excel (`xlsx`) y exportación a PDF.
 - **Ubicación:** Los procesadores y parsers residirán en `@/lib/importers/` y `@/lib/exporters/`.
 - **Regla actual:** Las tablas y listas deben mantener estructuras de datos serializables (objetos planos) para permitir su exportación directa sin transformaciones complejas en la UI.

4. **Arquitectura Multi-Tenant (Modelo SaaS Futuro)**
- **Modelo de Inquilinos:** La plataforma evolucionará de uso individual a un modelo SaaS Multi-Empresa compartido sobre una única base de datos e instancia web.
- **Aislamiento de Datos:**
  - Se implementará mediante la relación `empresa_id (UUID)` en todas las entidades transaccionales y de catálogo (`insumos`, `cocteles`, `cartas`, `eventos`, `proveedores`).
  - La seguridad y partición de datos se delegará al motor de PostgreSQL mediante políticas de **Row Level Security (RLS)** vinculadas al perfil del usuario autenticado (`auth.uid() -> perfiles.empresa_id`).
- **Directivas actuales para el código:**
  - No hardcodear identificadores fijos ni asumir que existe una sola organización en el sistema.
  - Diseñar interfaces y tipos en `@/types/` preparados para admitir opcionalmente campos de auditoría y pertenencia (`empresa_id?`, `created_by?`).