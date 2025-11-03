import {Survey} from '../models/survey.model.js';
import { ResponseSurvey } from '../models/responseSurvey.model.js';
import xlsx from 'xlsx';
import mongoose from 'mongoose'; // Importer mongoose pour vérifier l'ObjectId
import { Parser } from 'json2csv';
import fs from 'fs';


export const generateCsvWithQuestionsAndResponses = async (req,res) => {
  try {
    // Connexion à la base de données (assurez-vous d'adapter l'URL selon votre configuration)
    await mongoose.connect('mongodb://localhost:27017/votreBaseDeDonnees', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Récupérer toutes les réponses du sondage (ajustez la requête selon vos besoins)
    const surveyResponses = await SurveyResponse.find();

    const data = surveyResponses.map((response) => {
      const parsedResponses = JSON.parse(response.responses); // On suppose que 'responses' est une chaîne JSON
      const row = {};

      // On crée des colonnes QuestionX et ReponseX pour chaque question dans le questionnaire
      Object.keys(parsedResponses).forEach((question, index) => {
        row[`Question${index + 1}`] = question;
        row[`Reponse${index + 1}`] = parsedResponses[question];
      });

      return row;
    });

    // Utilisation de json2csv pour convertir les données en CSV
    const parser = new Parser();
    const csv = parser.parse(data);

    // Écrire le fichier CSV
    await fs.writeFile('survey_responses.csv', csv);

    console.log('CSV généré avec succès!');

    // Fermer la connexion à la base de données
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erreur lors de la génération du CSV:', error);
  }
}
// Fonction pour générer et exporter les réponses en Excel
export const exportResponsesToCSV = async (req, res) => {
  const { id } = req.params;

  try {
    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: 'Formulaire non trouvé' });
    }

    // Récupérer toutes les réponses
    const responses = await ResponseSurvey.find({ surveyId: id , })
      .populate('surveyId')
      .populate('agentId');

    // Préparer les données pour le CSV
    const csvData = responses.map(response => {
      // Parse les réponses JSON en un objet
      const parsedResponses = JSON.parse(response.responses);

      // Créer une ligne de données avec l'agentId et les questions/réponses
      const row = { agentId: response.agentId._id };

      // Ajouter les questions et réponses comme colonnes
      Object.keys(parsedResponses).forEach((question, index) => {
        row[`Question ${index + 1}`] = `${question}: ${parsedResponses[question]}`;
      });

      return row;
    });

    // Générer le CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    // Sauvegarder le fichier CSV sur le serveur
    const filePath = './responses.csv';
    fs.writeFileSync(filePath, csv);

    // Répondre au client avec le chemin du fichier CSV généré
    res.status(200).json({
      message: 'CSV exporté avec succès',
      filePath: filePath,
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des réponses:', error);
    res.status(500).json({ message: 'Erreur lors de l\'exportation des réponses', error });
  }
};

export const createSurvey = async (req, res) => {
  try {
    const { fields,title } = req.body; // Assurez-vous que cela récupère les champs correctement

    // Créer une nouvelle instance du modèle
    const newSurvey = new Survey({
      title,
       fields 
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
        const surveys = await Survey.find();
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
    const { title, description, fields, isPublished } = req.body;
  
    try {
      const updatedSurvey = await Survey.findByIdAndUpdate(
        id,
        { title, description, fields, isPublished, updatedAt: Date.now() },
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
    const { userId, fields ,location,localDate} = req.body;

    // Validation des données
    if (!userId || !fields) {
      console.log('Erreur de validation des données :', req.body);
        return res.status(400).json({ message: 'userId et responses sont requis' });
    }

    try {
        const survey = await Survey.findById(id);
        if (!survey) {
            return res.status(404).json({ message: 'Formulaire non trouvé' });
        }

        // Enregistrer les réponses dans la base de données
        const newResponse = new ResponseSurvey({
            surveyId: id,
            agentId: userId,
            responses: fields,
            localDate: localDate,
            location: location,
            createdAt: Date.now(),
        });

        const savedResponse = await newResponse.save();
        res.status(200).json({ 
            message: 'Réponse enregistrée avec succès',
            data: savedResponse  // Renvoyer les données sauvegardées si nécessaire
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la réponse:', error);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la réponse', error: error.message });
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
    const totalResponses = await ResponseSurvey.countDocuments({ surveyId: id }); // Nombre total de réponses
    const answers = await ResponseSurvey.find({ surveyId: id })
      .populate('surveyId')
      .populate('agentId')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      responses: answers,
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
      const answer = await ResponseSurvey.findById(id).populate("surveyId");
      if (!answer) {
        return res.status(404).json({ message: 'Reponse non trouvée' });
      }
      return res.status(200).json(answer);
      console.log(answer);
    }catch (error) {
      console.error('Erreur lors de la recuperation de la réponse:', error);
      res.status(500).json({ message: 'Erreur lors de la recuperation de la réponse', error });
    }
  };