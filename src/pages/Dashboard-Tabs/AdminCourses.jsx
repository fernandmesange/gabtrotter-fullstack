import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';


export default function AdminCourses() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending , error , data } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const validateCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      return await axiosInstance.get(`/courses/validate/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: "La formation a été validée avec succès, elle est maintenant disponible sur la plateforme.",
      });
      // Met à jour l'état local pour éviter un rechargement complet.
      queryClient.invalidateQueries(['courses']);
    },
    onError: (error) => {
      console.error('Erreur lors de la validation de la formation:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de la validation de la formation.",
        variant: 'destructive',
      });
    }
  });

  if(isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Erreur lors du chargement des formations.
      </div>
    );
  }



  const filteredCourses = data.filter((course) =>
     course.title.toLowerCase().includes(searchTerm.toLowerCase())
  ); 



  return (
    <Card>
      <CardHeader>
        <CardTitle>Toutes les formations</CardTitle>
        <div className="mb-4">
          <Input
            type="text"
             placeholder="Rechercher une formation..."
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)}
             className="max-w-sm"
          />
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
                  <p>Statut : {course.isValidate ? 'Validée' : 'En cours de validation'}</p>
                  <p>Catégorie : <b>{course.category}</b></p>
                  
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
                  <p>{course.subscribes?.length || 0} élèves</p>
                </CardContent>
                <CardFooter>
                  {!course.isValidate ? (
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => validateCourseMutation.mutate(course._id)}
                      disabled={validateCourseMutation.isLoading}
                    >
                      {validateCourseMutation.isLoading ? 'Chargement...' : 'Valider le cours'}
                    </Button>
                  ) : (
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => navigate(`/dashboard/course-management/${course._id}`)}
                      
                    >
                      Voir les chapitres
                    </Button>
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
