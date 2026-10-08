import {Survey} from '../models/survey.model.js';
import { ResponseSurvey } from '../models/responseSurvey.model.js';
import { Parser } from 'json2csv';
import { randomUUID } from 'crypto';
import { synchronizeBatch } from '../services/surveySync.service.js';
import { presentSurveyResponse } from '../services/surveyDataEncryption.service.js';

const normalizePrivacyNotice = (notice = {}) => {
  const locationPolicy = {
    enabled: notice.locationPolicy?.enabled === true,
    required: notice.locationPolicy?.enabled === true && notice.locationPolicy?.required === true,
    purpose: notice.locationPolicy?.purpose || '',
    precision: notice.locationPolicy?.precision === 'PRECISE' ? 'PRECISE' : 'COARSE',
  };
  return {
    ...notice,
    requiresConsent: notice.legalBasis === 'CONSENT'
      ? notice.requiresConsent !== false
      : false,
    locationPolicy,
  };
};


// Fonction pour générer et exporter les réponses en Excel
export const exportResponsesToCSV = async (req, res) => {
  const { id } = req.params;

  try {
    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: 'Formulaire non trouvé' });
    }

    // Récupérer toutes les réponses
    const responses = await ResponseSurvey.find({
      surveyId: id,
      processingRestricted: { $ne: true },
    }).select('+encryptedPayload')
      .populate('surveyId')
      .populate('agentId');

    // Préparer les données pour le CSV
    const csvData = responses.map(storedResponse => {
      const response = presentSurveyResponse(storedResponse);
      // Parse les réponses JSON en un objet
      const parsedResponses =
        typeof response.responses === "string"
          ? JSON.parse(response.responses)
          : response.responses;

      // Créer une ligne de données avec l'agentId et les questions/réponses
      const row = { agentId: response.agentId?._id || response.agentId };

      // Ajouter les questions et réponses comme colonnes
      Object.keys(parsedResponses).forEach((question, index) => {
        row[`Question ${index + 1}`] = `${question}: ${parsedResponses[question]}`;
      });

      return row;
    });

    // Générer le CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="survey-${id}-responses.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des réponses:', error);
    res.status(500).json({ message: 'Erreur lors de l\'exportation des réponses', error });
  }
};

export const createSurvey = async (req, res) => {
  try {
    const { fields, title, privacyNotice = {} } = req.body;

    // Créer une nouvelle instance du modèle
    const newSurvey = new Survey({
      title,
       fields,
       version: 1,
       privacyNotice: {
         ...normalizePrivacyNotice(privacyNotice),
         enabled: privacyNotice.enabled ?? true,
         version: 1,
         enforcedAt: privacyNotice.enabled === false ? null : new Date(),
         updatedAt: new Date(),
       },
      });

    // Sauvegarder le formulaire dans la base de données
    const savedSurvey = await newSurvey.save();

    return res.status(201).json(savedSurvey);
  } catch (error) {
    console.error('Erreur lors de la création du formulaire:', error);
    return res.status(400).json({ message: 'Erreur lors de la création du formulaire.', error: error.message });
  }
};



export const getSurveys = async (req,res) => {
    try{
        const surveys = await Survey.find({ isPublished: true });
        res.status(200).json(surveys);
    }catch(error){
        res.status(500).json({ message: 'Erreur lors de la récupération des formulaires' , error: error.message });
    }
};

// Récupérer un formulaire par son ID
export const getSurveyById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const survey = await Survey.findById(id);
      if (!survey) {
        return res.status(404).json({ message: 'Formulaire non trouvé' });
      }
  
      res.status(200).json(survey);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du formulaire', error });
    }
  };
  
  // Mettre à jour un formulaire
  export const updateSurvey = async (req, res) => {
    const { id } = req.params;
    const { title, description, fields, isPublished, privacyNotice } = req.body;
  
    try {
      const currentSurvey = await Survey.findById(id);
      if (!currentSurvey) {
        return res.status(404).json({ message: 'Formulaire non trouvé' });
      }
      const update = {
        title,
        description,
        fields,
        isPublished,
        updatedAt: Date.now(),
        $inc: { version: 1 },
      };
      if (privacyNotice) {
        update.privacyNotice = {
          ...currentSurvey.privacyNotice?.toObject?.(),
          ...normalizePrivacyNotice(privacyNotice),
          version: (currentSurvey.privacyNotice?.version || 0) + 1,
          enforcedAt: privacyNotice.enabled === false ? null : new Date(),
          updatedAt: new Date(),
        };
      }
      const updatedSurvey = await Survey.findByIdAndUpdate(
        id,
        update,
        { new: true }
      );
  
      if (!updatedSurvey) {
        return res.status(404).json({ message: 'Formulaire non trouvé' });
      }
  
      res.status(200).json(updatedSurvey);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du formulaire', error });
    }
  };
  
  // Supprimer un formulaire
  export const deleteSurvey = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedSurvey = await Survey.findByIdAndDelete(id);
      if (!deletedSurvey) {
        return res.status(404).json({ message: 'Formulaire non trouvé' });
      }
  
      res.status(200).json({ message: 'Formulaire supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du formulaire', error });
    }
  };


  export const submitSurvey = async (req, res) => {
    const { id } = req.params;
    try {
      const batch = await synchronizeBatch({
        batchId: req.body.batchId || randomUUID(),
        deviceId: req.body.deviceId,
        agentId: req.userId,
        responses: [{ ...req.body, surveyId: id }],
      });
      const result = batch.results[0];
      return res.status(result.status === 'rejected' ? 422 : 200).json({
        message: result.status === 'duplicate'
          ? 'Réponse déjà enregistrée'
          : 'Réponse enregistrée avec succès',
        data: result,
      });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la réponse:', error);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la réponse', error: error.message });
    }
};

export const syncSurveyResponses = async (req, res) => {
  try {
    const audit = await synchronizeBatch({
      batchId: req.body.batchId,
      deviceId: req.body.deviceId,
      responses: req.body.responses,
      agentId: req.userId,
    });
    return res.status(200).json({ message: 'Synchronisation traitée', data: audit });
  } catch (error) {
    const status = error.message.includes('requis') || error.message.includes('dépasser') ? 400 : 500;
    return res.status(status).json({ message: error.message });
  }
};



export const getResponses = async (req, res) => {
  const { id } = req.params;
  const { page = 1, pageSize = 10 } = req.query; // Valeurs par défaut

  try {
    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: 'Formulaire non trouvé' });
    }

    // Convertir page et pageSize en nombres
    const pageNumber = parseInt(page, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (pageNumber - 1) * limit;

    // Récupérer les réponses avec pagination
    const visibleFilter = { surveyId: id, processingRestricted: { $ne: true } };
    const totalResponses = await ResponseSurvey.countDocuments(visibleFilter); // Nombre total de réponses
    const answers = await ResponseSurvey.find(visibleFilter).select('+encryptedPayload')
      .populate('surveyId')
      .populate('agentId')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      responses: answers.map(presentSurveyResponse),
      totalResponses, // Total des réponses
      totalPages: Math.ceil(totalResponses / limit), // Nombre total de pages
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réponses', error });
  }
};

  export const getResponse = async (req, res) => {
    const { id } = req.params;
    try {
      const answer = await ResponseSurvey.findOne({
        _id: id,
        processingRestricted: { $ne: true },
      }).select('+encryptedPayload').populate("surveyId");
      if (!answer) {
        return res.status(404).json({ message: 'Reponse non trouvée' });
      }
      return res.status(200).json(presentSurveyResponse(answer));
    }catch (error) {
      console.error('Erreur lors de la recuperation de la réponse:', error);
      res.status(500).json({ message: 'Erreur lors de la recuperation de la réponse', error });
    }
  };
