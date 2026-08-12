import { BarChart3, Scissors, Users } from "lucide-react";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
// Which day column each demo appointment slot lands on (0-indexed, Mon-Sun).
const BOOKED_SLOTS = [
  { day: 1, row: 1 },
  { day: 1, row: 3 },
  { day: 3, row: 0 },
  { day: 4, row: 2 },
  { day: 4, row: 3 },
  { day: 5, row: 1 },
];

export function DashboardFeatures() {
  return (
    <section id="panel" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Todo tu negocio, en un panel.
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
            Lo que el bot agenda por WhatsApp, tú lo administras aquí.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-card sm:col-span-3 sm:flex-row sm:items-center sm:gap-10 sm:p-8">
            <div className="max-w-sm">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Agenda en tiempo real
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Ve la semana completa de un vistazo. Cada cita muestra cliente, servicio y
                duración — sin dobles reservas posibles.
              </p>
            </div>
            <MiniWeekCalendar />
          </div>

          <FeatureCard
            icon={Scissors}
            title="Servicios y precios"
            description="Carga tu catálogo con duración y precio — el bot lo usa para calcular disponibilidad real."
          >
            <MiniServicesList />
          </FeatureCard>
          <FeatureCard
            icon={Users}
            title="Roles del equipo"
            description="Administrador con control total; cada empleado ve solo su propia agenda del día."
          >
            <MiniTeamAvatars />
          </FeatureCard>
          <FeatureCard
            icon={BarChart3}
            title="Reportes del negocio"
            description="Citas completadas, ausencias y servicios más pedidos, sin hojas de cálculo."
          >
            <MiniReportBars />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Scissors;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

const MINI_SERVICES = [
  { name: "Corte de cabello", price: "RD$500", duration: "45 min" },
  { name: "Cerquillo", price: "RD$300", duration: "20 min" },
];

function MiniServicesList() {
  return (
    <div className="space-y-1.5" aria-hidden="true">
      {MINI_SERVICES.map((service) => (
        <div
          key={service.name}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2"
        >
          <span className="truncate text-xs font-medium text-foreground">{service.name}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-medium text-primary">{service.price}</span>
            {service.duration}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniTeamAvatars() {
  const members = [
    { initials: "CT", role: "Admin" },
    { initials: "JR", role: "Empleado" },
  ];

  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      {members.map((member) => (
        <div key={member.initials} className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {member.initials}
          </span>
          <span className="text-xs text-muted-foreground">{member.role}</span>
        </div>
      ))}
    </div>
  );
}

function MiniReportBars() {
  const bars = [40, 65, 30, 90, 55];

  return (
    <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          className={
            "flex-1 rounded-t-[3px] " + (index === 3 ? "bg-primary" : "bg-muted")
          }
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function MiniWeekCalendar() {
  return (
    <div
      className="grid w-full max-w-[280px] shrink-0 grid-cols-7 gap-1.5 sm:w-[280px]"
      aria-hidden="true"
    >
      {DAYS.map((day, index) => (
        <span
          key={`${day}-${index}`}
          className="text-center text-[11px] font-medium text-muted-foreground"
        >
          {day}
        </span>
      ))}
      {Array.from({ length: 28 }).map((_, cellIndex) => {
        const day = cellIndex % 7;
        const row = Math.floor(cellIndex / 7);
        const isBooked = BOOKED_SLOTS.some((slot) => slot.day === day && slot.row === row);
        return (
          <span
            key={cellIndex}
            className={
              "aspect-square rounded-[4px] " + (isBooked ? "bg-primary" : "bg-muted")
            }
          />
        );
      })}
    </div>
  );
}
