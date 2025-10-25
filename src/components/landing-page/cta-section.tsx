import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-6">
          Ready to Ace Your Next Interview?
        </h2>
        <p className="text-pretty text-lg text-muted-foreground mb-8 leading-relaxed">
          Join thousands of job seekers who have improved their interview skills and landed their dream jobs with
          InterviewAI.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2">
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            View Pricing
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">No credit card required. Start practicing in minutes.</p>
      </div>
    </section>
  )
}
