# 🏦 BanKinal — Ecosistema Bancario Digital Institucional

**BanKinal** es una plataforma Full-Stack de servicios financieros diseñada para ofrecer una experiencia bancaria moderna, segura y eficiente. El sistema integra una arquitectura de microservicios robusta con un frontend premium inspirado en estándares institucionales (Banrural/BAC).

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Arquitectura** | Microservicios Descentralizados |
| **Frontend** | React 19 + Vite |
| **Estilos** | Tailwind CSS v4 (Aesthetics Engine) |
| **Estado Global** | Zustand (Persistent Stores) |
| **Runtime Backend** | Node.js v24 + ES Modules |
| **Bases de Datos** | PostgreSQL (Cuentas/Usuarios) & MongoDB (Transacciones/Canjes) |
| **Infraestructura** | Docker + Docker Compose |
| **Seguridad** | JWT (RBAC) + Axios Interceptors |
| **Storage** | Cloudinary (Perfiles y Assets) |
| **Notificaciones** | Nodemailer (Verificación y Alertas) |

---

## 🚀 Instalación y Arranque

### 🛠️ Prerrequisitos
- Node.js 20+
- pnpm
- Docker & Docker Desktop

### 🏗️ Levantando la Infraestructura (Base de Datos)
El sistema utiliza **PostgreSQL 16** para la gestión de usuarios y roles.
```bash
# En la raíz del proyecto
docker compose up -d
```

### 📦 Instalación de Dependencias
```bash
# Instalar dependencias del backend
pnpm install

# Instalar dependencias del frontend
cd frontend
pnpm install
```

### 🏃 Ejecución en Desarrollo
Debes iniciar ambos entornos en terminales separadas:

**Terminal 1 (Backend):**
```bash
# En la raíz del proyecto
pnpm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
pnpm run dev
```

---

## 🔑 Credenciales por Defecto (Seed)

El sistema sincroniza automáticamente un administrador inicial al detectar una base de datos limpia:

| Rol | Usuario / Email | Contraseña |
|---|---|---|
| **Administrador** | `admin` / `admin@bankinal.com` | `Admin1234!` |
| **Cliente** | *Auto-registro habilitado* | *Definida por el usuario* |

---

## 🛡️ Roles y Seguridad (RBAC)

El sistema implementa un control de acceso basado en roles (Role-Based Access Control) que divide la experiencia en dos universos:

### 👤 User Role (Cliente)
- **Dashboard Financiero**: Resumen de saldos e ingresos/egresos.
- **Gestión de Cuentas**: Apertura de cuentas monetarias y de ahorro.
- **Operaciones**: Transferencias a terceros, retiros y depósitos.
- **Servicios**: Pago de servicios básicos y catálogo de canjes.
- **Perfil**: Gestión de datos personales y seguridad.

### 🛡️ Admin Role (Institucional)
- **Consola de Control**: Métricas globales de usuarios y capital circulante.
- **Aprobaciones**: Gestión de solicitudes de cuentas nuevas.
- **Seguridad**: Monitoreo de actividad y estado de servicios.
- **Gestión Global**: Control total sobre el catálogo de servicios y canjes.

---

## 📦 Estructura del Proyecto

```
Sistema_Bancario/
├── auth-service/       # Microservicio de Seguridad (PostgreSQL)
├── backend/            # Microservicio de Operaciones (MongoDB)
├── frontend/           # React 19 + Tailwind v4
│   ├── src/
│   │   ├── app/        # Router y Layouts
│   │   ├── features/   # Módulos (Auth, Accounts, Transacciones)
│   │   └── shared/     # Componentes, Hooks y API Config
├── docker-compose.yml  # Orquestación de DBs
└── .env                # Configuración de variables de entorno
```

---

## 🔧 Roadmap de Implementación

- [x] Fase 1: Arquitectura Base y Diseño de Identidad.
- [x] Fase 2: Auth Flow completo (Registro/Login/Verificación).
- [x] Fase 3: Dashboard y Gestión de Cuentas.
- [x] Fase 4: Operaciones Bancarias (Transferencias y Saldo).
- [x] Fase 5: Servicios y Sistema de Canjes.
- [x] Fase 6: Panel Administrativo y Reportes.
- [x] Fase 7: Optimización y Pulido Final.

---

> [!NOTE]
> **Seguridad Institucional:** BanKinal utiliza interceptores de Axios para garantizar que cada petición esté firmada por un JWT válido, manejando automáticamente la expiración de sesiones.

**BanKinal** — *Ingeniería financiera al alcance de un clic.*