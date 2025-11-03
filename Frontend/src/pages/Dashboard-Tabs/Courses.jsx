import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axiosInstance from '@/api/axiosInstance';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectValue , SelectTrigger } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function Courses() {
  const { toast } = useToast();
  
  const token = localStorage.getItem('token');
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [ searchTerm, setSearchTerm ] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkboxTrue, setCheckboxTrue] = useState(false);

  const { isPending , error , data:courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  })

  const subscribeCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      return await axiosInstance.post(
        `/courses/subscribe`,
        { courseId, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      toast({
        title: 'Inscription réussie',
        description: 'Vous êtes inscrit à la formation avec succès.',
      });
      // Mettre à jour l'état local pour refléter l'inscription
      queryClient.invalidateQueries(['courses']);
      setSelectedCourseId(null);
      setIsLoading(false);
    },

    onError: (error) => {
      console.error('Erreur lors de l\'inscription à la formation:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'inscription à la formation.",
        variant: 'destructive',
      });
      setIsLoading(false);
    }
    });


  // Inscription à un cours
  const handleSubscribe = async () => {
    if (!selectedCourseId) return;
      setIsLoading(true);
      subscribeCourseMutation.mutate(selectedCourseId);
      
  };


  if(isPending){
    return  (
      <div className="flex justify-center items-center h-64">
      <p>Chargement en cours...</p>
    </div>
    )
  }

  if(error){
    return (
      <div className="flex justify-center items-center h-64">
      <p>Une erreur est survenue lors du chargement des cours.</p>
    </div>
    )
  }


  const filteredCourses = courses
  .filter(course => course.isValidate)
  .filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()))
  .filter(course => {
    if (checkboxTrue) {
      return Array.isArray(course.subscribers) && course.subscribers.includes(userId);
    }
    return true;
  })



  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Toutes les formations</CardTitle>
        <Input
        type="text"
        placeholder="Rechercher une formation..."
        className="border rounded p-2 w-full mt-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        />

      <div className="items-top flex space-x-2">
      <Checkbox id="mycourses" checked={checkboxTrue} onCheckedChange={(checked) => setCheckboxTrue(!!checked)} />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="mycourses"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Voir mes cours uniquement
        </label>
      </div>
    </div>
      </CardHeader>
      <CardContent>
        {filteredCourses.length === 0 ? (
          <p className="text-center">Aucune formation disponible.</p>
        ) : (
              <ul className="space-y-4">
                {filteredCourses.map((course) => (
                  <Card key={course._id} className="border border-gray-200 shadow-md">
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>Catégorie : <b>{course.category}</b></p>
                      { course.description.length > 100 ? (
                    <p
                      dangerouslySetInnerHTML={{ __html: course.description.slice(0, 100) + '...' }}
                      className="break-words text-ellipsis"
                    ></p>
                  ) : (
                    <p
                      dangerouslySetInnerHTML={{ __html: course.description }}
                      className="break-words text-ellipsis"
                    ></p>
                  )}
                      <p>{course.chapters?.length || 0} chapitres</p>
                    </CardContent>
                    <CardFooter>
                      {Array.isArray(course.subscribers) &&
                      course.subscribers.includes(userId) ? (
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => navigate(`/dashboard/coursePage/${course._id}`)}
                        >
                          Voir le cours
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => setSelectedCourseId(course._id)}
                              
                            >
                              {isLoading && selectedCourseId === course._id ? 'Chargement...' : "M'inscrire"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmer l'inscription</DialogTitle>
                            </DialogHeader>
                            <p>Voulez-vous vraiment vous inscrire à la formation "{course.title}" ?</p>
                            <DialogFooter>
                              <Button onClick={() => setSelectedCourseId(null)} variant="outline">
                                Annuler
                              </Button>
                              <Button
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={handleSubscribe}
                              >
                                Confirmer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </ul>
              )}
      </CardContent>
    </Card>
  );
  
}