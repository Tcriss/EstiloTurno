import Link from "next/link";
import { ArrowLeft, Clock3, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ComingSoonProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-lg rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center sm:px-10">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <Clock3 className="h-3 w-3" aria-hidden="true" />
          En desarrollo
        </div>

        <h1 className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
          Estamos trabajando en esta sección. Próximamente podrás utilizar todas sus funciones desde aquí.
        </p>

        <Button asChild variant="outline" className="mt-8">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al dashboard
          </Link>
        </Button>
      </div>
    </section>
  );
}
