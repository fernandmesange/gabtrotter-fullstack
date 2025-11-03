import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const projects = [
  {
    title: "Éduquer autrement",
    description: "Promouvoir des approches pédagogiques innovantes et inclusives.",
    image: "/initiative-1.png"
  },
  {
    title: "Former aux compétences numériques",
    description: "Offrir des parcours autour de l’IA, de la cybersécurité, des STEAM et de la citoyenneté digitale.",
    image: "/initiative-2.png"
  },
  {
    title: "Autonomiser et inclure",
    description: "Créer des programmes qui renforcent la place des jeunes, des femmes et des communautés vulnérables.",
    image: "/initiative-3.png"
  },
  {
    title: "Connecter les talents ",
    description: "Développer des partenariats locaux et internationaux pour élargir les opportunités.",
    image: "/initiative-4.png"
  }
]

export default function Projects() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted mt-20" id="projects">
      <div className='container mx-auto px-4'>
        <h2 className='text-4xl md:text-5xl font-extrabold  mb-6 text-orange-500'>NOS MISSIONS</h2>
        {/* <p className='text-md md:text-lg leading-7 mb-12 '>
        Gabtrotter met en œuvre plusieurs projets innovants qui visent à améliorer les conditions de vie et d'éducation des populations vulnérables. Parmi nos initiatives phares, nous avons
        </p>
        <p className='text-md md:text-lg leading-7 mb-12 '>
        Nous croyons que ces projets peuvent faire une différence significative dans la vie des personnes que nous servons et contribuer à la construction d'une société plus juste et inclusive.
        </p> */}
        

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent>
            {projects.map((project, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="p-0">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-64 object-cover  transition-transform duration-300 hover:scale-105"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-xl font-bold mb-2">{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>

        <div className="flex justify-center mt-8 md:hidden">
          <Button variant="outline" size="icon" className="mr-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Projet précédent</span>
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Projet suivant</span>
          </Button>
        </div>
      </div>
    </section>
  )
}