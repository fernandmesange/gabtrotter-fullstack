import { Card, CardHeader,CardTitle ,CardContent,CardFooter} from '@/components/ui/card'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthProvider'
import { Button } from '@/components/ui/button'

import { useNavigate } from 'react-router-dom'
import axiosInstance from '@/api/axiosInstance'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'

export default function TrainerCourses() {
  const navigate = useNavigate();
  const { toast } = useToast()
  const [isLoading,setIsLoading] = useState(true);
  const token = localStorage.getItem('token');
  const { userId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  

  const { isPending , error , data:courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/trainer/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  })

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }


  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()));


  


  return (
    <Card>
        <CardHeader> 
            <CardTitle>Mes formations</CardTitle>
            <Input
                    type="text"
                    placeholder="Rechercher une formation..."
                    className="border rounded p-2 w-full mt-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
        </CardHeader>
        <CardContent>
              <ul>
              { filteredCourses.length > 0 ?
                courses.map((course,key) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p>Statut : { courses.isValidate ? 'Validée' : 'En cours de validation' }</p>
                        <p>Catégorie : <b>{course.category}</b></p>
                        <p dangerouslySetInnerHTML={{__html: course.description}} className='break-words'></p>
                        <p>{courses?.chapters?.length || 0} chapitres</p>
                        <p>{courses?.subscribes?.length || 0} élèves</p>

                      </CardContent> 
                      <CardFooter>
                        { course.isValidate ? <Button onClick={() => navigate(`/dashboard/course-management/${course._id}`)}>Gerer</Button> : " "}
                      </CardFooter>
                    </Card>
                  )) : <p>Aucune formation</p>
                }
              </ul>
                
              
        </CardContent>
    </Card>
  )
}
