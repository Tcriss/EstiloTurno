import { AgendaView } from "@/components/agenda/AgendaView";
import { listAppointments } from "@/services/appointments.service";

export const dynamic = "force-dynamic";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export default async function AgendaPage() {
  const today = todayIso();
  const initialAppointments = await listAppointments({ date: today });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-geist text-2xl font-bold text-text-main">Agenda</h1>
        <p className="mt-1 text-sm text-text-muted">Gestioná los turnos de tu negocio por fecha y estado.</p>
      </div>

      <AgendaView initialAppointments={initialAppointments} initialDate={today} />
    </div>
  );
}
