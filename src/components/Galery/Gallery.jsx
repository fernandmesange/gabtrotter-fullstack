import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Simulons une liste d'images pour la galerie
const images = [
  { src: "/gallery/photo1.jpg", alt: "Image 1" },
  { src: "/gallery/photo2.jpg", alt: "Image 2" },
  { src: "/gallery/photo3.jpg", alt: "Image 3" },
  { src: "/gallery/photo4.jpg", alt: "Image 4" },
  { src: "/gallery/photo5.jpg", alt: "Image 5" },
  { src: "/gallery/photo6.jpg", alt: "Image 6" },
]

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <section id="gallery" className="py-16 bg-gradient-to-b from-background to-gray-100">
      <div className="container mx-auto px-4 flex flex-col">
        <p className='text-md md:text-lg leading-7 mb-12'>
          Découvrez notre galerie pour voir nos réalisations et les moments forts de nos initiatives. 
          Des photos de nos formations, événements et projets en cours mettent en lumière l’impact de notre 
          travail et l'engagement de notre équipe et de nos participants.
        </p>
        
        {/* Grille d'images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {images.map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-auto w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <div className="relative">
                  <img src={image.src} alt={image.alt} className="w-full h-auto" />
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Bouton Voir plus vers Facebook */}
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 ">
          <a href="https://www.facebook.com/gabtrotterNGO" target="_blank" rel="noopener noreferrer">
            Voir plus sur Facebook
          </a>
        </Button>
      </div>
    </section>
  )
}
