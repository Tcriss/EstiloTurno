import { redirect } from "next/navigation";
import { BusinessSettingsForm } from "@/components/configuracion/BusinessSettingsForm";
import { GoogleCalendarCard } from "@/components/configuracion/GoogleCalendarCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AuthExpiredError } from "@/lib/api-server";
import { getBusiness } from "@/services/business.service";
import { getCalendarStatus } from "@/services/calendar.service";
import { getCurrentUser } from "@/services/session.service";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  try {
    const [business, user, calendarStatus] = await Promise.all([
      getBusiness(),
      getCurrentUser(),
      getCalendarStatus(),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader title="Configuración" description="Datos del negocio, horarios e integraciones." />

        <div className="grid gap-4 lg:grid-cols-2">
          <BusinessSettingsForm business={business} canEdit={user.role === "ADMIN"} />
          <GoogleCalendarCard initialStatus={calendarStatus} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof AuthExpiredError) {
      redirect("/login");
    }
    throw error;
  }
}
