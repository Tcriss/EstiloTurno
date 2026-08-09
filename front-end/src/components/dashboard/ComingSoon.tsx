import Link from "next/link";
import { ArrowLeft, Clock3, type LucideIcon } from "lucide-react";

type ComingSoonProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <div className="w-full max-w-2xl rounded-lg border border-dashed border-[#9FB7C1] bg-white px-6 py-12 text-center shadow-card sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#38b2ac]/15 text-[#006a66]">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d2e1f6] px-3 py-1 text-xs font-semibold text-[#516071]">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          En desarrollo
        </div>

        <h1 className="mt-4 font-geist text-3xl font-bold text-[#0F172A]">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-[#718096]">{description}</p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718096]">
          Estamos trabajando en esta sección. Próximamente podrás utilizar todas sus funciones desde aquí.
        </p>

        <Link
          href="/dashboard"
          className="mx-auto mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#0F172A] transition hover:border-[#9FB7C1] hover:bg-[#f7fafc] focus:outline-none focus:ring-4 focus:ring-[#006a66]/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al dashboard
        </Link>
      </div>
    </section>
  );
}