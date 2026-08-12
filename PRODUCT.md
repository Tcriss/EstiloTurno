# Product

## Register

brand

Note: this is a mixed site. The public marketing surface (`/`, and any future `/precios`, `/nosotros`) is **brand** register — design is the product, it has to sell. The authenticated surface (`/dashboard/*`, `/login`, `/register`) is **product** register — it already follows shadcn semantic tokens and existing form/table/card patterns in `front-end/src/components/ui`. Treat register as per-surface, not a single blanket default.

## Platform

web

## Users

**Public landing page:** dueños/administradores de salones de belleza, peluquerías y barberías en República Dominicana (B2B, quien paga la suscripción). Llegan buscando dejar de gestionar la agenda a mano (cuadernos, llamadas, WhatsApp informal) — el dolor es doble reserva, ausencias sin aviso, e interrupciones constantes. Es probable que no sean particularmente técnicos; el copy y la UI deben ser directos, no llenos de jerga de software. Convertir = registrarse o iniciar sesión.

**Authenticated app:** administradores (control total: servicios, empleados, horarios, citas, reportes) y empleados (solo su propia agenda, marcan citas atendidas/ausentes) usando el panel día a día durante horas de trabajo del salón.

## Product Purpose

EstiloTurno automatiza la agenda de salones/peluquerías/barberías combinando un bot de WhatsApp (cliente final reserva sin descargar nada) con un panel administrativo web (el dueño ve y controla todo). Elimina dobles reservas, reduce ausencias con recordatorios automáticos, y le da al dueño visibilidad real de su negocio. Éxito = el dueño se registra desde la landing y activa su negocio sin fricción.

## Brand Personality

Moderna y dinámica — un negocio de belleza/barbería activo, no una herramienta corporativa fría. Tech-forward y con energía, pensada para dueños que quieren verse a la vanguardia frente a la competencia que sigue en cuaderno. Directa y confiable de todos modos: quien paga necesita creer que su agenda no va a fallar.

## Anti-references

Explícitamente evitar el look "plantilla SaaS genérica": hero centrado + gradiente de fondo + grid de 3 tarjetas idénticas (ícono + título + párrafo) repetido sección tras sección. Nada de eyebrows en mayúsculas sobre cada sección, nada de texto con gradiente, nada de "01 · 02 · 03" como scaffolding por defecto.

## Design Principles

- El negocio real detrás del producto es un salón/barbería — el copy y las referencias visuales pueden anclarse en ese mundo (turnos, sillas, agenda del día) sin caer en cliché de belleza (flores, pasteles).
- WhatsApp es el canal del cliente final y es parte central de la propuesta de valor — debe sentirse presente en la narrativa de la landing, no solo mencionado en una lista de features.
- Un solo acento de color (el teal de marca ya definido en tokens) hace el trabajo pesado; nada de paleta arcoíris por sección.
- La landing vende al dueño del negocio (B2B), nunca al cliente final que agenda por WhatsApp — todo copy debe hablar en ese registro.
- Reusa los tokens semánticos ya definidos en `front-end/src/app/globals.css` (shadcn) — nunca hardcodear un hex nuevo.

## Accessibility & Inclusion

WCAG AA como mínimo: contraste de texto ≥4.5:1 en cuerpo, ≥3:1 en texto grande. Respetar `prefers-reduced-motion` en cualquier animación de la landing (scroll reveals, hovers). Sin requerimientos de usuario adicionales reportados.
