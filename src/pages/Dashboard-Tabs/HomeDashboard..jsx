import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Users, Calendar, ClipboardList, FileText } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'
import { useAuth } from '@/context/AuthProvider'
import axiosInstance from '@/api/axiosInstance'

const StatsCard = ({ title, value, description, icon: Icon }) => (
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

const SkeletonCard = () => (
  <Card className="shadow-md">
    <CardHeader className="space-y-0 pb-2">
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/3 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const HomeDashboard = () => {
  const {userId,role} = useAuth()
  const [userStats, setUserStats] = useState(null)
  const [eventStats, setEventStats] = useState(null)
  const [reportStats, setReportStats] = useState(null)
  const [surveyStats, setSurveyStats] = useState(null)
  const [offerStats, setOfferStats] = useState(null)
  const [coursesStats,setCoursesStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {

        if( role === 'admin' || role === 'supervisor'){
          const [userResponse, eventResponse, reportResponse, surveyResponse, offerResponse, coursesResponse] = await Promise.all([
            axiosInstance.get(`/stats/users`),
            axiosInstance.get(`/stats/activities`),
            axiosInstance.get(`/stats/reports`),
            axiosInstance.get(`/stats/surveys`),
            axiosInstance.get(`/stats/offers`),
            //axios.get(`${import.meta.env.VITE_API_URL}stats/courses/${userId}`),
          ])
          setUserStats(userResponse.data)
          setEventStats(eventResponse.data)
          setReportStats(reportResponse.data) 
          setSurveyStats(surveyResponse.data)
          setOfferStats(offerResponse.data)
          //setCoursesStats(coursesResponse.data)
        }else{
          const coursesResponse = await axiosInstance.get(`/stats/courses/${userId}`)
          setCoursesStats(coursesResponse.data)
        } 
        
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Une erreur est survenue lors du chargement des statistiques.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [role,userId])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(12)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }





    const userPieData =
    role === 'admin' || role === 'supervisor'
      ? [
          { name: 'Agents', value: userStats.agentsCount },
          { name: 'Autres utilisateurs', value: userStats.usersCount - userStats.agentsCount },
        ]
      : [];
  
      const eventBarData =
      eventStats && role !== 'trainer'
        ? [
            { name: 'Total', value: eventStats.eventsCount },
            { name: 'Disponibles', value: eventStats.availableEvents.length },
            { name: 'Nouveaux', value: eventStats.newEventsWeek },
          ]
        : [];


        const surveyBarData =
        surveyStats && role !== 'trainer'
          ? [
            { name: 'Total', value: surveyStats.surveysCount },
            { name: 'Réponses', value: surveyStats.surveysResponsesCount },
            { name: 'Nouvelles réponses', value: surveyStats.newSurveysResponsesWeek },
            { name: 'Nouveaux sondages', value: surveyStats.newSurveysWeek },
            ]
          : [];

          const reportLineData =
          reportStats && role !== 'trainer'
            ? [
              { name: 'Semaine 1', value: reportStats.reportsCount - reportStats.newReportsWeek },
      { name: 'Semaine 2', value: reportStats.reportsCount },
              ]
            : [];

          const offerBarData =
            offerStats && role !== 'trainer'
              ? [
                { name: 'Total', value: offerStats.offersCount },
      { name: 'Candidatures', value: offerStats.candidatesCounts },
                ]: [];

  
  

  return (
    <div className="space-y-6">
      {
        role === 'trainer' && (
          <Card>
        <CardHeader>
          <CardTitle>Statistiques des Formations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                  title="Nombre de formation"
                  value={coursesStats.coursesCount}
                  description="Nombre total de formations"
                  icon={Calendar}
                />
                <StatsCard
                  title="Événements disponibles"
                  value={coursesStats.availableCourses.length}
                  description="Nombre de formations actuellement disponibles"
                  icon={Calendar}
                />
                <StatsCard
                  title="Nombres d'élèves"
                  value={coursesStats.participantsCount}
                  description="Nombre de participants"
                  icon={Calendar}
                />
                
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>
        )
      }
      {
        (role == "admin" || role == "supervisor") && (
          <>
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                  title="Nombre d'agents"
                  value={userStats.agentsCount}
                  description="Nombre total d'agents actifs"
                  icon={Users}
                />
                <StatsCard
                  title="Nombre d'utilisateurs"
                  value={userStats.usersCount}
                  description="Nombre total d'utilisateurs"
                  icon={Users}
                />
                <StatsCard
                  title="Pourcentage d'agents"
                  value={`${userStats.agentsPercentage.toFixed(1)}%`}
                  description="Pourcentage d'agents par rapport aux utilisateurs"
                  icon={Users}
                />
                <StatsCard
                  title="Nouveaux utilisateurs"
                  value={"+"+userStats.newUsersWeek}
                  description="Utilisateurs inscrits cette semaine"
                  icon={Users}
                />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      


      <Card>
        <CardHeader>
          <CardTitle>Statistiques des événements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                  title="Nombre d'événements"
                  value={eventStats.eventsCount}
                  description="Nombre total d'événements"
                  icon={Calendar}
                />
                <StatsCard
                  title="Événements disponibles"
                  value={eventStats.availableEvents.length}
                  description="Nombre d'événements actuellement disponibles"
                  icon={Calendar}
                />
                <StatsCard
                  title="Nouveaux événements"
                  value={"+"+eventStats.newEventsWeek}
                  description="Événements créés cette semaine"
                  icon={Calendar}
                />
                <StatsCard
                  title="Nombre d'inscriptions"
                  value={eventStats.participantsCount}
                  description="Nombre total d'inscriptions"
                  icon={Calendar}
                />
              </div>
            </div>
            
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventBarData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques des sondages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                  title="Nombre de sondages"
                  value={surveyStats.surveysCount}
                  description="Nombre total de sondages"
                  icon={ClipboardList}
                />
                <StatsCard
                  title="Réponses aux sondages"
                  value={surveyStats.surveysResponsesCount}
                  description="Nombre total de réponses aux sondages"
                  icon={ClipboardList}
                />
                <StatsCard
                  title="Nouvelles réponses"
                  value={"+"+surveyStats.newSurveysResponsesWeek}
                  description="Nouvelles réponses cette semaine"
                  icon={ClipboardList}
                />
                <StatsCard
                  title="Nouveaux sondages"
                  value={surveyStats.newSurveysWeek}
                  description="Sondages créés cette semaine"
                  icon={ClipboardList}
                />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surveyBarData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques des rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                  title="Nombre de rapports"
                  value={reportStats.reportsCount}
                  description="Nombre total de rapports"
                  icon={FileText}
                />
                <StatsCard
                  title="Nouveaux rapports"
                  value={"+"+reportStats.newReportsWeek}
                  description="Rapports créés cette semaine"
                  icon={FileText}
                />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportLineData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend /> 
                  <Line type="monotone" dataKey="value" stroke="#FF8042" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques des offres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                  title="Nombre d'offres'"
                  value={offerStats.offersCount}
                  description="Nombre total d'offres"
                  icon={FileText}
                />
                <StatsCard
                  title="Nombre de candidatures"
                  value={"+"+offerStats.candidatesCount}
                  description="Nombres de candidatures"
                  icon={FileText}
                />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={offerBarData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
        )
}
    
    </div>
  )
}

export default HomeDashboard