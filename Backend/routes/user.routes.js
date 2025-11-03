import express from 'express';
import { signup, signUpWithLink, deleteUser, updateUserWithLink,login,verifyToken, checkStatus, forgotPassword, verifyPasswordToken, resetPassword, getUsers, updateUser, getUser, signUpFromLandingPage, updateUserFromLandingPage } from '../controllers/user.controllers.js';

const router = express.Router();

router.post('/login',login);
router.post('/register', signup);
router.post('/subscribe-link', signUpFromLandingPage);
router.post('/update-subscriber-link', updateUserFromLandingPage);
router.post('/create-user',verifyToken, signUpWithLink);
router.post('/update-new-user', updateUserWithLink);
router.put('/update-user/:id',verifyToken,updateUser);
router.delete('/delete-user/:id',verifyToken,deleteUser);
router.get('/checkAuth',verifyToken,checkStatus);
router.get('/',verifyToken,getUsers);
router.get('/:userId',verifyToken,getUser);
router.post('/forgot-password',forgotPassword);
router.post('/verify-password-token',verifyPasswordToken);
router.post('/reset-password',resetPassword);
export default router;