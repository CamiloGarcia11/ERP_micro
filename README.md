# 🏢 ERP Modular - Arquitectura de Microservicios & Docker

Sistema ERP modular empresarial desacoplado en una arquitectura de **Microservicios** contenerizada con **Docker**, compuesta por:
- **Backend Microservice:** API REST independiente desarrollada en **Node.js**, **Express** y **TypeScript** (Puerto `4000`).
- **Frontend Client:** Aplicación web moderna en **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **TanStack Query** y **Zustand** (Puerto `3000`).
- **Orquestación:** Despliegue automatizado con **Docker Compose** y red interna dedicada (`erp-network`).

---

## 🏗️ Arquitectura del Sistema

```
ERP_micro/
├── backend/                  # 🚀 Microservicio Backend (Express + TypeScript)
│   ├── src/
│   │   ├── modules/          # Auth, Inventory, Sales, Analytics
│   │   ├── db/               # In-Memory Database / Data Store
│   │   ├── types/            # DTOs y contratos
│   │   └── index.ts          # Servidor Express & Middleware RFC 7807
│   ├── Dockerfile            # Multi-stage build (node:20-alpine)
│   └── package.json
│
├── frontend/                 # 💻 Aplicación Frontend (Next.js 14)
│   ├── src/
│   │   ├── app/              # Dashboard, Inventario, Ventas, Analítica, Login
│   │   ├── components/       # Componentes UI
│   │   ├── lib/              # API Client (conecta al microservicio backend)
│   │   └── store/            # Zustand Store de autenticación
│   ├── Dockerfile            # Multi-stage build standalone (node:20-alpine)
│   └── package.json
│
├── docker-compose.yml        # 🐳 Orquestación de contenedores
├── .env.example              # Variables de entorno de referencia
└── package.json              # Scripts raíz para ejecución simultánea local
```

---

## 🐳 Despliegue con Docker (Recomendado para Producción)

### Requisitos
- Tener instalado **Docker Desktop** con soporte para Docker Compose.

### 1. Iniciar ambos contenedores (Backend + Frontend)
En la raíz del proyecto ejecuta:
```bash
docker compose up --build
```
O usando los scripts npm de la raíz:
```bash
npm run docker:up
```

Para ejecutar en segundo plano (modo detached):
```bash
docker compose up -d --build
# o
npm run docker:up:d
```

### 2. Acceso a los Servicios
- **Frontend Web:** [http://localhost:3000](http://localhost:3000)
- **Backend Microservice API:** [http://localhost:4000](http://localhost:4000)
- **Health Check del Microservicio:** [http://localhost:4000/health](http://localhost:4000/health)

### 3. Detener los contenedores
```bash
docker compose down
# o
npm run docker:down
```

---

## 💻 Ejecución Local (Sin Docker)

Si prefieres desarrollar localmente con recarga en caliente (Hot Reload):

### 1. Iniciar Frontend y Backend simultáneamente
Desde la raíz del proyecto:
```bash
npm run dev
```
*Este comando utiliza `concurrently` para lanzar tanto el Backend (`http://localhost:4000`) como el Frontend (`http://localhost:3000`) en una sola terminal con logs diferenciados por colores.*

### 2. Iniciar servicios por separado (opcional)
```bash
# Solo el Backend Microservice:
npm run dev:backend

# Solo el Frontend:
npm run dev:frontend
```

---

## 📡 Endpoints del Microservicio Backend

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck y estado de actividad del contenedor |
| `POST` | `/api/auth/login` | Autenticación con email y contraseña, emisión de tokens |
| `GET` | `/api/inventory/products` | Catálogo de productos (filtros: `?search=...&category=...`) |
| `POST` | `/api/inventory/products` | Registro de nuevos productos con validación de SKU duplicado |
| `GET` | `/api/sales/orders` | Historial de órdenes de venta emitidas |
| `POST` | `/api/sales/orders` | Creación de orden con cálculo de IGV (18%) y **descuento automático de existencias en almacén** |
| `GET` | `/api/analytics/summary` | KPIs financieros (ingresos totales, ticket promedio, unidades vendidas, ventas recientes) |

---

## 🔑 Credenciales de Acceso (o usa los botones Demo en pantalla)

| Rol | Correo Electrónico | Contraseña | Perfil |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@erp.local` | `Admin123!` | Administrador General |
| **Contador** | `contador@erp.local` | `Accountant123!` | Finanzas y Analítica |
| **Operador** | `operador@erp.local` | `Operator123!` | Almacén y Ventas |
