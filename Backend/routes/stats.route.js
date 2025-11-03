import express from 'express';
import upload from '../middleware/uploadMiddleWare.js';
import { verifyToken } from '../controllers/user.controllers.js';
import { getAgentStats, getCourseTrainerStats, getEventStats, getOfferStats, getReportStats, getSurveyStats, getUserStats } from '../controllers/stats.controller.js';


const router = express.Router();


router.get('/users',getUserStats);
router.get('/surveys',getSurveyStats);
router.get('/activities',getEventStats);
router.get('/reports',getReportStats);
router.get('/offers',getOfferStats);
router.get('/agent/:agentId',getAgentStats);
router.get('/courses/:trainerId',getCourseTrainerStats);



export default router;