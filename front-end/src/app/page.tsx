import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { PainPoints } from "@/components/landing/PainPoints";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DashboardFeatures } from "@/components/landing/DashboardFeatures";
import { BusinessSection } from "@/components/landing/BusinessSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <PainPoints />
        <HowItWorks />
        <DashboardFeatures />
        <BusinessSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
