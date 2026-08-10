import { redirect } from "next/navigation";
import { BusinessSettingsForm } from "@/components/configuracion/BusinessSettingsForm";
import { GoogleCalendarCard } from "@/components/configuracion/GoogleCalendarCard";
import { AuthExpiredError } from "@/lib/api-server";
import { getBusiness } from "@/services/business.service";
import { getCurrentUser } from "@/services/session.service";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  try {
    const [business, user] = await Promise.all([getBusiness(), getCurrentUser()]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-geist text-2xl font-bold text-text-main">Configuración</h1>
          <p className="mt-1 text-sm text-text-muted">Datos del negocio, horarios e integraciones.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BusinessSettingsForm business={business} canEdit={user.role === "ADMIN"} />
          <GoogleCalendarCard />
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
