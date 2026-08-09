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

| Capa | Tecnología | Notas |
|---|---|---|
| Backend / API | NestJS (Node.js) | Núcleo de toda la lógica de negocio, validaciones, auth. |
| ORM | TypeORM | Prohibido usar raw SQL queries salvo caso documentado y revisado. |
| Frontend admin | Next.js (App Router) | Panel administrativo + landing pública. |
| Estilos | Tailwind CSS | Sin CSS custom innecesario. |
| Base de datos | PostgreSQL | Relacional — ver modelo de datos en sección 6. |
| Canal cliente | WhatsApp Cloud API (oficial, Meta) | Nunca usar APIs no oficiales (riesgo de baneo del número). |
| Orquestación conversacional | n8n | Ver sección 5 — separación de responsabilidades con NestJS. |
| Autenticación | JWT (JSON Web Tokens) | HS256, expiración 8h, refresh token. |
| Hash de contraseñas | bcrypt | Salt rounds ≥ 12. Nunca texto plano. |
| Colas / tareas programadas | Bull Queue + Redis | Recordatorios, reintentos de envío. |
| Documentación de API | Swagger (NestJS) | Accesible en `/api`. |

---

## 5. Arquitectura — NestJS + n8n

**Principio de separación de responsabilidades:** NestJS es el cerebro (lógica de negocio, validación, seguridad, datos). n8n es la capa de orquestación conversacional (qué le decimos al cliente y cuándo).

### Vive en n8n
- Estado de la conversación (en qué paso del flujo está cada cliente).
- Construcción de mensajes, menús y plantillas de WhatsApp.
- Reintentos y manejo de errores de la integración con Meta.
- Disparo de recordatorios programados (lee citas vía API y dispara el envío).

### Vive en NestJS (nunca mover a n8n)
- Validación real de disponibilidad (consulta a PostgreSQL).
- Autenticación, JWT, roles y permisos.
- Toda escritura/lectura a PostgreSQL.
- Reglas de negocio: duración de servicios, bloqueo temporal de horarios, cálculo de estados de cita.

**Flujo de una reserva:**
1. Cliente escribe a WhatsApp → Meta dispara Webhook → llega a n8n (no a NestJS directamente).
2. n8n determina el paso de la conversación y arma la pregunta/menú correspondiente.
3. Cuando se necesita un dato real (disponibilidad, crear cita), n8n llama vía HTTP/REST a la API de NestJS.
4. NestJS valida, persiste en PostgreSQL, responde JSON.
5. n8n toma la respuesta, arma el mensaje en lenguaje natural y lo reenvía al cliente vía WhatsApp Cloud API.

**Detalle crítico:** usar siempre un token de acceso permanente (System User token) de Meta, nunca el token temporal de 24h — es la causa más común de que el bot deje de responder en producción sin aviso.

**Regla para agentes:** si se pide agregar lógica de negocio (cálculos, validaciones, reglas), debe implementarse como endpoint en NestJS, nunca como lógica embebida en un nodo de n8n. n8n solo orquesta y conversa.

---

## 6. Modelo de datos (entidades principales)

| Entidad | Campos clave | Relación |
|---|---|---|
| `Negocio` | id, nombre, teléfono, dirección, horario_general, estado_suscripción | — |
| `Usuario` | id, nombre, correo, password_hash, rol, negocio_id, estado | Pertenece a `Negocio` |
| `Empleado` | id, nombre, teléfono, especialidad, negocio_id, estado | Pertenece a `Negocio`, tiene `HorarioEmpleado` |
| `Servicio` | id, nombre, descripción, duración, precio_estimado, negocio_id, estado | Pertenece a `Negocio` |
| `Cliente` | id, nombre, teléfono, historial_citas, fecha_registro | Tiene muchas `Cita` |
| `HorarioEmpleado` | id, empleado_id, día, hora_inicio, hora_fin, disponible | Pertenece a `Empleado` |
| `Cita` | id, cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, estado, estado_slot | Asocia `Cliente`, `Empleado`, `Servicio` |
| `Recordatorio` | id, cita_id, fecha_envío, tipo, estado_envío | Pertenece a `Cita` |

**Estados de `Cita`:** confirmada, completada, cancelada, retrasada, no_asistida.
**Estados de `estado_slot`:** libre, en_proceso (bloqueo temporal 3 min), confirmado.

**Regla de oro de disponibilidad:** nunca confirmar una cita sin antes verificar que no exista solapamiento de horario para ese mismo empleado, considerando la duración real del servicio.

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
