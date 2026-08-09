import { createServerClient } from "@/lib/supabase-server";
import { getInitials } from "@/lib/dashboard-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KPIStats = {
  appointmentsToday: number;
  revenueToday: number;
  activeClients: number;
  occupancyPct: number;
};

export type CalendarAppointment = {
  id: string;
  staffIdx: number;
  staffName: string;
  service: string;
  timeLabel: string;
  start: number;   // decimal hours e.g. 9.5 = 09:30
  end: number;
  borderColor: string;
  bg: string;
};

export type ActivityItem = {
  id: string;
  type: "booking" | "cancellation" | "completion";
  label: string;
  body: string;
  timeAgo: string;
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

type CalendarAppointmentRow = {
  id: string;
  start_time: number | null;
  end_time: number | null;
  staff: { name: string | null; display_order: number | null } | null;
  service: { name: string | null } | null;
};

type ActivityLogRow = {
  id: string;
  type: ActivityItem["type"];
  client_name: string | null;
  service_name: string | null;
  created_at: string;
};

type UpcomingAppointmentRow = {
  id: string;
  start_time: number | null;
  service: { name: string | null } | null;
  client: { name: string | null } | null;
};

type ServiceNameRow = {
  service: { name: string | null } | null;
};
// ─── Helpers ─────────────────────────────────────────────────────────────────

const STAFF_COLORS = [
  { border: "#38b2ac", bg: "rgba(56,178,172,0.15)" },
  { border: "#516071", bg: "#d2e1f6" },
  { border: "#494bd6", bg: "rgba(228,226,255,0.55)" },
  { border: "#3a4859", bg: "rgba(58,72,89,0.08)" },
];

const AVATAR_COLORS = [
  "bg-[#38b2ac]/10 text-[#006a66]",
  "bg-[#d2e1f6] text-[#516071]",
  "bg-[#e1e0ff]/50 text-[#494bd6]",
  "bg-[#3a4859]/10 text-[#3a4859]",
];

const SERVICE_BAR_COLORS = ["bg-[#006a66]", "bg-[#38b2ac]", "bg-[#516071]", "bg-[#494bd6]"];

function minutesToDecimal(minutes: number): number {
  return Math.floor(minutes / 60) + (minutes % 60) / 60;
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeAgoFromIso(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `Hace ${mins} min`;
  if (mins < 1440) return `Hace ${Math.floor(mins / 60)}h`;
  return `Hace ${Math.floor(mins / 1440)}d`;
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function getKPIStats(): Promise<KPIStats> {
  const db = await createServerClient();
  if (!db) return { appointmentsToday: 0, revenueToday: 0, activeClients: 0, occupancyPct: 0 };

  const today = new Date().toISOString().split("T")[0];

  try {
    const [apptRes, clientRes] = await Promise.all([
      db.from("appointments").select("*", { count: "exact", head: true }).eq("date", today),
      db.from("clients").select("*", { count: "exact", head: true }),
    ]);
    return {
      appointmentsToday: apptRes.count ?? 0,
      revenueToday: 0,   // TODO: aggregate from completed appointments + services.price
      activeClients: clientRes.count ?? 0,
      occupancyPct: 0,   // TODO: (booked_slots / total_available_slots) * 100
    };
  } catch {
    return { appointmentsToday: 0, revenueToday: 0, activeClients: 0, occupancyPct: 0 };
  }
}

export async function getTodayCalendarAppointments(): Promise<CalendarAppointment[]> {
  const db = await createServerClient();
  if (!db) return [];

  const today = new Date().toISOString().split("T")[0];

  try {
    const { data, error } = await db
      .from("appointments")
      .select(`
        id,
        start_time,
        end_time,
        staff:staff_id ( name, display_order ),
        service:service_id ( name ),
        client:client_id ( name )
      `)
      .eq("date", today)
      .neq("status", "cancelled")
      .order("start_time");

    if (error || !data) return [];

    return (data as unknown as CalendarAppointmentRow[]).map((row, i) => {
      const colors = STAFF_COLORS[i % STAFF_COLORS.length];
      const startMin: number = row.start_time ?? 0;
      const endMin: number = row.end_time ?? startMin + 60;
      return {
        id: row.id,
        staffIdx: row.staff?.display_order ?? i,
        staffName: row.staff?.name ?? "Staff",
        service: row.service?.name ?? "Servicio",
        timeLabel: `${minutesToTimeString(startMin)} - ${minutesToTimeString(endMin)}`,
        start: minutesToDecimal(startMin),
        end: minutesToDecimal(endMin),
        borderColor: colors.border,
        bg: colors.bg,
      };
    });
  } catch {
    return [];
  }
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const db = await createServerClient();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from("activity_log")
      .select("id, type, client_name, service_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !data) return [];

    const typeMap: Record<string, Pick<ActivityItem, "label" | "labelColor" | "dot" | "ring">> = {
      booking: { label: "Nueva cita:", labelColor: "text-[#0F172A]", dot: "bg-[#006a66]", ring: "bg-[#38b2ac]/20" },
      cancellation: { label: "Cancelación:", labelColor: "text-red-600", dot: "bg-red-500", ring: "bg-red-100" },
      completion: { label: "Servicio finalizado:", labelColor: "text-[#0F172A]", dot: "bg-[#516071]", ring: "bg-[#d2e1f6]" },
    };

    return (data as unknown as ActivityLogRow[]).map((row) => {
      const meta = typeMap[row.type] ?? typeMap.booking;
      const body =
        row.type === "cancellation"
          ? `${row.client_name} canceló su turno.`
          : row.type === "completion"
          ? `${row.service_name} completado.`
          : `${row.client_name} reservó ${row.service_name}.`;
      return { id: row.id, type: row.type, body, timeAgo: timeAgoFromIso(row.created_at), ...meta };
    });
  } catch {
    return [];
  }
}

export async function getUpcomingAppointments(): Promise<UpcomingAppointment[]> {
  const db = await createServerClient();
  if (!db) return [];

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  try {
    const { data, error } = await db
      .from("appointments")
      .select(`id, start_time, service:service_id ( name ), client:client_id ( name )`)
      .eq("date", today)
      .eq("status", "scheduled")
      .gt("start_time", nowMinutes)
      .order("start_time")
      .limit(5);

    if (error || !data) return [];

    return (data as unknown as UpcomingAppointmentRow[]).map((row, i) => {
      const clientName: string = row.client?.name ?? "Cliente";
      return {
        id: row.id,
        clientName,
        service: row.service?.name ?? "Servicio",
        time: minutesToTimeString(row.start_time ?? 0),
        initials: getInitials(clientName),
        avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
      };
    });
  } catch {
    return [];
  }
}

export async function getTopServices(): Promise<ServiceStat[]> {
  const db = await createServerClient();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from("appointments")
      .select("service:service_id ( name )")
      .neq("status", "cancelled");

    if (error || !data || data.length === 0) return [];

    const counts: Record<string, number> = {};
    for (const row of data as unknown as ServiceNameRow[]) {
      const name = row.service?.name ?? "Otro";
      counts[name] = (counts[name] ?? 0) + 1;
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([label, count], i) => ({
        label,
        pct: Math.round((count / total) * 100),
        bar: SERVICE_BAR_COLORS[i % SERVICE_BAR_COLORS.length],
      }));
  } catch {
    return [];
  }
}
