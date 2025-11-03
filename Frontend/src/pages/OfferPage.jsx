import { useEffect, useState, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, FileIcon, PaperclipIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from '@/components/ui/checkbox'
import ReCAPTCHA from 'react-google-recaptcha'
import axiosInstance from '@/api/axiosInstance'

export default function OfferPage() {
  const { id } = useParams()
  const [consent, setConsent] = useState(false)
  const [offer, setOffer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const captchaRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cv: null,
    optionalFile: null,
  })
  const { toast } = useToast()

  const fetchOffer = async () => {
    try {
      const response = await axiosInstance.get(`/offers/${id}`)
      setOffer(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching offer:', error)
      setIsLoading(false)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'offre. Veuillez réessayer plus tard.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchOffer()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files.length > 0) {
      const file = files[0]
      const maxSizeInMB = 2
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024

      if (file.size > maxSizeInBytes) {
        toast({
          title: "Erreur",
          description: "Le fichier doit être inférieur à 2 Mo.",
          variant: "destructive",
        })
        return
      }

      setFormData((prev) => ({ ...prev, [name]: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const token = captchaRef.current.getValue();

    if (!token) {
      toast({
        title: "Validation du Captcha requise",
        description: "Veuillez valider le captcha pour continuer.",
        variant: "destructive",
      })
      setIsSubmitting(false);
      return;
    }

    captchaRef.current.reset()

    if(!consent) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les conditions d'utilisation pour soumettre votre candidature.",
        variant: "destructive",
      })
      setIsSubmitting(false);
      return;
    }

    const formDataToSubmit = new FormData()
    for (const key in formData) {
      formDataToSubmit.append(key, formData[key])
    }

    try {
      await axiosInstance.post(`/offers/apply/${id}`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast({
        title: "Succès",
        description: "Votre candidature a été soumise avec succès!",
      })
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        cv: null,
        optionalFile: null,
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Erreur",
        description: error.response.data.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDeadlinePassed = offer && new Date(offer.deadline) < new Date()

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="w-full">
        <CardHeader>
          {isLoading ? (
            <Skeleton className="h-8 w-3/4 mb-2" />
          ) : (
            <CardTitle className="text-3xl font-bold text-orange-500">{offer?.title}</CardTitle>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-1/2" />
          ) : (
            <CardDescription className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date limite: {new Date(offer?.deadline).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6 break-words" dangerouslySetInnerHTML={{ __html: offer?.description }}></p>
              
              {isDeadlinePassed ? (
                <p className="text-red-500 font-bold">Deadline dépassée</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-orange-500">Nom</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border-orange-500 mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-orange-500">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Votre email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-orange-500 mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-orange-500">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Votre numéro de téléphone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="border-orange-500 mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cv" className="text-orange-500 flex items-center">
                        <FileIcon className="mr-2 h-4 w-4" />
                        CV (PDF)
                      </Label>
                      <Input
                        id="cv"
                        name="cv"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="border-orange-500 mt-1"
                        required
                      />
                      {formData.cv && <p className="mt-1 text-gray-600">Fichier sélectionné : {formData.cv.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="optionalFile" className="text-orange-500 flex items-center">
                        <PaperclipIcon className="mr-2 h-4 w-4" />
                        Fichier optionnel
                      </Label>
                      <Input
                        id="optionalFile"
                        name="optionalFile"
                        type="file"
                        onChange={handleFileChange}
                        className="border-orange-500 mt-1"
                      />
                      {formData.optionalFile && <p className="mt-1 text-gray-600">Fichier sélectionné : {formData.optionalFile.name}</p>}
                    </div>
                  </div>
                  <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} ref={captchaRef} className='' />
                  
                  <p className='text-sm '>
                    En postulant à cette offre, vous acceptez que vos données personnelles 
                    (nom, e-mail, numéro de téléphone, CV) soient collectées et utilisées pour le 
                    processus de recrutement conformément à notre <a href="/politique-confidentialite" target="_blank">politique de confidentialité</a>.
                  </p>
                  <div className="flex items-center space-x-2 my-4">
                    <Checkbox
                      id="consent"
                      checked={consent}
                      onCheckedChange={(checked) => setConsent(checked)}
                      required
                    />
                    <Label
                      htmlFor="consent"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      J&apos;accepte les conditions de traitement de mes données personnelles.
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Soumission en cours...' : 'Soumettre'}
                  </Button>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

