# SGI Opera Soluciones
**Sistema de Gestión Integral para Opera Soluciones**
Plataforma integral de gestión empresarial desarrollada con Next.js 14, TypeScript y MySQL, diseñada para centralizar y optimizar todos los procesos administrativos, de recursos humanos y operativos de la empresa.

## 🎯 Propósito del Sistema

El SGI Opera Soluciones es un **Sistema de Gestión Integral** que unifica múltiples módulos empresariales en una sola plataforma, permitiendo:

- **Gestión centralizada** de empleados, documentos y procesos
- **Control de ausencias** y gestión de recursos humanos
- **Módulo contable** para gastos y nómina
- **Sistema de auditoría** completo con trazabilidad
- **Gestión documental** con almacenamiento seguro en la nube
- **Dashboards personalizados** según el rol del usuario

## 🏗️ Arquitectura del Sistema

### **Frontend (Next.js 14 + TypeScript)**
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript para type safety
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Estado**: React Hooks + Context API
- **Gráficos**: Recharts para visualizaciones
- **Formularios**: React Hook Form + Zod validation

### **Backend (Next.js API Routes)**
- **API**: Next.js API Routes (RESTful)
- **Base de Datos**: MySQL 8.0+ con mysql2
- **Autenticación**: JWT con jose
- **Almacenamiento**: DigitalOcean Spaces (S3 compatible)
- **Validación**: Zod schemas
- **Seguridad**: bcryptjs para hashing de contraseñas

### **Infraestructura**
- **Hosting**: Vercel (desarrollo y producción)
- **Base de Datos**: MySQL en CloudClusters.io
- **CDN**: DigitalOcean Spaces para archivos
- **Dominio**: Configurable para producción

## 📋 Módulos del Sistema

### 1. **Módulo de Autenticación** (`/app/api/auth/`)
- Login/logout con JWT
- Cambio de contraseñas
- Verificación de tokens
- Middleware de autenticación

### 2. **Módulo de Empleados** (`/app/inicio/empleados/`)
- **Gestión completa de empleados** con formularios detallados
- **Subida de fotos de perfil** con validación
- **Gestión de documentos** por empleado
- **Estados de contrato** (Activo, Inactivo, Archivado)
- **Información laboral completa** (cargo, salario, fechas, etc.)
- **Información personal** (documentos, contacto de emergencia, etc.)

### 3. **Módulo de Ausencias** (`/app/ausencias/`)
- **Registro de ausencias** por colaborador
- **Tipos de ausencia** configurables (Enfermedad, Incumplimiento, Accidente, No Presentado)
- **Cálculo automático de días** basado en fechas
- **Dashboard con estadísticas** y gráficos
- **Historial completo** con filtros
- **Archivos de soporte** para cada ausencia

### 4. **Módulo Contable** (`/app/inicio/contable/`)
- **Gestión de gastos** empresariales
- **Módulo de nómina** (en desarrollo)
- **Reportes financieros** y estadísticas

### 5. **Módulo de Documentos** (`/app/api/documents/`)
- **Subida de documentos** con categorización
- **Tipos de documento** configurables
- **Almacenamiento seguro** en DigitalOcean Spaces
- **Nombres de archivo únicos** con UUID para seguridad

### 6. **Sistema de Referencias** (`/app/api/reference/`)
- **Roles de usuario** (ADMIN, HR, EMPLOYEE, AUDITOR)
- **Estados de contrato** configurables
- **Tipos de documento** personalizables

## 👥 Roles y Permisos

### **Administrador (ADMIN)**
- ✅ Acceso completo al sistema
- ✅ Gestión de todos los usuarios
- ✅ Configuración del sistema
- ✅ Todos los módulos disponibles

### **Recursos Humanos (HR)**
- ✅ Gestión de empleados
- ✅ Módulo de ausencias
- ✅ Gestión de documentos
- ✅ Reportes de personal
- ❌ Configuración del sistema

### **Auditor (AUDITOR)**
- ✅ Visualización de reportes
- ✅ Acceso a datos de auditoría
- ✅ Módulo de ausencias (solo lectura)
- ❌ Gestión de usuarios

### **Empleado (EMPLOYEE)**
- ✅ Ver perfil propio
- ✅ Actualizar información personal
- ✅ Ver documentos propios
- ❌ Gestión de otros usuarios

## 🛠️ Tecnologías Utilizadas

### **Frontend**
```json
{
  "next": "14.2.16",
  "react": "^18.3.1",
  "typescript": "^5",
  "tailwindcss": "^3.4.17",
  "@radix-ui/react-*": "latest",
  "recharts": "^3.2.1",
  "framer-motion": "^12.23.0",
  "lucide-react": "^0.454.0"
}
```

### **Backend**
```json
{
  "mysql2": "^3.14.5",
  "jose": "^5.2.3",
  "bcryptjs": "^2.4.3",
  "zod": "^3.23.8",
  "@aws-sdk/client-s3": "^3.890.0"
}
```

### **Herramientas de Desarrollo**
```json
{
  "eslint": "configurado",
  "prettier": "configurado",
  "postcss": "^8.5",
  "class-variance-authority": "^0.7.1"
}
```

## 📁 Estructura del Proyecto

```
sgi-opera-soluciones/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticación
│   │   ├── ausencias/           # Módulo de ausencias
│   │   ├── colaboradores/       # API de colaboradores
│   │   ├── contable/            # Módulo contable
│   │   ├── documents/           # Gestión de documentos
│   │   ├── employees/           # Gestión de empleados
│   │   ├── reference/           # Datos de referencia
│   │   ├── upload/              # Subida de archivos
│   │   └── users/               # Gestión de usuarios
│   ├── ausencias/               # Páginas de ausencias
│   │   ├── historial/           # Historial de ausencias
│   │   └── registro/            # Registro de ausencias
│   ├── inicio/                  # Dashboard principal
│   │   ├── contable/            # Módulo contable
│   │   ├── empleados/           # Gestión de empleados
│   │   └── perfil/              # Perfil de usuario
│   ├── login/                   # Página de login
│   └── page.tsx                 # Página principal
├── components/                   # Componentes React
│   ├── ausencias/               # Componentes de ausencias
│   ├── auth/                    # Componentes de autenticación
│   ├── contable/                # Componentes contables
│   ├── dashboard/               # Dashboards por rol
│   ├── employees/               # Componentes de empleados
│   ├── forms/                   # Formularios reutilizables
│   ├── layout/                  # Componentes de layout
│   ├── sections/                # Secciones de la página
│   └── ui/                      # Componentes de UI (shadcn/ui)
├── database/                    # Scripts de base de datos
│   ├── database.sql             # Script principal
│   └── users.ts                 # Utilidades de usuarios
├── lib/                         # Utilidades y configuraciones
│   ├── ausencias/               # Servicios de ausencias
│   │   ├── services/            # Lógica de negocio
│   │   └── types/               # Tipos TypeScript
│   ├── auth/                    # Servicios de autenticación
│   ├── constants.ts             # Constantes del sistema
│   ├── database.ts              # Conexión a MySQL
│   ├── digitalocean-spaces.ts   # Integración con Spaces
│   ├── file-utils.ts            # Utilidades de archivos
│   └── validations.ts           # Validaciones Zod
├── public/                      # Archivos estáticos
│   ├── recursos/                # Imágenes del sistema
│   └── uploads/                 # Archivos subidos
├── styles/                      # Estilos globales
└── types/                       # Tipos TypeScript globales
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+
- MySQL 8.0+
- Cuenta de DigitalOcean (para Spaces)
- Git

### **1. Clonar el Repositorio**
```bash
git clone <url-del-repositorio>
cd sgi-opera-soluciones
```

### **2. Instalar Dependencias**
```bash
# Usando npm
npm install

# Usando pnpm (recomendado)
pnpm install

# Usando yarn
yarn install
```

### **3. Configurar Variables de Entorno**
Crear archivo `.env.local`:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=sgi_opera_soluciones

# Configuración JWT
JWT_SECRET=tu-clave-secreta-jwt-super-segura

# Configuración DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=tu_access_key
DO_SPACES_SECRET=tu_secret_key
DO_SPACES_BUCKET=nombre-de-tu-bucket

# Configuración de la Aplicación
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-nextauth-secret
```

### **4. Configurar Base de Datos**
```bash
# Crear base de datos y ejecutar script
mysql -u root -p < database/database.sql
```

### **5. Ejecutar en Desarrollo**
```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🔧 Configuración de DigitalOcean Spaces

### **1. Crear Space**
1. Ir a [DigitalOcean Dashboard](https://cloud.digitalocean.com/)
2. Crear un nuevo Space
3. Elegir región (recomendado: nyc3)
4. Configurar como público para acceso directo

### **2. Generar API Keys**
1. Ir a API > Spaces Keys
2. Crear nueva clave con permisos de escritura
3. Guardar Access Key y Secret Key

### **3. Configurar CORS (Opcional)**
```json
{
  "cors_rules": [
    {
      "allowed_origins": ["*"],
      "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
      "allowed_headers": ["*"],
      "max_age_seconds": 3000
    }
  ]
}
```

## 📊 Funcionalidades Principales

### **Gestión de Empleados**
- ✅ **Formulario completo** con 20+ campos
- ✅ **Subida de fotos** con validación (JPG, PNG, WEBP)
- ✅ **Gestión de documentos** por empleado
- ✅ **Estados de contrato** configurables
- ✅ **Información laboral** detallada
- ✅ **Información personal** completa
- ✅ **Validación robusta** con Zod

### **Sistema de Ausencias**
- ✅ **Registro de ausencias** por colaborador
- ✅ **Tipos configurables** (Enfermedad, Incumplimiento, Accidente, No Presentado)
- ✅ **Cálculo automático** de días de ausencia
- ✅ **Dashboard con estadísticas** y gráficos
- ✅ **Historial completo** con filtros
- ✅ **Archivos de soporte** para cada ausencia
- ✅ **Filtrado por roles** (excluye ADMIN)

### **Gestión Documental**
- ✅ **Subida de documentos** con categorización
- ✅ **Tipos de documento** configurables
- ✅ **Almacenamiento seguro** en DigitalOcean Spaces
- ✅ **Nombres únicos** con UUID para seguridad
- ✅ **Validación de tipos** y tamaños

### **Sistema de Autenticación**
- ✅ **JWT tokens** seguros
- ✅ **Roles diferenciados** con permisos
- ✅ **Middleware de autenticación**
- ✅ **Cambio de contraseñas**
- ✅ **Sesiones persistentes**

### **Dashboards Personalizados**
- ✅ **Admin Dashboard** - Acceso completo
- ✅ **HR Dashboard** - Gestión de personal
- ✅ **Employee Dashboard** - Vista limitada
- ✅ **Auditor Dashboard** - Reportes y auditoría

## 🔒 Seguridad

### **Autenticación y Autorización**
- JWT tokens con expiración configurable
- Roles y permisos granulares
- Middleware de autenticación en todas las rutas protegidas
- Validación de tokens en cada request

### **Protección de Datos**
- Contraseñas hasheadas con bcryptjs (12 rounds)
- Validación de entrada con Zod schemas
- Sanitización de datos de usuario
- Nombres de archivo únicos con UUID

### **Almacenamiento Seguro**
- Archivos almacenados en DigitalOcean Spaces
- URLs públicas con nombres únicos
- Validación de tipos de archivo
- Límites de tamaño configurados

## 🚀 Despliegue

### **Vercel (Recomendado)**
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en el dashboard
3. Desplegar automáticamente

### **Variables de Entorno en Producción**
```env
# Base de datos de producción
DB_HOST=tu-host-mysql
DB_PORT=3306
DB_USER=tu-usuario-prod
DB_PASSWORD=tu-contraseña-prod
DB_NAME=sgi_opera_soluciones

# JWT de producción
JWT_SECRET=clave-jwt-super-segura-produccion

# DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=tu-key-prod
DO_SPACES_SECRET=tu-secret-prod
DO_SPACES_BUCKET=tu-bucket-prod
```

## 📈 Monitoreo y Logs

### **Logs del Sistema**
- Logs de autenticación
- Logs de operaciones de base de datos
- Logs de subida de archivos
- Logs de errores con stack traces

### **Métricas Disponibles**
- Número de usuarios activos
- Estadísticas de ausencias
- Uso de almacenamiento
- Rendimiento de la aplicación

## 🛠️ Desarrollo

### **Comandos Útiles**
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar linting
npm run lint

# Ejecutar en producción
npm start
```

### **Estructura de Base de Datos**
El sistema incluye las siguientes tablas principales:
- `users` - Información de empleados
- `user_roles` - Roles del sistema
- `contract_statuses` - Estados de contrato
- `document_types` - Tipos de documento
- `documents` - Documentos subidos
- `ausencias` - Registro de ausencias
- `tipos_ausencia` - Tipos de ausencia
- `archivos_ausencias` - Archivos de soporte

### **Patrones de Desarrollo**
- **Clean Architecture** con separación de capas
- **SOLID Principles** en servicios
- **TypeScript** para type safety
- **Zod** para validación de datos
- **Error handling** consistente
- **Logging** estructurado

## 📝 Notas Importantes

1. **Seguridad**: Las contraseñas se hashean con bcryptjs (12 rounds)
2. **Archivos**: Máximo 5MB para fotos, 10MB para documentos
3. **Base de Datos**: Usar MySQL 8.0+ para mejor rendimiento
4. **DigitalOcean**: Configurar CORS si es necesario
5. **Vercel**: Plan gratuito tiene límites de tiempo de ejecución
6. **UUID**: Todos los archivos usan nombres únicos para seguridad

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- **Email**: soporte@opera-soluciones.com
- **Documentación**: `/docs`
- **Issues**: GitHub Issues

---
*Sistema de Gestión Integral*
