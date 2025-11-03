import express from 'express';
import upload from '../middleware/uploadMiddleWare.js';
import { verifyToken } from '../controllers/user.controllers.js';
import { createReport, getReport, getReports, getReportsForUser } from '../controllers/report.controller.js';


const router = express.Router();


router.get('/',verifyToken,getReports);
router.get('/:id',verifyToken,getReport);
router.get('/user/:userId',verifyToken,getReportsForUser);
router.post('/create', verifyToken,upload.single('image'),createReport);
// router.put('/update/:id',verifyToken,updateEvent);
// router.delete('/delete/:id',verifyToken,deleteEvent);



export default router;