# EstiloTurno — Guía de la API para el backoffice

Referencia de todos los endpoints que el panel administrativo (`front-end/`) necesita para gestionar un negocio: login, servicios, citas y configuración del bot.

**Nota importante sobre autenticación**: el `front-end/` actual usa **Supabase Auth** para el login de la app (pantallas de `login`, `register`, etc. ya existentes). Esta API NestJS tiene **su propio sistema de JWT, completamente separado** — no comparten sesión ni usuarios. Para que el backoffice hable con esta API, tiene que loguearse *además* contra `POST /auth/login` de acá abajo y guardar ese token por separado (ver sección "Integración con el frontend" al final).

Base URL local: `http://localhost:3301`

---

## Autenticación

### `POST /auth/register`

Da de alta un negocio nuevo y su usuario administrador, en un solo paso. Quien se registra siempre queda como `ADMIN` de un negocio recién creado.

Rate limit: 5 solicitudes/minuto por IP.

**Request:**
```json
{
  "businessName": "Barbería El Corte",
  "name": "Juan Pérez",
  "email": "juan@elcorte.com",
  "password": "unaClaveSegura123"
}
```

**Response `201`:**
```json
{
  "user": { "id": 1, "businessId": 1, "name": "Juan Pérez", "email": "juan@elcorte.com", "role": "ADMIN" },
  "accessToken": "eyJhbGciOi..."
}
```

**Errores:** `409 Conflict` si el email ya está registrado. `400 Bad Request` si falta algún campo o `password` tiene menos de 8 caracteres.

### `POST /auth/login`

**Request:**
```json
{ "email": "juan@elcorte.com", "password": "unaClaveSegura123" }
```

**Response `200`:** igual forma que `register`.

**Errores:** `401 Unauthorized` con credenciales inválidas (mensaje genérico a propósito, no revela si el email existe).

### Usar el token

Todo el resto de los endpoints van con:

```
Authorization: Bearer <accessToken>
```

El token expira a las **8 horas** — no hay refresh token todavía (ver `docs/PRODUCTION.md`), así que el frontend debe volver a llamar `/auth/login` cuando el token vence (`401` en cualquier request es la señal).

---

## Negocio (`/backoffice/business`)

### `GET /backoffice/business`

Cualquier usuario autenticado (`ADMIN` o `EMPLOYEE`) del negocio.

**Response `200`:**
```json
{
  "id": 1,
  "name": "Barbería El Corte",
  "whatsappPhoneNumberId": null,
  "workStartMinutes": 540,
  "workEndMinutes": 1080,
  "slotIntervalMinutes": 30,
  "botEnabled": true
}
```

`workStartMinutes`/`workEndMinutes` son minutos desde medianoche (540 = 9:00 AM, 1080 = 6:00 PM) — así se calcula la disponibilidad del bot.

### `PATCH /backoffice/business`

Solo `ADMIN`. Todos los campos son opcionales — mandá solo los que querés cambiar.

**Request:**
```json
{
  "whatsappPhoneNumberId": "109876543210987",
  "workStartMinutes": 480,
  "workEndMinutes": 1200,
  "botEnabled": true
}
```

**Response `200`:** el negocio actualizado. `400` si `workStartMinutes >= workEndMinutes`.

`whatsappPhoneNumberId` es el ID que Meta asigna al número de WhatsApp Business de este negocio — necesario para que el webhook enrute los mensajes correctamente (ver `docs/PRODUCTION.md` sección 1.4).

`botEnabled: false` hace que el bot ignore silenciosamente todos los mensajes entrantes de ese negocio (por si necesitás pausarlo sin desconectar el número).

---

## Servicios (`/backoffice/services`)

Todos requieren `ADMIN`.

### `POST /backoffice/services`

**Request:**
```json
{ "name": "Corte de Cabello", "price": "500.00", "durationMinutes": 30 }
```

**Response `201`:** el servicio creado (incluye `id` y `businessId`). `409 Conflict` si ya existe un servicio con ese nombre en el negocio.

### `PATCH /backoffice/services/:id`

Campos opcionales, mismo shape que el `POST`. `404` si el servicio no existe (o no pertenece a tu negocio — nunca vas a poder tocar servicios de otro tenant).

### `DELETE /backoffice/services/:id`

**Response `204`** sin body. `404` si no existe.

---

## Citas (`/backoffice/appointments`)

Cualquier usuario autenticado del negocio.

### `GET /backoffice/appointments?date=YYYY-MM-DD&status=CONFIRMED`

Ambos filtros son opcionales. `status` es uno de `PENDING | CONFIRMED | CANCELED | COMPLETED | NO_SHOW`.

**Response `200`:**
```json
[
  {
    "id": 12,
    "businessId": 1,
    "clientId": "18494562740",
    "clientName": "María Gómez",
    "serviceId": 1,
    "serviceName": "Corte de Cabello",
    "serviceDurationMinutes": 30,
    "date": "2026-08-10",
    "startTime": "10:00:00",
    "status": "CONFIRMED"
  }
]
```

### `PATCH /backoffice/appointments/:id`

Para reagendar, cambiar estado, o ambos.

**Request (reagendar):**
```json
{ "date": "2026-08-11", "time": "14:00" }
```

**Request (marcar como completada/no-show):**
```json
{ "status": "COMPLETED" }
```

Si mandás `date`/`time`, el backend re-verifica disponibilidad excluyendo la propia cita del cálculo (podés mover una cita dentro de su propio horario sin que choque consigo misma). `400 Bad Request` si el horario nuevo no está disponible. `404` si la cita no existe en tu negocio.

---

## Agenda operativa (`/schedule/*`)

Estos son los mismos endpoints que usa el bot internamente, expuestos también para que el backoffice pueda consultarlos directo si hace falta (por ejemplo, para armar el flujo de "crear cita manual" en el panel).

- `GET /schedule/services` — igual que backoffice, pero accesible a cualquier rol.
- `GET /schedule/availability?date=YYYY-MM-DD&serviceId=1` — devuelve `["09:00", "09:30", ...]`.
- `POST /schedule/appointments` — mismo body que documenta el bot (`phoneNumber`, `clientName`, `serviceId`, `date`, `time`). Devuelve `409 Conflict` si alguien tomó el horario justo antes (colisión real, protegida con lock a nivel de base).

---

## WhatsApp — solo diagnóstico

### `POST /webhooks/whatsapp/send-test-message`

Solo `ADMIN`. Envía un mensaje de WhatsApp real usando las credenciales del negocio — pensado para probar que la integración con Meta funciona, no para uso normal del backoffice.

```json
{ "to": "18494562740", "message": "Prueba desde el backoffice" }
```

---

## Formato de errores

Todos los errores siguen el formato estándar de NestJS:

```json
{ "statusCode": 400, "message": "El nuevo horario no está disponible.", "error": "Bad Request" }
```

Para errores de validación de `class-validator`, `message` es un array:

```json
{ "statusCode": 400, "message": ["email must be an email", "password must be longer than or equal to 8 characters"], "error": "Bad Request" }
```

Aislamiento entre negocios: cualquier intento de leer/modificar un recurso de otro negocio (por ejemplo, `PATCH /backoffice/appointments/999` donde `999` pertenece a otro tenant) devuelve `404`, no `403` — así no se filtra ni siquiera la existencia del recurso.

---

## Integración con el frontend (`front-end/`)

El frontend hoy solo tiene Supabase Auth conectado (login/registro de usuario de la app). Para conectarlo a esta API:

1. Al loguearse en el backoffice, además de la sesión de Supabase, llamar `POST /auth/login` (o `/auth/register` la primera vez) contra esta API y guardar el `accessToken` — por ejemplo en una cookie httpOnly separada, o en memoria si preferís revalidar en cada carga.
2. En cada fetch a `/backoffice/*` o `/schedule/*`, adjuntar `Authorization: Bearer <accessToken>`.
3. En desarrollo, `CORS_ORIGINS` no hace falta setearla — el backend acepta `http://localhost:3000` por default. En producción, hay que setear `CORS_ORIGINS` con el dominio real del backoffice (ver `docs/PRODUCTION.md`).
4. Cuando cualquier request devuelva `401`, tratarlo como "token vencido" y redirigir a un login contra esta API (no confundir con que haya vencido la sesión de Supabase, que es independiente).
