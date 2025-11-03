import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"

const PolitiqueConfidentialite = () => {
  const sections = [
    {
      title: "1. Informations collectées",
      content: (
        <>
          <p className="mb-2">Nous collectons les informations suivantes :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Pour les membres de l'association : nom, prénom, adresse e-mail lors de la création du compte.</li>
            <li>Pour les candidats aux offres d'emploi : nom, e-mail, numéro de téléphone et CV.</li>
            <li>Pour les inscrits aux événements : nom, e-mail, numéro de téléphone.</li>
          </ul>
        </>
      )
    },
    {
      title: "2. Utilisation des données",
      content: (
        <>
          <p className="mb-2">Les informations collectées sont utilisées pour les finalités suivantes :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestion des comptes et des membres de l'association.</li>
            <li>Gestion des candidatures aux offres d'emploi.</li>
            <li>Organisation et gestion des événements.</li>
          </ul>
        </>
      )
    },
    {
      title: "3. Partage des données",
      content: (
        <>
          <p className="mb-2">Vos données personnelles ne seront partagées qu'avec des tiers dans les situations suivantes :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Recrutement (CV partagé avec les employeurs potentiels).</li>
            <li>Fournisseurs de services pour la gestion des événements.</li>
          </ul>
        </>
      )
    },
    {
      title: "4. Durée de conservation des données",
      content: (
        <p>Vos données seront conservées aussi longtemps que nécessaire pour accomplir les finalités pour lesquelles elles ont été collectées ou conformément aux exigences légales.</p>
      )
    },
    {
      title: "5. Vos droits",
      content: (
        <p>Conformément au RGPD, vous avez le droit d'accéder à vos données, de les corriger, de les supprimer et de vous opposer à leur traitement. Pour exercer ces droits, veuillez nous contacter à : <a href="mailto:privacy@example.com" className="text-primary hover:underline">privacy@example.com</a>.</p>
      )
    },
    {
      title: "6. Cookies",
      content: (
        <p>Nous utilisons des cookies pour améliorer votre expérience de navigation. Vous pouvez accepter ou refuser les cookies en configurant votre navigateur.</p>
      )
    },
    {
      title: "7. Sécurité",
      content: (
        <p>Nous mettons en œuvre des mesures de sécurité pour protéger vos données contre l'accès non autorisé.</p>
      )
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Politique de Confidentialité</CardTitle>
          <p className="text-center text-muted-foreground">Dernière mise à jour : 25 octobre 2024</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] pr-4">
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none">
                      {section.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default PolitiqueConfidentialite