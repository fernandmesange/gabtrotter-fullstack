import React, { useRef, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Upload, X } from 'lucide-react'
import { format } from 'date-fns'
import axiosInstance from '@/api/axiosInstance'

const CreateReport = () => {
    const { toast } = useToast()
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef(null)

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(file)
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const sendReport = async (e) => {
        e.preventDefault()
        if (content.length < 500) {
            toast({
                title: 'Erreur',
                description: 'Le contenu du rapport doit contenir au moins 500 caractères.',
                variant: 'destructive',
            })
            return
        }
        setUploading(true)
        const formData = new FormData()
        formData.append('subject', subject)
        formData.append('content', content)
        formData.append('date', date)
        if (selectedImage) {
            formData.append('image', selectedImage)
        }

        try {
            await axiosInstance.post(`/reports/create`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            toast({
                title: 'Rapport envoyé avec succès',
                description: `Le rapport a été envoyé avec succès.`,
            })
            setSubject('')
            setContent('')
            setDate(format(new Date(), 'yyyy-MM-dd'))
            setSelectedImage(null)
            setImagePreview(null)
        } catch (error) {
            console.error('Erreur lors de l\'envoi du rapport:', error)
            toast({
                title: 'Erreur',
                description: 'Une erreur est survenue lors de la création du rapport.',
                variant: 'destructive',
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Envoyer un rapport</CardTitle>
            </CardHeader>
            <CardContent>
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <p className="text-lg font-semibold">Envoi en cours...</p>
                        <Progress value={progress} className="w-full mt-4" />
                    </div>
                ) : (
                    <form onSubmit={sendReport} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Sujet du rapport</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Contenu du rapport</Label>
                            <p className="text-sm text-muted-foreground">
                                500 caractères minimum requis
                            </p>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                className="min-h-[150px]"
                                minLength={500}
                            />
                            <p className="text-sm text-muted-foreground">
                                Caractères: {content.length} / 500 minimum
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Image</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                ref={fileInputRef}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" /> Choisir une image
                            </Button>
                            {imagePreview && (
                                <div className="relative mt-4">
                                    <img
                                        src={imagePreview}
                                        alt="Aperçu"
                                        className="max-w-full h-auto rounded-lg shadow-md"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                            setSelectedImage(null)
                                            setImagePreview(null)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </CardContent>
            {!uploading && (
                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        onClick={sendReport}
                    >
                        Envoyer le rapport
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

export default CreateReport

