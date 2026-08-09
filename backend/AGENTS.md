# AGENTS.md — EstiloTurno

Contexto de proyecto para cualquier agente (Claude Code, Cursor, Copilot, etc.) que trabaje en este repositorio. Léelo completo antes de generar o modificar código.

---

## 1. Resumen del proyecto

**Nombre provisional:** EstiloTurno (también referenciado como QiuTurn / BarberFlow en documentos tempranos — el nombre final aún puede cambiar, no asumir que es definitivo).

**Qué es:** Sistema de gestión y automatización de citas para salones de belleza, peluquerías y barberías en República Dominicana. Combina un bot conversacional de WhatsApp (interfaz del cliente final) con un dashboard web administrativo (interfaz del negocio).

**Problema que resuelve:** Los salones gestionan su agenda manualmente — cuadernos, llamadas, WhatsApp informal — lo que genera dobles reservas, ausencias sin aviso, interrupciones constantes al personal y cero visibilidad sobre el rendimiento del negocio.

**Contexto académico:** Proyecto Integrador II (asignatura universitaria, República Dominicana). El proyecto está sujeto a reglas del curso:
- Debe ser sector privado, nunca gobierno.
- Debe tener modelo de negocio real y sostenible (no es opcional, se evalúa).
- Debe evidenciar análisis de requerimientos, arquitectura, seguridad, gestión de datos, calidad de software y gestión de proyecto (Scrum).
- El MVP debe ser honesto sobre su alcance — no prometer features que no se construirán esta fase.

**Cliente principal:** Administradores/dueños de salones, peluquerías y barberías (modelo B2B).

**Usuarios del sistema:**
| Rol | Acceso |
|---|---|
| Cliente final | Solo WhatsApp. No accede al panel web. |
| Empleado | Panel web — solo su propia agenda, marca citas atendidas/ausentes. |
| Administrador | Panel web — control total: servicios, empleados, horarios, citas, reportes. |
| Sistema/Bot | Componente automatizado — valida disponibilidad, registra reservas, envía confirmaciones/recordatorios. |

---

## 2. Modelo de negocio

**Tipo:** B2B por suscripción mensual. El negocio (salón/barbería) es quien paga, no el cliente final.

**Quién paga / cómo se genera ingreso:**
- Suscripción mensual escalonada por tamaño de negocio (ej. Solo / Equipo / Cadena).
- Posibles upsells futuros: recordatorios premium vía WhatsApp Business API, listado en directorio público, membresías de fidelización.

**Propuesta de valor:** Automatiza el manejo de la agenda, reduce ausencias mediante recordatorios automáticos, simplifica la reserva para el cliente (usa un canal que ya conoce — WhatsApp) y da visibilidad operativa real al dueño del negocio.

**Importante para cualquier agente:** Si se solicita generar contenido de pitch, documentos o copy de marketing, mantener el enfoque B2B — el salón es el cliente que paga, el usuario final de WhatsApp es un beneficiario indirecto del producto, no el pagador.

---

## 3. Alcance del MVP — qué construir y qué NO

### Incluido en el MVP
- Bot de WhatsApp: consultar servicios, ver disponibilidad, reservar, cancelar.
- Panel web: gestión de citas, servicios, empleados, horarios.
- Validación de disponibilidad en tiempo real (sin dobles reservas).
- Recordatorios automáticos (24h antes de la cita).
- Roles básicos: administrador y empleado.
- Reportes básicos: citas, ausencias, servicios más solicitados.

### Explícitamente FUERA del MVP (no implementar salvo que se indique lo contrario)
- Pagos digitales o depósitos de garantía integrados.
- Multi-sucursal / arquitectura multi-tenant profunda.
- Programas de fidelización, cupones, campañas de marketing.
- Integración contable o facturación electrónica.
- Aplicación móvil nativa.
- Analítica avanzada con predicción de demanda.

**Regla para agentes:** si una tarea pide implementar algo de la lista "fuera del MVP", señalarlo explícitamente antes de proceder — probablemente es una mejora de fase 2, no de esta entrega.

---

## 4. Stack tecnológico

> Esta tabla refleja el código real (backend implementado); no es aspiracional. Ver `docs/PRODUCTION.md` y `docs/BACKOFFICE.md` para el detalle operativo.

| Capa | Tecnología | Notas |
|---|---|---|
| Backend / API | NestJS (Node.js) | Núcleo de toda la lógica de negocio, validaciones, auth. Arquitectura por capas (domain/application/infrastructure/presentation) dentro de cada feature — ver `backend/src/*/`. |
| ORM | Drizzle ORM | **No TypeORM.** Prohibido usar raw SQL queries salvo caso documentado y revisado. |
| Frontend admin | Next.js (App Router) | Panel administrativo + landing pública. |
| Estilos | Tailwind CSS | Sin CSS custom innecesario. |
| Base de datos | PostgreSQL | Relacional, multi-tenant por `business_id` — ver modelo de datos en sección 6. |
| Canal cliente | WhatsApp Cloud API (oficial, Meta) | Nunca usar APIs no oficiales (riesgo de baneo del número). |
| Motor de lenguaje natural | LLM directo desde NestJS (Anthropic u OpenAI, agnóstico vía port `NluEngine`) | **No se usa n8n** — ver sección 5, decisión revisada durante la implementación. Sin proveedor configurado (`LLM_PROVIDER`/`LLM_API_KEY`), el bot cae a un flujo de menús numéricos determinista. |
| Autenticación | JWT propio de NestJS | HS256, expiración 8h. Sin refresh token todavía (pendiente, no bloqueante). **No usa Supabase Auth** — el frontend usa Supabase solo para su propio login; son dos sistemas de identidad separados, decisión explícita del equipo. |
| Hash de contraseñas | bcrypt | Salt rounds ≥ 12. Nunca texto plano. |
| Colas / tareas programadas | **No implementado** | Recordatorios automáticos y reintentos programados quedan para cuando haya negocios reales en producción. |
| Documentación de API | **No implementado (Swagger pendiente)** | La referencia de endpoints vive en `docs/BACKOFFICE.md` mientras tanto. |

---

## 5. Arquitectura — todo vive en NestJS (n8n descartado)

**Decisión revisada durante la implementación:** se evaluó n8n como capa de orquestación conversacional (la propuesta original de este documento) y se descartó. Para slot-filling con estado conversacional persistente, un motor de workflows sin estado nativo como n8n complica justo lo que hay que resolver, y suma una pieza de infraestructura extra a mantener con presupuesto académico limitado. Todo el flujo conversacional se resuelve dentro de NestJS con function calling/tool use del LLM.

### Flujo de una reserva (con LLM configurado)
1. Cliente escribe a WhatsApp → Meta dispara Webhook → `POST /webhooks/whatsapp` (firma validada con `X-Hub-Signature-256`, `whatsapp/presentation/guards/whatsapp-signature.guard.ts`).
2. `HandleIncomingMessageUseCase` resuelve a qué negocio pertenece el mensaje por `phone_number_id` (multi-tenant, `ResolveBusinessForWebhookUseCase`).
3. `NluConversationService` arma un prompt de sistema (catálogo de servicios del negocio, horario, fecha/hora real) y corre un loop de tool-calling contra el `NluEngine` configurado (adapter Anthropic u OpenAI según `LLM_PROVIDER`).
4. El LLM decide cuándo llamar `check_availability` o `create_appointment` — esas tools llaman directo a los use-cases de `schedule/`. La validación real de disponibilidad y la creación de la cita **siempre** pasan por `ScheduleRepository` (transacción con lock a nivel de base, nunca lógica de negocio embebida en el prompt).
5. La respuesta se envía al cliente vía `WhatsappCloudApiClient` (adapter del port `WhatsappMessenger`).

### Fallback sin LLM
Sin `LLM_PROVIDER`/`LLM_API_KEY` configurados, `HandleIncomingMessageUseCase` usa `conversation-flow.ts`: máquina de estados por menús numéricos, con el mismo acceso a los use-cases de `schedule/`. El bot sigue funcionando, sin comprensión de lenguaje natural.

**Detalle crítico:** usar siempre un token de acceso permanente (System User token) de Meta, nunca el token temporal de 24h — es la causa más común de que el bot deje de responder en producción sin aviso. Ver `docs/PRODUCTION.md` sección 1.

**Regla para agentes:** la lógica de negocio (disponibilidad, creación de citas, reglas) vive exclusivamente en `schedule/domain` y `schedule/application` — ni el prompt del LLM ni ningún adapter de mensajería deben reimplementarla.

---

## 6. Modelo de datos (estado real implementado)

**Decisión de alcance tomada con el usuario:** por ahora 1 negocio = 1 agenda — el profesional individual (barbero, salonera, consultorio) ES el tenant. No hay tabla de empleados ni horarios por empleado todavía; es la evolución natural cuando un negocio necesite varios profesionales bajo la misma cuenta.

| Tabla real (`backend/src/database/schema.ts`) | Campos clave | Relación |
|---|---|---|
| `businesses` | id, name, whatsapp_phone_number_id, work_start_minutes, work_end_minutes, slot_interval_minutes, bot_enabled | — (es el tenant) |
| `users` | id, business_id, name, email, password_hash, role (`ADMIN`\|`EMPLOYEE`) | Pertenece a `businesses` |
| `business_services` | id, business_id, name, price, duration_minutes | Pertenece a `businesses` |
| `clients` | id (teléfono), name | Tiene muchas `appointments` |
| `appointments` | id, business_id, client_id, service_id, date, start_time, status | Asocia `businesses`, `clients`, `business_services` |
| `conversation_states` | id, phone, business_id, state, metadata (historial NLU o estado de menú) | Pertenece a `businesses` — el mismo teléfono puede conversar con negocios distintos |

**Estados de `appointments.status`:** `PENDING`, `CONFIRMED`, `CANCELED`, `COMPLETED`, `NO_SHOW`.

**No implementado todavía** (no confundir con lo real de arriba): `Empleado`, `HorarioEmpleado`, `Recordatorio`, pre-agenda/`estado_slot` con bloqueo temporal comprometido (requiere procesador de pagos) — roadmap en `docs/PRODUCTION.md`.

**Regla de oro de disponibilidad (sí implementada):** `createAppointment` corre dentro de una transacción con `pg_advisory_xact_lock` por negocio+día y re-verifica solapamiento antes del insert — nunca se confirma una cita sin comprobar que no exista solapamiento de horario, considerando la duración real del servicio. Ver `schedule/infrastructure/persistence/drizzle-schedule.repository.ts`.

---

## 7. Seguridad — no negociable

- JWT firmado, expiración 8h, refresh token para renovar sesión.
- Roles diferenciados (administrador / empleado) con middleware de autorización por endpoint — nunca confiar solo en ocultar UI en el frontend.
- Contraseñas: bcrypt, salt rounds ≥ 12. Nunca loguear ni exponer en respuestas de API.
- Validación de inputs en backend (class-validator) — la validación de frontend es solo UX, no seguridad real.
- Webhook de WhatsApp: validar siempre el header `X-Hub-Signature-256` con comparación de tiempo constante (`crypto.timingSafeEqual`) antes de procesar cualquier payload.
- Variables sensibles (claves JWT, tokens de Meta, credenciales de BD) solo en `.env`, nunca commiteadas al repo.
- HTTPS/TLS 1.3 obligatorio en todas las comunicaciones — interna y externa.
- Rate limiting en endpoints de login/registro.
- CORS restrictivo: solo orígenes autorizados (panel web + Webhook de Meta).
- Normativa aplicable: Ley 172-13 (RD, protección de datos personales) y Ley 53-07 (RD, crímenes de alta tecnología) — relevante porque el sistema maneja teléfonos e historial de clientes.

---

## 8. Convenciones de desarrollo

- **Idioma del código:** nombres de variables, funciones y clases en inglés. Nombres de entidades de negocio pueden mantenerse en español si ya están establecidos en el modelo de datos (`Cita`, `Empleado`, etc.) para consistencia con el resto de la documentación del proyecto.
- **Commits:** convención `tipo: descripción corta` (feat, fix, docs, refactor, test, chore).
- **Ramas:** `main` (producción), `develop` (integración), `feature/nombre-feature` para trabajo en curso.
- **Sin SQL crudo:** todo acceso a datos pasa por TypeORM con entidades tipadas.
- **Sin lógica de negocio en el frontend:** Next.js consume la API, no reimplementa reglas de disponibilidad ni validaciones de seguridad.
- **Documentar endpoints nuevos en Swagger** al crearlos, no después.
- **Toda funcionalidad de WhatsApp pasa por n8n primero**, según la separación de responsabilidades de la sección 5.

---

## 9. Roles del equipo (referencia)

| Rol | Responsabilidad |
|---|---|
| Tech Lead / Backend | Arquitectura general, auth/roles, API core, revisión de PRs |
| Backend / Bot | Módulo de reservas, integración WhatsApp/n8n, recordatorios |
| Frontend | UI del panel administrativo, dashboard, reportes |
| BD / QA / Seguridad | Diseño ERD, migraciones, pruebas de integración y seguridad |

---

## 10. Qué NO asumir

- No asumir que el nombre del proyecto es definitivo — confirmar antes de hardcodear branding en código o configuración.
- No asumir que se puede usar una API no oficial de WhatsApp (como Evolution API) en producción — el proyecto usa exclusivamente WhatsApp Cloud API oficial de Meta por estabilidad y cumplimiento de políticas.
- No asumir soporte multi-sucursal — el modelo de datos actual asume un `Negocio` con una sola ubicación operativa.
- No asumir pagos integrados — no existe módulo de procesamiento de pagos en este MVP.
- No proponer soluciones que requieran servicios de pago adicionales sin antes señalarlo (el proyecto es académico, con presupuesto limitado para infraestructura).
