// components/sections/VisionSection.tsx
import React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils" // (optionnel) si tu as déjà ce helper



export default function VisionSection({
  className,
  title = "Notre vision",
  text = "Être un acteur clé de la transformation éducative et digitale en Afrique, en donnant à chaque personne les moyens de réaliser son potentiel et de contribuer positivement à sa communauté."
}) {
  return (
    <section
      className={cn(
        "mx-12 relative overflow-hidden rounded-3xl border bg-gradient-to-b from-background to-orange-50/60 dark:to-orange-950/10",
        "py-14 md:py-20 shadow-sm",
        className
      )}
    >
      {/* léger halo décoratif */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10">
            <Sparkles className="h-6 w-6 text-orange-600" aria-hidden="true" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-orange-600">
            {title.toUpperCase()}
          </h2>

          <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground">
            {text}
          </p>
        </div>
      </div>
    </section>
  )
}
