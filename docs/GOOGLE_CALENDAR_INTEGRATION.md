# Integración con Google Calendar (OAuth2)

> **Estado: implementado en `backend/src/calendar/`.** Este documento arrancó como guía de investigación previa; la sección 2 ahora describe lo que efectivamente se construyó, no un plan.

Divide claramente qué pasos son **manuales, fuera de mi control** (requieren que vos actúes en Google Cloud Console o que cada negocio dueño de un calendario dé su consentimiento) y qué queda **bajo mi control** (código en este repo).

## 0. Variables de entorno necesarias (agregalas a `.env`)

```bash
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=   # ej: http://localhost:3301/calendar/google/callback — debe coincidir EXACTO con la redirect URI autorizada en Google Cloud Console
CALENDAR_TOKEN_ENCRYPTION_KEY=  # secreto random largo (ej: openssl rand -hex 32) — cifra los tokens en la DB y firma el "state" del flujo OAuth
```

## 1. Migración pendiente de correr

Ya generé la migración (`0002_elite_white_queen.sql`, tabla `business_calendar_credentials`). Falta aplicarla contra tu base — no la corrí yo porque no tengo `DATABASE_URL` ni quiero tocar tu DB sin que lo veas:

```bash
npm run db:migrate
```

Fuentes consultadas: [Node.js quickstart](https://developers.google.com/calendar/api/quickstart/nodejs), [OAuth2 for Web Server Apps](https://developers.google.com/identity/protocols/oauth2/web-server), [Calendar API auth guide](https://developers.google.com/calendar/api/guides/auth), [lista de scopes](https://developers.google.com/identity/protocols/oauth2/scopes#calendar). Todo lo marcado con ⚠️ es conocimiento general mío (no confirmado línea por línea contra la doc en esta sesión) — verificalo si es crítico antes de depender de él.

---

## 1. Fuera de mi control (acción manual tuya)

### 1.1 Google Cloud Console — ya hiciste parte de esto

- **Proyecto de Google Cloud** + **habilitar Google Calendar API** en ese proyecto.
- **Cliente OAuth 2.0** (dijiste que ya lo creaste): tipo *Web application* (no *Desktop* — el quickstart de Node usa Desktop, que no aplica acá porque nosotros somos un backend multi-tenant, no una app local).
- Necesito que me pases (como env vars, nunca pegados en el chat en texto plano si podés evitarlo):
  - `GOOGLE_CALENDAR_CLIENT_ID`
  - `GOOGLE_CALENDAR_CLIENT_SECRET`
- **Redirect URI autorizada**: tenés que agregar en el cliente OAuth la URL exacta de mi callback (ej. `https://tu-dominio/calendar/google/callback`, o `http://localhost:3301/calendar/google/callback` en dev). Si no coincide byte a byte, Google rechaza el intercambio de código.

### 1.2 Pantalla de consentimiento OAuth (OAuth consent screen)

- **Audiencia**: como cada negocio (tenant) conecta *su propio* Google Calendar y no son miembros de tu organización de Google Workspace, tiene que ser **External**, no Internal.
- **Scopes declarados**: vas a tener que agregar `calendar.events` (ver §1.4) en la pantalla de consentimiento antes de poder pedirlo en el código.
- **App en modo "Testing" (por defecto, mientras no la verifiques)**:
  - Máximo **100 usuarios de prueba**, agregados a mano por email en la consola.
  - ⚠️ Los `refresh_token` emitidos en modo Testing **expiran a los 7 días** — el negocio va a tener que reconectar el calendario cada semana hasta que la app esté verificada. Para el MVP puede ser aceptable, pero es una limitación real que no controlo desde código.
- **Verificación de la app (para producción real)**: si vas a tener negocios externos conectando, en algún momento vas a necesitar pasar la revisión de Google, que pide:
  - Política de privacidad pública (URL).
  - Posiblemente un video demo del flujo OAuth (para scopes "sensitive", que es la categoría de `calendar.events`).
  - Tiempo de revisión de Google — puede tardar días o semanas. Esto no lo puedo acelerar ni automatizar.

### 1.3 Consentimiento por negocio (no automatizable)

Cada dueño de negocio tiene que, en algún momento, hacer clic en "Permitir" en la pantalla de Google. Es una acción humana por tenant — el código solo puede generar el link y recibir el callback, no puede completar el consentimiento por él.

### 1.4 Scope recomendado

| Scope | Qué otorga | Uso |
|---|---|---|
| `https://www.googleapis.com/auth/calendar.events` | Ver y editar eventos en todos los calendarios del usuario | **Recomendado** — es lo mínimo que necesitamos (crear/actualizar/cancelar el evento del turno) |
| `https://www.googleapis.com/auth/calendar` | Acceso total (crear/borrar/compartir calendarios enteros) | Evitar — pide más de lo que usamos, complica la verificación |
| `https://www.googleapis.com/auth/calendar.freebusy` | Solo consultar disponibilidad, sin poder crear eventos | Insuficiente si queremos que el bot cree el evento |

### 1.5 Cosas que van a pasar en producción y no controlo desde código

- **Revocación**: si el dueño del negocio revoca el acceso desde su cuenta de Google, el `refresh_token` queda inválido. Google no me avisa proactivamente — me entero recién cuando intento usarlo y la API devuelve `invalid_grant`. El código puede detectar esto y marcar la conexión como "desconectada" para que el negocio la reconecte, pero no puedo evitar que pase.
- ⚠️ **Límite de 50 refresh tokens por combinación cliente OAuth + cuenta de Google**: si un mismo negocio reconecta muchas veces (ej. en testing), Google invalida silenciosamente el token más viejo al superar el límite. Mitigable reusando el token guardado en vez de re-autenticar innecesariamente, pero el límite en sí lo impone Google.
- **Cuotas de la API** (queries/día, requests/100s por usuario) — están fijadas en el proyecto de Cloud Console; si el volumen crece, el aumento de cuota es un trámite en la consola, no algo que el código resuelva.

---

## 2. Bajo mi control (implementado)

Módulo `backend/src/calendar/`, mismo patrón hexagonal que `whatsapp/` (puerto agnóstico + adapter de infraestructura):

```
calendar/
  domain/
    entities/calendar-credentials.entity.ts
    ports/calendar-provider.ts               # CALENDAR_PROVIDER — agnóstico (hoy solo Google)
    ports/calendar-credentials.repository.ts # CALENDAR_CREDENTIALS_REPOSITORY
  application/use-cases/
    start-google-calendar-connection.use-case.ts   # genera authUrl con state firmado
    handle-google-calendar-callback.use-case.ts    # intercambia code por tokens, persiste
    get-calendar-connection-status.use-case.ts     # conectado/no conectado, para el backoffice
    disconnect-google-calendar.use-case.ts
    sync-appointment-to-calendar.use-case.ts        # implementa AppointmentCalendarSync (ver abajo)
  infrastructure/
    google/google-calendar.adapter.ts       # googleapis: generateAuthUrl / exchangeCodeForTokens / createEvent
    persistence/drizzle-calendar-credentials.repository.ts
    crypto/token-cipher.ts                  # AES-256-GCM sobre access_token/refresh_token
    crypto/oauth-state.signer.ts            # HMAC-SHA256 sobre el parámetro `state`, con expiración de 10 min
  presentation/calendar.controller.ts
  calendar.module.ts
```

### 2.1 Endpoints

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| `GET` | `/backoffice/calendar/google/connect` | JWT + rol ADMIN | Devuelve `{ authUrl }` — el frontend hace `window.location = authUrl` |
| `GET` | `/backoffice/calendar/status` | JWT | `{ connected, provider, connectedAt }` |
| `DELETE` | `/backoffice/calendar/google` | JWT + rol ADMIN | Borra las credenciales guardadas (no revoca el acceso del lado de Google) |
| `GET` | `/calendar/google/callback` | Pública (sin JWT) | La pega Google directo desde el navegador; la identidad viaja en `state`, no en un header |

El callback es público a propósito: Google no manda tu `Authorization` header al redirigir. Devuelve una página HTML mínima de confirmación — no conozco las rutas del frontend, así que no redirijo a ninguna URL de la SPA. Si querés que redirija a una pantalla específica del backoffice, decime la ruta y lo ajusto.

### 2.2 Flujo OAuth (server-side, offline access)

1. `connect` genera `authUrl` con `access_type: "offline"` + `prompt: "consent"` (fuerza que Google reemita `refresh_token` incluso en reconexiones) + `state` firmado con HMAC que codifica el `businessId` y expira a los 10 minutos.
2. `callback` valida la firma de `state`, intercambia `code` por tokens (`oauth2Client.getToken`) y los guarda cifrados.
3. `sync-appointment-to-calendar.use-case.ts` es la implementación del puerto `AppointmentCalendarSync` que consume `schedule/`: `CreateAppointmentUseCase` lo inyecta como **opcional** (`@Optional()`) y lo llama en modo best-effort (`.catch()`, nunca bloquea la creación de la cita) después de crear la cita en nuestra base.
4. `GoogleCalendarAdapter.createEvent` engancha `oauth2Client.on("tokens", ...)` para capturar el `access_token` renovado automáticamente por `googleapis` cuando venció, y lo persiste (el `refresh_token` no cambia salvo reconexión).

### 2.3 Cifrado de tokens en reposo

`TokenCipher` (AES-256-GCM, clave derivada con `scrypt` desde `CALENDAR_TOKEN_ENCRYPTION_KEY`) cifra `access_token`/`refresh_token` antes de que `DrizzleCalendarCredentialsRepository` los escriba, y descifra al leer. Nunca quedan en texto plano en la tabla `business_calendar_credentials`.

### 2.4 Desacople con `schedule/`

Para evitar un import circular entre módulos (`calendar` necesitaría `schedule` para leer datos del turno, y `schedule` necesita `calendar` para la sync), el puerto `AppointmentCalendarSync` vive en `schedule/domain/ports/` y recibe los datos ya resueltos (`serviceName`, `clientName`, `date`, `startTime`, `durationMinutes`) — `calendar` nunca importa el repositorio de `schedule`.

---

## 3. Decisiones tomadas

1. **Scope**: `calendar.events` ya está agregado en la pantalla de consentimiento.
2. **Sincronización**: **best-effort**. La cita siempre se crea en nuestra base; si falla la creación del evento en Google Calendar, se loguea el error y no se bloquea la respuesta al cliente por WhatsApp.
3. **Verificación de Google**: se arranca en **modo Testing** para el MVP (reconexión manual cada 7 días es aceptable por ahora). Verificación formal queda para cuando haya negocios reales usándolo.
