# 🔗 LinkShort — Acortador de Enlaces SaaS

Plataforma moderna de acortamiento de enlaces con analíticas avanzadas, gestión de campañas y panel de administración. Construido con **Next.js 16**, **Prisma**, **PostgreSQL** y desplegable con **Docker**.

---

## ✨ Funcionalidades Principales

| Funcionalidad | Descripción |
|---|---|
| 🔗 **Acortamiento de URLs** | Genera slugs aleatorios o personalizados (Enterprise) para cada enlace |
| 📊 **Analíticas en tiempo real** | Geolocalización, dispositivos, navegadores, referrers y tráfico UTM por cada clic |
| 📁 **Campañas** | Organiza tus enlaces en campañas con opciones de archivar y eliminar |
| 🔒 **Autenticación completa** | Registro, login y gestión de sesiones con NextAuth.js v5 |
| 👑 **Panel de Administración** | Gestión de usuarios, cambio de tiers y métricas globales del sistema |
| 🏷️ **Sistema de Tiers** | FREE, PRO y ENTERPRISE con límites configurables de campañas y enlaces |
| 📅 **Enlaces con caducidad** | Configura una fecha de expiración (TTL) para cada enlace |
| 🌐 **Open Graph personalizable** | Edita título, descripción e imagen de vista previa para redes sociales |
| 📱 **QR Code** | Genera códigos QR descargables para cada enlace acortado |
| 📤 **Exportación CSV** | Descarga las analíticas de cualquier campaña en formato CSV |
| 🌍 **Geolocalización Offline** | Base de datos GeoIP local (sin depender de APIs externas) |
| 🎨 **Tema oscuro/claro** | Soporte completo de dark mode con `next-themes` |

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack)
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Autenticación:** NextAuth.js v5 (JWT + Credentials)
- **UI:** Tailwind CSS v4 + shadcn/ui + Recharts
- **Geolocalización:** geoip-lite (offline, sin APIs externas)
- **Despliegue:** Docker + Docker Compose (compatible con Coolify, Railway, etc.)

---

## 🚀 Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/link-shortener-saas.git
cd link-shortener-saas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL, NEXTAUTH_SECRET, etc.

# 4. Sincronizar la base de datos
npx prisma db push

# 5. Arrancar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:4675`.

---

## 🐳 Despliegue con Docker

```bash
# Construir y arrancar todos los servicios
docker compose up -d --build
```

El archivo `docker-compose.yml` incluye PostgreSQL y la aplicación Next.js. La base de datos se crea automáticamente con todas las tablas necesarias al arrancar.

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── [slug]/          # Redirección de enlaces + tracking
│   ├── admin/           # Panel de administración
│   ├── dashboard/       # Dashboard principal y campañas
│   ├── login/           # Página de inicio de sesión
│   ├── register/        # Página de registro
│   ├── settings/        # Configuración de perfil y billing
│   └── api/             # API routes (auth, exports)
├── components/          # Componentes reutilizables (shadcn/ui)
├── lib/                 # Utilidades (Prisma client, límites de tier)
├── types/               # Declaraciones de tipos TypeScript
├── auth.ts              # Configuración de NextAuth.js
└── middleware.ts        # Protección de rutas
```

---

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rondas de salt)
- Sesiones JWT con rotación automática
- Server Actions protegidas con verificación de sesión
- Panel admin restringido por rol (`ADMIN`)
- Protección contra IDOR en todas las operaciones de datos
- Middleware de autenticación en rutas protegidas
- Inputs validados y sanitizados vía Prisma ORM

---

## 📄 Variables de Entorno

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/linkshort"
NEXTAUTH_SECRET="tu-secreto-seguro"
NEXTAUTH_URL="http://localhost:4675"
AUTH_TRUST_HOST=true
```

---

## 📝 Licencia

Este proyecto es de código privado para uso en portfolio.
