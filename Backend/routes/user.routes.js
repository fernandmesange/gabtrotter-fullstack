import express from 'express';
import { signup, signUpWithLink, deleteUser, updateUserWithLink,login,verifyToken, requireRoles, requireSelfOrRoles, checkStatus, forgotPassword, verifyPasswordToken, resetPassword, getUsers, updateUser, getUser, signUpFromLandingPage, updateUserFromLandingPage } from '../controllers/user.controllers.js';

const router = express.Router();

router.post('/login',login);
router.post('/register', signup);
router.post('/subscribe-link', signUpFromLandingPage);
router.post('/update-subscriber-link', updateUserFromLandingPage);
router.post('/create-user', verifyToken, requireRoles('admin'), signUpWithLink);
router.post('/update-new-user', updateUserWithLink);
router.put('/update-user/:id', verifyToken, requireRoles('admin'), updateUser);
router.delete('/delete-user/:id', verifyToken, requireRoles('admin'), deleteUser);
router.get('/checkAuth',verifyToken,checkStatus);
router.get('/', verifyToken, requireRoles('admin', 'supervisor'), getUsers);
router.get('/:userId', verifyToken, requireSelfOrRoles('admin', 'supervisor'), getUser);
router.post('/forgot-password',forgotPassword);
router.post('/verify-password-token',verifyPasswordToken);
router.post('/reset-password',resetPassword);
export default router;
