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
import axiosInstance from '@/api/axiosInstance'


export default function CandidateList() {
  const { toast } = useToast()
  const { role } = useAuth();
  const [roleUser, setRoleUSer] = useState('')
  const [email, setEmail] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [updateEmail, setUpdateEmail] = useState('')
  const [updateRole, setUpdateRole] = useState('')
  const [updateName, setUpdateName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddingUser, setIsAddingUser] = useState(false)

  const handleClick = (User) => {
    setSelectedUser(User);
    setUpdateEmail(User.email)
    setUpdateRole(User.role)
    setUpdateName(User.fullname)
  }

  const handleClickDelete = (user) => {
    setUserIdToDelete(user._id);
  }

  const fetchCandidates = async () => {
    try {
      const response = await axiosInstance.get(`/offers/candidates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setUsers(response.data.users)
    } catch (error) {
      setError('Erreur lors de la récupération des utilisateurs')
      console.error('Erreur lors de la récupération des utilisateurs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/auth/delete-user/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      toast({
        title: 'Utilisateur supprimé avec succès',
        description: 'L\'utilisateur a été supprimé avec succès.',
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: 'Erreur lors de la suppression de l\'utilisateur',
        description: 'Une erreur est survenue lors de la suppression de l\'utilisateur.',
      })
    }
  }

  const handleUpdate = async (e,id) => {
    e.preventDefault();
    setIsAddingUser(true)

    try {
      await axiosInstance.put(`/auth/update-user/${id}`, {
        email: updateEmail,
        role: updateRole,
        fullname: updateName
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      toast({
        title: 'Utilisateur mis à jour avec succès',
        description: 'L\'utilisateur a été mis à jour avec succès.',
      })
      fetchCandidates()
    }catch(error){
      toast({
        title: 'Erreur lors de la mise à jour de l\'utilisateur',
        description: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.',
        variant: 'destructive',
      })
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    }finally {
      setIsAddingUser(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsAddingUser(true)
    try {
      await axiosInstance.post(`$/auth/create-user`, 
        { email,roleUser },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      toast({
        title: 'Utilisateur créé avec succès',
        description: 'L\'utilisateur a été créé avec succès.',
      })
      fetchCandidates()
    } catch (error) {
      toast({
        title: 'Erreur lors de la création de l\'utilisateur',
        description: 'Une erreur est survenue lors de la création de l\'utilisateur.',
        variant: 'destructive',
      })
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error)
    } finally {
      setIsAddingUser(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className='flex flex-wrap items-center gap-6'>
          <CardTitle>Liste des candidatures</CardTitle>
          
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Offres</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullname || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleClick(user)}>
                          <Eye className="h-4 w-4" />
                          </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <h2>Nom : </h2>
                          </DialogContent>
              </Dialog>
                       <Dialog>
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
                       </Dialog>
                        
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