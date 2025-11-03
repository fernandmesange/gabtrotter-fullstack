import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { Plus, Loader2, Pencil, Trash2, Eye } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { set } from 'date-fns'
import { useAuth } from '@/context/AuthProvider'
import { Textarea } from '@/components/ui/textarea'
import axiosInstance from '@/api/axiosInstance'


export default function Contact() {
  const { toast } = useToast()
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answer, setAnswer] = useState('')

  const handleClick = (Message) => {
    setSelectedMessage(Message);
  }


  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get(`/contact/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setMessages(response.data)
    } catch (error) {
      setError('Erreur lors de la récupération des messages')
      console.error('Erreur lors de la récupération des messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post(`/contact/answer/${selectedMessage._id}`, {
        answer: answer,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      toast({
        title: 'Réponse envoyée avec succès',
        description: 'Votre réponse a été envoyée avec succès',
      })
      fetchMessages()
    } catch (error) {
        toast({
          title: 'Erreur lors de l\'envoi de la réponse',
          description: 'Une erreur est survenue lors de l\'envoi de la réponse',
          variant: 'destructive',
        })
      console.error('Erreur lors de l\'envoi de la réponse:', error)
    }
  }
  

  

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className='flex flex-wrap items-center gap-6'>
          <CardTitle>Liste des messages</CardTitle>
          
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : messages.length === 0 ? ('Aucun message trouvé') : (
            <ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message,index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{message.name || 'N/A'}</TableCell>
                      <TableCell>{message.subject || 'N/A'}</TableCell>
                      <TableCell>{message.status ? <p className='p-2 bg-green-500 rounded-sm text-white'>Repondu</p> : <p className='p-2 bg-red-500 rounded-sm text-white'>Pas repondu</p>}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleClick(message)}>
                          <Eye className="h-4 w-4" />
                          </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <h1 className='text-lg font-bold'>Informations personnelles</h1>
                            <h2>Nom : {message.name}</h2>
                            <h2>Email : {message.email}</h2>
                            <h2>Sujet : {message.subject}</h2>
                            <p>Message: {message.message}</p>

                            <form className='flex flex-col gap-2' onSubmit={handleSubmitAnswer}>
                                <Label htmlFor="answers" className='text-md font-bold'>Votre reponses</Label>
                                <p className='text-red-500 text-sm font-bold'>Attention votre reponses sera visible par les admins , soyez respectueux dans vos propos</p>
                                <Textarea  id="answers" name="answers" rows="4" cols="50" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-50" value={answer} onChange={(e) => setAnswer(e.target.value)}/>
                                <Button type="submit" className="mt-4">Envoyer</Button>
                            </form>
                            
                          </DialogContent>
              </Dialog>
                       {/* <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleClickDelete(user._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        </DialogTrigger>
                        <DialogContent>
                          { user.role == 'admin' ? (
                            <h2 className='text-red-600 font-bold text-lg'>Vous ne pouvez pas supprimer un administrateur</h2>
                          ) : (
                            <>
                            <h2 className='font-bold text-lg'>Etes-vous sur de vouloir supprimer cette utilisateur</h2>
                            <div className="flex justify-end">
                              <Button variant="destructive" onClick={() => handleDelete(user._id)}>
                                Confirmer
                              </Button>
                              </div>
                            </>
                          )}
                          
                        </DialogContent>
                       </Dialog> */}
                        
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}