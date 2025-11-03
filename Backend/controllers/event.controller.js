import { Event } from '../models/event.model.js';
import { User } from '../models/user.model.js';
import { v2 as cloudinary } from 'cloudinary';
import qrcode from 'qrcode';
import mongoose from 'mongoose';
import nodemailerTransport from '../config/nodemailerTransport.js';



import dotenv from 'dotenv';

dotenv.config();


export const createEvent = async (req, res) => {
  const { title, description, type, startDate, endDate, location, city, isFinance, financeName, isFree, price, maximumPlaces, conditions, createdBy } = req.body;

  console.log(req.body); // Affiche les données du corps de la requête
  console.log(req.file); // Affiche les informations sur le fichier uploadé

  try {
    // Vérifier l'utilisateur
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifie si un fichier a été uploadé
    if (req.file) {
      // Upload de l'image vers Cloudinary
      const imageBuffer = req.file.buffer;

      const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
        if (error) {
          console.error('Erreur lors de l\'upload de l\'image sur Cloudinary', error);
          return res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image', error: error.message });
        }

        // Récupérer l'URL de l'image uploadée
        const imageUrl = result.secure_url;

        // Créer un nouvel événement
        const event = new Event({
          title,
          description,
          type,
          startDate,
          endDate,
          location,
          city,
          isFinance,
          financeName,
          image: imageUrl, // Utilise l'URL de l'image de Cloudinary
          isFree,
          price,
          availablePlaces: maximumPlaces,
          maximumPlaces,
          conditions,
          createdBy,
        });

        await event.save();
        return res.status(201).json({ message: 'Événement créé avec succès' });
      });

      // Passer le buffer au stream
      uploadStream.end(imageBuffer);
    } else {
      return res.status(400).json({ message: 'Aucun fichier d\'image reçu.' });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement', error);
    return res.status(500).json({ message: 'Erreur lors de la création de l\'événement', error: error.message });
  }
};



export const updateEvent = async (req, res) => {
  const { title, description, type, startDate, endDate, location,city, isFinance, financeName, isFree, price, maximumPlaces, createdBy,isAvailable,open } = req.body;
  console.log(isAvailable); // Ceci affichera les données du corps de la requête
  const { id } = req.params;
  try {
    const event = await Event.findOneAndUpdate({ _id: id }, {
      title,
      description,
      type,
      startDate,
      endDate,
      location,
      city,
      isFinance,
      financeName,
      isFree,
      price,
      availablePlaces: maximumPlaces,
      maximumPlaces,
      createdBy,
      isAvailable: isAvailable,
      open
    }, { new: true });
    console.log(event);
    if (!event) {
      return res.status(404).json({ message: 'Evenement non trouvé' });
    }
    res.status(200).json({ message: 'Événement mis à jour avec succès' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la mise a jour de l\'événement', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findOneAndDelete({ _id: id });
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.status(200).json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement', error: error.message });
  }
};


export const getEvents = async (req,res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try{
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' , error: error.message });
  }
}

export const getEvent = async (req,res) => {
  try{
    const event = await Event.findOne({_id: req.params.id});
    res.status(200).json(event);
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événements' , error: error.message });
  }
}


export const getEventsPublic = async (req,res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try{
    const events = await Event.find({}, {participants: 0}).sort({ createdAt: -1 });
    res.status(200).json(events);
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' , error: error.message });
  }
}

export const getEventPublic = async (req,res) => {
  try{
    const event = await Event.findOne({_id: req.params.id}, {participants:0});
    res.status(200).json(event);
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événements' , error: error.message });
  }
}



export const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { eventId, email,name,phone, location } = req.body;
  try {
    // Recherche de l'événement avec verrouillage
    const event = await Event.findOne({ _id: eventId }).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    if (event.availablePlaces <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Événement complet' });
    }

    const alreadyRegistered = event.participants.some(p => p.email === email);
    if (alreadyRegistered) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cet e-mail est déjà inscrit à l\'événement' });
    }

    const alreadyRegisteredName = event.participants.some(p => p.name === name);
    if (alreadyRegisteredName) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ce nom est déjà inscrit à l\'événement' });
    }

    const alreadyRegisteredPhone = event.participants.some(p => p.phone === phone);
    if (alreadyRegisteredPhone) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ce numero de telephone est déjà inscrit à l\'événement' });
    }
    const participant = { name, email, phone,location };
    // Ajouter le participant et décrémenter les places
    event.participants.push(participant);
    event.availablePlaces =  event.maximumPlaces - event.participants.length;
    await event.save({ session });

    // const currentEvent = await Event.findOne({_id: eventId});

    // Génération du QR Code et envoi de l'e-mail
    const qrCodeData = JSON.stringify({ eventId: event._id, name, email, phone , location});
    const qrCodeBuffer = await qrcode.toBuffer(qrCodeData);
    await nodemailerTransport.sendMail({
      from: 'contact@gabtrotter.org',
      to: email,
      subject: `Inscription à l\'événement ${event.title} - Gabtrotter `,
      html: `<p>Votre inscription a bien été prise en compte ! 

Nous sommes ravis de vous compter parmi les participants. Pour toute question ou information complémentaire, n’hésitez pas à nous contacter directement via WhatsApp au +241 04 32 14 12</p><p>Merci,</p><p>GabTrotter</p>`,
      // attachments:[
      //   {
      //     filename: 'qrcode.png',
      //     content: qrCodeBuffer,
      //     cid: 'qrcode'
      //   }
      // ]
    });
  
  

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: 'Inscription réussie'});
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription à l\'événement', error: error.message });
  }
};

export const checkParticipant = async (req, res) => {
  const { decodedText,selectedEvent } = req.body;


  // Vérifiez si decodedText est présent
  if (!decodedText) {
    return res.status(400).json({ message: 'Aucune donnée fournie' });
  }

  let data;
  try {
    data = JSON.parse(decodedText); // Tentez de parser le JSON
  } catch (error) {
    return res.status(400).json({ message: 'Données QR invalides' });
  }

  const { email } = data; // Extraire eventId et email
  console.log(`Event ID: ${selectedEvent}, Email: ${email}`);

  try {
    // Cherchez l'événement par ID
    const event = await Event.findOne({ _id: selectedEvent });
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: 'Événement non trouvé' });
      
    }

    // Cherchez le participant par email
    const participant = event.participants.find(p => p.email === email);
    if (!participant) {
      console.log('Participant not found');
      return res.status(404).json({ message: 'Participant non trouvé' });
    } else {
      // Si le participant est trouvé, retournez ses informations
      console.log('Participant found:', participant);
      return res.status(200).json({ message: 'Participant trouvé', participant });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement', error: error.message });
  }
};

