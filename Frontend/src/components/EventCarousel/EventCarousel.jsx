import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import axiosInstance from '@/api/axiosInstance'



export default function EventCarousel() {
    const navigate = useNavigate()
    const [events, setEvents] = useState(null)

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get(`/events/public`)
      setEvents(response.data.filter((event) => event.isAvailable == true));
      console.log(events);
      
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <div className="container mx-auto px-12 py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-orange-500 mb-6">Inscription en cours</h2>
      <p className='text-md md:text-lg leading-7 mb-12 '>
      Nous organisons régulièrement des événements pour sensibiliser, éduquer et mobiliser la communauté autour de nos causes. Consultez notre section dédiée pour rester informé sur les prochains ateliers, séminaires, et autres activités. Rejoignez-nous pour faire la différence !
      </p>
      {events === null ? (
        <div className="text-center">Chargement des événements...</div>
      ) : events.length > 0 ? (
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselPrevious />
          <CarouselContent>
            {events.map((event) => (
              <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3 ">
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={event.image || '/placeholder.svg?height=200&width=300'}
                        alt={event.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{event.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <time dateTime={event.startDate}>
                          {new Date(event.startDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => navigate('/event/' + event._id)}>
                        En savoir plus
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselNext />
        </Carousel>
      ) : (
        <p className="text-center font-bold text-gray-600">Aucun événement en cours</p>
      )}
    </div>
  )
}