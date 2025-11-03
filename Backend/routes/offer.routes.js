import express from 'express';
import upload from '../middleware/uploadMiddleWare.js';
import { verifyToken } from '../controllers/user.controllers.js';
import { applyJobOffer, createJobOffer, deleteJobOffer, getCandidates, getJobOffer, getJobOffers, updateJobOffer } from '../controllers/jobOffer.controller.js';


const router = express.Router();


router.get('/',getJobOffers);
router.get('/:id',getJobOffer);
router.get('/:id/candidates/', verifyToken, getCandidates);
router.post('/create', verifyToken,createJobOffer);
router.put('/update/:id',verifyToken,updateJobOffer);
router.delete('/delete/:id',verifyToken,deleteJobOffer);
router.post('/apply/:id',upload.fields([{name:'cv'}, {name:'optionalFile'}]),applyJobOffer);
//router.post('/register',register);
//router.post('/checkParticipants',verifyToken,checkParticipant);


export default router;