# 📌 Backlog de Desarrollo e Implementación - BARodrIA

Este documento centraliza las ideas, mejoras y tareas pendientes por implementar en el ecosistema **BARodrIA**. Es un archivo editable en formato Markdown que sirve como hoja de ruta (*roadmap* operativo) y memoria de desarrollo para asegurar el control de calidad y evitar que las ideas se pierdan.

---

## 🗓️ 1. Mejoras al Calendario (Módulo Eventos)
- [ ] **Eventos por Día:** Implementar la visualización agregada de múltiples eventos por celda diaria, mostrando mini-etiquetas con el nombre y estado del evento.
- [ ] **Selectores Rápidos de Fecha:** Añadir menús desplegables para selección directa de **Mes** y **Año** sin tener que avanzar manualmente mes a mes.
- [ ] **Vista de Año:** Diseñar una vista de cuadrícula anual (12 meses) para identificar rápidamente la densidad de eventos reservados en el año.
- [ ] **Vista de Década:** Crear un selector de rango secular o de década para planificación estratégica a largo plazo de contratos corporativos recurrentes.

## 🗂️ 2. Actualización de Módulo Catálogos
- [ ] **Nuevas Entidades de Base de Datos:** Incorporar las nuevas tablas del `schema-v4` en la UI del gestor de catálogos:
  - [ ] `soportes` (Gestión de cristalería / vasos de servicio).
  - [ ] `hielos` (Tipos de hielo según la técnica y dilución).
  - [ ] `tecnicas` (Técnicas de preparación: Shake, Stir, Throwing, etc.).
  - [ ] `garnishes` (Catálogo maestro de adornos, mermas asociadas y tipos de corte).
- [ ] **Asociación Relacional:** Permitir la edición y mapeo de relaciones de catálogo directamente desde las vistas de edición maestra de insumos y cócteles.

## 🔄 3. Revisión de Lógica de Mutaciones
- [ ] **Integridad con Supabase:** Auditar las consultas SQL y llamadas RPC para inserciones, actualizaciones y eliminaciones (mutaciones) para asegurar el correcto manejo de estados locales reactivos.
- [ ] **Optimistic Updates (Actualizaciones Optimistas):** Implementar actualizaciones optimistas en la UI para que los cambios en comandas o stock de insumos se reflejen instantáneamente antes de que retorne la confirmación del servidor.
- [ ] **Cálculos en vivo:** Verificar que las mutaciones de ingredientes gatillen correctamente el recálculo en cascada del COGS y el ABV% en memoria antes de persistir los datos.

## 📖 4. Diccionario de Datos (Base de Datos)
- [ ] **Especificación de Tablas:** Redactar un diccionario interactivo que desglose las 42 tablas contempladas en el `schema-v4`.
- [ ] **Detalle de Campos:** Documentar para cada columna: tipo de dato PostgreSQL, restricciones (PK, FK, Unique), descripción de su propósito de negocio y valores por defecto.
- [ ] **Reglas de Integridad:** Describir los comportamientos de eliminación en cascada (`ON DELETE CASCADE` / `SET NULL`) y las políticas de seguridad RLS aplicadas.

## ✍️ 5. Proceso de Documentación y Actualización
- [ ] **Estandarización de Archivos:** Definir la plantilla y formato oficial para todos los archivos de documentación técnica y lógica de negocio.
- [ ] **Flujo de Modificaciones:** Establecer las pautas obligatorias para actualizar documentos de requerimientos (Docs 1 a 8) ante cambios de alcance aprobados por negocio.
- [ ] **Control de Versiones de Docs:** Crear un registro de cambios (*changelog*) histórico para la documentación técnica en la carpeta del repositorio.

## 🚀 6. Proceso de Commits y Publicación (CI/CD)
- [ ] **Semántica de Commits:** Implementar el estándar *Conventional Commits* (ej. `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- [ ] **Automatización de Builds:** Configurar un pipeline de integración continua (ej. GitHub Actions) que valide la compilación con TypeScript estricto antes de permitir un merge a la rama principal.
- [ ] **Pipeline de Deploy:** Documentar el flujo de despliegue automatizado hacia el entorno de producción (Supabase Edge Functions + Hosting de la SPA).

## 📘 7. Documentación de Módulos, Vistas y Funcionalidades
- [ ] **Mapa de Componentes TSX:** Documentar la jerarquía, hooks y props de los componentes comunes reutilizables (ej. `AsignadorDual`, `FormularioFluido`, `VisualizadorABV`).
- [ ] **Flujos de Navegación de Usuario:** Diseñar diagramas que grafiquen la navegación entre vistas (Listado con Tabla Paginada -> Detalle con Pestañas -> Formulario Completo de Pantalla Completa).
- [ ] **Guías de Operación por Rol:** Redactar manuales rápidos de operación enfocados para los roles *Administrador* (finanzas y proveedores) y *Bartender* (Modo Bartender y toma de comandas rápidas).

---

💡 *Nota: Puedes editar y sincronizar este archivo directamente en tu entorno para ir tachando las tareas completadas o agregar nuevas ideas a medida que se te ocurran.*