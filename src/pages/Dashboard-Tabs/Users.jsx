import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { Plus, Loader2, Pencil, Trash2, Search } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthProvider'
import axiosInstance from '@/api/axiosInstance'

export default function Users() {
  const { toast } = useToast()
  const { role } = useAuth();
  const [roleUser, setRoleUSer] = useState('')
  const [email, setEmail] = useState('')
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [updateEmail, setUpdateEmail] = useState('')
  const [updateRole, setUpdateRole] = useState('')
  const [updateName, setUpdateName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleClick = (User) => {
    setSelectedUser(User);
    setUpdateEmail(User.email)
    setUpdateRole(User.role)
    setUpdateName(User.fullname)
  }

  const handleClickDelete = (user) => {
    setUserIdToDelete(user._id);
  }

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`/auth/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setUsers(response.data.users)
      setFilteredUsers(response.data.users)
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
      fetchUsers()
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
      await axiosInstance.post(`/auth/create-user`, 
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
      fetchUsers()
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

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = users.filter(user => 
      user.fullname?.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term) || 
      user.role?.toLowerCase().includes(term)
    )
    setFilteredUsers(filtered)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className='flex flex-wrap items-center gap-6'>
            <CardTitle>Liste des membres</CardTitle>
            {role === 'admin' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Ajouter un utilisateur
                  </Button>
                </DialogTrigger>
                
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                    <DialogDescription>
                      Entrez l'adresse e-mail du nouvel utilisateur pour l'ajouter au système.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Adresse e-mail
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="utilisateur@exemple.com"
                          className="col-span-3"
                          required
                        />
                        <Label htmlFor="role" className="text-left ml-2">Role</Label>
                        <Select id="role" name='role' className="col-span-3 " onValueChange={(value) => setRoleUSer(value)} value={roleUser}>
                          <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Role"></SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="supervisor">Superviseur</SelectItem>
                          <SelectItem value="agent">Agent de terrain</SelectItem>
                          <SelectItem value="beneficiary">Bénéficiaire</SelectItem>
                          <SelectItem value='trainer'>Formateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isAddingUser}>
                        {isAddingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isAddingUser ? 'Ajout en cours...' : 'Ajouter'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
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
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullname || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleClick(user)}>
                          <Pencil className="h-4 w-4" />
                          </Button>
                          </DialogTrigger>
                          <DialogContent>
                          <form onSubmit={(e) => handleUpdate(e, user._id)}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="email" className="text-right">
                                  Nom complet
                                </Label>
                                <Input
                                  id="fullname"
                                  name="fullname"
                                  type="text"
                                  value={updateName}
                                  onChange={(e) => setUpdateName(e.target.value)}
                                  placeholder="utilisateur@exemple.com"
                                  className="col-span-3"
                                  required
                                />
                                <Label htmlFor="email" className="text-right">
                                  Adresse e-mail
                                </Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={updateEmail}
                                  onChange={(e) => setUpdateEmail(e.target.value)}
                                  placeholder="utilisateur@exemple.com"
                                  className="col-span-3"
                                  required
                                />
                                <Label htmlFor="role" className="text-left ml-2">Role</Label>
                                <Select id="role" name='role' className="col-span-3 " onValueChange={(value) => setUpdateRole(value)} value={updateRole}>
                                  <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Role"></SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="supervisor">Superviseur</SelectItem>
                                  <SelectItem value="agent">Agent de terrain</SelectItem>
                                  <SelectItem value='beneficiary'>Bénéficiaire</SelectItem>
                                  <SelectItem value='trainer'>Formateur</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={isAddingUser}>
                                {isAddingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isAddingUser ? 'Mise à jour...' : 'Mettre à jour'}
                              </Button>
                            </DialogFooter>
                          </form>
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

