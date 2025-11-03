import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPinIcon, TicketIcon, BanknoteIcon } from "lucide-react";
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import ReCAPTCHA from 'react-google-recaptcha'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import axiosInstance from '@/api/axiosInstance';

export default function EventPage() {
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [location,setLocation] = useState('');
  const params = useParams();
  const id = params?.id;
  const captchaRef = useRef(null)

  const fetchEvent = async () => {
    if (!id) {
      setError("Identifiant de l'événement manquant.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`/events/public/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError("Impossible de charger les détails de l'événement. Veuillez réessayer plus tard.");
      toast({
        title: "Erreur",
        description: "Échec du chargement des détails de l'événement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = captchaRef.current.getValue();

    if (!token) {
      toast({
        title: "Validation du Captcha requise",
        description: "Veuillez valider le captcha pour continuer.",
        variant: "destructive",
      });
      return;
    }

    captchaRef.current.reset();
    if (!consent) {
      toast({
        title: "Consentement requis",
        description: "Veuillez accepter les conditions d'utilisation avant de continuer.",
        variant: "destructive",
      });
      return;
    }
    try {
      await axiosInstance.post(`/events/register`, {
        eventId: id,
        name,
        email,
        phone,
        location
      });
      localStorage.setItem(`registration-${id}`, JSON.stringify({isRegistered: true, eventId: id}));
      setIsAlreadyRegistered(true);
      toast({
        variant: "success",
        title: "Inscription réussie",
        description: "Vous recevrez un email de confirmation",
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Erreur",
        description: "Échec de l'inscription à l'événement.",
        variant: "destructive",
      });
    }finally{
      setName('');
      setEmail('');
      setPhone('');
      setLocation('');
      setConsent(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    if(localStorage.getItem(`registration-${id}`)){
      setIsAlreadyRegistered(JSON.parse(localStorage.getItem(`registration-${id}`)).isRegistered);
    }
  }, [id]);

  const formatDate = (date) => {
    return format(parseISO(date), "d MMMM yyyy", { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <p className="text-gray-500 text-center">Aucun événement trouvé.</p>
      </div>
    );
  }

  const isEventFull = event.availablePlaces === 0;
  const registrationButtonText = isEventFull
    ? "Complet"
    : event.isFree
    ? "S'inscrire gratuitement"
    : `S'inscrire (${event.price} FCFA)`;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="overflow-hidden">
            <div className="relative h-64 sm:h-96">
              <img
                src={event.image}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">{event.title}</CardTitle>
                  <Badge variant="secondary" className="mb-2">
                    {event.type}
                  </Badge>
                </div>
                <Badge variant={event.isFree ? "secondary" : "default"} className="text-lg mt-2 sm:mt-0">
                  {event.isFree ? "Gratuit" : `${event.price} FCFA`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              { isAlreadyRegistered &&
                <div className='bg-orange-400 text-white p-3 rounded-md font-bold text-center'>
                  <p>✅ Vous êtes déjà inscrit avec ce navigateur</p>
                </div>
              }
              <p className="text-gray-600">{event.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Du {formatDate(event.startDate)} au {formatDate(event.endDate)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPinIcon className="mr-2 h-4 w-4" />
                <span>{event.location}, {event.city}</span>
              </div>
              {event.isFinance && (
                <div className="flex items-center text-sm text-gray-500">
                  <BanknoteIcon className="mr-2 h-4 w-4" />
                  <span>Financé par : {event.financeName}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <TicketIcon className="mr-2 h-4 w-4" />
                <span>
                  {event.availablePlaces} place{event.availablePlaces > 1 ? 's' : ''} dispo / {event.maximumPlaces}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-6">
              { event.open && event.isAvailable ? (
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <Input type="text" placeholder="Nom complet" required value={name} onChange={(e) => setName(e.target.value)} />
                  <Input type="email" placeholder="Adresse mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input type="tel" placeholder="Numéro de téléphone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                  
                  <Select required value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <span>{location || "Choisissez un lieu"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {event.city.split(',').map((city, index) => (
                        <SelectItem key={index} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} ref={captchaRef} />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consent"
                      checked={consent}
                      onCheckedChange={(checked) => setConsent(checked)}
                      required
                    />
                    <Label htmlFor="consent" className="text-sm leading-none">
                      J'accepte les conditions de traitement de mes données personnelles.
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isEventFull}>
                    {registrationButtonText}
                  </Button>
                </form>
              ) : (
                <p className='font-bold mx-auto bg-orange-400 p-4 rounded-md text-white'>
                  ⛔ Les inscriptions sont fermées pour le moment
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
