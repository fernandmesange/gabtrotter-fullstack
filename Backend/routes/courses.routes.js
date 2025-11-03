import express from 'express';
import upload from '../middleware/uploadMiddleWare.js';
import { verifyToken } from '../controllers/user.controllers.js';
import { addChapters, createCourses, deleteCourse, getAllCoursesPublic, getTrainerCourses, subscribe, validateCourse } from '../controllers/courses.controller.js';
import { getAllCourses,getCourse } from '../controllers/courses.controller.js';
import { toggleChapterLock } from './../controllers/courses.controller.js';


const router = express.Router();


// router.get('/',getJobOffers);
// router.get('/:id',getJobOffer);
// router.get('/:id/candidates/', verifyToken, getCandidates);
router.get('/public', verifyToken, getAllCoursesPublic); // Route statique
router.post('/subscribe', verifyToken,subscribe );
router.get('/trainer/:trainerId', verifyToken, getTrainerCourses); // Route avec paramètre spécifique
router.get('/validate/:courseId', verifyToken, validateCourse); // Route avec paramètre spécifique
router.post('/create', verifyToken, createCourses);
router.delete('/delete/:id',verifyToken,deleteCourse);
router.get('/', verifyToken, getAllCourses); // Route pour récupérer tous les cours
router.post('/addChapter', upload.single('file'), addChapters);
router.get('/:id', verifyToken, getCourse); // Route dynamique pour récupérer un cours spécifique
router.get('/lock/:courseId/:chapterId', verifyToken, toggleChapterLock);

//router.post('/register',register);
//router.post('/checkParticipants',verifyToken,checkParticipant);


export default router;