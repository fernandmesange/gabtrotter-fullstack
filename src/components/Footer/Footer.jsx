import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';


const Footer = () => {
    return (
        <footer className="bg-orange-500 mt-12 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <img src="/logo-blanc.png?height=50&width=150" alt="Logo" className="h-20" />
              
            </div>
            <div>
              <h3 className="font-semibold mb-4">Menu</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-sm text-white hover:text-gray-900">Accueil</a></li>
                <li><a href="#projects" className="text-sm text-white hover:text-gray-900">Projets</a></li>
                <li><a href="#partners" className="text-sm text-white hover:text-gray-900">Partenaires</a></li>
                <li><a href="#contact" className="text-sm text-white hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="text-sm text-white hover:text-gray-900">Connexion</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suivez-nous</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/gabtrotterNGO" className="text-white hover:text-gray-900"><i className={`bi bi-facebook text-2xl`}></i></a>
                <a href="https://wa.me/message/2X4GG6IFAU33O1" className="text-white hover:text-gray-900"><i className={`bi bi-whatsapp text-2xl`}></i></a>
                <a href="https://www.linkedin.com/company/gabtrotter/" className="text-white hover:text-gray-900"><i className={`bi bi-linkedin text-2xl`}></i></a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Informations légales</h3>
              <ul className="space-y-2">
                {/* <li><a href="#" className="text-sm text-white hover:text-gray-900">Mentions légales</a></li> */}
                <li><a href="/confidentiality" className="text-sm text-white hover:text-gray-900">Politique de confidentialité</a></li>
                {/* <li><a href="#" className="text-sm text-white hover:text-gray-900">Conditions d'utilisation</a></li> */}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t-2 border-white text-center text-sm text-white">
            © {new Date().getFullYear()} GabTrotter Tous droits réservés.
          </div>
        </div>
      </footer>
    );
}

export default Footer;
