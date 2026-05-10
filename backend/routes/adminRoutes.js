import express from 'express';
import { getAllUsers, updateUser, deleteUser, getDashboardStats, getReportData } from '../controllers/adminController.js';
import { loginAdmin, getAdminProfile } from '../controllers/adminAuthController.js';
import { getMonitoredCities, addCity, removeCity, refreshCityAQI } from '../controllers/aqiAdminController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// ─── PUBLIC ADMIN ROUTES ──────────────────────────────────────────────────────
router.post('/login', loginAdmin);

// ─── PROTECTED ADMIN ROUTES ──────────────────────────────────────────────────
router.get('/profile', protectAdmin, getAdminProfile);

// Dashboard
router.get('/dashboard-stats', protectAdmin, getDashboardStats);

// User Management
router.get('/users', protectAdmin, getAllUsers);
router.put('/users/:id', protectAdmin, updateUser);
router.delete('/users/:id', protectAdmin, deleteUser);

// City / AQI Management
router.get('/cities', protectAdmin, getMonitoredCities);
router.post('/cities', protectAdmin, addCity);
router.delete('/cities/:id', protectAdmin, removeCity);
router.post('/cities/:id/refresh', protectAdmin, refreshCityAQI);

// Reports / Analytics
router.get('/reports', protectAdmin, getReportData);

export default router;
