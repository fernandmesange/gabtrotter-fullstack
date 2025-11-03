import React from 'react';
import Header from '@/components/header/Header';
import Projects from '@/components/projects/Projects.jsx';
import Stats from '@/components/stats/Stats';
import Gallery from '@/components/Galery/Gallery';
import Partners from '@/components/Partners/Partners';
import ContactForm from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';
import EventsCarousel from '@/components/EventCarousel/EventCarousel';
import Hero from '@/components/Hero/Hero';
import ResourceCTA from '@/components/resourceCTA';
import VisionSection from '@/components/VisionSection';

const HomePage = () => {


    return (
        <div className=''>
        
        <Hero/>
        {/* <SuspensionNotice/> */}
        {/* <ResourceCTA/> */}
        {/* <EventsCarousel/> */}
            <section className="  mt-20" id="projects">
      <div className='container mx-auto px-4'>
        <h2 className='text-4xl md:text-5xl font-extrabold  mb-6 text-orange-500'>QUI SOMMES-NOUS ?</h2>
        <p className='text-lg md:text-xl leading-7 mb-12 '>
Gabtrotter est une organisation gabonaise dédiée à l’éducation, à l’innovation numérique et à l’autonomisation des jeunes et des femmes. Nous croyons qu’un accès équitable aux savoirs, aux technologies et aux opportunités est la clé pour bâtir une société plus juste, inclusive et innovante.
        </p>
        
      </div>
    </section>
        <Projects/>
        <Stats/>
        <br/>
        <VisionSection/>
        <Gallery/>
        
        <Partners/>
        <ContactForm/>
        <Footer/>
        
        </div>
    );
}

export default HomePage;
