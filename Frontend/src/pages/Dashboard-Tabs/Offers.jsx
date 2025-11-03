'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, BarChart, MoreVertical, Pencil, FileText, Paperclip } from "lucide-react"
import axios from 'axios'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthProvider'
import { 
    BtnBold,
    BtnItalic,
    BtnUnderline,
    BtnBulletList,
    BtnNumberedList,
    Editor,
    EditorProvider,
    Toolbar
  } from 'react-simple-wysiwyg';
import axiosInstance from '@/api/axiosInstance'


const Offers = () => {
    const navigate = useNavigate()
    const [offers, setOffers] = useState([])
    const [updateTitle, setUpdateTitle] = useState('')
    const [updateDescription, setUpdateDescription] = useState('')
    const [updateDeadline, setUpdateDeadline] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [isLoading, setIsLoading] = useState(true)
    const [userIdToDelete, setUserIdToDelete] = useState(null)
    const { toast } = useToast()
    const [selectedOffer, setSelectedOffer] = useState(null)
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const [showCandidates, setShowCandidates] = useState(false)

    const handleResponseClick = (offer) => {
        setSelectedOffer(offer)
    }

    const handleClick = (offer) => {
        setSelectedOffer(offer)
        setUpdateTitle(offer.title)
        setUpdateDescription(offer.description)
        setUpdateDeadline(format(new Date(offer.deadline), 'yyyy-MM-dd'))
    }
    
    const handleClickDelete = (user) => {
        setUserIdToDelete(user._id)
    }

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/offers/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            toast({
                title: 'Offre supprimée avec succès',
                description: 'L\'offre a été supprimée avec succès.',
            })
            fetchOffers()
        } catch (error) {
            toast({
                title: 'Erreur lors de la suppression de l\'offre',
                description: 'Une erreur est survenue lors de la suppression de l\'offre.',
            })
        }
    }

    const handleUpdate = async (e, id) => {
        e.preventDefault()
        try {
            await axiosInstance.put(`/offers/update/${id}`, {
                title: updateTitle,
                description: updateDescription,
                deadline: updateDeadline
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            toast({
                title: 'Offre mise à jour avec succès',
                description: 'L\'offre a été mise à jour avec succès.',
            })
            fetchOffers()
        } catch(error) {
            toast({
                title: 'Erreur lors de la mise à jour de l\'offre',
                description: 'Une erreur est survenue lors de la mise à jour de l\'offre.',
                variant: 'destructive',
            })
            console.error('Erreur lors de la mise à jour de l\'offre:', error)
        }
    }

    const fetchOffers = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(`/offers/`)
            setOffers(response.data)
        } catch (error) {
            console.error('Erreur lors de la récupération des offres:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les offres.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOffers()
    }, [])

    const handleViewCandidates = (offer) => {
        setSelectedOffer(offer)
        setShowCandidates(true)
    }

    const handleViewCandidateDetails = (candidate) => {
        setSelectedCandidate(candidate)
    }

    const handleExportParticipants = () => {
      const participants = selectedOffer?.candidates || [];
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Nom,Email,Téléphone,CV,Fichier Optionnel\n"
        + participants.map(p => `${p.name},${p.email},${p.phone},${p.file},${p.optionalFile || 'N/A'}`).join("\n");
  
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `candidatures_${selectedOffer.title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      toast({
        title: "Export réussi",
        description: "La liste des participants a été exportée au format CSV.",
      });
  };
  

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Offres</CardTitle>
                    <CardDescription>Toutes les offres créées</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : offers.length > 0 ? (
                        <ScrollArea className="h-[400px] ">
                            <div className="space-y-4">
                                {offers.map((offer) => (
                                    <Card key={offer._id} className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col space-x-2">
                                                <h3 className="text-lg font-semibold">{offer.title}</h3>
                                                <Button variant="outline" size="sm" className="w-max px-2" onClick={() => handleViewCandidates(offer)}>
                                                    Voir les candidatures
                                                </Button>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleClick(offer)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <form onSubmit={(e) => handleUpdate(e, offer._id)}>
                                                            <div className="grid gap-4 py-4">
                                                                <div className=" items-center gap-4">
                                                                    <Label htmlFor="title" className="text-right">Titre</Label>
                                                                    <Input
                                                                        id="title"
                                                                        name="title"
                                                                        type="text"
                                                                        value={updateTitle}
                                                                        onChange={(e) => setUpdateTitle(e.target.value)}
                                                                        placeholder="Titre de l'offre"
                                                                        className="col-span-3"
                                                                        required
                                                                    />
                                                                    <Label htmlFor="deadline" className="text-right">Deadline</Label>
                                                                    <Input
                                                                        id="deadline"
                                                                        name="deadline"
                                                                        type="date"
                                                                        value={updateDeadline}
                                                                        onChange={(e) => setUpdateDeadline(e.target.value)}
                                                                        className="col-span-3"
                                                                        required
                                                                    />
                                                                    <div className='w-full'>
                                                                    <Label htmlFor="description" className="text-right">Description</Label>
                                                                    
       <ScrollArea className="h-[200px]">
                                                                    <EditorProvider className='w-full'>
  <Editor value={updateDescription} onChange={(e) => setUpdateDescription(e.target.value)} className='w-min'>
    <Toolbar>
      <BtnBold />
      <BtnItalic />
      <BtnUnderline />
      <BtnBulletList />
      <BtnNumberedList />
    </Toolbar>
  </Editor>
</EditorProvider>
</ScrollArea>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="submit">Modifier</Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="icon" onClick={() => handleResponseClick(offer)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[600px]">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl font-bold">Détails de l'offre</DialogTitle>
                                                        </DialogHeader>
                                                        <ScrollArea className="h-[60vh] mt-4">
                                                            {offer && (
                                                                <Card>
                                                                    <CardHeader>
                                                                        <CardTitle className="text-xl font-semibold">Titre: {offer.title}</CardTitle>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Date Limite: {format(new Date(offer.deadline), 'dd MMMM yyyy à HH:mm')}
                                                                        </p>
                                                                    </CardHeader>
                                                                    <CardContent className="space-y-4">
                                                                        <div>
                                                                            <h3 className="text-lg font-medium mb-2">Description</h3>
                                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{offer.description}</p>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            )}
                                                        </ScrollArea>
                                                    </DialogContent>
                                                </Dialog>    
                                                <Button variant="outline" size="icon" className="bg-red-500" onClick={() => handleDelete(offer._id)}>
                                                    <Trash2 className="h-4 w-4 text-white" />
                                                </Button>                                        
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Aucune offre trouvée.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
    <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Candidatures pour {selectedOffer?.title}</DialogTitle>
            <Button onClick={handleExportParticipants} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Exporter les candidatures
            </Button>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
            {selectedOffer?.candidates.length > 0 ? (
                selectedOffer.candidates.map((candidate) => (
                    <Card key={candidate._id} className="mb-4 cursor-pointer hover:bg-gray-100" onClick={() => handleViewCandidateDetails(candidate)}>
                        <CardHeader>
                            <CardTitle>{candidate.name}</CardTitle>
                            <CardDescription>{candidate.email}</CardDescription>
                        </CardHeader>
                    </Card>
                ))
            ) : (
                <p className="text-center text-gray-500 py-8">Aucune candidature pour cette offre.</p>
            )}
        </ScrollArea>
    </DialogContent>
</Dialog>


            <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Détails du candidat</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {selectedCandidate && (
                            <>
                                <p><strong>Nom:</strong> {selectedCandidate.name}</p>
                                <p><strong>Email:</strong> {selectedCandidate.email}</p>
                                <p><strong>Téléphone:</strong> {selectedCandidate.phone}</p>
                                <div className="mt-4">
                                    <Button asChild className="mr-2">
                                        <a href={selectedCandidate.file} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Voir le CV
                                        </a>
                                    </Button>
                                    {selectedCandidate.optionalFile && (
                                        <Button asChild variant="outline">
                                            <a href={selectedCandidate.optionalFile} target="_blank" rel="noopener noreferrer">
                                                <Paperclip className="mr-2 h-4 w-4" />
                                                Voir le fichier optionnel
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Offers