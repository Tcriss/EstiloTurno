import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

type AuthBrandPanelProps = {
  mode: "login" | "register";
};

const staff = [
  { name: "Lucía", role: "Estilista", initial: "L", tone: "bg-[#38b2ac]/15 text-[#006a66]" },
  { name: "Carlos", role: "Barbero", initial: "C", tone: "bg-[#d2e1f6] text-[#516071]" },
  { name: "Mariana", role: "Manicurista", initial: "M", tone: "bg-[#e1e0ff]/50 text-[#494bd6]" },
];

const loginAppointments = [
  { name: "Ana López", service: "Corte y Peinado", time: "09:00 - 10:00", col: 1, row: 1, tone: "bg-[#38b2ac]/15" },
  { name: "Diego Ramírez", service: "Corte Clásico", time: "09:00 - 10:00", col: 2, row: 1, tone: "bg-[#d2e1f6]" },
  { name: "Sofía Martínez", service: "Color", time: "11:00 - 12:00", col: 1, row: 3, tone: "bg-[#d2e1f6]" },
  { name: "Javier Ruiz", service: "Afeitado", time: "12:00 - 13:00", col: 2, row: 4, tone: "bg-[#d2e1f6]" },
  { name: "Laura G.", service: "Manicura", time: "10:00 - 11:00", col: 3, row: 2, tone: "bg-[#38b2ac]/15" },
  { name: "Paula Vega", service: "Manicura Gel", time: "13:00 - 14:00", col: 3, row: 5, tone: "bg-[#38b2ac]/15" },
];

const registerAppointments = [
  { name: "Juan Pérez", service: "Corte clásico", time: "09:00 - 10:00", col: 1, row: 1, tone: "bg-[#38b2ac]/20" },
  { name: "Ana Gómez", service: "Coloración", time: "10:00 - 11:30", col: 2, row: 2, tone: "bg-[#d2e1f6]" },
  { name: "Laura S.", service: "Mechas", time: "11:30 - 12:30", col: 3, row: 3, tone: "bg-[#d2e1f6]" },
  { name: "Miguel T.", service: "Corte + Barba", time: "14:30 - 15:30", col: 4, row: 6, tone: "bg-[#38b2ac]/20" },
  { name: "Sofía M.", service: "Tratamiento", time: "16:00 - 17:00", col: 2, row: 8, tone: "bg-[#d2e1f6]" },
];

const loginSidebarIcons: LucideIcon[] = [CalendarDays, CheckCircle2, Users, Scissors, BarChart3, Settings];

const registerNavItems: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Resumen", icon: BarChart3 },
  { label: "Calendario", icon: CalendarDays },
  { label: "Citas", icon: CheckCircle2 },
  { label: "Clientes", icon: Users },
  { label: "Servicios", icon: Sparkles },
  { label: "Personal", icon: Users },
  { label: "Reportes", icon: ChartNoAxesColumnIncreasing },
  { label: "Configuración", icon: Settings },
];

const summaryStats: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "28", label: "Citas", icon: CalendarDays },
  { value: "3", label: "Profesionales", icon: Users },
  { value: "12", label: "Servicios", icon: Scissors },
  { value: "92%", label: "Ocupación", icon: ChartNoAxesColumnIncreasing },
];

export function AuthBrandPanel({ mode }: AuthBrandPanelProps) {
  const isLogin = mode === "login";

  if (isLogin) {
    return (
      <aside className="relative hidden min-h-screen overflow-hidden bg-slate-dark px-10 py-12 text-white lg:flex lg:flex-col xl:px-12">
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-teal/5 blur-3xl" />
        <div className="relative z-10">
          <Logo inverse compact />
        </div>

        <div className="relative z-10 my-auto max-w-lg py-12">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">
            Gestiona tu salón de forma inteligente
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">
            Agenda citas, administra empleados y automatiza tu negocio con una plataforma creada para centros de estética.
          </p>

          <div className="mt-9 space-y-7">
            <LoginBenefit
              icon={CalendarDays}
              title="Agenda Inteligente"
              text="Optimiza tus horarios y reduce cancelaciones de último minuto."
            />
            <LoginBenefit
              icon={Users}
              title="Gestión de Personal"
              text="Controla comisiones, turnos y desempeño de todo tu equipo."
            />
            <LoginBenefit
              icon={BarChart3}
              title="Reportes en Tiempo Real"
              text="Toma decisiones basadas en datos sobre ventas y rentabilidad."
            />
          </div>
        </div>

        <LoginChartPreview />
      </aside>
    );
  }

  return (
    <aside className="relative hidden overflow-hidden bg-[#0F172A] px-10 py-12 lg:block">
      {/* Decorative teal glows */}
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#38b2ac]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-40 h-56 w-56 rounded-full bg-[#006a66]/20 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col">
        {isLogin ? (
          <div className="mx-auto max-w-xl pt-12">
            <h1 className="font-geist text-4xl font-extrabold leading-tight tracking-tight text-white">
              Gestiona turnos.
              <span className="block text-[#38b2ac]">Optimiza tu tiempo.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-white/60">
              EstiloTurno te ayuda a organizar citas, equipos y servicios en un solo lugar.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <Logo darkBg />
            <h1 className="font-geist mt-16 text-5xl font-extrabold leading-tight tracking-tight text-white">
              La gestión de tu salón,
              <span className="block text-[#38b2ac]">en perfecto orden.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/60">
              EstiloTurno te ayuda a organizar citas, personal, servicios y clientes desde un solo lugar.
            </p>
          </div>
        )}

        <div className={isLogin ? "mt-16" : "mt-12"}>
          {isLogin ? <LoginDashboardPreview /> : <RegisterDashboardPreview />}
        </div>

        {!isLogin && (
          <div className="mt-auto grid grid-cols-3 gap-6 pt-8">
            <Benefit
              icon={<CalendarDays className="h-8 w-8" />}
              title="Agenda inteligente"
              text="Organiza citas sin conflictos y evita no shows."
            />
            <Benefit
              icon={<Users className="h-8 w-8" />}
              title="Todo en un lugar"
              text="Clientes, servicios y personal siempre accesibles."
            />
            <Benefit
              icon={<BarChart3 className="h-8 w-8" />}
              title="Decisiones con datos"
              text="Reportes claros para crecer cada día."
            />
          </div>
        )}
      </div>
    </aside>
  );
}

function LoginBenefit({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-teal">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-base leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function LoginChartPreview() {
  const bars = ["h-20 bg-teal/20", "h-24 bg-teal/40", "h-16 bg-teal/20", "h-28 bg-teal/60"];

  return (
    <div className="floating-preview relative z-10 w-full max-w-[520px] rounded-xl border border-slate-700 bg-slate-800/60 p-5 shadow-2xl backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        </div>
        <span className="h-2 w-24 rounded-full bg-slate-600" />
      </div>
      <div className="grid grid-cols-4 items-end gap-3">
        {bars.map((bar, index) => (
          <div key={bar} className={`flex flex-col justify-end rounded border border-teal/30 p-3 ${bar}`}>
            <span className="h-1 w-full rounded-full bg-teal" />
            <span className="sr-only">Indicador {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginDashboardPreview() {
  return (
    <div className="relative mx-auto max-w-[620px]">
      {/* Mini sidebar */}
      <div className="absolute left-0 top-0 z-20 flex h-[438px] w-20 flex-col items-center gap-5 rounded-2xl bg-[#1e293b] py-6 text-white shadow-panel">
        {loginSidebarIcons.map((Icon, index) => (
          <div
            key={index}
            className={
              index === 1
                ? "rounded-lg bg-[#006a66] p-3"
                : "p-2 text-white/50"
            }
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        ))}
      </div>
      <CalendarCard className="ml-16" title="Agenda" appointments={loginAppointments} columns={staff} />
      <SummaryCard />
    </div>
  );
}

function RegisterDashboardPreview() {
  return (
    <div className="relative ml-4 max-w-[650px] -rotate-2">
      <div className="absolute left-0 top-5 z-20 flex h-[410px] w-48 flex-col rounded-lg bg-[#1e293b] px-4 py-6 text-white shadow-panel">
        <div className="mb-8 flex items-center gap-2 text-lg font-extrabold">
          <CalendarDays className="h-7 w-7 text-[#38b2ac]" />
          Estilo<span className="-ml-1 text-[#38b2ac]">Turno</span>
        </div>
        {registerNavItems.map(({ label, icon: Icon }, index) => (
          <div
            key={label}
            className={
              index === 1
                ? "mb-2 flex items-center gap-3 rounded-lg bg-[#006a66] px-3 py-3 text-sm font-bold"
                : "mb-2 flex items-center gap-3 px-3 py-2 text-sm font-semibold text-white/60"
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>
      <CalendarCard
        className="ml-40"
        title="Calendario"
        appointments={registerAppointments}
        columns={[
          { name: "María", role: "", initial: "M", tone: "bg-[#38b2ac]/15 text-[#006a66]" },
          { name: "Carlos", role: "", initial: "C", tone: "bg-[#d2e1f6] text-[#516071]" },
          { name: "Lucía", role: "", initial: "L", tone: "bg-[#e1e0ff]/50 text-[#494bd6]" },
          { name: "Andrés", role: "", initial: "A", tone: "bg-[#3a4859]/10 text-[#3a4859]" },
        ]}
        compact
      />
    </div>
  );
}

type CalendarCardProps = {
  title: string;
  appointments: Array<{
    name: string;
    service: string;
    time: string;
    col: number;
    row: number;
    tone: string;
  }>;
  columns: Array<{ name: string; role: string; initial: string; tone: string }>;
  className?: string;
  compact?: boolean;
};

function CalendarCard({ title, appointments, columns, className, compact = false }: CalendarCardProps) {
  const rows = compact
    ? ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]
    : ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

  return (
    <div className={`relative z-10 rounded-2xl bg-white shadow-panel ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-7 py-5">
        <h2 className="text-xl font-extrabold text-[#0F172A]">{title}</h2>
        <div className="flex items-center gap-3 text-sm font-semibold text-[#718096]">
          <button className="rounded-lg border border-[#E2E8F0] p-2" aria-label="Día anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>Martes, 20 de mayo de 2025</span>
          <button className="rounded-lg border border-[#E2E8F0] p-2" aria-label="Día siguiente">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[64px_1fr] px-5 pb-5">
        <div />
        <div
          className="grid border-b border-[#E2E8F0] py-3"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((person) => (
            <div key={person.name} className="flex items-center justify-center gap-2 text-xs font-bold text-[#0F172A]">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${person.tone}`}>
                {person.initial}
              </span>
              <span>
                {person.name}
                {person.role && <span className="block text-[11px] font-medium text-[#718096]">{person.role}</span>}
              </span>
            </div>
          ))}
        </div>
        <div
          className="grid text-sm font-semibold text-[#718096]"
          style={{ gridTemplateRows: `repeat(${rows.length}, 54px)` }}
        >
          {rows.map((time) => (
            <div key={time} className="border-b border-dashed border-[#E2E8F0] pt-3">
              {time}
            </div>
          ))}
        </div>
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows.length}, 54px)`,
          }}
        >
          {Array.from({ length: columns.length * rows.length }).map((_, index) => (
            <div key={index} className="border-b border-l border-dashed border-[#E2E8F0]" />
          ))}
          {appointments.map((appointment) => (
            <div
              key={`${appointment.name}-${appointment.time}`}
              className={`m-2 rounded-lg p-3 text-xs font-semibold leading-5 text-[#0F172A] ${appointment.tone}`}
              style={{ gridColumn: appointment.col, gridRow: appointment.row }}
            >
              <p>{appointment.name}</p>
              <p className="font-medium">{appointment.service}</p>
              <p className="font-medium">{appointment.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard() {
  return (
    <div className="absolute -bottom-24 left-14 z-30 w-[500px] rounded-2xl bg-white p-7 shadow-panel">
      <h3 className="mb-5 text-lg font-extrabold text-[#0F172A]">Resumen del día</h3>
      <div className="grid grid-cols-4 gap-5">
        {summaryStats.map(({ value, label, icon: Icon }) => (
          <div key={label} className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#38b2ac]/10 text-[#006a66]">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-2xl font-extrabold text-[#0F172A]">{value}</p>
            <p className="text-sm font-medium text-[#718096]">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Benefit({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="text-[#38b2ac]">{icon}</div>
      <div>
        <h3 className="font-extrabold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-white/50">{text}</p>
      </div>
    </div>
  );
}
