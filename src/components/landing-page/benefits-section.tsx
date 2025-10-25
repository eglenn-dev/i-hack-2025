import { Card } from "@/components/ui/card"
import { Sparkles, Target, TrendingUp, Clock } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: Sparkles,
      title: "AI-Generated Questions",
      description: "Paste any job description and instantly receive tailored interview questions specific to the role.",
    },
    {
      icon: Target,
      title: "Realistic Practice",
      description:
        "Practice with our AI interviewer that adapts to your responses and provides natural conversation flow.",
    },
    {
      icon: TrendingUp,
      title: "Instant Feedback",
      description: "Get real-time insights on your answers, communication style, and areas for improvement.",
    },
    {
      icon: Clock,
      title: "Practice Anytime",
      description: "No scheduling needed. Practice interviews 24/7 at your own pace and convenience.",
    },
  ]

  return (
    <section id="features" className="container mx-auto px-4 py-24 bg-muted/30">
      <div className="mx-auto max-w-2xl text-center mb-16">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl mb-4">
          Everything You Need to Succeed
        </h2>
        <p className="text-pretty text-muted-foreground leading-relaxed">
          Our AI-powered platform gives you the tools and confidence to excel in any interview situation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <benefit.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">{benefit.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
