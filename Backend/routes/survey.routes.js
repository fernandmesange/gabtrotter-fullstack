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
  syncSurveyResponses,
} from '../controllers/survey.controller.js';
import { requireRoles, verifyToken } from '../controllers/user.controllers.js';

const router = express.Router();

// Créer un formulaire
router.post('/create', verifyToken, requireRoles('admin', 'supervisor'), createSurvey);

// Récupérer tous les formulaires
router.get('/', verifyToken, getSurveys);

// Récupérer un formulaire spécifique par son ID
router.get('/:id', verifyToken, getSurveyById);

router.get('/survey-responses/:id', verifyToken, requireRoles('admin', 'supervisor'), getResponses);

router.get('/responses/:id', verifyToken, requireRoles('admin', 'supervisor'), getResponse);

// Mettre à jour un formulaire
router.put('/:id', verifyToken, requireRoles('admin', 'supervisor'), updateSurvey);

// Supprimer un formulaire
router.delete('/:id', verifyToken, requireRoles('admin', 'supervisor'), deleteSurvey);

router.post('/sync', verifyToken, requireRoles('agent', 'supervisor', 'admin'), syncSurveyResponses);
router.post('/submit/:id', verifyToken, requireRoles('agent', 'supervisor', 'admin'), submitSurvey);

router.get('/:id/export', verifyToken, requireRoles('admin', 'supervisor'), exportResponsesToCSV);

export default router;
