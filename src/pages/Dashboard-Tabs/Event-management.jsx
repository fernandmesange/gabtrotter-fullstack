import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, DollarSign, Users, Pencil, Trash2, FileDown, AlertTriangle, Image as ImageIcon, ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import axiosInstance from '@/api/axiosInstance'


export default function EventManagement() {
  const params = useParams()
  const id = params?.id
  const navigate = useNavigate();
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editedEvent, setEditedEvent] = useState(null)

  const fetchEvent = async () => {
    try {
      const response = await axiosInstance.get(`/events/${id}`, {
        headers:{
          Authorization:  `Bearer ${localStorage.getItem('token')}`
        }
      })
      setEvent(response.data)
      setEditedEvent(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [id])

  const handleEditEvent = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.put(`/events/update/${id}`, editedEvent,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setEvent(editedEvent)
      toast({
        title: "Événement mis à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async () => {
    try {
      await axiosInstance.delete(`/events/delete/${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
        variant: "destructive",
      })
      setIsDeleteDialogOpen(false)
      navigate('/admin/dashboard')
      // Redirect to events list or home page
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportParticipants = () => {
    const participants = event?.participants || []
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nom,Email,Telephone,Ville\n"
      + participants.map(p => `${p.name},${p.email},${p.phone},${p.location}`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `participants_${event.title}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Export réussi",
      description: "La liste des participants a été exportée au format CSV.",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>The requested event could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
        <Button variant="" onClick={() => navigate('/admin/dashboard')}><ArrowLeft/> Retourner sur la liste</Button>   
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Debut: {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Fin: {format(new Date(event.endDate), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{event.city}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>{event.isFree ? 'Gratuit' : `${event.price} FCFA`}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>{event.availablePlaces} / {event.maximumPlaces} places disponibles</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Status {event.isAvailable ? <Badge className='px-2 bg-green-600'>Disponible</Badge> : <Badge className='px-2 bg-red-600'>Indisponible</Badge>}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Inscription {event.open ? <Badge className='px-2 bg-green-600'>Ouverte</Badge> : <Badge className='px-2 bg-red-600'>Fermée</Badge>}</span>
              </div>
              {event.isFinance && (
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Financé par: {event.financeName}</span>
                </div>
              )}
            </div>
            <div className="relative aspect-video">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg w-max h-full  aspect-square"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Modifier</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleEditEvent}>
                <DialogHeader>
                  <DialogTitle>Modifier l'événement</DialogTitle>
                  <DialogDescription>
                    Apportez les modifications nécessaires à votre événement ici.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Titre
                    </Label>
                    <Input
                      id="title"
                      value={editedEvent.title}
                      onChange={(e) => setEditedEvent({...editedEvent, title: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={editedEvent.description}
                      onChange={(e) => setEditedEvent({...editedEvent, description: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Date de début
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={format(new Date(editedEvent.startDate), "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setEditedEvent({...editedEvent, startDate: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      Date de fin
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={format(new Date(editedEvent.endDate), "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setEditedEvent({...editedEvent, endDate: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Lieu
                    </Label>
                    <Input
                      id="location"
                      value={editedEvent.location}
                      onChange={(e) => setEditedEvent({...editedEvent, location: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">
                      Ville
                    </Label>
                    <Input
                      id="city"
                      value={editedEvent.city}
                      onChange={(e) => setEditedEvent({...editedEvent, city: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select 
                      value={editedEvent.type} 
                      onValueChange={(value) => setEditedEvent({...editedEvent, type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Evenement">Événement</SelectItem>
                        <SelectItem value="Formation">Formation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isFree" className="text-right">
                      Gratuit
                    </Label>
                    <Select 
                      value={editedEvent.isFree.toString()} 
                      onValueChange={(value) => setEditedEvent({...editedEvent, isFree: value === 'true'})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Oui</SelectItem>
                        <SelectItem value="false">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!editedEvent.isFree && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Prix
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={editedEvent.price || ''}
                        onChange={(e) => setEditedEvent({...editedEvent, price: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maximumPlaces" className="text-right">
                      Places max
                    </Label>
                    <Input
                      id="maximumPlaces"
                      type="number"
                      value={editedEvent.maximumPlaces}
                      onChange={(e) => setEditedEvent({...editedEvent, maximumPlaces: parseInt(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isFinance" className="text-right">
                      Financé
                    </Label>
                    <Select 
                      value={editedEvent.isFinance.toString()} 
                      onValueChange={(value) => setEditedEvent({...editedEvent, isFinance: value === 'true'})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Oui</SelectItem>
                        <SelectItem value="false">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isFinance" className="text-right">
                      Statut
                    </Label>
                    <RadioGroup defaultValue={editedEvent.isAvailable} onValueChange={(value) => setEditedEvent({...editedEvent, isAvailable: value})}>
                    <div className="flex items-center space-x-2">
    <RadioGroupItem value={true} id="available" />
    <Label htmlFor="available">Disponible</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value={false} id="unavailble" />
    <Label htmlFor="unavailable">Indisponible</Label>
  </div>
  </RadioGroup>
                    
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isFinance" className="text-right">
                      Inscription
                    </Label>
                    <RadioGroup defaultValue={editedEvent.open} onValueChange={(value) => setEditedEvent({...editedEvent, open: value})}>
                    <div className="flex items-center space-x-2">
    <RadioGroupItem value={true} id="open" />
    <Label htmlFor="available">Ouverte</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value={false} id="close" />
    <Label htmlFor="unavailable">Fermée</Label>
  </div>
  </RadioGroup>
                    
                  </div>
                  {editedEvent.isFinance && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="financeName" className="text-right">
                        Financeur
                      </Label>
                      <Input
                        id="financeName"
                        value={editedEvent.financeName || ''}
                        onChange={(e) => setEditedEvent({...editedEvent, financeName: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Enregistrer les modifications</Button>
                
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center py-4">
                <AlertTriangle className="h-16 w-16 text-yellow-500" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
                <Button variant="destructive" onClick={handleDeleteEvent}>Supprimer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des participants</CardTitle>
          <CardDescription>
            {event.availablePlaces} places disponibles sur {event.maximumPlaces}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telephone</TableHead>
                <TableHead>Ville</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>

              { event.participants && event.participants.length > 0 ? event.participants.map((participant) => (
                <TableRow key={participant.id}>
                  {console.log(participant)}
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>{participant.phone}</TableCell>
                  <TableCell>{participant.location}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell></TableCell></TableRow>}
              
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4 justify-between">
          <Button onClick={handleExportParticipants}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter vers Excel
          </Button>
          <Button onClick={() => navigate(`/event/checkParticipation/`)}>Verifier les participants</Button>
        </CardFooter>
      </Card>
    </div>
  )
}