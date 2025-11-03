import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Pencil, Trash2, FileDown, AlertTriangle, Image as ImageIcon, ArrowLeft, Eye, Check, Lock } from "lucide-react"
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthProvider'
import axiosInstance from '@/api/axiosInstance'


export default function CourseManagement() {
  const params = useParams()
  const id = params?.id
  const navigate = useNavigate();
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [course, setCourse] = useState(null)
  const { userId , role} = useAuth();
    const [newChapter, setNewChapter] = useState({
      title:'',
      description:'',
      type:'',
      file:null
    });
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [lockStatus, setLockStatus] = useState(false)

  const fetchCourse = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${id}`, {
        headers:{
          Authorization:  `Bearer ${localStorage.getItem('token')}`
        }
      })
      setCourse(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching course:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récuperer la formation",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCourse()
    }
  }, [id])

  const handleFileChange = (e) => {
    const {name, files} = e.target

    if(files.length > 0){
      const file = files[0];
      const maxSizeInMB = 10
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024

      if (file.size > maxSizeInBytes) {
        toast({
          title: "Erreur",
          description: "Le fichier doit être inférieur à 10 Mo.",
          variant: "destructive",
        })
        e.target.value = null
        return
      }

      if(file.type !== 'application/pdf') {
        toast({
          title: "Erreur",
          description: "Le fichier doit être au format PDF.",
          variant: "destructive",
        })
        e.target.value = null
        return
      }

      setNewChapter((prev) => ({ ...prev, [name]: file}));
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    //setIsAddingChapter(true)
    if (!newChapter.title || !newChapter.description || !newChapter.file) {
      toast({
        title: "Erreur",
        description: "Tous les champs doivent être remplis.",
        variant: "destructive",
      });
      return;
    }
    
    const formDataToSubmit = new FormData()
    for (const key in newChapter) {
      formDataToSubmit.append(key, newChapter[key])
    }

    formDataToSubmit.append('courseId', course._id );

    try {
      await axiosInstance.post(`/courses/addChapter`, 
        formDataToSubmit,
        {
          headers: {
            'Content-type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      toast({
        title: 'Chapitre ajouté avec succès',
        description: 'Le chapitre a été ajouté avec succès.',
      })

      setNewChapter({
        title:'',
        description:'',
        type:'',
        file:null
      })

      setIsOpen(false)



    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Erreur",
        description: error.response.data.message,
        variant: "destructive",
      })
    }
  }


  const handleDeleteEvent = async () => {
    try {
      await axiosInstance.delete(`/courses/delete/${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      toast({
        title: "Formation supprimé",
        description: "La formation a été supprimé avec succès.",
        variant: "",
      })
      setIsDeleteDialogOpen(false)
      navigate('/admin/dashboard')
      // Redirect to events list or home page
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "Failed to delete courses. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportParticipants = () => {
    const participants = course?.subscribers || []
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nom,Email\n"
      + participants.map(p => `${p.name},${p.email}`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `participants_${course.title}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Export réussi",
      description: "La liste des participants a été exportée au format CSV.",
    })
  }


  const handleLockChapter = async (chapterId) => {
    try{
      await axiosInstance.get(`/courses/lock/${id}/`+chapterId, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      toast({
        title: "Chapitre verrouillé",
        description: "Le chapitre a été verrouillé avec succès.",
        variant: "success",
      })
      window.location.reload()
    }catch(error){
      console.error('Error locking chapter:', error)
      toast({
        title: "Erreur",
        description: "Impossible de verrouiller le chapitre.",
        variant: "destructive",
      })
    }
    
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Formation non trouvée</CardTitle>
            <CardDescription>The requested  courses could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
        <Button variant="" onClick={() => navigate('/admin/dashboard?page=admin-courses')}>
  <ArrowLeft /> Retourner sur la liste
</Button>
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription><p className="break-words" dangerouslySetInnerHTML={{__html: course.description}}></p></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Status {course.isValidate ? <Badge className='px-2 bg-green-600'>Validée</Badge> : <Badge className='px-2 bg-red-600'>En attente de validation</Badge>}</span>
              </div>
              
            </div>
            
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
           <Dialog  open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild >
              <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Ajouter un chapitre</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Ajouter un chapitre</DialogTitle>
                  <DialogDescription>
                    Ajouter un chapitre ( titre , description , type de cours , cours en PDF )
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Titre
                    </Label>
                    <Input
                      id="title"
                      value={newChapter.title}
                      onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newChapter.description}
                      onChange={(e) => setNewChapter({...newChapter, description: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="Type de cours" className="text-right">
                      Type
                    </Label>
                    <Select onValueChange={(value) => setNewChapter({...newChapter, type: value})}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choisir un type de cours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson">Leçon</SelectItem>
                        <SelectItem value="evaluation">Evaluation</SelectItem>
                        <SelectItem value="exercise">Exercice</SelectItem>
                      </SelectContent>
                      </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Cours au format PDF
                    </Label>
                    <Input
                    type='file'
                      id="file"
                      name='file'
                      onChange={handleFileChange}
                      className="col-span-3"
                    />
                    {newChapter.file && <p className="mt-1 text-gray-600">Fichier sélectionné : {newChapter.file.name}</p>}
                  </div>
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
          <CardTitle>Liste des chapitres</CardTitle>
          
        </CardHeader>
        <CardContent>
          {
            course?.chapters?.length > 0 ?
            course.chapters.map((chapter,key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{chapter.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription  className='break-all'>
                    {chapter.description}
                  </CardDescription>
                <p className='text-md text-gray-500 font-bold pt-2'>
                  Status : {chapter.isLocked ? "Bloqué" : "Débloqué"}
                </p>
                </CardContent>
                <CardFooter className="space-x-3">
                <Button
    onClick={() => {
      window.open(chapter.file, '_blank'); // Ouvre le fichier dans un nouvel onglet
    }}
  >
    Voir le cours
  </Button>
  { role === "admin" && 
  (
      <Button onClick={ () => handleLockChapter(chapter._id)}> 
      <Eye className="mr-2 h-4 w-4" />
     {chapter.isLocked ? "Déverrouiller" : "Verrouiller"}
     </Button>
    
  )
}

{ role !== "admin" && chapter.isLocked && (
  <div>
  <p className='text-red-500 font-bold'>Ce cours est actuellement bloqué , demander a un Administrateur de le débloquer</p>
  </div>
  
)}
  
                </CardFooter>
              </Card>
            )) : <p>Aucun chapitres pour l&apos;instant</p>
          }
        </CardContent>
        
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des participants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              
              { course.subscribers && course.subscribers.length > 0 ? course.subscribers.map((participant, key) => (
                <TableRow key={key}>
                  {console.log(participant)}
                  <TableCell>{participant.fullname}</TableCell>
                  <TableCell>{participant.email}</TableCell>

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