import { Check, X } from "lucide-react";

const ROWS = [
  {
    before: "Contestas WhatsApp entre corte y corte, y a veces se te va un cliente.",
    after: "El bot responde al instante, 24/7, aunque tengas las manos ocupadas.",
  },
  {
    before: "Dos clientes agendados en el mismo horario, por error.",
    after: "El sistema bloquea el horario apenas se confirma — no hay cruces.",
  },
  {
    before: "Clientes que faltan sin avisar y te comen el día.",
    after: "Recordatorio automático antes de cada cita, sin que muevas un dedo.",
  },
  {
    before: "No tienes ni idea de qué servicio se pide más.",
    after: "Reportes simples: citas, ausencias y servicios más solicitados.",
  },
];

export function PainPoints() {
  return (
    <section className="border-t border-border bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Ya conoces esta parte del negocio.
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
            La agenda a mano funciona hasta que deja de funcionar.
          </p>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium text-muted-foreground">Antes</p>
            {ROWS.map((row) => (
              <div key={row.before} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <X className="h-3 w-3" />
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {row.before}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6 border-t border-border pt-8 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-10">
            <p className="text-sm font-medium text-primary">Con EstiloTurno</p>
            {ROWS.map((row) => (
              <div key={row.after} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <p className="text-sm leading-relaxed text-foreground sm:text-[15px]">
                  {row.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
