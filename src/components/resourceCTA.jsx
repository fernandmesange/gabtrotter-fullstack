import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowRight } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast" 
import axios from "axios"
import ReCAPTCHA from 'react-google-recaptcha'
import axiosInstance from "@/api/axiosInstance"

export default function ResourceCTA() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialisation du formulaire avec react-hook-form
  const form = useForm({
    defaultValues: {
      fullname: "",
      email: "",
    },
  })

  // Fonction de soumission du formulaire
  async function onSubmit(data) {
    setIsSubmitting(true)
    
    try {
      const response = await axiosInstance.post("/auth/subscribe-link", data)
      
      // Afficher un message de succès
      toast({
        title: "Inscription réussie !",
        description: "Veuillez consulter votre boîte de réception pour confirmer votre inscription.",
        variant: "default",
      })
      
      // Fermer le dialogue
      setIsOpen(false)
      form.reset()

      
    } catch (error) {
      if(error.response && error.response.status === 400) {
        // Si l'email est déjà utilisé, afficher un message spécifique
        toast({
          title: "Erreur",
          description: "Vous êtes déjà inscrit avec cet email.",
          variant: "destructive",
        })
      }
      else {
        toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'inscription. Veuillez réessayer.",
        variant: "destructive",
      })
      }
      console.log(error);
      
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-[#FF7518] text-white p-6 md:p-8">
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl md:text-2xl font-bold">Accédez à nos ressources en ligne</h3>
              <p className="text-white/90">
                Rejoignez notre communauté et découvrez des contenus exclusifs pour vous accompagner dans vos projets.
              </p>
              <Button 
                onClick={() => setIsOpen(true)}
                className="bg-white text-[#FF7518] hover:bg-white/90 hover:text-[#FF7518] w-full md:w-auto self-start mt-2"
              >
                S&apos;inscrire maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#FF7518] text-xl font-bold">Inscrivez-vous</DialogTitle>
            <DialogDescription>
              Remplissez ce formulaire pour accéder à nos ressources en ligne.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              
              <Button 
                type="submit" 
                className="w-full bg-[#FF7518] hover:bg-[#FF7518]/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </form>
            
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
