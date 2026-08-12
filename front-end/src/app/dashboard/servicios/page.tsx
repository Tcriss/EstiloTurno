import { ServicesView } from "@/components/services/ServicesView";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getServices } from "@/services/schedule.service";

export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const initialServices = await getServices();

  return (
    <div className="space-y-6">
      <PageHeader title="Servicios" description="Gestioná el catálogo de servicios que ofrece tu negocio." />

      <ServicesView initialServices={initialServices} />
    </div>
  );
}
