import express from 'express';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitSurvey,
  getResponse,
  getResponses,
  exportResponsesToCSV,
} from '../controllers/survey.controller.js';
import { verifyToken } from '../controllers/user.controllers.js';

const router = express.Router();

// Créer un formulaire
router.post('/create', verifyToken,createSurvey);

// Récupérer tous les formulaires
router.get('/', getSurveys);

// Récupérer un formulaire spécifique par son ID
router.get('/:id', getSurveyById);

router.get('/survey-responses/:id', getResponses);

router.get('/responses/:id', getResponse);

// Mettre à jour un formulaire
router.put('/:id',verifyToken, updateSurvey);

// Supprimer un formulaire
router.delete('/:id',verifyToken, deleteSurvey);

router.post('/submit/:id', submitSurvey);

router.get('/:id/export', exportResponsesToCSV);

export default router;
