const STEPS = [
  {
    number: "1",
    title: "El cliente escribe por WhatsApp",
    description:
      "Pregunta por un servicio, ve precios y duración — el mismo chat que ya usa todos los días, sin apps nuevas que instalar.",
  },
  {
    number: "2",
    title: "El bot revisa tu disponibilidad real",
    description:
      "Cruza el horario del negocio con las citas ya tomadas y ofrece solo espacios libres. Nunca se confirman dos citas en el mismo turno.",
  },
  {
    number: "3",
    title: "Queda en tu agenda al instante",
    description:
      "La cita aparece en tu panel apenas se confirma, y tu cliente recibe un recordatorio antes de llegar.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Del mensaje a la cita, en tres pasos.
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
            Sin llamadas cruzadas, sin cuaderno, sin que tengas que estar pendiente del teléfono.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.number} className="relative">
              <span
                className="font-heading text-5xl font-semibold tracking-[-0.03em] text-primary/20"
                aria-hidden="true"
              >
                {step.number}
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              {index < STEPS.length - 1 && (
                <span
                  className="absolute top-6 -right-4 hidden h-px w-8 bg-border sm:block"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
