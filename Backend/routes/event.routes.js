import express from 'express';
import { createEvent, getEvents,getEventsPublic, getEvent, getEventPublic, updateEvent, deleteEvent, register, checkParticipant } from '../controllers/event.controller.js';
import upload from '../middleware/uploadMiddleWare.js';
import { verifyToken } from '../controllers/user.controllers.js';


const router = express.Router();


router.get('/',verifyToken,getEvents);
router.get('/public',getEventsPublic);
router.get('/:id',verifyToken,getEvent);
router.get('/public/:id',getEventPublic);
router.post('/create', verifyToken,upload.single('image'),createEvent);
router.put('/update/:id',verifyToken,updateEvent);
router.delete('/delete/:id',verifyToken,deleteEvent);
router.post('/register',register);
router.post('/checkParticipants',verifyToken,checkParticipant);


export default router;