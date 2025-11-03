import { useState, useEffect } from "react"
import { BarChart, User, MessageSquare, ClipboardList, Package, Home, Search, Bell, Settings, Menu, X, ChevronDown, Handshake, PhoneCall, Book } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Events from "./Dashboard-Tabs/Events"
import { useAuth } from "@/context/AuthProvider"
import Survey from "./Dashboard-Tabs/Survey"
import Users from "./Dashboard-Tabs/Users"
import { useLocation } from "react-router-dom"
import Reports from "./Dashboard-Tabs/Reports"
import CreateEvent from "./Dashboard-Tabs/Create-Event"
import CreateSurvey from "./Dashboard-Tabs/Create-Survey"
import CreateReport from "./Dashboard-Tabs/Create-Report"
import AgentReports from "./Dashboard-Tabs/AgentReports"
import HomeDashboard from "./Dashboard-Tabs/HomeDashboard."
import CreateOffer from "./Dashboard-Tabs/Create-offer"
import Offers from "./Dashboard-Tabs/Offers"
import CandidateList from "./Dashboard-Tabs/Candidate-List"
import Contact from "./Dashboard-Tabs/Contact"
import AgentStats from "./Dashboard-Tabs/AgentStats"
import AddCourse from "./Dashboard-Tabs/AddCourse"
import TrainerCourses from "./Dashboard-Tabs/TrainerCourses"
import AdminCourses from "./Dashboard-Tabs/AdminCourses"
import Courses from './Dashboard-Tabs/Courses'

export default function ResponsiveDashboard() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tabs = queryParams.get('tabs') || 'home';
  const page = queryParams.get('page')
  
  const { logout, role } = useAuth()
  const [open, setOpen] = useState(false)

  const [activeTab, setActiveTab] = useState(() => {
    if (role === 'beneficiary') return 'courses'
    if (role === 'admin' && page) return page
    return 'home'
  })


  useEffect(() => {
  if (role === 'admin' && page) {
    setActiveTab(page)
  }
}, [role, page])


  const navItems = [
    { 
      name: "Enquetes", 
      icon: ClipboardList, 
      id: "surveys",
      subItems: [
        { name: "Voir mes stats", id: "survey-stats" },
      ]
    },
    { 
      name: "Rapports", 
      icon: MessageSquare, 
      id: "reports",
      subItems: [
        { name: "Consulter mes rapports", id: "check-my-report" },
        { name: "Envoyer un rapport", id: "send-report" },
      ]
    },
  ]

  const navItemsBeneficiary = [
    
    { 
      name: "Formation", 
      icon: Book, 
      id: "courses",
      subItems: [
        { name: "Voir les Formation", id: "courses" },
      ]
    }
  ]

  const navItemsTrainer = [
    { 
      name: "Accueil", 
      icon: Home, 
      id: "home" 
    },
    { 
      name: "Formation", 
      icon: Book, 
      id: "courses",
      subItems: [
        { name: "Voir mes Formation", id: "trainer-courses" },
        { name: "Ajouter une formation", id:"add-course"},
      ]
    },
    { 
      name: "Rapports", 
      icon: MessageSquare, 
      id: "reports",
      subItems: [
        { name: "Consulter mes rapports", id: "check-my-report" },
        { name: "Envoyer un rapport", id: "send-report" },
      ]
    },
  ]

  const navItemsSupervisor = [
    { 
      name: "Accueil", 
      icon: Home, 
      id: "home" 
    },
    { 
      name: "Evenements", 
      icon: BarChart, 
      id: "events",
      subItems: [
        { name: "Créer un événement", id: "create-event" },
        { name: "Liste des événements", id: "event-list" },
      ]
    },
    { 
      name: "Enquetes", 
      icon: ClipboardList, 
      id: "surveys",
      subItems: [
        { name: "Créer une enquetes", id: "create-survey" },
        { name: "Gerer les enquetes", id: "survey-results" },
      ]
    },
    { 
      name: "Rapports", 
      icon: MessageSquare, 
      id: "reports",
      subItems: [
        { name: "Consulter les rapports", id: "check-report" },
        { name: "Envoyer un rapport", id: "send-report" },
      ]
    },
    { 
      name: "Formation", 
      icon: Book, 
      id: "courses",
      subItems: [
        { name: "Voir mes Formation", id: "trainer-courses" },
        { name: "Ajouter une formation", id:"add-course"},
      ]
    },
    { name: "Utilisateurs", icon: User, id: "users" },
    { name: "Matériel", icon: Package, id: "equipment" , subItems:[
      { name: "Consulter le materiel", id: "check-items" },
      { name: "Ajouter du materiel", id: "add-items" },
      { name: "Alouer du materiel", id: "allocate-items" },
    ]},
    { 
      name: "Offre d'emploi", 
      icon: Handshake, 
      id: "events",
      subItems: [
        { name: "Créer une offre", id: "create-offer" },
        { name: "Liste des offres", id: "offer-list" },
        { name: "Consulter les candidatures", id: "check-candidatures" },
      ]
    },
  ]

  const navItemsAdmin = [
    { 
      name: "Accueil", 
      icon: Home, 
      id: "home" 
    },
    { 
      name: "Evenements", 
      icon: BarChart, 
      id: "events",
      subItems: [
        { name: "Créer un événement", id: "create-event" },
        { name: "Liste des événements", id: "event-list" },
      ]
    },
    { 
      name: "Enquetes", 
      icon: ClipboardList, 
      id: "surveys",
      subItems: [
        { name: "Créer une enquetes", id: "create-survey" },
        { name: "Gerer les enquetes", id: "survey-results" },
      ]
    },
    { 
      name: "Formation", 
      icon: Book, 
      id: "courses",
      subItems: [
        { name: "Voir toutes les formation", id: "admin-courses" },
      ]
    },
    { 
      name: "Rapports", 
      icon: MessageSquare, 
      id: "reports",
      subItems: [
        { name: "Consulter les rapports", id: "check-report" },
        { name: "Envoyer un rapport", id: "send-report" },
      ]
    },
    { name: "Utilisateurs", icon: User, id: "users" },
    { name: "Matériel", icon: Package, id: "equipment" , subItems:[
      { name: "Consulter le materiel", id: "check-items" },
      { name: "Ajouter du materiel", id: "add-items" },
      { name: "Alouer du materiel", id: "allocate-items" },
    ]},
    { 
      name: "Offre d'emploi", 
      icon: Handshake, 
      id: "events",
      subItems: [
        { name: "Créer une offre", id: "create-offer" },
        { name: "Liste des offres", id: "offer-list" },
        { name: "Consulter les candidatures", id: "check-candidatures" },
      ]
    },
    { 
      name: "Contact", 
      icon: PhoneCall, 
      id: "contact",
      subItems: [
        { name: "Consulter les messages", id: "check-messages" },
        { name: "Repondre au message", id: "send-message" },
      ]
    },
  ]



  const Sidebar = ({ className = "" , onSelect}) => (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4">
        <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-2 px-2">
          {(role === 'admin' ? navItemsAdmin : role === 'supervisor' ? navItemsSupervisor : role === 'beneficiary' ?  navItemsBeneficiary : role === 'trainer' ? navItemsTrainer : navItems).map((item,key) => (
            item.subItems ? (
              <Collapsible key={key}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant={activeTab.startsWith(item.id) ? "secondary" : "ghost"}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Button
                      key={subItem.id}
                      variant={activeTab === subItem.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab(subItem.id)
                        onSelect?.()
                      } 
                      }
                    >
                      {subItem.name}
                    </Button>
                    
                  ))}
                  
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab(item.id)
                  onSelect?.()
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            )
          ))}
          <Button className="bg-orange-500"> <a href="../">Revenir sur le site</a></Button>
        </nav>
      </ScrollArea>
      <div className="p-4">
        <Button variant="destructive" className="w-full" onClick={logout}>
          Déconnexion
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:block w-64 bg-white shadow-md">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <Sidebar onSelect={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="search" placeholder="Rechercher..." className="pl-8" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button size="icon" variant="ghost">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <ScrollArea className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="home">
             <HomeDashboard/>
            </TabsContent>
            <TabsContent value="create-event">
              <CreateEvent/>
            </TabsContent>
            <TabsContent value="trainer-courses">
              <TrainerCourses/>
            </TabsContent>
            <TabsContent value="admin-courses">
              <AdminCourses/>
            </TabsContent>

            <TabsContent value="courses">
              <Courses/>
            </TabsContent>
            <TabsContent value='add-course'>
              <AddCourse/>
            </TabsContent>
            <TabsContent value="event-list">
              <Events />
            </TabsContent>
            <TabsContent value="create-survey">
              <CreateSurvey/>
            </TabsContent>
            <TabsContent value="survey-results">
              <Survey />
            </TabsContent>
            <TabsContent value="survey-stats">
            <AgentStats/>
            </TabsContent>
            <TabsContent value="check-my-report">
              <AgentReports/>
              </TabsContent>
            <TabsContent value="check-report">
             
              <Reports />
              {/* Add monthly report component here */}
            </TabsContent>
            <TabsContent value="send-report">
              <CreateReport/>
            </TabsContent>
            <TabsContent value="users">
              <Users />
            </TabsContent>
            <TabsContent value="equipment">
              {/* Equipment content (unchanged) */}
            </TabsContent>
            <TabsContent value="create-offer" >
              <CreateOffer/>
            </TabsContent>
            <TabsContent value="offer-list" >
            <Offers/>
            </TabsContent>
            <TabsContent value="check-candidatures" >
            <CandidateList/>
            </TabsContent>
            <TabsContent value="check-messages" >
            <Contact/>
            </TabsContent>
            <TabsContent value="send-messages" >
            <CandidateList/>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </main>
    </div>
  )
}