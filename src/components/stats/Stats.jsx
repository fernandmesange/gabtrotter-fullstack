import React from "react"
import { ArrowBigRight, Brain, GraduationCap, Globe2, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"



const initiatives = [
  {
    key: "ai4steam",
    title: "AI4STEAM",
    emoji: "🚀",
    icon: <Brain className="h-6 w-6" aria-hidden="true" />,
    description:
      "Former étudiants, enseignants et jeunes professionnels aux compétences numériques et à l’intelligence artificielle.",
    href: "/initiatives/ai4steam",
  },
  {
    key: "permis-numerique",
    title: "Permis de Conduire Numérique",
    emoji: "🖥️",
    icon: <GraduationCap className="h-6 w-6" aria-hidden="true" />,
    description:
      "Démocratiser la culture digitale via des parcours certifiants accessibles à tous.",
    href: "/initiatives/permis-de-conduire-numerique",
  },
  {
    key: "inclusion",
    title: "Champion de l’Inclusion",
    emoji: "🌍",
    icon: <Globe2 className="h-6 w-6" aria-hidden="true" />,
    description:
      "Promouvoir l’égalité des chances et l’intégration des populations marginalisées.",
    href: "/initiatives/champion-de-linclusion",
  },
  {
    key: "voix-acces",
    title: "Voix et Accès",
    emoji: "🎤",
    icon: <Megaphone className="h-6 w-6" aria-hidden="true" />,
    description:
      "Donner la parole aux jeunes et faciliter leur participation citoyenne via des espaces d’expression et d’innovation.",
    href: "/initiatives/voix-et-acces",
  },
]

export default function Stats() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-orange-50 mt-20" id="initiative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-orange-500 mb-3">
          NOS INITIATIVES PHARES
        </h2>
        <p className="mb-10 text-muted-foreground max-w-3xl">
          Autonomiser les jeunes et les femmes par l’usage responsable des technologies
          et des médias, avec des parcours concrets, certifiants et inclusifs.
        </p>

        {/* CTA global */}
        <div className="flex justify-center mb-12">
          <Link to="/events">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white h-12 px-6" size="lg">
            <ArrowBigRight className="mr-2 h-4 w-4" /> Voir nos inscriptions
          </Button>
          </Link>

        </div>

        {/* Grille d’initiatives */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {initiatives.map((item) => (
            <Card
              key={item.key}
              className="group border-orange-100/60 hover:shadow-lg hover:border-orange-200 transition-all duration-200"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
                    <span aria-hidden="true">{item.emoji}</span>
                    <span className="sr-only">{item.title}</span>
                    {item.icon}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      En savoir plus
                      <ArrowBigRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Bientôt disponible</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
