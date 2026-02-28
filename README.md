<div align="center">

<br/>

# 🏗️ ERP Nexus — Fábrica de Bloques de Hormigón

**Sistema de gestión integral diseñado para optimizar los procesos productivos,  
comerciales y operativos de una fábrica de bloques de hormigón.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

<br/>

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Modelo de Datos](#-modelo-de-datos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roles y Permisos](#-roles-y-permisos)

---

## 📖 Descripción

**ERP Nexus** es una aplicación web **full-stack** tipo ERP (Enterprise Resource Planning) construida con el **App Router de Next.js 16** y una arquitectura orientada a **Server Actions**. Permite gestionar de forma centralizada todos los procesos clave de una fábrica de bloques:

- Control de producción por turnos y lotes
- Gestión de compras de materias primas con trazabilidad de costos
- Ventas, órdenes de pedido y despachos con ticket de pesaje
- Inventario de patio en tiempo real
- Gestión del personal de planta
- Configuración de tipos de bloques y formulaciones

---

## 🧩 Módulos del Sistema

### 📊 Dashboard
Panel principal con indicadores clave de rendimiento: producción del día, stock disponible, órdenes pendientes y alertas de stock mínimo.

### 🏭 Producción
Registro de lotes de producción por turno (mañana/tarde/noche). Vincula cada lote con:
- Tipo de bloque y su formulación (cemento, arena, aditivos)
- Operarios participantes con bloques producidos individuales
- Cálculo automático de costo unitario por bloque

### 🛒 Compras
Gestión de proveedores y compras de materias primas. Actualiza automáticamente el stock y el precio promedio de cada material al registrar una compra.

### 🚚 Venta y Despacho
Flujo completo de ventas:
1. Creación de orden con líneas de productos (tipos de bloques + precios)
2. Aprobación y despacho por un trabajador
3. Registro de ticket de pesaje (peso bruto, tara, peso neto)

### 📦 Inventario de Patio
Control del stock físico de bloques terminados en el patio. Permite ajustes manuales con registro de movimientos de entrada y salida.

### 👥 Personal
Administración del personal de planta: altas, bajas, posiciones y estado activo/inactivo.

### ⚙️ Configuración General
Gestión de los tipos de bloques producidos (dimensiones, nombre) y sus formulaciones de materias primas asociadas.

---

## 🛠 Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript 5 |
| **UI** | React 19 + Tailwind CSS 4 + shadcn/ui |
| **ORM** | Prisma 6 |
| **Base de Datos** | SQLite (libSQL) |
| **Autenticación** | NextAuth.js v4 |
| **Formularios** | React Hook Form + Zod |
| **Iconos** | Lucide React |
| **Notificaciones** | Sonner |

---

## 🗄 Modelo de Datos

```
User ──────────── ProductionBatch ── BatchWorker ── Worker
                        │
BlockType ──────────────┤
    │                   └── Formulation
    ├── YardStock
    ├── StockMovement
    └── OrderLine ── Order ── Client
                       │
                    Dispatch ── WeighingTicket
                    
RawMaterial ── RawMaterialPurchase ── Supplier
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** v18 o superior
- **npm** o **pnpm**

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/MauriiLogx/ERP_Fabrica_Bloques.git
cd ERP_Fabrica_Bloques

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

Editar `.env` con los valores correspondientes:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu_clave_secreta_aqui"
NEXTAUTH_URL="http://localhost:3000"
```

```bash
# 4. Generar la base de datos y ejecutar migraciones
npx prisma migrate dev

# 5. Poblar la base de datos con datos iniciales
npm run seed

# 6. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en **[http://localhost:3000](http://localhost:3000)**

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Inicia el servidor en modo producción |
| `npm run lint` | Ejecuta el linter ESLint |
| `npm run seed` | Pobla la base de datos con datos de ejemplo |

---

## 📁 Estructura del Proyecto

```
erp/
├── prisma/
│   ├── schema.prisma       # Modelos de base de datos
│   └── seed.ts             # Datos iniciales
├── src/
│   ├── app/
│   │   ├── (dashboard)/    # Páginas protegidas del ERP
│   │   │   ├── dashboard/  # Panel de inicio
│   │   │   ├── produccion/ # Módulo de producción
│   │   │   ├── compras/    # Módulo de compras
│   │   │   ├── ventas/     # Módulo de ventas y despacho
│   │   │   ├── stock/      # Módulo de inventario de patio
│   │   │   ├── personal/   # Módulo de personal
│   │   │   └── configuracion/ # Configuración general
│   │   ├── actions/        # Server Actions (lógica de negocio)
│   │   ├── api/auth/       # Endpoints de NextAuth
│   │   └── login/          # Página de inicio de sesión
│   ├── components/         # Componentes reutilizables (shadcn/ui)
│   └── lib/                # Utilidades: auth, prisma client
└── public/                 # Archivos estáticos
```

---

## 🔐 Roles y Permisos

El sistema cuenta con autenticación basada en sesiones mediante **NextAuth.js**. Se define el rol del usuario en el modelo `User`:

| Rol | Descripción |
|---|---|
| `ADMIN` | Acceso completo a todos los módulos y configuración |
| `OPERARIO_APP` | Acceso operativo para registro de producción y despachos |

---

<div align="center">

**ERP Nexus** — Versión 1.0 MVP

*Desarrollado con ❤️ en San Carlos, Chile*

</div>
