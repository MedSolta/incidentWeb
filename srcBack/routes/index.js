import express from 'express';
import adminRoutes from './admin.routes.js';
import operateurRoutes from './operateur.routes.js';
import technicienRoutes from './technicien.routes.js';
import incidentRoutes from './incident.routes.js';
import feedbackRoutes from './feedback.routes.js';
import notificationRoutes from './notification.routes.js';
import authRoutesAdmin from './auth/admin.routes.js';
import authRoutesTechnicien from './auth/technicien.routes.js';
import authRoutesOperateur from './auth/operateur.routes.js';
import { verifyToken, isAdmin, isOperateur, isTechnicien } from '../middleware/auth.js';

const router = express.Router();

// Auth routes (public)
router.use('/api/auth', authRoutesAdmin, authRoutesOperateur, authRoutesTechnicien);

// Protected routes
router.use('/api/admins', verifyToken, adminRoutes);
router.use('/api/operateurs', operateurRoutes);
router.use('/api/techniciens', technicienRoutes);
router.use('/api/incidents', isAdmin, isTechnicien, incidentRoutes);
router.use('/api/feedbacks', isAdmin, isTechnicien, feedbackRoutes);
router.use('/api/notifications', isTechnicien, notificationRoutes);
//router.use('/api/notifications', verifyToken, isAdmin, notificationRoutes);

export default router;