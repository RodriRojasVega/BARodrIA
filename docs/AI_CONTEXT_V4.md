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
        │       ├── hooks/            # Lógica de negocio, llamadas a Supabase y mutaciones (use[Modulo].ts, use[Modulo]Mutations.ts)
        │       └── types.ts          # Tipos locales efímeros exclusivos del módulo
        └── types/                    # Interfaces y entidades de base de datos globales
            ├── database.types.ts     # Tipos autogenerados por CLI de Supabase
            ├── index.ts              # Barrel export de tipos
            └── [entidad].ts          # Modelos compartidos (insumos.ts, carta.ts, coctel.ts, etc.)

## 📂 Arquitectura de Módulos y Estrategia de Tipado

### 1. Estructura de Módulos Autocontenidos
Para mantener la atomicidad y el orden a medida que la PWA escala, los módulos complejos dentro de `@/modules/[nombre]/` deben organizarse bajo la siguiente anatomía estándar:
* `[Nombre]View.tsx`: El componente orquestador principal (maneja vistas activas, navegación interna y estados globales del módulo).
* `components/`: Subcomponentes visuales específicos y exclusivos de este módulo.
  * `tabs/`: Sub-vistas seccionales exclusivas para pestañas de formularios o detalle.
* `hooks/`: Lógica de negocio, llamadas a Supabase y manejo de estados complejos separados de la UI (incluyendo hooks dedicados a mutaciones).
* `types.ts`: Tipos o interfaces exclusivas del módulo (si aplican).

## 🥇 Reglas de Oro (Golden Rules) Consolidadas para Generación de Código

**1. TypeScript Estricto y Tolerancia CERO a los `any`:**
- Queda estrictamente prohibido utilizar `any`. Todas las entidades y payloads deben estar fuertemente tipados.
- Si una tabla nueva no existe en `database.types.ts`, se DEBE declarar una `interface` local explícita que describa la respuesta (ej. `interface EtapaRemota { id: number; nombre: string; }`).
- Variables o imports no utilizados DEBEN eliminarse (cero tolerancia al error `TS6133`). Parámetros obligatorios sin uso deben prefijarse con guion bajo (ej. `_eventoId`).

**2. Arquitectura de Hooks Bidireccionales (Base de Datos):**
- **Lectura:** Usar hooks dedicados con React Query (ej. `useEventos()`).
- **Escritura:** Usar hooks dedicados EXCLUSIVAMENTE para mutaciones (ej. `useEventoMutations()`).
- Las validaciones de "null", "undefined" o strings vacíos en IDs relacionales (`etapa_id`, `punto_id`) deben ser casteadas explícitamente (`Number(id)` o validaciones estrictas) antes de enviarse al payload. Todas las consultas deben manejar estado de carga (`cargando`) y bloques `try/catch`.

**3. Restricción de Componentes y UI Kit:**
- NO generes HTML/CSS nativo (`<button>`, `<table>`, etc.) si existe un componente equivalente en el UI Kit.
- **Botones y Props permitidas:** Solo se permiten tamaños estándar (`sm`, `md`, `lg`) y variantes oficiales (`primary`, `secondary`, `danger`, `ghost`, `outline`). PROHIBIDO inventar variantes como `inline`.
- Elementos como `<ToggleButton>` no soportan propiedades HTML nativas como `title` a menos que esté en su interfaz.

**4. Estilos, Tailwind y Principio de Superficie Limpia (Flotación):**
- PROHIBIDO usar colores estáticos hardcodeados (ej. `slate-900`). Usa siempre tokens: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`, `text-primary`.
- **Flotación:** Las vistas de detalle y formularios (`FormView`, `DetailView`) NO DEBEN estar envueltas en tarjetas principales con fondo (`bg-surface`) ni bordes. Deben usar un contenedor transparente (`bg-background`) y dejar que solo las secciones internas clave (`InfoCard`, `SectionCard`) dibujen cajas.

**5. Tablas y Mentalidad Mobile-First:**
- Toda tabla (`<Table>`) debe construirse con la composición completa (`<TableHead>`, `<TableBody>`, etc.).
- Toda tabla debe estar envuelta en un contenedor con `overflow-x-auto` y `custom-scrollbar`. En vistas muy complejas, el diseño debe garantizar el colapso en columnas (Grid) en pantallas móviles (`< lg`).

**6. Optimización de Formularios (Lazy Initial State):**
- PROHIBIDO utilizar `useEffect` para pre-llenar datos de un formulario en modo edición. Utiliza siempre inicialización perezosa en el estado (`useState(() => { ... })`) para evitar *cascading renders*.

**7. Feedback Visual No Intrusivo y Cargas Granulares:**
- PROHIBIDO usar `alert()` o `confirm()`. Usa el sistema global de notificaciones. Evita bloquear la pantalla completa con spinners; usa esqueletos de carga (`Skeleton`) y estados `disabled` en botones.

**8. Convención de Carpetas y Versionamiento (SemVer):**
- La carpeta `components/tabs/` es EXCLUSIVA para sub-componentes seccionales de formularios o detalles, nunca para vistas principales (listados/calendarios).
- La IA no debe modificar la versión en `package.json`. El desarrollador humano gestiona el ciclo `npm version` (SemVer) localmente.

## 🧩 Diccionario del UI Kit Maestro 2.6.0 (Fuente de Verdad Externa)

> **⚠️ REGLA DE ORO ESTRICTA SOBRE COMPONENTES:** 
> La especificación técnica completa, las interfaces exactas, las props válidas y los ejemplos de uso de **todos los componentes del UI Kit** se encuentran centralizados en el archivo **`src/components/ui/UI_KIT_DOCS.md`** (dentro del submódulo Git del kit).
> 
> El desarrollador IA DEBE asumir que ese documento es la ÚNICA fuente de verdad. Si un tamaño o variante no está listado en las reglas consolidadas o en dicho documento, no debe ser inventado ni inferido.

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