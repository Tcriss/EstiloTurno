import { CalendarCheck } from "lucide-react";
import clsx from "clsx";

type LogoProps = {
  compact?: boolean;
  centered?: boolean;
  darkBg?: boolean;
  inverse?: boolean;
};

export function Logo({ compact = false, centered = false, darkBg = false, inverse = false }: LogoProps) {
  const usesDarkBackground = darkBg || inverse;

  return (
    <div className={centered ? "flex flex-col items-center" : "flex items-center gap-3"}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-container to-primary text-white shadow-panel">
        <CalendarCheck className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className={centered ? "mt-3 text-center" : ""}>
        <p className={clsx("font-heading text-3xl font-semibold tracking-normal", usesDarkBackground ? "text-white" : "text-navy")}>
          Estilo<span className="text-primary-container">Turno</span>
        </p>
        {!compact && (
          <p className={clsx("text-sm font-medium", usesDarkBackground ? "text-white/60" : "text-navy/60")}>
            Agenda. Automatiza. Gestiona.
          </p>
        )}
      </div>
    </div>
  );
}