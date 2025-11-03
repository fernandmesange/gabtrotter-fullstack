import React, { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import axiosInstance from "@/api/axiosInstance"

const EventCard = ({
  _id,
  title,
  description,
  startDate,
  endDate,
  location,
  city,
  isFree,
  price,
  availablePlaces,
  maximumPlaces,
  image
}) => {
  const navigate = useNavigate()
  const eventStart = new Date(startDate)
  const isUpcoming = eventStart >= new Date()

  return (
    <Card className="mb-6 border-orange-500 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-orange-500">{title}</CardTitle>
          <Badge className={`text-white ${isUpcoming ? "bg-green-500" : "bg-gray-500"}`}>
            {eventStart.toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-40 object-cover rounded-md mb-3"
          />
        )}
        <p
          className="text-sm text-muted-foreground mb-2 break-words line-clamp-3"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <p className="text-sm font-medium mt-2">📍 {location}, {city}</p>
        <p className="text-sm mt-1">
          {isFree ? (
            <span className="text-green-600 font-semibold">Événement gratuit</span>
          ) : (
            <span className="text-orange-600 font-semibold">Prix : {price} FCFA</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Places disponibles : {availablePlaces} / {maximumPlaces}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => navigate(`/event/${_id}`)} // ⚡ route publique d'un seul event
        >
          Consulter
        </Button>
      </CardFooter>
    </Card>
  )
}

const EventsList = () => {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      // ⚡ route publique
      const response = await axiosInstance.get(`/events/public`)
      setEvents(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const filtered = events.filter(ev => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    setFilteredEvents(filtered)
  }, [searchTerm, events])

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-orange-500">Nos Événements</h1>

      {/* Barre de recherche */}
      <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="search" className="text-orange-500">Recherche</Label>
          <Input
            id="search"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-orange-500"
          />
        </div>
      </div>

      {/* Liste d'événements */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Chargement des événements...</p>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map(ev => (
            <EventCard key={ev._id} {...ev} />
          ))
        ) : (
          <p className="text-center text-muted-foreground">Aucun événement trouvé.</p>
        )}
      </div>
    </div>
  )
}

export default EventsList
