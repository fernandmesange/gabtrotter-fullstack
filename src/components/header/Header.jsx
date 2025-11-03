
import { Menu, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useNavigate } from 'react-router-dom'



export default function Header() {
  const navigate = useNavigate();


  const menuItems = [
    { href: "/", label: "Accueil" },
    { href: "#projects", label: "Projets" },
    { href: "#gallery", label: "Galerie" },
    { href: "/offers", label: "Offres" },
    { href: "#partners", label: "Partenaires" },
    { href: "#contact", label: "Contact" },
  ]



  
  return (
    <header >
      <div className="bg-orange-500 rounded-md m-5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <a href="/" className="flex items-center space-x-2">
              <img src="/logo-blanc.png" alt="Logo GabTrotter" className="h-16 w-16" />
            </a>

            <nav className="hidden lg:flex space-x-6 items-center">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-white transition-colors hover:text-orange-200"
                >
                  {item.label}
                </a>
              ))}
              <Button variant="secondary" size="icon" className="rounded-full" onClick={() => navigate('/login')}>
          <User className="h-5 w-5 text-orange-500" />
          <span className="sr-only">Profil utilisateur</span>
        </Button>
              
              
            </nav>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-6">
                  {menuItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium transition-colors hover:text-orange-500"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Button variant="secondary" size="icon" className="rounded-full" onClick={() => navigate('/login')}>
          <User className="h-5 w-5 text-orange-500" />
          <span className="sr-only">Profil utilisateur</span>
        </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      
    </header>
  )
}