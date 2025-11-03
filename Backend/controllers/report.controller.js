import { User } from '../models/user.model.js';
import { Report } from '../models/report.model.js';
import { v2 as cloudinary } from 'cloudinary';
import nodemailerTransport from '../config/nodemailerTransport.js';
import dotenv from 'dotenv';

dotenv.config();

export const createReport = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const { subject, date, content } = req.body;
  const userId = req.userId;

  try {
    // Vérifier l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    let imageUrl = null; // Initialiser à null si aucune image n'est fournie

    // Vérifie si un fichier a été uploadé
    if (req.file) {
      const imageBuffer = req.file.buffer;

      // Upload de l'image vers Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
        if (error) {
          console.error('Erreur lors de l\'upload de l\'image sur Cloudinary', error);
          return res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image', error: error.message });
        }

        imageUrl = result.secure_url; // Stocker l'URL de l'image
        finalizeReportCreation(user, subject, date, content, imageUrl, res);
      });

      // Passer le buffer au stream
      uploadStream.end(imageBuffer);
    } else {
      // Si aucune image n'est fournie, passer directement à la création du rapport
      finalizeReportCreation(user, subject, date, content, imageUrl, res);
    }
  } catch (error) {
    console.error('Erreur lors de la création du rapport', error);
    return res.status(500).json({ message: 'Erreur lors de la création du rapport', error: error.message });
  }
};

// Fonction utilitaire pour finaliser la création du rapport
const finalizeReportCreation = async (user, subject, date, content, imageUrl, res) => {
  try {
    const report = new Report({
      userId: user._id,
      subject,
      date,
      content,
      image: imageUrl, // Peut être null si aucune image
    });

    await report.save();

    const admins = await User.find({ role: 'admin' });
    const adminEmails = admins.map(admin => admin.email);

    const emailContent = {
      from: 'contact@gabtrotter.org',
      subject: `Rapport de ${user.fullname} du ${date} - Gabtrotter`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background-color: #f8f8f8; padding: 10px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h2 style="color: #333;">Rapport de ${user.fullname}</h2>
            <p style="color: #777;">${date}</p>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Bonjour,</p>
            <p style="font-size: 16px; color: #333;">Voici le rapport de <strong>${user.fullname}</strong> concernant <strong>${subject}</strong>.</p>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">${content}</p>
            ${imageUrl ? `<div style="margin: 20px 0; text-align: center;">
              <img src="${imageUrl}" alt="Image du rapport" style="max-width: 100%; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            </div>` : ''}
          </div>
          <div style="background-color: #f8f8f8; padding: 10px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 14px; color: #999;">© 2024 Gabtrotter. Tous droits réservés.</p>
          </div>
        </div>`,
    };

    await Promise.all(adminEmails.map(email => {
      return nodemailerTransport.sendMail({ ...emailContent, to: email });
    }));

    return res.status(201).json({ message: 'Rapport créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails ou de la création du rapport', error);
    return res.status(500).json({ message: 'Erreur lors de la finalisation du rapport', error: error.message });
  }
};


export const getReports = async (req,res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try{
    const reports = await Report.find().populate('userId');
    res.status(200).json(reports);
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la récupération des rapports' , error: error.message });
  }
}

export const getReport = async (req,res) => {
  try{
    const report = await Report.findOne({_id: req.params.id});
    res.status(200).json(report);
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la récupération des rapports' , error: error.message });
  }
}

export const getReportsForUser = async (req,res) => {
  try{
    console.log(req.params.userId)
    const reports = await Report.find({userId: req.params.userId}).populate('userId');
    console.log(reports)
    res.status(200).json(reports);
  }catch(error){
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de rapports de l\'utilisateur ' , error: error.message });
  }
}



