# 🏢 ERP Modular - Next.js

Sistema ERP modular empresarial desarrollado directamente con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Zustand** y **TanStack Query**.

---

## 🚀 Inicio Rápido en el IDE (VS Code)

### 1. Instalar dependencias
Abre la terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```

### 3. Abrir en el navegador
Ingresa a: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Credenciales de Acceso (o usa los botones Demo en pantalla)

| Rol | Correo Electrónico | Contraseña | Perfil |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@erp.local` | `Admin123!` | Administrador General |
| **Contador** | `contador@erp.local` | `Accountant123!` | Finanzas y Analítica |
| **Operador** | `operador@erp.local` | `Operator123!` | Almacén y Ventas |

---

## 📦 Módulos Incluidos

- **🔐 Autenticación & Roles:** Manejo de sesiones y control de acceso por roles (`ADMIN`, `ACCOUNTANT`, `OPERATOR`).
- **📦 Inventario & Stock:** Catálogo de productos, filtrado en tiempo real, registro de SKUs y visualización de existencias.
- **💳 Ventas & Facturación:** Emisión de órdenes con cálculo automático de impuestos (IGV 18%) y **descuento reactivo de stock en almacén**.
- **📊 Analítica de Negocio:** Panel en tiempo real de ingresos totales, ticket promedio, unidades vendidas y auditoría de transacciones.
