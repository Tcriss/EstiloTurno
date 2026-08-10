import { CalendarDays, DollarSign, TrendingUp, Users, type LucideIcon } from "lucide-react";
import {
  getKPIStats,
  getTodayAppointments,
  getRecentActivity,
  getUpcomingAppointments,
  getTopServices,
  type KPIStats,
} from "@/lib/dashboard-data";
import { APPOINTMENT_STATUS_BADGE_VARIANT, APPOINTMENT_STATUS_LABEL } from "@/lib/appointment-status";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { getCurrentUser } from "@/services/session.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    iconBg: "bg-teal/15",
    iconColor: "text-primary",
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
    iconBg: "bg-secondary",
    iconColor: "text-secondary-color",
    format: (v) => String(v),
  },
  {
    key: "occupancyPct",
    label: "Ocupación",
    icon: TrendingUp,
    iconBg: "bg-tertiary-fixed/50",
    iconColor: "text-tertiary",
    format: (v) => `${v}%`,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [user, kpi, todayAppointments, activity, upcoming, services] = await Promise.all([
    getCurrentUser(),
    getKPIStats(),
    getTodayAppointments(),
    getRecentActivity(),
    getUpcomingAppointments(),
    getTopServices(),
  ]);
  const firstName = user.name.trim().split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <WelcomeHeader firstName={firstName} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CONFIG.map(({ key, label, icon: Icon, iconBg, iconColor, format }) => (
          <Card key={key} className="p-5 shadow-card">
            <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
            </div>
            <p className="font-geist text-2xl font-bold text-text-main">{format(kpi[key])}</p>
            <p className="mt-1 text-sm text-text-muted">{label}</p>
          </Card>
        ))}
      </div>

      {/* Agenda del día + Services */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Agenda del día</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
                Sin citas programadas para hoy
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {todayAppointments.map((appt) => (
                  <li key={appt.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-main">{appt.clientName}</p>
                      <p className="truncate text-xs text-text-muted">{appt.service}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-medium text-text-main">{appt.timeLabel}</span>
                      <Badge variant={APPOINTMENT_STATUS_BADGE_VARIANT[appt.status]}>
                        {APPOINTMENT_STATUS_LABEL[appt.status]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Servicios más solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">Sin datos de servicios aún</p>
            ) : (
              <div className="space-y-4">
                {services.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-text-main">{s.label}</span>
                      <span className="font-semibold text-text-main">{s.pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <div className={`h-2 rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity + Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">Sin actividad reciente</p>
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
                        <span className="text-text-main">{item.body}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">{item.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Próximas citas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">Sin próximas citas para hoy</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((appt) => (
                  <li key={appt.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${appt.avatarBg}`}
                    >
                      {appt.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-main">{appt.clientName}</p>
                      <p className="truncate text-xs text-text-muted">{appt.service}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-teal/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {appt.time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
