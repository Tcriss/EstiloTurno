import { CalendarDays, DollarSign, TrendingUp, Users, type LucideIcon } from "lucide-react";
import {
  getKPIStats,
  getTodayCalendarAppointments,
  getRecentActivity,
  getUpcomingAppointments,
  getTopServices,
  type CalendarAppointment,
  type KPIStats,
} from "@/lib/dashboard-data";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";

export const dynamic = "force-dynamic";

// ─── KPI config (no hardcoded values — only display shape) ───────────────────

type KPIKey = keyof KPIStats;

type KPIConfig = {
  key: KPIKey;
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  format: (v: number) => string;
};

const KPI_CONFIG: KPIConfig[] = [
  {
    key: "appointmentsToday",
    label: "Citas hoy",
    icon: CalendarDays,
    iconBg: "bg-[#38b2ac]/15",
    iconColor: "text-[#006a66]",
    format: (v) => String(v),
  },
  {
    key: "revenueToday",
    label: "Ingresos del día",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    format: (v) => `$${v.toLocaleString("es-DO")}`,
  },
  {
    key: "activeClients",
    label: "Clientes activos",
    icon: Users,
    iconBg: "bg-[#d2e1f6]",
    iconColor: "text-[#516071]",
    format: (v) => String(v),
  },
  {
    key: "occupancyPct",
    label: "Ocupación",
    icon: TrendingUp,
    iconBg: "bg-[#e1e0ff]/50",
    iconColor: "text-[#494bd6]",
    format: (v) => `${v}%`,
  },
];

// ─── Calendar ─────────────────────────────────────────────────────────────────

const CELL_H = 76;
const START_HOUR = 8;
const HOURS = Array.from({ length: 9 }, (_, i) => START_HOUR + i);

function StaffCalendar({ appointments }: { appointments: CalendarAppointment[] }) {
  const staffMap = new Map<string, { name: string; idx: number }>();
  for (const a of appointments) {
    if (!staffMap.has(a.staffName)) {
      staffMap.set(a.staffName, { name: a.staffName, idx: a.staffIdx });
    }
  }
  const staffCols = Array.from(staffMap.values()).sort((a, b) => a.idx - b.idx);
  const colCount = Math.max(staffCols.length, 1);

  if (appointments.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] text-sm text-[#718096]">
        Sin citas programadas para hoy
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Staff header */}
        <div
          className="grid border-b border-[#E2E8F0] pb-3"
          style={{ gridTemplateColumns: `64px repeat(${colCount}, 1fr)` }}
        >
          <div />
          {staffCols.map((s) => (
            <div key={s.name} className="text-center text-sm font-semibold text-[#0F172A]">
              {s.name}
            </div>
          ))}
        </div>

        {/* Hour rows */}
        <div className="relative" style={{ height: HOURS.length * CELL_H }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: (h - START_HOUR) * CELL_H }}
            >
              <span className="w-16 shrink-0 pr-3 text-right text-xs font-medium text-[#718096]">
                {String(h).padStart(2, "0")}:00
              </span>
              <div className="flex-1 border-t border-dashed border-[#E2E8F0]" />
            </div>
          ))}

          {/* Appointment blocks */}
          <div className="absolute left-16 right-0" style={{ top: 0, height: HOURS.length * CELL_H }}>
            {appointments.map((appt) => {
              const colIdx = staffCols.findIndex((s) => s.name === appt.staffName);
              const colW = 100 / colCount;
              const top = (appt.start - START_HOUR) * CELL_H + 3;
              const height = (appt.end - appt.start) * CELL_H - 6;
              return (
                <div
                  key={appt.id}
                  className="absolute rounded-lg border-l-4 px-2 py-1"
                  style={{
                    left: `${colIdx * colW}%`,
                    width: `calc(${colW}% - 6px)`,
                    top,
                    height,
                    borderColor: appt.borderColor,
                    background: appt.bg,
                  }}
                >
                  <p className="truncate text-xs font-semibold text-[#0F172A]">{appt.staffName}</p>
                  <p className="truncate text-xs text-[#718096]">{appt.service}</p>
                  <p className="text-[10px] text-[#718096]">{appt.timeLabel}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [kpi, calendarAppts, activity, upcoming, services] = await Promise.all([
    getKPIStats(),
    getTodayCalendarAppointments(),
    getRecentActivity(),
    getUpcomingAppointments(),
    getTopServices(),
  ]);

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CONFIG.map(({ key, label, icon: Icon, iconBg, iconColor, format }) => (
          <div key={key} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
            <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
            </div>
            <p className="font-geist text-2xl font-bold text-[#0F172A]">{format(kpi[key])}</p>
            <p className="mt-1 text-sm text-[#718096]">{label}</p>
          </div>
        ))}
      </div>

      {/* Calendar + Services */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card">
          <h2 className="mb-4 font-geist text-lg font-bold text-[#0F172A]">Agenda del día</h2>
          <StaffCalendar appointments={calendarAppts} />
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card">
          <h2 className="mb-4 font-geist text-lg font-bold text-[#0F172A]">Servicios más solicitados</h2>
          {services.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#718096]">Sin datos de servicios aún</p>
          ) : (
            <div className="space-y-4">
              {services.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#2D3748]">{s.label}</span>
                    <span className="font-semibold text-[#0F172A]">{s.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div className={`h-2 rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity + Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card">
          <h2 className="mb-4 font-geist text-lg font-bold text-[#0F172A]">Actividad reciente</h2>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#718096]">Sin actividad reciente</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.ring}`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className={`font-semibold ${item.labelColor}`}>{item.label}</span>{" "}
                      <span className="text-[#2D3748]">{item.body}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#718096]">{item.timeAgo}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card">
          <h2 className="mb-4 font-geist text-lg font-bold text-[#0F172A]">Próximas citas</h2>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#718096]">Sin próximas citas para hoy</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((appt) => (
                <li
                  key={appt.id}
                  className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] px-4 py-3"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${appt.avatarBg}`}
                  >
                    {appt.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">{appt.clientName}</p>
                    <p className="truncate text-xs text-[#718096]">{appt.service}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#38b2ac]/10 px-2.5 py-1 text-xs font-semibold text-[#006a66]">
                    {appt.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
