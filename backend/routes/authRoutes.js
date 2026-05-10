import express from 'express';
import {
    register,
    login,
    getMe,
    refreshTokenHandler,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendOTP,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Public Auth Routes ───────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// ─── Token Management ────────────────────────────────────────────────────────
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logout);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me', protect, getMe);

export default router;
