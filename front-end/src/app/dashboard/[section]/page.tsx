import { notFound } from "next/navigation";
import { UserRound, type LucideIcon } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

type SectionConfig = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const SECTIONS: Record<string, SectionConfig> = {
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