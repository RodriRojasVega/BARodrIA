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

## 📂 Estructura de Carpetas y Arquitectura (Alias `@/` = `src/`)

```text
├── docs/                      # Documentación del proyecto y artefactos para IA
│   ├── AI_CONTEXT.md          # Reglas, UI Kit y arquitectura del sistema
│   └── database/schema.sql    # DDL del esquema de PostgreSQL (Supabase)
├── public/                    # Archivos estáticos e iconos PWA
└── src/
    ├── assets/                # Imágenes, logos e ilustraciones
    ├── components/
    │   ├── layout/            # Componentes estructurales (Sidebar, Navbar)
    │   └── ui/                # UI Kit Maestro 2.0 (Botones, Tablas, Inputs, etc.)
    ├── hooks/                 # Custom hooks globales/transversales
    ├── lib/                   # Clientes e integraciones (supabase.ts, calculos.ts)
    ├── modules/               # Módulos de negocio autocontenidos
    │   └── [nombre_modulo]/   # Ej: insumos, coctel, carta, eventos, proveedores
    │       ├── [Nombre]View.tsx # Orquestador: vistas activas, KPIs y navegación
    │       ├── components/    # Subvistas y modales exclusivos ([Modulo]Detail, [Modulo]Form, etc.)
    │       ├── hooks/         # Lógica de negocio y llamadas a Supabase (use[Modulo].ts)
    │       └── types.ts       # Tipos locales efímeros exclusivos del módulo
    └── types/                 # Interfaces y entidades de base de datos globales
        ├── database.types.ts  # Tipos autogenerados por CLI de Supabase
        ├── index.ts           # Barrel export de tipos
        └── [entidad].ts       # Modelos compartidos (insumos.ts, carta.ts, coctel.ts, etc.)
```

## 🥇 Reglas de Oro (Golden Rules) para Generación de Código

1. **TypeScript Estricto:** 
   - Prohibido usar `any`. Todas las entidades de la base de datos deben tener su interfaz en `@/types/`.
   - Si una variable de función o un import no se utiliza, DEBE ser eliminado para evitar el error `TS6133` en el build de producción. Si un parámetro de función es obligatorio pero no se usa, prefijarlo con un guion bajo (ej. `_nombreTabla`).

2. **Case Sensitivity Absoluta:**
   - El entorno es Linux. Los imports deben coincidir EXACTAMENTE con las mayúsculas y minúsculas del nombre físico del archivo y la carpeta.

3. **Estandarización del UI Kit 2.0:**
   - NO generes HTML/CSS nativo para elementos comunes. Debes importar y utilizar los componentes de `@/components/ui/`.
   - **Módulos Principales:** Deben iniciar con el componente `<ModuleHeader />`.
   - **Indicadores:** Utilizar `<SummaryCard />` para mostrar KPIs debajo del header.
   - **Tablas:** Utilizar la composición completa: `<Table>`, `<TableHead>`, `<TableBody>`, `<TableRow>`, `<TableCell>`, `<TableHeaderCell>`, `<TablePagination>`.
   - **Botones:** Utilizar `<Button variant="..." size="..." icon={...} />` (Variantes comunes: `primary`, `secondary`, `inline`, `inline-danger`).

4. **Estilos y Tailwind (Diseño Semántico Desacoplado):**
   - **PROHIBIDO** usar colores estáticos (hardcodeados) como `slate-900`, `emerald-500` o `gray-100` en las clases de Tailwind.
   - El sistema de diseño se basa 100% en tokens semánticos definidos en `tailwind.config.js`. 
   - **Diccionario de Tokens Visuales:**
     - Fondos: `bg-background` (raíz), `bg-surface` (tarjetas/paneles), `bg-surface-muted` (inputs/hovers).
     - Bordes: `border-border`, `border-border-hover`.
     - Textos: `text-foreground` (principal), `text-muted` (secundario/iconos).
     - Marca: `bg-primary`, `text-primary`, `border-primary` (y sus variantes `-hover`).
     - Estados: `danger`, `success`, `warning`.

5. **Interacciones con Base de Datos:**
   - Usar el cliente instanciado en `import { supabase } from '@/lib/supabase'`.
   - Todas las llamadas deben manejar estado de carga (`cargando`) y bloques `try/catch` para la gestión de errores.

## 📂 Arquitectura de Módulos y Estrategia de Tipado

### 1. Estructura de Módulos Autocontenidos
Para mantener la atomicidad y el orden a medida que la PWA escala, los módulos complejos dentro de `@/modules/[nombre]/` deben organizarse bajo la siguiente anatomía estándar:
*   `[Nombre]View.tsx`: El componente orquestador principal (maneja vistas activas, navegación interna y estados globales del módulo).
*   `components/`: Subcomponentes visuales específicos y exclusivos de este módulo.
*   `hooks/`: Lógica de negocio, llamadas a Supabase y manejo de estados complejos separados de la UI.
*   `types.ts`: Tipos o interfaces exclusivas del módulo (si aplican).

### 2. Estrategia de Tipos (`Types`)
*   **Tipos Globales (`src/types/`):** Utilízalos exclusivamente para entidades de base de datos o modelos de negocio que se comparten o relacionan en **más de un módulo** (ej. `Carta`, `Coctel`, `Insumo`, `Proveedor`).
*   **Tipos Locales (`src/modules/[nombre]/types.ts`):** Utilízalos para estructuras de datos efímeras, estados de formularios locales, filtros de tablas o props de subcomponentes que no salen del ámbito de ese módulo.

## 🧩 Diccionario del UI Kit Maestro 2.0 (APIs de Componentes)

**REGLA DE ORO ESTRICTA:** Para generar cualquier vista, NO debes utilizar etiquetas HTML nativas (`<button>`, `<table>`, `<input>`, `<select>`, `<span class="badge">`) si existe un componente equivalente en este UI Kit. Debes importar y utilizar estrictamente los siguientes componentes con sus Props exactas.

### 0. Estructura de Layout (Navegación)
*   **Sidebar:** Menú lateral de navegación basado en SPA (`react-router-dom`).
    *   `import { Sidebar } from '@/components/layout/Sidebar';`
    *   **Props:** Ninguna (gestiona su propia ruta activa con `useLocation` y la lista estática `NAV_ITEMS`).
    *   **Uso:** `<Sidebar />` (Se ubica en el contenedor principal de la App).

### 1. Cabeceras y KPIs (Estructura de Vistas)
*   **ModuleHeader:** Cabecera estándar para todos los módulos.
    *   `import { ModuleHeader } from '@/components/ui/ModuleHeader';`
    *   **Props:** `icon` (ReactNode), `title` (string), `subtitle?` (string), `showKpis?` (boolean), `onToggleKpis?` (function), `kpiButtonText?` (string), `primaryAction` (ReactNode).
    *   **Uso:** `<ModuleHeader icon={<Icon/>} title="Módulo" primaryAction={<Button>Nuevo</Button>} />`

*   **SummaryCard:** Tarjetas para mostrar KPIs debajo del header.
    *   `import { SummaryCard } from '@/components/ui/SummaryCard';`
    *   **Props:** `label` (string), `value` (ReactNode), `badge?` (ReactNode), `valueClassName?` (string, ej. "text-primary").
    *   **Uso:** `<SummaryCard label="Total" value="$150" valueClassName="text-success" />` 

### 2. Navegación Interna (Pestañas)
*   **Tabs & TabPanel:** Sistema de pestañas con renderizado condicional.
    *   `import { Tabs, TabPanel } from '@/components/ui/Tabs';`
    *   **Props Tabs:** `tabs` (Array de `{id, label, icon?, activeColor?}`), `activeTab` (string), `onChangeTab` (function).
    *   **Props TabPanel:** `id` (string), `activeTab` (string), `children` (ReactNode).
    *   **Uso:** 
        ```tsx
        <Tabs 'Datos', 'border-accent 'info', activeColor: activeTab="{tab}" id: label: onChangeTab="{setTab}" tabs="{[{" text-accent' }]}/>
        <TabPanel activeTab="{tab}" id="info">Contenido</TabPanel>
        ```

### 3. Formularios (Inputs y Selects)
*   **Input:** Campo de texto minimalista (soporta `forwardRef`).
    *   `import { Input } from '@/components/ui/Input';`
    *   **Props:** `label?` (string), `icon?` (ReactNode), `prefix?` (string), más atributos nativos de `<input>`.
    *   **Uso:** `<Input label="Nombre" icon={<User size={14}/>} placeholder="Ingresa..." />`

*   **Select:** Menú desplegable estilizado (soporta `forwardRef`).
    *   `import { Select } from '@/components/ui/Select';`
    *   **Props:** `label?` (string), `children` (<option>s), más atributos nativos de `<select>`.
    *   **Uso:** `<Select label="Categoría"><option value="1">A</option></Select>`

### 4. Acciones y Estado
*   **Button:** Botones estandarizados.
    *   `import { Button } from '@/components/ui/Button';`
    *   **Props:** `variant` ('primary' | 'secondary' | 'danger' | 'ghost' | 'inline' | 'inline-danger'), `size` ('sm' | 'md' | 'lg'), `icon?` (ReactNode), `children?` (ReactNode).
    *   **Uso:** `<Button variant="primary" icon={<Save size={16}/>}>Guardar</Button>`

*   **Badge:** Etiquetas de estado semánticas.
    *   `import { Badge } from '@/components/ui/Badge';`
    *   **Props:** `variant` ('success' | 'warning' | 'danger' | 'info' | 'purple' | 'default'), `size` ('sm' | 'md'), `children` (ReactNode).
    *   **Uso:** `<Badge variant="success">Activo</Badge>`

### 5. Sistema de Tablas (Data Display)
*   **Composición de Tabla:** Reemplaza completamente las tablas nativas.
    *   `import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';`
    *   **Toolbar Props:** `busqueda`, `onBusquedaChange`, `limite`, `onLimiteChange`, `placeholder?`.
    *   **Row Props:** `isClickable?` (boolean), `onClick?` (function).
    *   **HeaderCell Props:** `align?` ('left'|'center'|'right'), `isSortable?`, `sortDirection?`, `onSort?`.
    *   **Cell Props:** `align?` ('left'|'center'|'right').
    *   **Pagination Props:** `paginaActual`, `totalPaginas`, `onCambiarPagina`, `elementosMostrados`, `totalElementos`.
    *   **Estructura Base:** `<TableToolbar /> <Table><TableHead><TableRow><TableHeaderCell>...</Table>`

### 6. Filas Dinámicas (Formularios Array / Recetas)
*   **DynamicRow:** Para listas secuenciales simples (ej. Pasos).
    *   `import { DynamicRow } from '@/components/ui/DynamicRow';`
    *   **Props:** `children` (Inputs internos), `onRemove?` (function).
*   **DynamicIngredientRow:** Para listas de insumos con columnas (Grid-12).
    *   `import { DynamicIngredientRow } from '@/components/ui/DynamicIngredientRow';`
    *   **Props:** `children` (Selects/Inputs que deben sumar 12 columnas), `onRemove` (function).

### 7. Selector Dual
*   **DualAsignador:** Panel dual de selección (Asignados vs. Disponibles) con buscadores y contadores integrados.
    *   `import { DualAsignador } from '@/components/ui/DualAsignador';`
    *   **Props:** 
        *   Izquierda: `tituloIzq` (string), `contadorIzq` (number), `iconoIzq?` (ReactNode), `placeholderBusquedaIzq?` (string), `valorBusquedaIzq?` (string), `onChangeBusquedaIzq?` (function), `childrenIzq` (ReactNode).
        *   Derecha: `tituloDer` (string), `iconoDer?` (ReactNode), `placeholderBusquedaDer?` (string), `valorBusquedaDer?` (string), `onChangeBusquedaDer?` (function), `childrenDer` (ReactNode).
    *   **Uso:** 
        ```tsx
        <DualAsignador childrenDer="{...}" childrenIzq="{...}" contador="{5}" tituloDer="Insumos Disponibles" tituloIzq="Receta Activa"/>
        ```

### 8. Tarjeta de Información
*   **InfoCard:** Componente para mostrar información detallada en tarjetas visuales con colores temáticos y botón de copiado rápido al portapapeles.
    *   `import { InfoCard } from '@/components/ui/InfoCard';`
    *   **Props:**
        *   `title` (string): Título de la tarjeta (determina el color según la variante).
        *   `value` (string | number | null): Valor principal a mostrar.
        *   `copyText` (string): Texto que se copiará al portapapeles (si se omite, el botón de copiado no se renderiza).
        *   `variant` ('primary' | 'info' | 'success' | 'warning' | 'purple'): Selector de color para el título.
        *   `children` (ReactNode): Contenido personalizado alternativo si no se usa `value`.
    *   **Uso:**
        ```tsx
        <InfoCard copyText="contacto@empresa.cl" title="Correo Electrónico" value="contacto@empresa.cl" variant="warning"/>
        ```

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


  ## 🧩 Arquitectura del Sistema & UI Kit (Actualizado - Agosto 2026)

### 1. Nuevos Componentes UI (`src/components/ui/`)
* **`InfoCard.tsx`**: Tarjeta modular de información para vistas de detalle y fichas.
  * **Características**: Títulos con colores dinámicos por categoría (variantes `primary`, `info`, `success`, `warning`, `purple`), soporte para texto multilínea o hijos personalizados, y botón integrado de copiado rápido al portapapeles con feedback visual temporal (`navigator.clipboard`).

### 2. Estándar Arquitectónico de Módulos (Ej: Proveedores)
* **Estructura de Vistas**:
  * **Listado (`*List.tsx`)**: KPIs colapsables, barra de herramientas con búsqueda dinámica, selector de límite de paginación y soporte completo de ordenamiento por columnas.
  * **Formularios (`*Form.tsx`)**: Integración con `ModuleHeader`, inputs numéricos seguros (previniendo el bloqueo del cero al vaciar el campo) y componente `DualAsignador`.
  * **Detalle (`*Detail.tsx`)**: Estructurado en **3 pestañas arquitectónicas**:
    1. *Información General*: Desplegada mediante `InfoCard`s con copiado rápido (excluyendo notas u observaciones).
    2. *Catálogo de Productos*: Tabla filtrable, paginada y ordenable de insumos asociados.
    3. *Histórico de Precios*: Registro cronológico de auditoría de tarifas con búsqueda y ordenamiento.

### 3. Centralización de Tipos (`src/types/`)
* Las entidades de dominio y base de datos (Supabase) residen globalmente en `src/types/` (`insumos.ts`, `proveedores.ts`, etc.) para permitir referencias cruzadas limpias entre módulos.
* Los tipos locales dentro de los submódulos (`src/modules/.../types.ts`) se limitan estrictamente a estados de interfaz y navegación de vistas (ej. `VistaProveedor`, `VistaInsumo`).