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
  format: (v: number) => string;
};

const KPI_CONFIG: KPIConfig[] = [
  {
    key: "appointmentsToday",
    label: "Citas hoy",
    icon: CalendarDays,
    format: (v) => String(v),
  },
  {
    key: "revenueToday",
    label: "Ingresos del día",
    icon: DollarSign,
    format: (v) => `$${v.toLocaleString("es-DO")}`,
  },
  {
    key: "activeClients",
    label: "Clientes activos",
    icon: Users,
    format: (v) => String(v),
  },
  {
    key: "occupancyPct",
    label: "Ocupación",
    icon: TrendingUp,
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
        {KPI_CONFIG.map(({ key, label, icon: Icon, format }) => (
          <Card key={key} className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="mt-2 font-heading text-2xl font-semibold tabular-nums text-foreground">
              {format(kpi[key])}
            </p>
          </Card>
        ))}
      </div>

      {/* Agenda del día + Services */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Agenda del día</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Sin citas programadas para hoy
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {todayAppointments.map((appt) => (
                  <li key={appt.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{appt.clientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{appt.service}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm tabular-nums text-muted-foreground">{appt.timeLabel}</span>
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

        <Card>
          <CardHeader>
            <CardTitle>Servicios más solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos de servicios aún</p>
            ) : (
              <div className="space-y-3.5">
                {services.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-foreground">{s.label}</span>
                      <span className="tabular-nums text-muted-foreground">{s.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity + Upcoming */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin actividad reciente</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.ring}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className={`font-medium ${item.labelColor}`}>{item.label}</span>{" "}
                        <span className="text-muted-foreground">{item.body}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas citas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin próximas citas para hoy</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((appt) => (
                  <li key={appt.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${appt.avatarBg}`}
                    >
                      {appt.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{appt.clientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{appt.service}</p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{appt.time}</span>
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
