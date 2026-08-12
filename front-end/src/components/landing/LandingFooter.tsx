import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo compact />

        <nav className="flex items-center gap-6" aria-label="Enlaces de cuenta">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Crear cuenta
          </Link>
        </nav>
      </div>
      <div className="border-t border-border px-4 py-5 sm:px-6">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} EstiloTurno — hecho en República Dominicana.
        </p>
      </div>
    </footer>
  );
}
