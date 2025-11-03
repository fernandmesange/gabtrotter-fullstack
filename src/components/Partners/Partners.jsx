import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

const Partners = () => {
  const partnerLogos = [
    { src: "/partners/usaFlag.webp", alt: "Logo Partenaire 0" },
    { src: "/partners/USE.png", alt: "Logo Partenaire 2" },
    { src: "/partners/AMFG.jpg", alt: "Logo Partenaire 1" },
    { src: "/partners/logo-lgn.png", alt: "Logo Partenaire 4" },
    { src: "/partners/LAC.jpg", alt: "Logo Partenaire 7" },
    { src: "/partners/IREX.jpg", alt: "Logo Partenaire 6" },
    { src: "/partners/DHF.jpg", alt: "Logo Partenaire 8" },

  ]
  return (
    <div>
     
      <section id="partners" className="py-16 bg-gradient-to-b from-background to-gray-100  mt-20">
      <div className="container mx-auto px-4">
      <h1 className='font-extrabold text-5xl text-orange-500'>PARTENAIRES</h1>
      <br/>
      <p className='text-lg'>Pour accomplir nos missions sur le terrain, nous sommes soutenus par une multitude de partenaires financiers et techniques qui partagent notre vision d’un avenir inclusif.</p>
      <br/>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {partnerLogos.map((logo, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex items-center justify-center p-4 h-40">
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="max-w-full max-h-full   object-cover transition-transform duration-300 hover:scale-105 "
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
      
    </div>
  );
}

export default Partners;
