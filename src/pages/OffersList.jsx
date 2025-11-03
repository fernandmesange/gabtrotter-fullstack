import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useNavigate } from 'react-router-dom'
import axiosInstance from '@/api/axiosInstance'


const JobOfferCard = ({ _id, title, description, deadline }) => {
    console.log(_id)
    const navigate = useNavigate()
  const isUrgent = new Date(deadline) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return (
    <Card className="mb-6 border-orange-500 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-orange-500">{title}</CardTitle>
          <Badge className="bg-orange-500 text-white">
            Date limite: {new Date(deadline).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 break-words line-clamp-3" dangerouslySetInnerHTML={{ __html: description }}>
        </p>
      </CardContent>
      <CardFooter>
        <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={() => navigate(`/offer/${_id}`)}>Consulter</Button>
      </CardFooter>
    </Card>
  )
}

const OffersList = () => {
  const [offers, setOffers] = useState([])
  const [filteredOffers, setFilteredOffers] = useState(offers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchOffers = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(`/offers/`)
      setOffers(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  useEffect(() => {
    const filtered = offers.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = selectedDepartment === '' || job.department === selectedDepartment
      const matchesType = selectedType === '' || job.type === selectedType
      const isUrgent = new Date(job.deadline) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const matchesUrgency = !showUrgentOnly || isUrgent

      return matchesSearch && matchesDepartment && matchesType && matchesUrgency
    })

    setFilteredOffers(filtered)
  }, [searchTerm, selectedDepartment, selectedType, showUrgentOnly, offers])

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-orange-500">Offres d'emploi</h1>

      <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="search" className="text-orange-500">Recherche</Label>
          <Input
            id="search"
            placeholder="Rechercher un poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-orange-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOffers.length > 0 ? (
          filteredOffers.map(job => (
            <JobOfferCard key={job._id} {...job} />
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            Aucune offre d'emploi ne correspond à vos critères.
          </p>
        )}
      </div>
    </div>
  )
}

export default OffersList
