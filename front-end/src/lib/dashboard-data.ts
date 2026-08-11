import { getInitials } from "@/lib/dashboard-utils";
import { getBusiness } from "@/services/business.service";
import { listAppointments, type AppointmentStatus } from "@/services/appointments.service";
import { getServices } from "@/services/schedule.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KPIStats = {
  appointmentsToday: number;
  revenueToday: number;
  activeClients: number;
  occupancyPct: number;
};

export type DailyAppointment = {
  id: string;
  clientName: string;
  service: string;
  timeLabel: string;
  status: AppointmentStatus;
};

export type ActivityItem = {
  id: string;
  type: "booking" | "cancellation" | "completion";
  label: string;
  body: string;
  meta: string;
  labelColor: string;
  dot: string;
  ring: string;
};

export type UpcomingAppointment = {
  id: string;
  clientName: string;
  service: string;
  time: string;
  initials: string;
  avatarBg: string;
};

export type ServiceStat = {
  label: string;
  pct: number;
  bar: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-primary/10 text-primary",
  "bg-muted text-muted-foreground",
  "bg-foreground/5 text-foreground",
  "bg-primary/5 text-primary",
];

const SERVICE_BAR_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4"];

// Estados que ocupan un slot de la agenda — igual criterio que SLOT_BLOCKING_STATUSES en el backend.
const SLOT_BLOCKING_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED"];

const ACTIVITY_TYPE_META: Record<ActivityItem["type"], Pick<ActivityItem, "label" | "labelColor" | "dot" | "ring">> = {
  booking: { label: "Turno:", labelColor: "text-foreground", dot: "bg-primary", ring: "bg-primary/15" },
  cancellation: {
    label: "Cancelación:",
    labelColor: "text-destructive",
    dot: "bg-destructive",
    ring: "bg-destructive/15",
  },
  completion: { label: "Completado:", labelColor: "text-foreground", dot: "bg-muted-foreground", ring: "bg-muted" },
};

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function timeLabel(startTime: string): string {
  return startTime.slice(0, 5);
}

function dateTimeLabel(date: string, startTime: string): string {
  const parsed = new Date(`${date}T${startTime}`);
  const dateFmt = parsed.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
  return `${dateFmt}, ${timeLabel(startTime)}`;
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function getKPIStats(): Promise<KPIStats> {
  const today = todayIso();

  const [business, todayAppointments, allAppointments, services] = await Promise.all([
    getBusiness(),
    listAppointments({ date: today }),
    listAppointments({}),
    getServices(),
  ]);

  const priceByService = new Map(services.map((s) => [s.id, Number(s.price)]));

  const revenueToday = todayAppointments
    .filter((a) => a.status === "CONFIRMED" || a.status === "COMPLETED")
    .reduce((sum, a) => sum + (priceByService.get(a.serviceId) ?? 0), 0);

  const activeSince = new Date();
  activeSince.setDate(activeSince.getDate() - 30);
  const activeSinceIso = activeSince.toISOString().split("T")[0];
  const activeClients = new Set(
    allAppointments.filter((a) => a.date >= activeSinceIso).map((a) => a.clientId)
  ).size;

  const totalSlots = Math.max(
    Math.floor((business.workEndMinutes - business.workStartMinutes) / business.slotIntervalMinutes),
    1
  );
  const bookedSlots = todayAppointments.filter((a) => SLOT_BLOCKING_STATUSES.includes(a.status)).length;
  const occupancyPct = Math.min(Math.round((bookedSlots / totalSlots) * 100), 100);

  return {
    appointmentsToday: todayAppointments.length,
    revenueToday,
    activeClients,
    occupancyPct,
  };
}

export async function getTodayAppointments(): Promise<DailyAppointment[]> {
  const appointments = await listAppointments({ date: todayIso() });

  return appointments
    .filter((a) => a.status !== "CANCELED")
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((a) => ({
      id: String(a.id),
      clientName: a.clientName ?? "Cliente",
      service: a.serviceName,
      timeLabel: timeLabel(a.startTime),
      status: a.status,
    }));
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const appointments = await listAppointments({});

  // No hay un log de auditoría en el backend: se aproxima "actividad reciente" ordenando
  // por id descendente (proxy de orden de creación) y mostrando la fecha/hora del turno
  // en vez de un timestamp real de creación, que la API no expone.
  return [...appointments]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
    .map((a) => {
      const type: ActivityItem["type"] =
        a.status === "CANCELED" ? "cancellation" : a.status === "COMPLETED" ? "completion" : "booking";
      const meta = ACTIVITY_TYPE_META[type];
      const clientName = a.clientName ?? "Cliente";
      const body =
        type === "cancellation"
          ? `${clientName} canceló su turno.`
          : type === "completion"
            ? `${a.serviceName} completado para ${clientName}.`
            : `${clientName} reservó ${a.serviceName}.`;

      return {
        id: String(a.id),
        type,
        body,
        meta: dateTimeLabel(a.date, a.startTime),
        ...meta,
      };
    });
}

export async function getUpcomingAppointments(): Promise<UpcomingAppointment[]> {
  const now = new Date();
  const today = todayIso();
  const nowTime = now.toTimeString().slice(0, 8);

  const appointments = await listAppointments({ date: today, status: "CONFIRMED" });

  return appointments
    .filter((a) => a.startTime > nowTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5)
    .map((a, i) => {
      const clientName = a.clientName ?? "Cliente";
      return {
        id: String(a.id),
        clientName,
        service: a.serviceName,
        time: timeLabel(a.startTime),
        initials: getInitials(clientName),
        avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
      };
    });
}

export async function getTopServices(): Promise<ServiceStat[]> {
  const appointments = await listAppointments({});
  const active = appointments.filter((a) => a.status !== "CANCELED");

  if (active.length === 0) return [];

  const counts = new Map<string, number>();
  for (const a of active) {
    counts.set(a.serviceName, (counts.get(a.serviceName) ?? 0) + 1);
  }

  const total = active.length;

  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([label, count], i) => ({
      label,
      pct: Math.round((count / total) * 100),
      bar: SERVICE_BAR_COLORS[i % SERVICE_BAR_COLORS.length],
    }));
}
