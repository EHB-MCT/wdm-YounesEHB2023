import express from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { UserRepository } from '../repositories/UserRepository.js';

const router = express.Router();
const userRepository = new UserRepository();
const adminController = new AdminController(userRepository);

// Admin authentication
router.post('/login', adminController.login.bind(adminController));

// Protected admin routes
router.get('/users', adminAuth, adminController.getUsers.bind(adminController));
router.get('/stats', adminAuth, adminController.getUserStats.bind(adminController));
router.get('/users/:userId/insights', adminAuth, adminController.getUserInsights.bind(adminController));
router.get('/insights', adminAuth, adminController.getAllUserInsights.bind(adminController));

export default router;