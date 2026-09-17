# UI Kit Maestro 2.6.0 - Manual de Referencia Técnica

Este documento contiene la especificación, propiedades y ejemplos de uso de los componentes modulares de la interfaz. Todos los componentes están construidos sobre React, utilizan Tailwind CSS para el diseño y dependen de `clsx` y `tailwind-merge` para la resolución dinámica de clases.

Para la actualización de la documentación, se te enviarán los códigos completos de cada componente. La respuesta debe ser el CODIGO de la documentación de cada componente para pegarlo en VSCODE en el archivo .md. Debes entregarlo en un markdown plano sin bloques tsx internos para poder copiarlo directamente.

## 1. Badge (`Badge.tsx`)
Componente visual de solo lectura utilizado para resaltar estados, categorías o etiquetas con una tipografía monoespaciada para mayor legibilidad.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | Requerido | El texto o contenido interno del badge. |
| `variant` | `string` | `'default'` | Define el esquema de colores. Opciones: `'success'`, `'warning'`, `'danger'`, `'info'`, `'purple'`, `'default'`. |
| `size` | `string` | `'sm'` | Define el tamaño y padding. Opciones: `'sm'`, `'md'`. |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para sobrescribir o extender estilos. |

### Ejemplo de uso
```tsx
import { Badge } from '@/components/ui/Badge';

export function StatusIndicator() {
  return (
    <div className="flex gap-2">
      <Badge size="md" variant="success">Confirmado</Badge>
      <Badge variant="warning">Pendiente</Badge>
    </div>
  );
}
```

---

## 2. BlockHeader (`BlockHeader.tsx`)
Componente estructural diseñado para la cabecera de bloques de tiempo o itinerarios, mostrando horario, nombre, fase, aforo y métricas de holgura. Soporta la inyección de elementos personalizados en el extremo derecho para reemplazar los indicadores por defecto.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `horario` | `string` | Requerido | Texto que indica el intervalo de tiempo. |
| `nombre` | `string` | Requerido | Título principal o nombre del bloque. |
| `fase` | `string` | `undefined` | Fase o etapa secundaria del proceso. |
| `pax` | `number \| string` | `undefined` | Cantidad de personas (PAX) asociadas (Opcional). |
| `holgura` | `string \| number` | `undefined` | Porcentaje o valor numérico de holgura mostrado como Badge. |
| `rightElement` | `ReactNode` | `undefined` | Nodo opcional para inyectar contenido personalizado a la derecha (sobrescribe la visualización por defecto de pax y holgura). |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para el contenedor principal. |

### Ejemplo de uso
```tsx
    import { BlockHeader } from '@/components/ui/BlockHeader';
    import { Button } from '@/components/ui/Button';

    export function ScheduleBlock() {
      return (
        <div className="space-y-4">
          {/* Uso por defecto */}
          <BlockHeader 
            horario="10:00 - 11:30" 
            nombre="Recepción de Invitados" 
            fase="Acreditación" 
            pax={150} 
            holgura={15} 
          />

          {/* Uso con elemento derecho personalizado */}
          <BlockHeader 
            horario="12:00 - 14:00" 
            nombre="Almuerzo Principal" 
            rightElement={<Button size="sm" variant="outline">Ajustar Menú</Button>} 
          />
        </div>
      );
    }

```

---

## 3. Button (`Button.tsx`)
Elemento interactivo principal que soporta múltiples variantes de diseño, tamaños e integración nativa de iconos, manteniendo un control estricto sobre los estados de *focus* y *disabled*.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | Opcional | Texto del botón. Puede omitirse si solo se usa un icono. |
| `variant` | `string` | `'primary'` | Estilo visual. Opciones: `'primary'`, `'secondary'`, `'danger'`, `'ghost'`, `'inline'`, `'inline-danger'`. |
| `size` | `string` | `'md'` | Dimensiones del botón. Opciones: `'sm'`, `'md'`, `'lg'`, `'inline'`. |
| `icon` | `ReactNode` | `undefined` | Icono renderizado a la izquierda del texto. |
| `disabled` | `boolean` | `false` | Deshabilita la interacción y reduce la opacidad. |
| `...props` | `HTMLAttributes`| - | Soporta todas las propiedades nativas de `<button>`. |

### Ejemplo de uso
```tsx
import { Button } from '@/components/ui/Button';
import { Save, Trash } from 'lucide-react';

export function ActionBar() {
  return (
    <div className="flex gap-4">
      <Button icon="{<Save" size="{16}"/>} variant="primary">
        Guardar Cambios
      </Button>
      <Button disabled variant="ghost">
        Cancelar
      </Button>
      <Button icon="{<Trash" size="{12}"/>} variant="inline-danger">
        Eliminar
      </Button>
    </div>
  );
}
```

---

## 4. Calendar (Calendar.tsx)
Grilla mensual interactiva estructurada por año y mes, diseñada para visualizar eventos categorizados por estado con soporte para scroll interno por día.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `events` | `CalendarEvent[]` | Requerido | Arreglo de eventos a renderizar en la grilla. |
| `year` | `number` | Requerido | Año numérico a desplegar (ej. 2026). |
| `month` | `number` | Requerido | Índice numérico del mes (0 = Enero, 11 = Diciembre). |
| `onSelectEvent`| `function` | `undefined` | Callback que se ejecuta al hacer clic en un evento. Recibe el `id`. |
| `className`| `string` | `undefined` | Clases adicionales para el contenedor principal. |

### Interfaz `CalendarEvent`
```typescript
interface CalendarEvent {
  id: number | string;
  title: string;
  date: string; // Formato estricto 'YYYY-MM-DD'
  status?: 'cotizacion' | 'confirmado' | 'en_produccion' | 'ejecutado' | 'cancelado';
}
```

### Ejemplo de uso
```tsx
import { Calendar, type CalendarEvent } from '@/components/ui/Calendar';

const events: CalendarEvent[] = [
  { id: 1, title: 'Evento Corporativo', date: '2026-08-22', status: 'confirmado' }
];

export function MonthView() {
  return (
    <div className="h-[600px]">
      <Calendar events="{events}" month="{7}" onSelectEvent="{(id)" year="{2026}"> console.log(id)} />
    </div>
  );
}
```

---

## 5. CategoryFilter (`CategoryFilter.tsx`)
Componente de filtrado basado en botones interactivos con soporte para selección única o múltiple e iconos opcionales.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `options` | `CategoryOption[]` | Requerido | Arreglo de opciones de categoría a renderizar. |
| `activeId` | `string \| number \| (string \| number)[]` | Requerido | ID o arreglo de IDs seleccionados actualmente. |
| `onChange` | `function` | Requerido | Callback ejecutado al hacer clic en una opción. Recibe el `id`. |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para el contenedor. |

### Interfaz `CategoryOption`
```typescript
interface CategoryOption {
  id: string | number;
  label: string;
  icon?: ReactNode;
}
```

### Ejemplo de uso
```tsx
import { CategoryFilter, type CategoryOption } from '@/components/ui/CategoryFilter';
import { Tag } from 'lucide-react';

const categories: CategoryOption[] = [
  { id: 'all', label: 'Todos', icon: <Tag size={14} /> },
  { id: 'vip', label: 'VIP' }
];

export function FilterSection() {
  return (
    <CategoryFilter 
      activeId="all" 
      onChange={(id) => console.log(id)} 
      options={categories} 
    />
  );
```

---

## 6. DataCard (DataCard.tsx)
Tarjeta semántica flexible diseñada para mostrar agrupaciones de metadatos o resúmenes de información. Soporta interactividad automática: si se le proporciona la función onClick, la tarjeta aplica inmediatamente estilos de hover (cambio de bordes, sombras y color del título) y se comporta como un elemento clickeable.

### Propiedades
| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| title | string | Requerido | Título principal destacado de la tarjeta. |
| badge | ReactNode | undefined | Elemento opcional (ej. un componente Badge) renderizado en la esquina superior derecha. |
| onClick | function | undefined | Callback opcional. Si se define, activa los estilos interactivos (hover/cursor). |
| children | ReactNode | Requerido | Contenido interno (usualmente un bloque de texto o lista de metadatos). |
| className | string | undefined | Clases adicionales de Tailwind para sobrescribir o extender el contenedor. |

### Ejemplo de uso
```tsx
import { DataCard } from '@/components/ui/DataCard';
import { Badge } from '@/components/ui/Badge';

export function DataCardExamples() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Ejemplo 1: Tarjeta estática puramente informativa */}
      <DataCard 
        title="Datos del Proveedor" 
        badge={<Badge variant="info">Verificado</Badge>}
      >
        <p>RUT: 76.543.210-K</p>
        <p>Contacto: Juan Pérez</p>
      </DataCard>

      {/* Ejemplo 2: Tarjeta interactiva (como botón selector) */}
      <DataCard 
        title="Seleccionar Locación" 
        onClick={() => console.log('Locación seleccionada')}
        badge={<Badge variant="success">Disponible</Badge>}
      >
        <p>Salón Principal - Piso 2</p>
        <p>Capacidad: 250 PAX</p>
      </DataCard>
    </div>
  );
}
```

---

## 7. DateInput & TimeInput (`DateTimeInput.tsx`)
Componentes especializados de fecha y hora optimizados con soporte completo para tema oscuro (`[color-scheme:dark]`) mediante un diseño limpio, minimalista y sin duplicación de iconos nativos.

### Propiedades (DateInput / TimeInput)

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `undefined` | Etiqueta superior opcional en tipografía monoespaciada. |
| `className` | `string` | `undefined` | Clases adicionales de Tailwind para sobrescribir el input. |
| `...props` | `HTMLAttributes` | - | Soporta todas las propiedades nativas de `<input type="date">` o `<input type="time">`. |

### Ejemplo de uso
```tsx
import { DateInput, TimeInput } from '@/components/ui/DateTimeInput';

export function DateTimeForm() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DateInput label="Fecha Operativa" value="2026-08-25" onChange={() => {}} />
      <TimeInput label="Hora Inicio" value="19:00" onChange={() => {}} />
    </div>
  );
}
```

---

## 8. DualAsignador (DualAsignador.tsx)
Organismo complejo utilizado para flujos de asignación bidireccional (ej. Mover elementos de "Disponibles" a "Asignados"). Incorpora buscadores independientes para cada panel y un layout de doble columna.

### Propiedades
| Propiedad (Izq/Der) | Tipo | Descripción |
| :--- | :--- | :--- |
| childrenIzq | ReactNode | Elementos asignados. |
| childrenDer | ReactNode | Elementos disponibles. |

### Ejemplo de uso
```tsx
import { DualAsignador } from '@/components/ui/DualAsignador';

export function AssignmentPanel() {
  return (
    <DualAsignador 
      childrenIzq={<div>Listado de asignados</div>}
      childrenDer={<div>Listado de disponibles</div>}
      tituloIzq="Equipo Asignado"
      tituloDer="Staff Disponible"
      onChangeBusquedaDer={(val) => console.log(val)}
    />
  );
}
```

---

## 9. DynamicIngredientRow (DynamicIngredientRow.tsx)
Componente estructural diseñado específicamente para formularios de recetas o Bill of Materials (BOM). Emplea un sistema de Grid-12 para alinear perfectamente los inputs e incluye un botón de eliminación.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| children | ReactNode | Elementos del formulario (Grid-12). |
| onRemove | function | Acción para eliminar la fila. |

### Ejemplo de uso
```tsx
import { DynamicIngredientRow } from '@/components/ui/DynamicIngredientRow';
import { Input } from '@/components/ui/Input';

export function RecipeBuilder() {
  return (
    <DynamicIngredientRow onRemove={() => console.log('Remover fila')}>
      <div className="col-span-12 sm:col-span-8">
        {/* Selector de Insumos */}
      </div>
      <div className="col-span-12 sm:col-span-4">
        <Input label="Cantidad (ml)" type="number" />
      </div>
    </DynamicIngredientRow>
  );
}
```

---

## 10. DynamicRow (DynamicRow.tsx)
Versión simplificada y genérica de la fila dinámica, ideal para listas secuenciales o pasos de preparación. Usa Flexbox.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| children | ReactNode | Contenido interno. |
| onRemove | function | Acción opcional de eliminación. |

### Ejemplo de uso
```tsx
import { DynamicRow } from '@/components/ui/DynamicRow';

export function StepBuilder() {
  return (
    <DynamicRow onRemove={() => console.log('Paso eliminado')}>
      <span className="text-sm">Agitar vigorosamente.</span>
    </DynamicRow>
  );
}
```

---

## 11. EmptyState (EmptyState.tsx)
Componente estandarizado para manejar estados vacíos en listas, tablas o formularios. Incluye soporte para un icono atenuado, título, descripción y un botón de acción opcional, adaptándose de forma automática a los colores semánticos del sistema.

### Propiedades
| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| title | string | Requerido | Texto principal que describe el estado vacío. |
| icon | ReactNode | undefined | Icono representativo (ej. de Lucide) que se renderizará atenuado. |
| description | string | undefined | Texto secundario explicativo. |
| action | ReactNode | undefined | Elemento interactivo (ej. Button) para accionar una salida del estado vacío. |
| className | string | undefined | Clases adicionales de Tailwind para el contenedor. |

### Ejemplo de uso
```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NoEvents() {
  return (
    <EmptyState 
      icon={<CalendarDays size={48} />} 
      title="No se encontraron eventos" 
      description="Aún no has agregado etapas o hitos a este cronograma." 
      action={<Button variant="primary">Crear Etapa</Button>} 
    />
  );
}
```
---

## 12. EventDashboardCard (EventDashboardCard.tsx)
Tarjeta de resumen ejecutiva diseñada específicamente para el Centro de Mando B2B, optimizada para mostrar métricas de aforo, locaciones o KPIs del evento con un diseño flotante y minimalista.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Requerido | Etiqueta descriptiva superior de la métrica. |
| `value` | `ReactNode` | Requerido | Valor principal destacado (número, texto o componente). |
| `icon` | `ReactNode` | `undefined` | Icono contextual opcional renderizado en la esquina superior. |
| `badge` | `ReactNode` | `undefined` | Etiqueta o Badge de estado opcional. |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para estilos personalizados. |

### Ejemplo de uso
```tsx
import { EventDashboardCard } from '@/components/ui/EventDashboardCard';
import { Badge } from '@/components/ui/Badge';
import { Users } from 'lucide-react';

export function KPIMetric() {
  return (
    <EventDashboardCard icon="{<Users" label="PAX Confirmados" size="{18}" value="600"/>} 
      badge={<Badge variant="success">Activo</Badge>} 
    />
  );
}
```

---

## 13. IconText (IconText.tsx)
Micro-componente (átomo) utilizado para alinear visualmente un icono (ej. Lucide) de forma perfecta con su texto descriptivo. Es ideal para renderizar listas de datos de contacto, resúmenes o metadatos.

### Propiedades
| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| icon | ReactNode | Requerido | Icono a mostrar a la izquierda. |
| text | string o ReactNode | Requerido | Texto o nodo descriptivo a renderizar a la derecha. |
| className | string | undefined | Clases CSS adicionales para el contenedor flex. |
| textClassName | string | undefined | Clases CSS exclusivas para inyectar estilos (como fuente o color) solo al texto. |

### Ejemplo de uso
```tsx
import { IconText } from '@/components/ui/IconText';
import { Phone, Mail } from 'lucide-react';

export function ContactInfo() {
  return (
    <div className="space-y-2">
      <IconText icon={<Phone size={14} />} text="+56 9 1234 5678" />
      <IconText icon={<Mail size={14} />} text="contacto@cliente.com" textClassName="text-primary font-medium" />
    </div>
  );
}
```

---

## 14. InfoCard (InfoCard.tsx)
Tarjeta modular de información ideal para vistas de detalle y fichas técnicas. Soporta colores temáticos para el título y funcionalidad integrada de copiar al portapapeles.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| title | string | Título en monoespaciado. |
| value | string | Valor principal. |
| variant | string | Color semántico (primary, info, success, etc). |

### Ejemplo de uso
```tsx
import { InfoCard } from '@/components/ui/InfoCard';

export function Details() {
  return (
    <InfoCard 
      title="Teléfono" 
      value="+56912345678" 
      copyText="+56912345678" 
      variant="info" 
    />
  );
}
```

---

## 15. Input (Input.tsx)
Campo de entrada minimalista, diseñado con borde inferior estilizado y soporte para prefijos o iconos.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| label | string | Etiqueta superior opcional. |
| icon | ReactNode | Icono opcional a la izquierda. |
| prefix | string | Prefijo de texto (ej. '$') a la izquierda. |
| ...props | InputHTMLAttributes | Soporta atributos nativos HTML de input. |

### Ejemplo de uso
```tsx
import { Input } from '@/components/ui/Input';

export function Form() {
  return <Input label="Precio" placeholder="0.00" prefix="$" type="number" />;
}
```

---

## 16. Modal (Modal.tsx)
Ventana emergente modal con efecto de backdrop blur, gestión de z-index y cierre automático con la tecla Escape.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| isOpen | boolean | Estado de visibilidad del modal. |
| onClose | function | Función para cerrar el modal. |
| title | string | Título del modal. |
| children | ReactNode | Contenido interno. |

### Ejemplo de uso
```tsx
import { Modal } from '@/components/ui/Modal';

export function Confirmation() {
  return (
    <Modal isOpen={true} onClose={() => {}} title="Confirmar Acción">
      <p>¿Estás seguro de continuar?</p>
    </Modal>
  );
}
```

---

## 17. ModuleHeader (`ModuleHeader.tsx`)
Cabecera estandarizada para módulos y centros de mando, con soporte para botones de retorno contextuales, alternadores de KPIs, insignias y acciones primarias personalizables.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `icon` | `ReactNode` | `undefined` | Icono principal contenedor. |
| `title` | `ReactNode` | Requerido | Título principal (puede ser texto o nodo). |
| `subtitle` | `string` | `undefined` | Subtítulo opcional descriptivo. |
| `badges` | `ReactNode` | `undefined` | Elementos de etiqueta o Badges asociados. |
| `showKpis` | `boolean` | `undefined` | Estado activo para el botón de toggle de KPIs. |
| `onToggleKpis` | `function` | `undefined` | Callback ejecutado al accionar el botón de KPIs. |
| `kpiButtonText`| `string` | `'KPIs'` | Texto del botón de métricas. |
| `primaryAction`| `ReactNode` | `undefined` | Nodo de acción principal a la derecha. |
| `action` | `ReactNode` | `undefined` | Nodo alternativo de acción (alias de primaryAction). |
| `backAction` | `function` | `undefined` | Función callback para el botón de retroceso. |
| `backLabel` | `string` | `undefined` | Texto personalizado del botón de retroceso. |
| `backOnRight`| `boolean` | `false` | Posiciona el botón de retroceso a la derecha dentro de la botonera. |

### Ejemplo de uso
```tsx
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Badge } from '@/components/ui/Badge';

export function HeaderExample() {
  return (
    <ModuleHeader 
      backAction={() => console.log('Volver')} 
      title="Evento 001"
      badges={<Badge variant="success">Corporativo</Badge>}
    />
  );
}
```

---

## 18. PillNavigation (PillNavigation.tsx)
Navegación horizontal tipo "píldora", ideal para filtrar vistas sin cambiar de ruta.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| options | Array | { id: string, label: string }. |
| activeId | string | ID seleccionado. |
| onChange | function | Callback de cambio. |

### Ejemplo de uso
```tsx
import { PillNavigation } from '@/components/ui/PillNavigation';

export function FilterView() {
  const options = [{id: 'all', label: 'Todos'}, {id: 'active', label: 'Activos'}];
  return <PillNavigation activeId="all" onChange={(id) => console.log(id)} options={options} />;
}
```

---

## 19. SectionCard (SectionCard.tsx)
Contenedor semántico frameless (flotante) diseñado para agrupar bloques lógicos de información en vistas de detalle y formularios. Utiliza la paleta bg-surface para destacar sutilmente sobre el bg-background principal sin recargar la interfaz.

### Propiedades
| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| children | ReactNode | Requerido | Contenido interno de la tarjeta. |
| className | string | undefined | Clases CSS adicionales para extender el contenedor. |

### Ejemplo de uso
```tsx
import { SectionCard } from '@/components/ui/SectionCard';

export function FormBlock() {
  return (
    <SectionCard className="space-y-4">
      <p className="text-sm">Contenedor agrupador para inputs...</p>
    </SectionCard>
  );
}
```

---

## 20. SectionTitle (SectionTitle.tsx)
Cabecera tipográficamente normalizada para titular sub-secciones dentro de formularios o detalles, manteniendo la consistencia visual mediante el uso de fuentes monoespaciadas, texto en mayúsculas y tracking ampliado.

### Propiedades
| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| title | string | Requerido | Título principal de la sección. |
| subtitle | string | undefined | Texto descriptivo secundario. |
| className | string | undefined | Clases CSS adicionales. |

### Ejemplo de uso
```tsx
import { SectionTitle } from '@/components/ui/SectionTitle';

export function TitleGroup() {
  return (
    <SectionTitle 
      subtitle="Información de facturación y cliente final" 
      title="Datos Comerciales"
    />
  );
}
```

---

## 21. Select (Select.tsx)
Menú desplegable estilizado con soporte para etiquetas superiores y un icono de chevron personalizado.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| label | string | Etiqueta superior opcional. |
| children | ReactNode | Elementos option internos. |
| ...props | SelectHTMLAttributes | Atributos nativos del elemento select. |

### Ejemplo de uso
```tsx
import { Select } from '@/components/ui/Select';

export function SelectExample() {
  return (
    <Select label="Categoría">
      <option value="1">Opción 1</option>
    </Select>
  );
}
```

---
## 22. SelectableCard (`SelectableCard.tsx`)
Tarjeta interactiva seleccionable utilizada para opciones con estados activos, soporte para iconos, subtítulos opcionales y la integración de acciones secundarias aisladas (como botones de eliminar).

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Requerido | Título principal de la tarjeta. |
| `subtitle` | `string` | `undefined` | Texto secundario o descripción en tipografía monoespaciada. |
| `isActive` | `boolean` | Requerido | Define si la tarjeta se encuentra en estado seleccionado. |
| `onClick` | `function` | Requerido | Callback ejecutado al hacer clic en la tarjeta. |
| `icon` | `ReactNode` | `undefined` | Icono opcional ubicado a la izquierda del título. |
| `action` | `ReactNode` | `undefined` | Nodo opcional para una acción secundaria (ej. botón de eliminar) renderizado en el extremo derecho. |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para el contenedor principal. |

### Ejemplo de uso
```tsx
    import { SelectableCard } from '@/components/ui/SelectableCard';
    import { User, Trash2 } from 'lucide-react';

    export function CardExample() {
      return (
        <SelectableCard 
          isActive={true} 
          onClick={() => console.log('Seleccionado')} 
          title="Opción Principal" 
          subtitle="ID: 001" 
          icon={<User size={16} />} 
          action={
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Eliminar');
              }}
              className="p-1.5 text-danger hover:bg-danger/20 rounded"
            >
              <Trash2 size={14} />
            </button>
          }
        />
      );
    }
```

---

## 23. Sidebar (Sidebar.tsx)
Panel de navegación lateral colapsable, ideal para layouts principales con soporte para logo y elementos de menú interactivos.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| items | NavItem[] | Arreglo de opciones de navegación. |
| activeId | string | ID de la opción activa. |
| isCollapsed | boolean | Estado de colapso del menú. |
| onToggleCollapse | function | Acción para alternar el colapso. |
| logo | ReactNode | Logo opcional para el encabezado. |

### Interfaz NavItem (Soporta ítems simples y grupos colapsables / acordeones)
```typescript
type NavItem =
  | {
      id: string;
      label: string;
      icon: ReactNode;
      onClick: () => void;
      special?: boolean;
      children?: never;
      defaultOpen?: never;
    }
  | {
      id: string;
      label: string;
      icon: ReactNode;
      children: NavItem[];
      defaultOpen?: boolean;
      onClick?: never;
      special?: never;
    };
```

### Ejemplo de uso
```tsx
import { Sidebar, type NavItem } from '@/components/ui/Sidebar';
import { Home, Folder, Settings } from 'lucide-react';

export function Navigation() {
  const items: NavItem[] = [
    { id: 'home', label: 'Inicio', icon: <Home size={18} />, onClick: () => {} },
    { 
      id: 'config', 
      label: 'Configuración', 
      icon: <Folder size={18} />, 
      defaultOpen: true,
      children: [
        { id: 'general', label: 'General', icon: <Settings size={16} />, onClick: () => {} }
      ]
    }
  ];
  return <Sidebar items={items} activeId="home" isCollapsed={false} onToggleCollapse={() => {}} />;
}
```

---

## 24. StepList (StepList.tsx)
Renderizador de listas de pasos secuenciales numerados, con soporte para destacar pasos críticos con alertas visuales.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| steps | Step[] | Lista de pasos a renderizar. |
| emptyMessage | string | Mensaje opcional si la lista está vacía. |

### Interfaz Step
```typescript
interface Step {
  descripcion: string;
  isCritical?: boolean;
}
```

### Ejemplo de uso
```tsx
import { StepList } from '@/components/ui/StepList';

export function RecipeSteps() {
  const steps = [{ descripcion: 'Mezclar ingredientes', isCritical: false }];
  return <StepList steps={steps} />;
}
```

---

## 25. SummaryCard (SummaryCard.tsx)
Tarjeta métrica de resumen optimizada para mostrar KPIs y valores numéricos destacados con etiquetas opcionales.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| label | string | Etiqueta superior de la métrica. |
| value | ReactNode | Valor principal (número, texto o componente). |
| badge | ReactNode | Etiqueta o badge lateral opcional. |
| valueClassName | string | Clases CSS personalizadas para el valor. |

### Ejemplo de uso
```tsx
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Badge } from '@/components/ui/Badge';

export function Metric() {
  return <SummaryCard label="Ventas Totales" value="$45.000" badge={<Badge variant="success">+12%</Badge>} />;
}

```

---

## 26. Table y Subcomponentes (`Table.tsx`)
Sistema completo de tablas de datos que incluye contenedores, cabeceras, filas interactivas, celdas alineadas, barra de herramientas con búsqueda y selector de límites, y paginación.

### Componentes y Propiedades Principales
- **Table**: Contenedor principal (`children`, `className`).
- **TableHead / TableBody**: Estructuras semánticas (`children`).
- **TableRow**: Fila de tabla (`isClickable`, `onClick`, `className`).
- **TableCell**: Celda de datos (`align`: 'left' | 'center' | 'right', `...props`).
- **TableHeaderCell**: Celda de cabecera con soporte para ordenamiento (`isSortable`, `sortDirection`: 'asc' | 'desc' | null, `onSort`, `align`).
- **TableToolbar**: Barra superior de búsqueda y paginación (`busqueda`, `onBusquedaChange`, `placeholder`, `limite`, `onLimiteChange`, `children`).
- **TablePagination**: Pie de paginación (`paginaActual`, `totalPaginas`, `onCambiarPagina`, `elementosMostrados`, `totalElementos`).

### Ejemplo de uso
```tsx
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';

export function CompleteTable() {
  return (
    <>
      <TableToolbar busqueda="" onBusquedaChange={() => {}} limite={10} onLimiteChange={() => {}} />
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nombre</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow isClickable onClick={() => console.log('Fila clickeada')}>
            <TableCell>Dato de prueba</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <TablePagination 
        elementosMostrados={1} 
        onCambiarPagina={() => {}} 
        paginaActual={1} 
        totalElementos={1} 
        totalPaginas={1} 
      />
    </>
  );
}
```

---

## 27. Textarea (Textarea.tsx)
Campo de texto multilínea estilizado con soporte para etiqueta superior opcional, manejo de errores de validación y redimensionamiento dinámico.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `label` | `string` | Etiqueta superior opcional en tipografía monoespaciada. |
| `error` | `string` | Mensaje de error opcional renderizado debajo del área de texto. |
| `...props` | `TextareaHTMLAttributes` | Atributos nativos de textarea. |

### Ejemplo de uso
```tsx
import { Textarea } from '@/components/ui/Textarea';

export function CommentBox() {
  return <Textarea label="Observaciones Logísticas" placeholder="Escribe tus notas..." rows={4} />;
}
```

---

## 28. Tabs y TabPanel (Tabs.tsx)
Navegación por pestañas personalizables con soporte para iconos, colores temáticos activos y contenedores de panel condicionales.

### Propiedades de Tabs
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| tabs | TabItem[] | Arreglo de pestañas ({ id, label, icon?, activeColor? }). |
| activeTab | string | ID de la pestaña activa. |
| onChangeTab | function | Callback ejecutado al cambiar de pestaña. |

### Propiedades de TabPanel
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| id | string | Identificador asociado a la pestaña. |
| activeTab | string | Pestaña activa actual para controlar visibilidad. |
| children | ReactNode | Contenido del panel. |

### Ejemplo de uso
```tsx
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { useState } from 'react';

export function TabbedView() {
  const [active, setActive] = useState('tab1');
  const tabs = [{ id: 'tab1', label: 'General' }];
  return (
    <>
      <Tabs tabs={tabs} activeTab={active} onChangeTab={setActive} />
      <TabPanel id="tab1" activeTab={active}>
        <p>Contenido general</p>
      </TabPanel>
    </>
  );
}
```

---

## 29. Textarea (Textarea.tsx)
Campo de texto multilínea estilizado con soporte para manejo de errores de validación y redimensionamiento dinámico.

### Propiedades
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| error | string | Mensaje de error opcional renderizado debajo del área de texto. |
| ...props | TextareaHTMLAttributes | Atributos nativos de textarea. |

### Ejemplo de uso
```tsx
import { Textarea } from '@/components/ui/Textarea';

export function CommentBox() {
  return <Textarea placeholder="Escribe tus notas..." rows={4} />;
}
```


## 30. Timeline (`Timeline.tsx`)
Componente visual estructurado en una grilla responsiva que muestra una secuencia cronológica de hitos o actividades, con estilos destacados para eventos importantes.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `items` | `TimelineItem[]` | Requerido | Arreglo de elementos que conforman la línea de tiempo. |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para el contenedor principal de la grilla. |

### Interfaz `TimelineItem`
```typescript
interface TimelineItem {
  id: number | string;
  orden: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  es_hito?: boolean;
}
```

### Ejemplo de uso
```tsx
import { Timeline, type TimelineItem } from '@/components/ui/Timeline';

const timelineItems: TimelineItem[] = [
  { id: 1, orden: 1, nombre: 'Apertura de Puertas', hora_inicio: '09:00', hora_fin: '09:30', es_hito: true }
];

export function TimelineView() {
  return (
    <Timeline items={timelineItems} />
  );
}
```

---

## 31. ToggleButton (`ToggleButton.tsx`)
Botón de alternancia interactivo utilizado para activar o desactivar estados, soportando iconos opcionales y transiciones de diseño fluidas.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | Requerido | Contenido interno o etiqueta de texto del botón. |
| `isActive` | `boolean` | Requerido | Define si el botón se encuentra activo. |
| `onClick` | `function` | Requerido | Callback ejecutado al hacer clic. |
| `icon` | `ReactNode` | `undefined` | Icono opcional ubicado a la izquierda del texto. |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para sobrescribir o extender estilos. |

### Ejemplo de uso
```tsx
import { ToggleButton } from '@/components/ui/ToggleButton';
import { Check } from 'lucide-react';

export function ToggleExample() {
  return (
    <ToggleButton isActive={true} onClick={() => console.log('Alternado')} icon={<Check size={14} />}>
      Activo
    </ToggleButton>
  );
}
```

---

## 32. VerticalTimeline (`VerticalTimeline.tsx`)
Componente interactivo de línea de tiempo vertical que organiza cronológicamente actividades o etapas operativas con soporte avanzado para reordenamiento, acciones de edición/eliminación y renderizado personalizado en estado activo.

### Propiedades

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `items` | `VerticalTimelineItem[]` | Requerido | Arreglo de elementos que conforman la línea de tiempo vertical. |
| `activeItem`| `number \| string \| null` | `undefined` | ID o número de orden del elemento activo actualmente. |
| `onSelectItem`| `function` | `undefined` | Callback ejecutado al hacer clic en un elemento. Recibe el `orden`. |
| `onMoveUp` | `function` | `undefined` | Callback para mover el ítem hacia arriba. Recibe `id` e `index`. |
| `onMoveDown` | `function` | `undefined` | Callback para mover el ítem hacia abajo. Recibe `id` e `index`. |
| `onEdit` | `function` | `undefined` | Callback ejecutado al hacer clic en el botón de edición. Recibe el `id`. |
| `onDelete` | `function` | `undefined` | Callback ejecutado al hacer clic en el botón de eliminar. Recibe el `id`. |
| `renderActiveCard`| `function` | `undefined` | Función que retorna un nodo React personalizado para reemplazar el contenido cuando la tarjeta está activa (ideal para edición *inline*). |
| `className`| `string` | `undefined` | Clases adicionales de Tailwind para el contenedor principal. |

### Interfaz `VerticalTimelineItem`
```typescript
    interface VerticalTimelineItem {
      id: number | string;
      orden: number;
      nombre: string;
      hora_inicio: string;
      hora_fin: string;
      es_hito?: boolean;
      faseOrden?: number;
    }
```

### Ejemplo de uso
```tsx
    import { VerticalTimeline, type VerticalTimelineItem } from '@/components/ui/VerticalTimeline';

    const timelineSteps: VerticalTimelineItem[] = [
      { 
        id: '1', 
        orden: 1, 
        nombre: 'Inicio de Actividades', 
        hora_inicio: '08:00', 
        hora_fin: '09:00', 
        es_hito: true, 
        faseOrden: 1 
      }
    ];

    export function TimelineView() {
      return (
        <VerticalTimeline 
          items={timelineSteps} 
          activeItem={'1'} 
          onSelectItem={(orden) => console.log('Seleccionado:', orden)}
          onMoveUp={(id, index) => console.log('Mover arriba:', id)}
          onMoveDown={(id, index) => console.log('Mover abajo:', id)}
          onEdit={(id) => console.log('Editar:', id)}
          onDelete={(id) => console.log('Eliminar:', id)}
          renderActiveCard={(item) => (
            <div className="p-4 text-sm text-primary font-bold">
              Modo de edición para: {item.nombre}
            </div>
          )}
        />
      );
    }
```

---

## 33. ViewToggle (ViewToggle.tsx)
Selector flotante y minimalista de modo de vista (por ejemplo, alternar entre grilla, calendario o lista) con soporte para iconos y estilos activos fluidos.

### Propiedades
| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `options` | `ViewOption[]` | Requerido | Arreglo de opciones ({ id, label, icon? }). |
| `activeId` | `string` | Requerido | ID de la vista seleccionada actualmente. |
| `onChange` | `function` | Requerido | Callback que recibe el ID de la nueva vista seleccionada. |
| `className`| `string` | `undefined` | Clases CSS adicionales para el contenedor. |

### Ejemplo de uso
```tsx
import { ViewToggle } from '@/components/ui/ViewToggle';

export function ToggleExample() {
  const views = [{ id: 'grid', label: 'Grilla' }, { id: 'list', label: 'Lista' }];
  return <ViewToggle activeId="grid" onChange="{(id)" options="{views}"> console.log(id)} />;
}
```