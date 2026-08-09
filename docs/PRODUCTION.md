# EstiloTurno — Guía de salida a producción

Este documento cubre todo lo que falta **fuera del código** para que el backend (`backend/`) pase de "funciona en mi máquina" a atender WhatsApp real. El servidor NestJS ya está completo: multi-tenant, auth JWT, motor de lenguaje natural (con fallback determinista), API de backoffice y protección básica (CORS, rate limiting, validación de inputs, transacciones anti doble-reserva).

Lo que **no** está construido, a propósito, y por qué:

| Feature | Estado | Por qué se dejó afuera |
|---|---|---|
| Pre-agenda (bloqueo comprometido con el cliente) | No implementada | Requiere procesador de pagos para tener sentido real (depósito de garantía) — es la fase siguiente natural, no de este alcance. |
| Google Calendar | No implementada | Necesita credenciales de Google Cloud que solo el dueño del proyecto puede crear. Sección 5 de este doc deja la arquitectura lista para enchufarlo. |
| Recordatorios automáticos (24h antes) | No implementada | Necesita un scheduler (cron/Bull) corriendo en background — agregar solo cuando haya negocios reales usando el sistema. |
| Refresh tokens | No implementada | El access token dura 8h; hoy hay que volver a loguearse. Aditivo, se puede sumar después sin romper nada. |
| Empleados múltiples por negocio | No implementada | El modelo actual es 1 agenda = 1 negocio (1 profesional). Válido para el MVP: cada barbero/salonera/consultorio es su propio tenant. |

---

## 1. Meta / WhatsApp Cloud API

### 1.1 Crear la app en Meta

1. [developers.facebook.com](https://developers.facebook.com) → crear una app tipo **Business**.
2. Agregar el producto **WhatsApp**.
3. En **Configuración de la API** vas a encontrar un **número de prueba** gratis para desarrollo — sirve para probar todo el flujo antes de comprar un número real.

### 1.2 Token de acceso — el error más común

**Nunca uses el token temporal de 24h que Meta muestra por default.** Es la causa #1 de que un bot "deje de responder" en producción sin aviso.

Generá un **token permanente de System User**:
1. Meta Business Suite → **Configuración del negocio** → **Usuarios del sistema** → crear un System User con rol Admin.
2. Asignarle el activo (la app de WhatsApp) con permiso `whatsapp_business_messaging`.
3. Generar el token desde ahí — no expira mientras el System User exista.

Ese token va en `WHATSAPP_ACCESS_TOKEN`.

### 1.3 Webhook

En **WhatsApp → Configuración → Webhook**:

- **URL de callback**: `https://tu-dominio.com/webhooks/whatsapp`
- **Token de verificación**: cualquier string que vos elijas — tiene que coincidir *exactamente* con `WHATSAPP_VERIFY_TOKEN` en el `.env` del backend.
- Suscribite al campo `messages`.

El endpoint ya valida la firma `X-Hub-Signature-256` de cada mensaje entrante contra `WHATSAPP_APP_SECRET` (App Secret, en Configuración básica de la app) — sin esa variable configurada, el backend rechaza *todos* los webhooks con 500, a propósito (fail-closed).

### 1.4 phone_number_id por negocio

Cada negocio (fila en la tabla `businesses`) tiene una columna `whatsapp_phone_number_id`. Cuando llega un mensaje, el backend lee el `phone_number_id` que Meta manda en el payload y busca a qué negocio pertenece (`ResolveBusinessForWebhookUseCase`) — así un solo webhook de Meta puede atender a varios negocios/números.

Configurá esa columna vía `PATCH /backoffice/business` (ver `docs/BACKOFFICE.md`) con el `phone_number_id` real de cada número de WhatsApp Business.

> **Fallback de desarrollo**: si un mensaje llega con un `phone_number_id` que no matchea ningún negocio y en la base **solo hay un negocio dado de alta**, el backend igual lo procesa contra ese negocio (con un warning en el log). Esto permite probar con el número de prueba de Meta sin configurar nada más. En cuanto haya un segundo negocio, este fallback deja de aplicarse — configurá el `phone_number_id` real de cada uno.

### 1.5 Probar con ngrok (desarrollo)

```bash
ngrok http 3301
```

Usá la URL HTTPS de ngrok como callback URL en Meta mientras desarrollás localmente.

---

## 2. Deploy

El backend es un proceso NestJS estándar (`bun run build && bun run start`), sin estado propio (todo vive en Postgres) — corre en cualquier lado que ofrezca:

- Node.js 20+ o Bun runtime.
- **HTTPS obligatorio** — Meta no manda webhooks a `http://`.
- PostgreSQL 16 accesible (managed o propio).

Opciones simples para un proyecto de este tamaño: **Railway** o **Fly.io** (ambos con free tier razonable, Postgres administrado incluido, y despliegue desde Git sin Dockerfile propio si no querés mantener uno — aunque `backend/docker-compose.*.yml` ya te da una base si preferís contenedor).

### Variables de entorno en producción

Copiá `backend/.env.example` y completá todas — la lista completa y actualizada está en el [`README.md`](../README.md#variables-de-entorno) de la raíz. Puntos que importan especialmente en prod:

- `JWT_SECRET`: generá uno nuevo y distinto al de desarrollo (`openssl rand -base64 48`, por ejemplo). Nunca reuses el de dev.
- `CORS_ORIGINS`: el/los dominios reales del backoffice (ej. `https://app.tudominio.com`). Sin esta variable, el backend solo acepta `http://localhost:3000` — así que en prod **hay que setearla** o el frontend no va a poder llamar a la API.
- `DATABASE_URL`: apuntando a la instancia de Postgres de producción, con `sslmode=require` si el proveedor lo exige.

---

## 3. Migraciones de base de datos

Dos comandos, dos propósitos distintos:

- `bun run db:generate` (`drizzle-kit generate`) — genera un archivo SQL a partir del diff de `schema.ts`. No toca ninguna base. Ya está corrido para el estado actual del schema (multi-tenant incluido) en `backend/src/database/migrations/`.
- `bun run db:migrate` (`drizzle-kit migrate`) — aplica las migraciones pendientes contra `DATABASE_URL`. Este es el que corrés en producción, contra una base **nueva y vacía**.

### ⚠️ Si venís de una base de desarrollo con datos viejos

Las migraciones `0000` y `0001` agregan columnas `NOT NULL` (`business_id` en varias tablas) sin default — si tu base de dev ya tenía filas de antes de esta fase (citas, servicios, etc. sin negocio asociado), `drizzle-kit migrate` va a fallar. Para desarrollo, lo más simple es arrancar de cero:

```bash
cd backend
docker compose -f docker-compose.arm.yml down -v   # o docker-compose.x86.yml — el -v borra el volumen
docker compose -f docker-compose.arm.yml up -d
bunx drizzle-kit push      # sincroniza el schema completo de una (no usa el historial de migrations/)
bun run db:seed            # crea el negocio demo + servicios
```

**En producción**, donde la base arranca vacía desde el día uno, `bun run db:migrate` corre limpio sin este problema — usalo ahí en vez de `push`, para tener historial de cambios versionado.

---

## 4. Elegir proveedor de LLM para el bot

El motor conversacional (`NluEngine`) es agnóstico de proveedor — vos elegís con dos variables de entorno:

```env
LLM_PROVIDER=anthropic          # o "openai" — vacío = el bot usa el flujo de menús numéricos (sin IA)
LLM_API_KEY=sk-...
LLM_MODEL=claude-haiku-4-5      # opcional, tiene default por proveedor
```

| Proveedor | Modelo default | Dónde conseguir la key | Costo aproximado (por conversación típica de ~10 mensajes) |
|---|---|---|---|
| Anthropic | `claude-haiku-4-5` | [console.anthropic.com](https://console.anthropic.com) | Centavos de dólar — Haiku es el modelo más económico de Anthropic, pensado justo para este tipo de uso de alto volumen. |
| OpenAI | `gpt-4o-mini` | [platform.openai.com](https://platform.openai.com) | Similar en orden de magnitud a Haiku. |

Sin ninguna de las dos variables configuradas, el backend cae automáticamente al flujo de menús numéricos original (`whatsapp/application/services/conversation-flow.ts`) — el bot sigue funcionando, solo que sin comprensión de lenguaje natural. Es el comportamiento por default en desarrollo si no querés gastar en API calls todavía.

**Antes de ir a producción con un LLM real**: probá bien el prompt del sistema (`nlu-conversation.service.ts`, método `buildSystemPrompt`) contra casos reales de tu negocio — nombres de servicios, jerga local, horarios límite. Es la pieza que más vas a querer ajustar según feedback real de clientes.

---

## 5. Roadmap: Google Calendar

No implementado, pero la arquitectura ya está pensada para esto. Cuando llegue el momento:

**Patrón recomendado**: OAuth 2.0 por profesional (no service account — eso es solo para dominios de Google Workspace que vos administrás). Cada negocio conecta su propio Google Calendar, igual que hacen Calendly o Cal.com.

**Dónde enchufarlo en el código**:
1. Nuevo port `whatsapp/domain/ports/calendar-sync.ts` (o en una feature `calendar/` nueva si crece) — interfaz `createEvent(businessId, appointment)`.
2. `business` necesitaría dos columnas nuevas: `googleRefreshToken` (cifrado) y `googleCalendarId`.
3. Un flujo OAuth en el backoffice: `GET /backoffice/business/google/connect` (redirige a Google) y `GET /backoffice/business/google/callback` (intercambia el code por refresh token, lo guarda cifrado).
4. `CreateAppointmentUseCase` y `UpdateAppointmentUseCase` (en `schedule/application/use-cases/`) llamarían al nuevo port después de persistir la cita — mismo patrón que ya usan con `ScheduleRepository`.
5. Scope mínimo necesario: `https://www.googleapis.com/auth/calendar.events` (crear/leer/modificar eventos — no hace falta el scope amplio `.../auth/calendar`).

Credenciales necesarias (las tenés que crear vos en [console.cloud.google.com](https://console.cloud.google.com)): un proyecto de Google Cloud, pantalla de consentimiento OAuth configurada, y credenciales de tipo "OAuth client ID" (Web application) con el callback URL de arriba autorizado.

---

## 6. Checklist de seguridad antes de anunciar el número real

- [ ] `JWT_SECRET` único de producción, no el de desarrollo.
- [ ] `WHATSAPP_APP_SECRET` configurado (sin esto, el webhook rechaza todo — es intencional, pero confirmá que esté seteado).
- [ ] `CORS_ORIGINS` restringido a los dominios reales del backoffice.
- [ ] Token de WhatsApp es el **System User permanente**, no el temporal de 24h.
- [ ] HTTPS en el dominio del backend (Meta lo exige para el webhook).
- [ ] Backups automáticos de Postgres configurados en el proveedor.
- [ ] Ningún archivo `.env` commiteado al repo (ya está en `.gitignore`, pero verificá antes del primer deploy).
