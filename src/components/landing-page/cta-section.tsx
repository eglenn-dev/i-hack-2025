import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-6">
          Ready to Ace Your Next Interview?
        </h2>
        <p className="text-pretty text-lg text-muted-foreground mb-8 leading-relaxed">
          Improve your interview skills and land your dream job with InterviewAI.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href='/login'>
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>
      </div>
    </section>
  )
}
