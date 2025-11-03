import { User } from '../models/user.model.js';
import dotenv from 'dotenv';
import nodemailerTransport from '../config/nodemailerTransport.js';
import { ContactAnswer } from '../models/contactAnswers.model.js';

dotenv.config();

export const sendToContact = async (req, res) => {
  try {
    const fromUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    // on récupère phone depuis req.body (optionnel)
    const { name, email, subject, message, phone } = req.body;

    // Validation des champs obligatoires
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // Création du document
    const contact = new ContactAnswer({
      from: `Formulaire de contact depuis : ${fromUrl}`,
      name,
      email,
      subject,
      message,
      phone: phone || null, // si phone n’est pas fourni → null
    });

    await contact.save();

    res.status(201).json({ message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi du message" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const messages = await ContactAnswer.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

export const answerToMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { answer } = req.body;
    const message = await ContactAnswer.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    message.answer.push({ answer, userId });
    message.status = true;

    await nodemailerTransport.sendMail({
      from: 'contact@gabtrotter.org',
      to: message.email,
      subject: 'Réponse à votre message',
      html: `
        <p>Bonjour ${message.name},</p>
        <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contacté.</p>
        <p>Voici notre réponse :</p>
        <p>${answer}</p>
        <p>Nous vous remercions de votre confiance et nous espérons vous revoir bientôt.</p>
        <p>Cordialement,</p>
        <p>L'équipe Gabtrotter</p>
        <p> En cas de problème, n'hésitez pas à nous contacter à l'adresse suivante : ${process.env.EMAIL_USER}</p>
      `,
    });
    await message.save();
    res.status(200).json({ message: 'Réponse envoyée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la réponse' });
  }
};





