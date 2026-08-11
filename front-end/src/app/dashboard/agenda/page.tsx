import { AgendaView } from "@/components/agenda/AgendaView";
import { PageHeader } from "@/components/dashboard/PageHeader";
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
      <PageHeader title="Agenda" description="Gestioná los turnos de tu negocio por fecha y estado." />

      <AgendaView initialAppointments={initialAppointments} initialDate={today} />
    </div>
  );
}
