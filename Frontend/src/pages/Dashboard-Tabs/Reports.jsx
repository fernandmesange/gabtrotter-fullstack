import React, { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, BarChart, MoreVertical, User, Calendar } from 'lucide-react'
import axios from 'axios'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axiosInstance from '@/api/axiosInstance'

const Reports = () => {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    const [selectedReport, setSelectedReport] = useState(null)
    const [viewType, setViewType] = useState('agents')
    const [searchTerm, setSearchTerm] = useState('')

    const handleResponseClick = (report) => {
        setSelectedReport(report)
    }

    const fetchReports = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(`/reports/`,{
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

    const filterReports = (reports) => {
        return reports.filter(report =>
            report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.userId.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const groupedReports = useMemo(() => {
        const filteredReports = filterReports(reports)
        if (viewType === 'agents') {
            return filteredReports.reduce((acc, report) => {
                const agentName = report.userId?.fullname
                if (!acc[agentName]) {
                    acc[agentName] = []
                }
                acc[agentName].push(report)
                return acc
            }, {})
        } else {
            return filteredReports.reduce((acc, report) => {
                const date = format(new Date(report.date), 'dd MMMM yyyy')
                if (!acc[date]) {
                    acc[date] = []
                }
                acc[date].push(report)
                return acc
            }, {})
        }
    }, [reports, viewType, searchTerm])

    const renderReportCard = (report) => (
        <Card key={report._id} className="p-4">
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
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {viewType === 'agents'
                    ? format(new Date(report.date), 'dd MMMM yyyy à HH:mm')
                    : report.userId.fullname
                }
            </p>
        </Card>
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Rapports</CardTitle>
                    <CardDescription>Tous les rapports créés</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Rechercher des rapports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <Tabs defaultValue="agents" className="w-full" onValueChange={setViewType}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="agents">
                                <User className="mr-2 h-4 w-4" />
                                Par agents
                            </TabsTrigger>
                            <TabsTrigger value="dates">
                                <Calendar className="mr-2 h-4 w-4" />
                                Par dates
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="agents">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : Object.keys(groupedReports).length > 0 ? (
                                <ScrollArea className="h-[400px]">
                                    {Object.entries(groupedReports).map(([agent, agentReports]) => (
                                        <div key={agent} className="mb-6">
                                            <h2 className="text-xl font-bold mb-2">{agent}</h2>
                                            <div className="space-y-4">
                                                {agentReports.map(report => renderReportCard(report))}
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Aucun rapport trouvé.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="dates">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : Object.keys(groupedReports).length > 0 ? (
                                <ScrollArea className="h-[400px]">
                                    {Object.entries(groupedReports).map(([date, dateReports]) => (
                                        <div key={date} className="mb-6">
                                            <h2 className="text-xl font-bold mb-2">{date}</h2>
                                            <div className="space-y-4">
                                                {dateReports.map(report => renderReportCard(report))}
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Aucun rapport trouvé.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

export default Reports

