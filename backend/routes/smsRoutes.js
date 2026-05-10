import express from 'express';
import { sendOTPController, verifyOTPController, sendSMSController } from '../controllers/smsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All SMS routes require authentication
router.post('/send-otp', protect, sendOTPController);
router.post('/verify-otp', protect, verifyOTPController);
router.post('/send', protect, sendSMSController);

export default router;
