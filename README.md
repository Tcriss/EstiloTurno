# EstiloTurno

EstiloTurno es un bot de WhatsApp con lenguaje natural para agendar citas, más un backoffice web, pensado para profesionales con agenda (barberos, saloneras, consultorios). Cada profesional/negocio es un tenant independiente con su propia agenda, servicios y número de WhatsApp.

El proyecto está organizado como monorepo:

```text
EstiloTurno/
  front-end/   Aplicación web con Next.js, Tailwind CSS y Supabase Auth
  backend/     API con NestJS, PostgreSQL, Drizzle ORM y WhatsApp Cloud API
  docs/        Guía de producción y guía de la API para el backoffice
```

Documentación adicional:
- [`docs/PRODUCTION.md`](docs/PRODUCTION.md) — pasos para salir a producción (Meta, deploy, migraciones, elegir LLM, roadmap de Google Calendar).
- [`docs/BACKOFFICE.md`](docs/BACKOFFICE.md) — referencia completa de la API para quien construya o integre el panel administrativo.

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
DATABASE_URL=postgresql://postgres:estiloturno_secure_pass_2026@localhost:5432/estiloturno
```

### Variables de entorno

Crea un archivo `.env` en `backend/` tomando como base `.env.example`:

```env
PORT=3301
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_APP_SECRET=
JWT_SECRET=
CORS_ORIGINS=
LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=
DATABASE_URL=postgresql://postgres:estiloturno_secure_pass_2026@localhost:5432/estiloturno
```

`WHATSAPP_APP_SECRET` es el App Secret de la app de Meta (Meta Developers > tu app > Configuración básica). Se usa para validar la firma `X-Hub-Signature-256` de cada webhook entrante y rechazar payloads falsificados.

`JWT_SECRET` firma los access tokens que emite `/auth/login` y `/auth/register` (HS256, expiran a las 8h). Usá un valor largo y aleatorio, distinto entre entornos.

`CORS_ORIGINS` es una lista de orígenes permitidos separada por comas (ej. `https://app.tudominio.com,https://otro.dominio.com`). Sin esta variable, el backend solo acepta `http://localhost:3000`.

`LLM_PROVIDER` (`anthropic` | `openai`) y `LLM_API_KEY` habilitan el motor de lenguaje natural del bot. `LLM_MODEL` es opcional (tiene default por proveedor). Sin `LLM_PROVIDER`/`LLM_API_KEY`, el bot usa un flujo de menús numéricos sin IA. Detalle completo en [`docs/PRODUCTION.md`](docs/PRODUCTION.md#4-elegir-proveedor-de-llm-para-el-bot).

El puerto por defecto del backend es `3301`, definido en `src/main.ts` y en `.env.example`.

### Scripts disponibles

```bash
bun run start:dev   # desarrollo con watch mode de NestJS
bun run build       # compila el backend
bun run start       # ejecuta dist/main.js
bun run start:prod  # ejecuta dist/main.js
bun run db:seed     # inserta servicios iniciales en PostgreSQL
bun run db:generate # genera un archivo SQL de migración a partir de schema.ts (no toca la DB)
bun run db:migrate  # aplica las migraciones pendientes contra DATABASE_URL
```

> Si tenés una base local con datos de antes de la fase multi-tenant, las migraciones agregan columnas `business_id NOT NULL` que van a fallar contra filas viejas sin negocio asociado. Lo más simple: resetear la base de dev (`docker compose down -v && up`) y correr `bunx drizzle-kit push` en vez de `db:migrate` para sincronizar el schema completo de una. `db:migrate` (con historial versionado) es para una base nueva desde cero — ver detalle en [`docs/PRODUCTION.md`](docs/PRODUCTION.md#3-migraciones-de-base-de-datos).

### Desarrollo local

```bash
bun run start:dev
```

URL local:

```text
http://localhost:3301
```

### Endpoints principales

Referencia completa con ejemplos de request/response en [`docs/BACKOFFICE.md`](docs/BACKOFFICE.md). Resumen:

Autenticación (rate limit 5/min):

```text
POST /auth/register   # {businessName, name, email, password} -> crea negocio + usuario ADMIN, devuelve accessToken
POST /auth/login      # {email, password} -> devuelve accessToken
```

Backoffice (requiere `Authorization: Bearer <accessToken>`, scoped al negocio del token):

```text
GET   /backoffice/business                # datos y configuración del negocio
PATCH /backoffice/business                # (ADMIN) horario laboral, botEnabled, whatsappPhoneNumberId
POST  /backoffice/services                # (ADMIN) crear servicio
PATCH /backoffice/services/:id            # (ADMIN)
DELETE /backoffice/services/:id           # (ADMIN)
GET   /backoffice/appointments            # ?date=&status=
PATCH /backoffice/appointments/:id        # reagendar o cambiar status
```

Agenda operativa (la usa el bot internamente, también expuesta al backoffice):

```text
GET  /schedule/services
GET  /schedule/availability?date=YYYY-MM-DD&serviceId=1
POST /schedule/appointments
```

Webhook de WhatsApp:

```text
GET  /webhooks/whatsapp                     # verificación de Meta (hub.verify_token)
POST /webhooks/whatsapp                     # mensajes entrantes (valida firma X-Hub-Signature-256, enruta por negocio)
POST /webhooks/whatsapp/send-test-message   # requiere Authorization: Bearer <token> de un usuario ADMIN
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
