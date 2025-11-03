import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, BarChart, MoreVertical } from "lucide-react"
import axios from 'axios'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Dialog,DialogTitle, DialogHeader, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import axiosInstance from '@/api/axiosInstance'

const AgentReports = () => {
    const {userId} = useAuth();
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    const [selectedReport, setSelectedReport] = useState(null);

    const handleResponseClick = (report) => {
        setSelectedReport(report);
    }
    const fetchReports = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(`/reports/user/${userId}`,{
              headers:{
                Authorization:  `Bearer ${localStorage.getItem('token')}`
              }
            })
            setReports(response.data)
        } catch (error) {
            console.error('Erreur lors de la récupération des rapports:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les rapports.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Rapports</CardTitle>
                    <CardDescription>Toutes les rapports créés</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : reports.length > 0 ? (
                        <ScrollArea className="h-[400px] ">
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <Card key={report.id} className="p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">{report.subject}</h3>
                                            <div className="flex items-center space-x-2">
                                            <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => handleResponseClick(report)}>
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Détails du rapport</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          {report && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{report.subject}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Date: {format(new Date(report.date), 'dd MMMM yyyy à HH:mm')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Contenu</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.content}</p>
                </div>
                {report.image && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Image</h3>
                    <img 
                      src={report.image} 
                      alt={report.subject}
                      className="w-full h-auto rounded-md shadow-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
                                                
                                            </div>
                        
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{report.userId.fullname}</p>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Aucune enquête trouvée.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AgentReports;