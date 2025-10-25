import { BenefitsSection } from "@/components/landing-page/benefits-section";
import { CTASection } from "@/components/landing-page/cta-section";
import { Header } from "@/components/landing-page/header";
import { Hero } from "@/components/landing-page/hero";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <BenefitsSection />
        <CTASection />
      </main>
    </div>
  )
}