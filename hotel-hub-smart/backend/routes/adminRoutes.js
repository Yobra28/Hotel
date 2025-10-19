import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getAllStaff,
  createStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  toggleStaffStatus
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes and ensure admin access
router.use(protect, adminOnly);

// Staff management endpoints
router.get('/staff', getAllStaff);
router.post('/staff', createStaff);
router.get('/staff/:id', getStaffById);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);
router.patch('/staff/:id/toggle-status', toggleStaffStatus);

export default router;
