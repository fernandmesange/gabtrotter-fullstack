import React, { useState } from 'react'
import { Menu, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BorderBeam } from '@/components/ui/border-beam'
import BlurIn from '@/components/ui/blur-in'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import {useAuth} from '@/context/AuthProvider'


const Hero = () => {

    const socialLinks = [
        { href: 'https://www.facebook.com/gabtrotterNGO', icon: 'bi-facebook', label: 'Facebook' },
        { href: 'https://www.linkedin.com/company/gabtrotter/', icon: 'bi-linkedin', label: 'LinkedIn' },
        { href: 'https://wa.me/message/2X4GG6IFAU33O1', icon: 'bi-whatsapp', label: 'WhatsApp' },
      ]

      
    return (
        <div className="relative w-full h-[50vh] lg:h-[70vh]  overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/background-header.png")' }}
        />
        <BorderBeam colorFrom='white' colorTo='#e67505' borderWidth={3} />
        <div className="absolute inset-0  flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <BlurIn 
              word="BIENVENUE CHEZ GABTROTTER" 
              className="text-4xl font-bold mb-8 md:text-5xl lg:text-6xl text-white md:leading-normal"
            />
            <div className='flex justify-center space-x-6 mb-8'>
              {socialLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  target='_blank' 
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-200 transition-colors"
                  aria-label={link.label}
                >
                  <i className={`bi ${link.icon} text-2xl`}></i>
                </a>
              ))}
            </div>
<Button
  size="lg"
  onClick={() => {
    document.getElementById("initiative")?.scrollIntoView({ behavior: "smooth" })
  }}
  className="bg-white hover:bg-orange-500 text-orange-500 hover:text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
>
  Découvrir nos initiatives
</Button>
          </div>
        </div>
      </div>
    );
}

export default Hero;
