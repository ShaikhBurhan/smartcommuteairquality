import express from 'express';
import { getHealthCheck } from '../controllers/indexController.js';

const router = express.Router();

router.get('/health', getHealthCheck);

export default router;
