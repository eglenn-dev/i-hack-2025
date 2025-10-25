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
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}