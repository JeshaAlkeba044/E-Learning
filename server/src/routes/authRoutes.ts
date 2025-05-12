import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from '../controllers/authController';
import { validateRegister, validateLogin, authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/verify-email', verifyEmail);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;