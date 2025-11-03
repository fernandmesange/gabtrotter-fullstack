import express from 'express';
import { verifyToken } from '../controllers/user.controllers.js';
import { answerToMessage, getMessages, sendToContact } from '../controllers/contact.controller.js';


const router = express.Router();


router.get('/',verifyToken,getMessages);
router.post('/send',sendToContact);
router.post('/answer/:id',verifyToken,answerToMessage);


export default router;