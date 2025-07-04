''''''''''''''''''''''''''''''''''''''''''''''''''# COnsultores - Sistema de Gestión Legal

Un sistema integral de gestión para consultores legales que permite administrar clientes, procesos judiciales, documentos y recursos legales de manera eficiente y organizada.

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Directorio Principal](#estructura-del-directorio-principal)
- [Instalación y Configuración](#instalación-y-configuración)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Detalles de la Base de Datos](#detalles-de-la-base-de-datos)
- [Scripts Útiles del Proyecto](#scripts-útiles-del-proyecto)
- [Páginas y Componentes Clave](#páginas-y-componentes-clave)
- [Gestión de Archivos](#gestión-de-archivos)
- [Buenas Prácticas y Convenciones](#buenas-prácticas-y-convenciones)
- [Referencias y Documentación Adicional](#referencias-y-documentación-adicional)

## Descripción del Proyecto

COnsultores es una aplicación web moderna diseñada específicamente para consultores y bufetes legales que necesitan gestionar de manera eficiente sus clientes, procesos judiciales y documentación legal. La plataforma ofrece una interfaz intuitiva y funcionalidades especializadas que incluyen:

- **Gestión integral de clientes**: Registro, seguimiento y administración de información de clientes
- **Administración de procesos legales**: Creación y seguimiento de casos judiciales con radicados únicos
- **Sistema de archivos avanzado**: Almacenamiento y organización de documentos por proceso con vista previa integrada
- **Buscador legal especializado**: Acceso rápido a códigos, decretos y leyes con integración de búsqueda inteligente
- **Tableros de control**: Métricas y seguimiento de actividades, audiencias, términos y reuniones
- **Calendario y notificaciones**: Gestión de fechas importantes y recordatorios

El sistema está construido con tecnologías modernas y sigue las mejores prácticas de desarrollo, ofreciendo una experiencia de usuario fluida y una arquitectura escalable.

## Stack Tecnológico

### Frontend
- **[React](https://reactjs.org/)** (v18.3.1) - Biblioteca principal para la interfaz de usuario
- **[TypeScript](https://www.typescriptlang.org/)** (v5.5.3) - Tipado estático para mayor robustez
- **[Vite](https://vitejs.dev/)** (v5.4.2) - Herramienta de construcción y desarrollo rápido
- **[Tailwind CSS](https://tailwindcss.com/)** (v3.4.1) - Framework CSS de utilidades
- **[React Router DOM](https://reactrouter.com/)** (v6.22.2) - Enrutamiento y navegación SPA

### UI/UX y Componentes
- **[Lucide React](https://lucide.dev/)** (v0.344.0) - Biblioteca de iconos moderna
- **[Headless UI](https://headlessui.com/)** (v1.7.18) - Componentes accesibles sin estilos
- **[React Hot Toast](https://react-hot-toast.com/)** (v2.4.1) - Sistema de notificaciones
- **[Chonky](https://chonky.io/)** (v2.3.2) - Explorador de archivos avanzado

### Backend y Base de Datos
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service completo
  - PostgreSQL como base de datos principal
  - Autenticación integrada
  - Row Level Security (RLS)
  - Almacenamiento de archivos
  - APIs REST automáticas

### Herramientas de Desarrollo
- **[ESLint](https://eslint.org/)** (v9.9.1) - Linting y calidad de código
- **[PostCSS](https://postcss.org/)** (v8.4.35) - Procesamiento de CSS
- **[Autoprefixer](https://autoprefixer.github.io/)** (v10.4.18) - Prefijos CSS automáticos

## Estructura del Directorio Principal

```
COnsultores/
├── public/                     # Archivos estáticos
│   ├── vite.svg
│   └── index.html
├── src/                        # Código fuente principal
│   ├── components/             # Componentes React reutilizables
│   │   ├── actividades/       # Componentes específicos para actividades (Kanban)
│   │   ├── actuaciones/       # Componentes específicos de actuaciones
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── clients/           # Componentes específicos de clientes
│   │   ├── historial/         # Componentes para historial de auditoría
│   │   ├── processes/         # Componentes específicos de procesos
│   │   ├── responsables/      # Componentes específicos de responsables
│   │   ├── sujetosProcesales/ # Componentes específicos de sujetos procesales
│   │   ├── ui/                # Componentes UI genéricos
│   │   └── Editor.tsx         # Componente de vista previa de archivos
│   ├── hooks/                 # Custom hooks de React
│   ├── lib/                   # Configuraciones de librerías externas
│   ├── pages/                 # Componentes de páginas principales
│   │   └── process_details/   # Páginas de detalle de procesos
│   │       └── tableros/      # Sub-páginas de tableros
│   ├── types/                 # Definiciones de tipos TypeScript
│   ├── utils/                 # Funciones de utilidad
│   ├── App.tsx               # Componente raíz de la aplicación
│   ├── main.tsx              # Punto de entrada de React
│   └── index.css             # Estilos globales y Tailwind
├── supabase/                  # Configuración de Supabase
│   └── migrations/            # Scripts de migración de BD
├── .env                       # Variables de entorno
├── package.json              # Dependencias y scripts
├── tailwind.config.js        # Configuración de Tailwind CSS
├── vite.config.ts            # Configuración de Vite
└── tsconfig.json             # Configuración de TypeScript
```

## Instalación y Configuración

### Prerrequisitos

- **Node.js** (v18.0.0 o superior)
- **npm** (v8.0.0 o superior)
- Cuenta en **[Supabase](https://supabase.com/)** para la base de datos y autenticación

### Clonación del Repositorio

```bash
git clone <repository-url>
cd COnsultores
```

### Instalación de Dependencias

```bash
npm install
```

### Configuración de Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env  # Si existe un archivo de ejemplo
```

2. Configura las siguientes variables de entorno en el archivo `.env`:

```env
VITE_SUPABASE_URL=tu_supabase_project_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_CLOUD_STORAGE_API_URL=tu_cloud_storage_api_url
```

**Variables de entorno clave:**
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave pública de Supabase para autenticación
- `VITE_CLOUD_STORAGE_API_URL`: URL de la API de almacenamiento en la nube

### Configuración de Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com/) y crea un nuevo proyecto
   - Obtén la URL del proyecto y la clave anónima desde la configuración

2. **Aplicar migraciones de base de datos:**
   ```bash
   # Si usas Supabase CLI localmente
   npx supabase login
   npx supabase link --project-ref <PROJECT_ID>
   npx supabase db push
   ```

3. **Configurar autenticación:**
   - En el panel de Supabase, ve a Authentication > Settings
   - Configura los proveedores de autenticación según tus necesidades
   - Asegúrate de que la confirmación por email esté deshabilitada para desarrollo

### Ejecución del Proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Funcionalidades Principales

### 🏢 Gestión de Clientes
- **Registro de clientes**: Crear perfiles completos con información de contacto
- **Búsqueda y filtrado**: Localizar clientes rápidamente
- **Estados de cliente**: Gestión de clientes activos e inactivos
- **Historial**: Seguimiento de la fecha de creación y modificaciones

### ⚖️ Administración de Procesos Legales
- **Creación de procesos**: Asociar casos a clientes específicos
- **Radicados únicos**: Sistema de identificación de procesos
- **Estados de proceso**: Seguimiento del estado actual de cada caso
- **Bucket de archivos**: Creación automática de almacenamiento por proceso

### 📁 Sistema de Gestión de Archivos
- **Explorador de archivos**: Interfaz similar a un explorador de escritorio
- **Operaciones CRUD**: Crear carpetas, subir, descargar y eliminar archivos
- **Vista previa integrada**: Visualización de imágenes y PDFs sin descargar
- **Organización jerárquica**: Estructura de carpetas personalizable

### 🔍 Buscador Legal Especializado
- **Códigos legales**: Búsqueda en códigos civil, penal y comercial
- **Decretos**: Acceso a decretos ejecutivos, legislativos y de urgencia
- **Leyes**: Consulta de leyes orgánicas, ordinarias y marco
- **Búsqueda inteligente**: Integración con Google Gen App Builder

### 📊 Tableros de Control
- **Métricas**: Análisis de datos y estadísticas de procesos
- **Actividades**: Gestión de tareas y actividades con tablero Kanban
- **Audiencias**: Programación y seguimiento de audiencias
- **Términos**: Control de plazos y términos legales
- **Reuniones**: Organización de reuniones relacionadas

### 📅 Gestión de Tiempo
- **Calendario**: Visualización de fechas importantes
- **Daily**: Registro de actividades diarias
- **Notificaciones**: Sistema de alertas y recordatorios

## Detalles de la Base de Datos

### Esquema Principal

La base de datos utiliza PostgreSQL a través de Supabase con las siguientes tablas principales:

#### Tabla `clientes`
```sql
- id (UUID, PK, auto-generado)
- nombre (TEXT, requerido)
- apellido (TEXT, opcional)
- correo (TEXT, opcional, único)
- telefono (TEXT, opcional)
- estado (TEXT, default: 'Activo')
- fecha_creacion (TIMESTAMPTZ, auto-generado)
```

#### Tabla `procesos`
```sql
- id (UUID, PK, auto-generado)
- client_id (UUID, FK → clientes.id, CASCADE DELETE)
- nombre (TEXT, requerido)
- radicado (TEXT, requerido)
- estado (TEXT, default: 'Activo')
- fecha_creacion (TIMESTAMPTZ, auto-generado)
- bucket_path (TEXT, opcional)
```

#### Tabla `actuaciones`
```sql
- id (UUID, PK, auto-generado)
- process_id (UUID, FK → procesos.id, CASCADE DELETE)
- fecha_actuacion (DATE, requerido)
- actuacion_texto (TEXT, requerido)
- anotacion (TEXT, requerido)
- fecha_inicio_termino (DATE, opcional)
- fecha_finaliza_termino (DATE, opcional)
- fecha_registro (TIMESTAMPTZ, requerido)
- storage_path (TEXT, opcional)
```

#### Tabla `responsables`
```sql
- id (UUID, PK, auto-generado)
- nombre (TEXT, requerido)
- apellido (TEXT, opcional)
- telefono (TEXT, opcional)
- correo (TEXT, opcional, único)
- roles (TEXT[], opcional)
- estado (TEXT, default: 'Activo')
- fecha_creacion (TIMESTAMPTZ, auto-generado)
```

#### Tabla `sujetos_procesales`
```sql
- id (UUID, PK, auto-generado)
- process_id (UUID, FK → procesos.id, CASCADE DELETE)
- nombre (TEXT, requerido)
- tipo (TEXT, requerido)
- fecha_creacion (TIMESTAMPTZ, auto-generado)
```

#### Tabla `actividades`
```sql
- id (UUID, PK, auto-generado)
- process_id (UUID, FK → procesos.id, CASCADE DELETE)
- nombre (TEXT, requerido)
- descripcion (TEXT, opcional)
- estado (TEXT, default: 'Pendiente')
- responsable_id (UUID, FK → responsables.id)
- fecha_inicio (TIMESTAMPTZ, opcional)
- fecha_finalizacion (TIMESTAMPTZ, opcional)
- fecha_creacion (TIMESTAMPTZ, auto-generado)
```

#### Tabla `audit_logs`
```sql
- id (UUID, PK, auto-generado)
- created_at (TIMESTAMPTZ, auto-generado)
- table_name (TEXT, requerido)
- record_id (UUID, requerido)
- operation_type (TEXT, requerido)
- old_data (JSONB, opcional)
- new_data (JSONB, opcional)
- user_id (UUID, FK → users.id, opcional)
```

### Relaciones
- **Uno a Muchos**: Un cliente puede tener múltiples procesos
- **Uno a Muchos**: Un proceso puede tener múltiples actuaciones y sujetos procesales
- **Uno a Muchos**: Un responsable puede estar asignado a múltiples actividades
- **Cascada**: Al eliminar un cliente, se eliminan todos sus procesos asociados

### Seguridad (Row Level Security)
- **RLS habilitado** en todas las tablas
- **Políticas de acceso**: Solo usuarios autenticados pueden realizar operaciones CRUD
- **Aislamiento de datos**: Cada usuario solo accede a sus datos autorizados

### Índices
- `clientes_correo_key`: Índice único en el campo correo
- `procesos_client_id_idx`: Índice en client_id para optimizar consultas de relación
- `actuaciones_process_id_idx`: Índice en process_id para optimizar consultas
- `actuaciones_fecha_actuacion_idx`: Índice en fecha_actuacion para búsquedas por fecha

## Scripts Útiles del Proyecto

```json
{
  "dev": "vite",                    // Inicia el servidor de desarrollo
  "build": "vite build",            // Construye la aplicación para producción
  "lint": "eslint .",               // Ejecuta el linter en todo el proyecto
  "preview": "vite preview"         // Previsualiza la build de producción
}
```

### Comandos de desarrollo más utilizados:

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo con hot reload

# Construcción
npm run build        # Genera la build optimizada para producción
npm run preview      # Sirve la build de producción localmente

# Calidad de código
npm run lint         # Verifica el código con ESLint
```

## Páginas y Componentes Clave

### Páginas Principales

| Página | Ruta | Descripción |
|--------|------|-------------|
| **Login** | `/` | Autenticación de usuarios |
| **Inicio** | `/inicio` | Dashboard principal |
| **Clientes** | `/clientes` | Gestión de clientes |
| **Responsables** | `/responsables` | Gestión de responsables |
| **Detalle Cliente** | `/clientes/:id` | Información específica del cliente |
| **Procesos Cliente** | `/clientes/:id/procesos` | Procesos asociados a un cliente |
| **Procesos** | `/procesos` | Vista general de procesos |
| **Detalle Proceso** | `/procesos/:id/*` | Secciones detalladas del proceso |
| **Archivos** | `/procesos/:id/archivos` | Gestión de archivos del proceso |
| **Tableros** | `/procesos/:id/tableros/*` | Tableros específicos del proceso |
| **Buscador Legal** | `/buscador-legal/*` | Búsqueda de información legal |

### Componentes Reutilizables Clave

#### Componentes UI Base
- **`Input.tsx`**: Campo de entrada con validación, iconos y estados de error
- **`Button.tsx`**: Botón con variantes (primary, secondary, outline) y estados de carga
- **`Modal.tsx`**: Modal genérico con manejo de escape y overlay
- **`SidebarMenu.tsx`**: Menú de navegación lateral con colapso
- **`Header.tsx`**: Encabezado de página consistente

#### Componentes de Negocio
- **`ClientTable.tsx`**: Tabla de clientes con paginación y acciones CRUD
- **`ClientForm.tsx`**: Formulario de creación/edición de clientes con validación
- **`ProcessTable.tsx`**: Tabla de procesos con funcionalidades similares
- **`ProcessForm.tsx`**: Formulario de procesos con validación específica
- **`ActuacionTable.tsx`**: Tabla de actuaciones con paginación
- **`ResponsableTable.tsx`**: Tabla de responsables con gestión completa
- **`KanbanBoard.tsx`**: Tablero Kanban para gestión visual de actividades
- **`Editor.tsx`**: Visor de archivos con soporte para imágenes y PDFs

#### Componentes de Navegación
- **`ProcessDetailHorizontalMenu.tsx`**: Navegación horizontal para secciones de proceso
- **`TablerosHorizontalMenu.tsx`**: Navegación específica para tableros
- **`HorizontalMenu.tsx`**: Componente genérico de menú horizontal

## Gestión de Archivos

### Sistema de Almacenamiento
- **Buckets automáticos**: Cada proceso genera un bucket único (`process-{id}`)
- **API de almacenamiento**: Integración con servicio de almacenamiento en la nube
- **Operaciones soportadas**:
  - Crear carpetas
  - Subir archivos múltiples
  - Descargar archivos
  - Eliminar archivos y carpetas
  - Vista previa de imágenes y PDFs

### Explorador de Archivos (Chonky)
- **Interfaz familiar**: Similar a exploradores de escritorio
- **Navegación jerárquica**: Soporte completo para carpetas anidadas
- **Acciones contextuales**: Menús y barras de herramientas intuitivas
- **Vista previa integrada**: Panel lateral para visualización de archivos

## Buenas Prácticas y Convenciones

### Estructura de Código
- **Separación de responsabilidades**: Componentes enfocados en una sola funcionalidad
- **Tipado estricto**: Uso consistente de TypeScript para mayor robustez
- **Componentes modulares**: Reutilización máxima de componentes UI
- **Custom hooks**: Encapsulación de lógica compleja en hooks reutilizables

### Gestión de Estado
- **Estado local**: Uso de `useState` para estado de componente
- **Contexto de rutas**: `useOutletContext` para compartir datos entre rutas anidadas
- **Supabase real-time**: Aprovechamiento de las capacidades en tiempo real cuando sea necesario

### Seguridad
- **Variables de entorno**: Todas las claves sensibles en archivos `.env`
- **RLS en Supabase**: Políticas de seguridad a nivel de base de datos
- **Validación de formularios**: Validación tanto en cliente como en servidor
- **Autenticación requerida**: Protección de todas las rutas principales

### Estilo y UI/UX
- **Design system consistente**: Uso de Tailwind CSS con configuración personalizada
- **Tema oscuro**: Paleta de colores optimizada para uso profesional
- **Responsive design**: Adaptación a diferentes tamaños de pantalla
- **Feedback visual**: Notificaciones, estados de carga y transiciones suaves

## Referencias y Documentación Adicional

### Documentación Oficial
- **[React Documentation](https://reactjs.org/docs)** - Guía completa de React
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Referencia de TypeScript
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Documentación de utilidades CSS
- **[Supabase Documentation](https://supabase.com/docs)** - Guía completa de Supabase
- **[Vite Guide](https://vitejs.dev/guide/)** - Documentación de Vite
- **[React Router](https://reactrouter.com/docs)** - Guía de enrutamiento

### Librerías Específicas
- **[Chonky File Browser](https://chonky.io/)** - Documentación del explorador de archivos
- **[Lucide Icons](https://lucide.dev/)** - Catálogo de iconos
- **[Headless UI](https://headlessui.com/)** - Componentes accesibles
- **[React Hot Toast](https://react-hot-toast.com/)** - Sistema de notificaciones

### Recursos de Desarrollo
- **[Supabase CLI](https://supabase.com/docs/reference/cli)** - Herramientas de línea de comandos
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)** - Referencia de base de datos
- **[ESLint Rules](https://eslint.org/docs/rules/)** - Reglas de linting

---

**Desarrollado con ❤️ para la comunidad legal**

*Para soporte técnico o contribuciones, consulta la documentación de cada tecnología utilizada o contacta al equipo de desarrollo.*