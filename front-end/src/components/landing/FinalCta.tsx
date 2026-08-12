import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-primary py-20 text-primary-foreground sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Deja que WhatsApp trabaje por ti.
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
          Crea tu cuenta y ten tu agenda lista para recibir reservas hoy mismo.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="h-11 px-6 text-[15px] text-foreground"
            asChild
          >
            <Link href="/register">
              Crear cuenta gratis
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Link
            href="/login"
            className="text-sm font-medium text-primary-foreground/90 underline underline-offset-4 hover:text-primary-foreground"
          >
            ¿Ya usas EstiloTurno? Inicia sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
