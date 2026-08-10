import { notFound } from "next/navigation";
import { BarChart3, Scissors, UserRound, Users, type LucideIcon } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

type SectionConfig = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const SECTIONS: Record<string, SectionConfig> = {
  clientes: {
    title: "Clientes",
    description: "Aquí podrás consultar perfiles, historial de citas y preferencias de tus clientes.",
    icon: Users,
  },
  servicios: {
    title: "Servicios",
    description: "Aquí podrás organizar los servicios, precios, duración y profesionales disponibles.",
    icon: Scissors,
  },
  personal: {
    title: "Personal",
    description: "Aquí podrás gestionar integrantes, horarios, permisos y disponibilidad del equipo.",
    icon: UserRound,
  },
  analiticas: {
    title: "Analíticas",
    description: "Aquí encontrarás reportes de citas, ocupación, ingresos y rendimiento del negocio.",
    icon: BarChart3,
  },
  perfil: {
    title: "Mi perfil",
    description: "Aquí podrás actualizar tu información personal y las opciones de acceso a tu cuenta.",
    icon: UserRound,
  },
};

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;
  const config = SECTIONS[section];

  if (!config) {
    notFound();
  }

  return <ComingSoon {...config} />;
}