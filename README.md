# EstiloTurno

EstiloTurno es una plataforma para gestión y automatización de citas para salones de belleza, peluquerías y barberías.

El proyecto está organizado como monorepo:

```text
EstiloTurno/
  front-end/   Aplicación web con Next.js, Tailwind CSS y Supabase Auth
  backend/     API con NestJS, PostgreSQL, Drizzle ORM y WhatsApp Cloud API
```

## Requisitos

- Bun `1.3.14` o compatible
- Docker, si vas a levantar PostgreSQL localmente
- Node.js compatible con el toolchain de NestJS/Next.js, si tu entorno lo requiere

## Frontend

Ruta:

```bash
cd front-end
```

Stack principal:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- App Router
- Bun
- Supabase JS

Instalar dependencias:

```bash
bun install
```

Desarrollo local:

```bash
bun run dev
```

URL local:

```text
http://localhost:3000
```

Variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Backend

Ruta:

```bash
cd backend
```

Stack principal real del backend:

- NestJS 11
- TypeScript 5
- Bun
- PostgreSQL 16
- Drizzle ORM
- Drizzle Kit
- `pg` para la conexión a PostgreSQL
- Axios / `@nestjs/axios`
- WhatsApp Cloud API

> Importante: el backend **no usa Supabase como dependencia directa**. La persistencia actual está modelada con PostgreSQL + Drizzle ORM. Si Supabase se usa como proveedor de PostgreSQL en despliegue, eso es infraestructura; no una dependencia del backend.

Instalar dependencias:

```bash
bun install
```

### Base de datos local

El backend requiere `DATABASE_URL`. Para desarrollo local puedes levantar PostgreSQL con Docker desde la carpeta `backend/`.

En máquinas ARM, por ejemplo Apple Silicon:

```bash
docker compose -f docker-compose.arm.yml up -d
```

En máquinas x86/amd64:

```bash
docker compose -f docker-compose.x86.yml up -d
```

Cadena de conexión local esperada:

```env
DATABASE_URL=postgresql://postgres:***REMOVED***@localhost:5432/estiloturno
```

### Variables de entorno

Crea un archivo `.env` en `backend/` tomando como base `.env.example`:

```env
PORT=3301
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
DATABASE_URL=postgresql://postgres:***REMOVED***@localhost:5432/estiloturno
```

El puerto por defecto del backend es `3301`, definido en `src/main.ts` y en `.env.example`.

### Scripts disponibles

```bash
bun run start:dev   # desarrollo con watch mode de NestJS
bun run build       # compila el backend
bun run start       # ejecuta dist/main.js
bun run start:prod  # ejecuta dist/main.js
bun run db:seed     # inserta servicios iniciales en PostgreSQL
```

### Desarrollo local

```bash
bun run start:dev
```

URL local:

```text
http://localhost:3301
```

### Endpoints principales

Agenda:

```text
GET  /schedule/services
GET  /schedule/availability?date=YYYY-MM-DD&serviceId=1
POST /schedule/appointments
```

Webhook de WhatsApp:

```text
GET  /webhooks/whatsapp
POST /webhooks/whatsapp
POST /webhooks/whatsapp/send-test-message
```

Para exponer el backend local con ngrok:

```bash
ngrok http 3301
```

URL para Meta Developers:

```text
https://URL_DE_NGROK/webhooks/whatsapp
```

Token de verificación:

```text
Debe coincidir exactamente con WHATSAPP_VERIFY_TOKEN en backend/.env
```

## Verificación

Frontend:

```bash
cd front-end
bun run lint
bunx tsc --noEmit
```

Backend:

```bash
cd backend
bun run build
```

## Seguridad

No se deben subir archivos `.env` al repositorio. Los valores reales de Supabase, PostgreSQL y WhatsApp Cloud API deben mantenerse solo en archivos locales o en variables de entorno del proveedor de despliegue.
