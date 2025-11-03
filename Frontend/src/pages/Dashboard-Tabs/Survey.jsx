import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, BarChart, MoreVertical } from "lucide-react"
import axios from 'axios'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import FormBuilder from '../FormBuilder'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { useNavigate } from 'react-router-dom'
import axiosInstance from '@/api/axiosInstance'

const Survey = () => {
    const navigate = useNavigate()
    const [surveys, setSurveys] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    const [surveyToDelete, setSurveyToDelete] = useState(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const fetchSurveys = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(`/surveys/`)
            setSurveys(response.data)
        } catch (error) {
            console.error('Erreur lors de la récupération des enquêtes:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les enquêtes.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSurveys()
    }, [])

    const handleDeleteClick = (survey) => {
        setSurveyToDelete(survey)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!surveyToDelete) return

        try {
            await axiosInstance.delete(`/surveys/${surveyToDelete._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            toast({
                title: "Succès",
                description: "L'enquête a été supprimée.",
            })
            fetchSurveys()
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'enquête:', error)
            toast({
                title: "Erreur",
                description: "Impossible de supprimer l'enquête.",
                variant: "destructive",
            })
        } finally {
            setIsDeleteDialogOpen(false)
            setSurveyToDelete(null)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Enquêtes</CardTitle>
                    <CardDescription>Toutes les enquêtes créées</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : surveys.length > 0 ? (
                        <ScrollArea className="h-[400px] ">
                            <div className="space-y-4">
                                {surveys.map((survey) => (
                                    <Card key={survey.id} className="p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">{survey.title}</h3>
                                            <div className="hidden md:flex items-center space-x-2">
                                                <Button variant="outline" size="icon" >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => navigate(`/admin/dashboard/survey-responses/${survey._id}`)}>
                                                    <BarChart className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDeleteClick(survey)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className='md:hidden'>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-40">
                                                <div className="flex flex-col items-stretch space-x-2 ">
                                                <Button variant="outline" size="icon" className="flex items-center space-x-2 w-30">
                                                    <p>Consulter</p>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="flex items-center space-x-2 w-30">
                                                    <p>Modifier</p>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="flex items-center space-x-2 w-30">
                                                    <p>Statistiques</p>
                                                    <BarChart className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(survey)} className="flex items-center space-x-2 w-30">
                                                    <p>Supprimer</p>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                                </PopoverContent>
                                            </Popover>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">{survey.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Aucune enquête trouvée.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette enquête ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Survey

   