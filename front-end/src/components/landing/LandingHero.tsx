import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingMockup } from "@/components/landing/BookingMockup";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20 sm:pb-32">
      <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="max-w-xl">
          <h1 className="landing-fade-up text-balance font-heading text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-foreground">
            Que tus clientes reserven solos. Por WhatsApp.
          </h1>

          <p className="landing-fade-up mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:80ms]">
            EstiloTurno convierte WhatsApp en la recepción de tu salón: tus clientes agendan,
            cancelan y reciben recordatorios sin que tengas que soltar las tijeras. Tú ves cada
            cita, empleado y servicio desde un panel simple.
          </p>

          <div className="landing-fade-up mt-8 flex flex-col gap-3 sm:flex-row [animation-delay:160ms]">
            <Button size="lg" className="h-11 px-6 text-[15px]" asChild>
              <Link href="/register">
                Crear cuenta gratis
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6 text-[15px]" asChild>
              <a href="#como-funciona">Ver cómo funciona</a>
            </Button>
          </div>

          <p className="landing-fade-up mt-6 text-sm text-muted-foreground [animation-delay:220ms]">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Inicia sesión
            </Link>
          </p>
        </div>

        <BookingMockup />
      </div>
    </section>
  );
}
