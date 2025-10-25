import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          AI-Powered Interview Preparation
        </div>

        <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          Ace Your Next Interview with AI
        </h1>

        <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
          Generate tailored interview questions from any job description and practice with our AI interviewer. Get
          real-time feedback and build confidence before the big day.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href='/login'>
                <Button size="lg" className="gap-2">
                  Start Practicing
                  <ArrowRight className="h-4 w-4" />
                </Button>
            </Link>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
