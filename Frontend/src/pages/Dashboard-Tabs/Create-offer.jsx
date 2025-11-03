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

const CreateOffer = () => {
    const { toast } = useToast()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState(format(new Date(), 'yyyy-MM-dd'))

    const [uploading, setUploading] = useState(false)


    const sendOffer = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('deadline', deadline)
        console.log(formData.get('title'))

        try {
            await axiosInstance.post(`/offers/create`, formData, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            toast({
                title: 'Offre crée avec succès',
                description: `Vous pouvez désormais consulter votre offre dans votre tableau de bord.`,
            })
            setTitle('')
            setDescription('')
            setDeadline(format(new Date(), 'yyyy-MM-dd'))
        } catch (error) {
            console.error('Erreur lors de la creation de l\'offre:', error)
            toast({
                title: 'Erreur',
                description: 'Une erreur est survenue lors de la création de l\'offre.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
            <CardTitle className="text-2xl font-bold mb-4">Créer une offre</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={sendOffer} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Titre de l'offre</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Description de l'offre</Label>
                        <EditorProvider >
      <Editor value={description} onChange={(e) => setDescription(e.target.value)} >
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnBulletList />
          <BtnNumberedList />

        </Toolbar>
      </Editor>
    </EditorProvider>
                    </div>
                    <Button
                    type="submit"
                    className="w-full"
                    disabled={uploading}
                    
                >
                    Creer l'offre
                </Button>
                </form>
            </CardContent>
            <CardFooter>
                
            </CardFooter>
        </Card>
    )
}

export default CreateOffer