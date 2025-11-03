"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Plus, Send, Upload, Calendar, MapPin, DollarSign, Users } from "lucide-react"
import axios from 'axios'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import EventListItem from '@/components/Events-tab/EventListItems'
import { useAuth } from '@/context/AuthProvider'
import axiosInstance from '@/api/axiosInstance'

const CreateEvent = () => {
    const { role } = useAuth()
    const { toast } = useToast()
    const [events, setEvents] = useState([])
    const [step, setStep] = useState(1)
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        startDate: '',
        endDate: '',
        location: '',
        city:'',
        maximumPlaces: '',
        isFinance: false,
        financeName: '',
        isFree: true,
        price: '',
        createdBy: '670eee6e5fea75d0aeeb293b'
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => Math.min(prev + 1, 4))
    }
    const handlePrevious = (e) => {
        e.preventDefault();
        setStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 4) {
            await createEvent();
            setUploading(false);
            setProgress(0);
            setSelectedImage(null);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(file)
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
            simulateUpload()
        }
    }

    const simulateUpload = () => {
        setUploading(true)
        setProgress(0)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setUploading(false)
                    return 100
                }
                return prev + 10
            })
        }, 500)
    }



    const createEvent = async () => {
        const eventData = new FormData()
        Object.keys(formData).forEach(key => {
            eventData.append(key, formData[key])
        })
        
        if (selectedImage) {
            eventData.append('image', selectedImage)
        }else{
            console.log('No image selected')
        }

        try {
            await axiosInstance.post(`/events/create`, eventData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization:  `Bearer ${localStorage.getItem('token')}` },
            })
            toast({
                title: 'Événement créé avec succès',
                description: `L'événement ${formData.title} a été créé avec succès.`,
            })
            setStep(1)
            setFormData({
                title: '',
                description: '',
                type: '',
                startDate: '',
                endDate: '',
                location: '',
                maximumPlaces: '',
                isFinance: false,
                financeName: '',
                isFree: true,
                price: '',
                createdBy: '670eee6e5fea75d0aeeb293b'
            })
            setSelectedImage(null);
        } catch (error) {
            console.error('Erreur lors de la création de l\'événement:', error)
            toast({
                title: 'Erreur',
                description: 'Une erreur est survenue lors de la création de l\'événement.',
                variant: 'destructive',
            })
        }
    }

    useEffect(() => {
        
    }, [])

    const stepContent = [
        // Step 1
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'événement</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Entrez le titre de l'événement"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Décrivez votre événement"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Type d'événement</Label>
                    <Select name="type" onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Evenement">Événement</SelectItem>
                            <SelectItem value="Formation">Formation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </motion.div>,
        // Step 2
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Date de début</Label>
                        <div className="relative">
                            <Calendar className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate">Date de fin</Label>
                        <div className="relative">
                            <Calendar className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Lieu</Label>
                    <div className="relative">
                        <MapPin className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                        <Input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                            placeholder="Entrez le lieu de l'événement"
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Ville</Label>
                    <div className="relative">
                        <MapPin className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                        <Input
                            id="city"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            placeholder="Entrez la ville ou ce déroule l'événement"
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>
        </motion.div>,
        // Step 3
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Cet événement est-il financé par une autre entité ?</Label>
                    <RadioGroup
                        value={formData.isFinance.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, isFinance: value === "true" }))}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="finance-yes" />
                            <Label htmlFor="finance-yes">Oui</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="finance-no" />
                            <Label htmlFor="finance-no">Non</Label>
                        </div>
                    </RadioGroup>
                </div>
                {formData.isFinance && (
                    <div className="space-y-2">
                        <Label htmlFor="financeName">Nom de l'entité</Label>
                        <Input
                            id="financeName"
                            name="financeName"
                            type="text"
                            value={formData.financeName}
                            onChange={handleInputChange}
                            required
                            placeholder="Nom de l'entité finançant l'événement"
                        />
                    </div>
                )}
                <div className="space-y-2">
                    <Label>Cet événement est-il gratuit ?</Label>
                    <RadioGroup
                        value={formData.isFree.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, isFree: value === "true" }))}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="free-yes" />
                            <Label htmlFor="free-yes">Oui</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="free-no" />
                            <Label htmlFor="free-no">Non</Label>
                        </div>
                    </RadioGroup>
                </div>
                {!formData.isFree && (
                    <div className="space-y-2">
                        <Label htmlFor="price">Prix (en FCFA)</Label>
                        <div className="relative">
                            <DollarSign className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                placeholder="Prix de l'événement"
                                className="pl-10"
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>,
        // Step 4
        <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="maximumPlaces">Nombre de places</Label>
                        <div className="relative">
                            <Users className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="maximumPlaces"
                                name="maximumPlaces"
                                type="number"
                                value={formData.maximumPlaces}
                                onChange={handleInputChange}
                                required
                                placeholder="Nombre maximum de participants"
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ajouter une image</CardTitle>
                            <CardDescription>Choisissez une image représentative pour votre événement</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="image">Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                     name="image"
                                    onChange={handleImageUpload}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full"
                                >
                                    <Upload className="mr-2 h-4 w-4" /> Choisir une image
                                </Button>
                            </div>
                            {imagePreview && (
                                <div className="mt-4">
                                    <img
                                        src={imagePreview}
                                        alt="Aperçu"
                                        className="max-w-full h-auto rounded-lg shadow-md"
                                    />
                                </div>
                            )}
                            {uploading && (
                                <div className="space-y-2">
                                    <Progress value={progress}   className="w-full" />
                                    <p className="text-sm text-center">{progress}% uploadé</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </motion.div>
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            { role === 'admin' && (
                <Card className="mb-8">
                <CardHeader>
                <h2 className="text-2xl font-bold">Créer un événement</h2>
                    <CardDescription>Ajoutez un nouvel événement à votre calendrier</CardDescription>
                </CardHeader>
                <CardContent>

                <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    
                                    <Progress value={step * 25} className="w-full" />
                                    <AnimatePresence mode="wait">
                                        {stepContent[step - 1]}
                                    </AnimatePresence>
                                    <div className="flex justify-between pt-4">
                                        {step > 1 && (
                                            <Button onClick={handlePrevious} variant="outline" type="button">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Précédent
                                            </Button>
                                        )}
                                        {step < 4 ? (
                                            <Button onClick={handleNext} className="ml-auto" type="button">
                                                Suivant
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button type="submit" className="ml-auto bg-green-500 hover:bg-green-600">
                                                Publier l'événement
                                                <Send className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                </CardContent>
            </Card>
            )}
            
            
        </div>
    )
}

export default CreateEvent