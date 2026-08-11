import clsx from "clsx";

type LogoProps = {
  /** Hides the tagline. */
  compact?: boolean;
  /** Stacks mark and wordmark, centred. */
  centered?: boolean;
};

export function Logo({ compact = false, centered = false }: LogoProps) {
  return (
    <div className={clsx("flex", centered ? "flex-col items-center gap-2" : "items-center gap-2.5")}>
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground"
        aria-hidden="true"
      >
        ET
      </span>
      <div className={centered ? "text-center" : ""}>
        <p className="font-heading text-[15px] font-semibold leading-none tracking-tight text-foreground">
          estilo<span className="text-muted-foreground">turno</span>
        </p>
        {!compact && (
          <p className="mt-1.5 text-xs leading-none text-muted-foreground">Agenda. Automatiza. Gestiona.</p>
        )}
      </div>
    </div>
  );
}
