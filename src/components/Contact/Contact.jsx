import { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, CreditCard } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import axiosInstance from '@/api/axiosInstance'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('') // ✅ nouveau champ optionnel
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const captchaRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = captchaRef.current.getValue();
    if (!token) {
      setError('Veuillez valider le captcha');
      return;
    }
    captchaRef.current.reset();
    setIsLoading(true);
    try {
      await axiosInstance.post(`/contact/send`, { 
        name, 
        email, 
        phone: phone || null, // ✅ inclus dans les données, null si vide
        subject, 
        message 
      })
      console.log('Formulaire soumis', { name, email, phone, subject, message })
      setSuccess(true)
      setIsLoading(false)
      setError(null)
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    } catch (error) {
      console.log(error)
      setSuccess(false)
      setError("Une erreur est survenue. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  return (
    <div id="contact" className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto p-16 pt-20">
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        <p className='text-md md:text-lg leading-7 mb-12'>
          Pour toute question, demande d'information ou pour vous joindre à nos initiatives, n'hésitez pas à nous contacter :
          Nous serons ravis de vous répondre et de vous accueillir dans notre communauté !
        </p>

        {/* Nom */}
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* ✅ Téléphone optionnel */}
        <div className="space-y-2">
          <Label htmlFor="phone">Numéro (optionnel)</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+241 77 00 00 00"
          />
        </div>

        {/* Sujet */}
        <div className="space-y-2">
          <Label htmlFor="subject">Sujet</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        {/* Messages d'erreur/succès */}
        {error && <p className="bg-red-500 text-white p-4">{error}</p>}
        {success && <p className="bg-green-500 text-white p-4">Votre message a été envoyé avec succès</p>}

        <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} ref={captchaRef} className='' />
        
        <Button 
          type="submit"  
          disabled={isLoading} 
          className="w-full bg-orange-500 hover:bg-orange-700"
        >
          {isLoading ? "Envoi en cours..." : "Envoyer"}
        </Button>
      </form>

      {/* Carte Contact */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Contactez-nous</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 mt-1" />
            <p>Balise, Port-Gentil B.P. 2061 - Gabon</p>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <p>Tel : +241 77 52 62 55</p>
          </div>
          <div className="flex items-center space-x-2">
            <p>Whatsapp : +241 76 29 03 10</p>
          </div>
          <p>Récépissé provisoire : N°0021/G8/2018</p>
          <div className="space-y-2">
            <p className="font-semibold">Pour faire un don :</p>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <p>BGFI BANK GABON : GA214000 3041 9561 1113 8500 141</p>
              </div>
              <p>Intitulé du compte : Gabtrotter</p>
              <p>Airtel Money : 076 29 03 10</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
