import React, { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from '@/hooks/use-toast'
import { CalendarIcon, CheckCircleIcon, MapPinIcon, ScanIcon } from "lucide-react"
import axios from 'axios'
import axiosInstance from '@/api/axiosInstance'



export default function CheckParticipants() {
    const { toast } = useToast()
  const [qrCodeData, setQrCodeData] = useState('')
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [scanner, setScanner] = useState(null)
  const [result,setResult] = useState(null);

  const checkOnServer = async (decodedText) => {
    try {
      const response = await axiosInstance.post(`/events/checkParticipants/`, {
        decodedText,selectedEvent
      }, {
        headers: {
          Authorization:  `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log(response.statusText, response.status);
  
      if (response.status === 200) {
        const data = response.data; // Obtenez les données directement ici
        toast({
          title: "Vérification réussie",
          description: `Participant vérifié: ${data.participant.name}`, // Modifiez ceci en fonction de la structure de votre réponse
        });
        setResult(true);
        setQrCodeData('')
      } else {
        toast({
          title: "Erreur de vérification",
          description: "Le participant n'a pas été trouvé ou n'est pas inscrit à cet événement.",
          variant: "destructive",
        });
        setQrCodeData('')
        setResult(false);
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de vérifier le participant. Veuillez réessayer.",
        variant: "destructive",
      });
      setQrCodeData('')
      setResult(false);
      console.error("Erreur lors de la vérification du participant:", error); // Ajoutez un log pour le débogage
    }
  }
  

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get(`/events/`,
          {
            headers:{
              Authorization : `Bearer ${localStorage.getItem('token')}`
            },
          });

          if(response.status === 200){
            const data = response.data;
            setEvents(data);
          }
          
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Cette personne n'est pas inscrite à cet événement.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      const config = {
        fps: 20,
        qrbox: { width: 500, height: 500 },
      }
      const newScanner = new Html5QrcodeScanner('reader', config, false)

      newScanner.render(
        (decodedText) => {
          setQrCodeData(decodedText)
          newScanner.clear().catch(error => {
            console.error('Erreur lors de l\'effacement du scanner:', error)
          })
          checkOnServer(decodedText)
        },
        (errorMessage) => {
          console.log(`QR Code Scan Error: ${errorMessage}`)
        }
      )

      setScanner(newScanner)

      return () => {
        newScanner.clear().catch(error => {
          console.error('Erreur lors de l\'effacement du scanner:', error)
        })
      }
    }
  }, [selectedEvent])

  const getSelectedEventDetails = () => {
    if (!selectedEvent) return null
    return events.find(event => event._id === selectedEvent)
  }

  const selectedEventDetails = getSelectedEventDetails()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vérification des Participants</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {events.length > 0 ? (
            events.map((event) => (
              <Card 
                key={event._id} 
                className={`cursor-pointer transition-shadow hover:shadow-lg ${selectedEvent === event._id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedEvent(event._id)}
              >
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{new Date(event.startDate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPinIcon className="mr-2 h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Aucun événement disponible.</p>
          )}
        </div>
      )}

      {selectedEvent && selectedEventDetails && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Événement Sélectionné: {selectedEventDetails.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2"><CalendarIcon className="inline mr-2" /> {new Date(selectedEventDetails.startDate).toLocaleString()}</p>
            <p className="mb-2"><MapPinIcon className="inline mr-2" /> {selectedEventDetails.location}</p>
            <p className="mb-4">{selectedEventDetails.description}</p>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scannez le QR CODE du participant :</h3>
              {qrCodeData && (
                <div className="p-4 bg-muted rounded-md overflow-auto">
                  <p className="font-medium ">Données du QR Code: {qrCodeData}</p>
                </div>
              )}
              <div id="reader" className=" w-full h-full mx-auto border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                <ScanIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  setQrCodeData('')
                  scanner?.render(() => {}, () => {})
                }}
              >
                Réinitialiser le Scanner
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {result && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Résultat de la Vérification</CardTitle>
            {result}
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              {result === false ? (
                <span className="text-red-500">
                  <XCircleIcon className="inline mr-2" />
                  Le participant n'est pas inscrit à cet événement.
                </span>
              ) : (
                <span className="text-green-500">
                  <CheckCircleIcon className="inline mr-2" />
                  Le participant est inscrit à cet événement.
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}