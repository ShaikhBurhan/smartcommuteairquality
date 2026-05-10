import express from 'express';
import { calculatePRIMRoute, saveJourney } from '../controllers/primController.js';

const router = express.Router();

router.post('/calculate', calculatePRIMRoute);
router.post('/save', saveJourney);

export default router;
