import Image from "next/image";

export function BusinessSection() {
  return (
    <section className="border-t border-border bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border lg:order-2">
          <Image
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80"
            alt="Barbero atendiendo a un cliente en su sillón de trabajo"
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-lg lg:order-1">
          <h2 className="text-balance font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Pensado para salones y barberías de República Dominicana.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            No es un ERP genérico traducido al español. Empezamos por lo esencial — agenda,
            servicios y WhatsApp — porque es lo que un negocio como el tuyo usa todos los días,
            antes de sumarle cosas que no vas a necesitar.
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Un negocio, una cuenta: tú y tu equipo, con acceso según el rol de cada quien.
          </p>
        </div>
      </div>
    </section>
  );
}
