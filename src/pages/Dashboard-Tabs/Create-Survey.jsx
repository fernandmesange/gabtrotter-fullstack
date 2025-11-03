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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
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

const CreateSurvey = () => {
    const navigate = useNavigate()
    const [surveys, setSurveys] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

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

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/surveys/${id}`,{
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
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex  flex-col justify-between gap-3 items-start mb-6">
                <Card>
                <FormBuilder />
                </Card>      
                        

            </div>
            
            
        </div>
    )
}

export default CreateSurvey