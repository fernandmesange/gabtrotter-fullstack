import { Card,CardHeader, CardTitle, CardContent, } from '@/components/ui/card'
import { useState }from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import axios from 'axios';
import { useToast } from '@/hooks/use-toast'
import axiosInstance from '@/api/axiosInstance'

export default function AddCourse() {

    const [title,setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')

    const { toast } = useToast()

    const sendCourses = async (e) => {
       e.preventDefault()
       const data = {
        title,
        description,
        category
       }

        try {
            await axiosInstance.post(`/courses/create`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },

            })
            toast({
                title: 'Formation créer avec succées',
                description: `Votre formation est en cours de validation.`,
            })
            setTitle('')
            setDescription('')
            setCategory('')
        } catch (error) {
            console.error('Erreur lors de la creation de la formation', error)
            toast({
                title: 'Erreur',
                description: 'Une erreur est survenue lors de la création de la formation.',
                variant: 'destructive',
            })
        }
    }
  return (
    <Card>
        <CardHeader>
            <CardTitle>Ajouter une formation</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={sendCourses} className='space-y-4'>
            <div className="space-y-2">
                <Label htmlFor="subject">Titre de la formation</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">Catégories</Label>
                <Select
                    id="category"
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                    required
                >
                    <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choisir une catégorie"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="santé">Santé</SelectItem>
                        <SelectItem value="droitt">Droit</SelectItem>
                        <SelectItem value="bien-être">Bien-être</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="éducation">Education</SelectItem>
                        <SelectItem value="informatique">Informatique</SelectItem>
                        <SelectItem value="éléctronique">Eléctronique</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type='submit'>Ajouter</Button>
            </form>
        </CardContent>
    </Card>
  )
}
