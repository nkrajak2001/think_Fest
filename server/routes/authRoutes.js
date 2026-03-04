import express from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
} from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.getMe);
router.patch('/me', authMiddleware, validateProfileUpdate, AuthController.updateProfile);
router.post('/change-password', authMiddleware, validatePasswordChange, AuthController.changePassword);

export default router;