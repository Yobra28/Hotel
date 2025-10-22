import express from 'express';
import { protect, staffOnly, receptionistAccess, guestAccess, adminOnly } from '../middleware/auth.js';
import { listMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } from '../controllers/menuController.js';

const router = express.Router();

// Public or guest view could be optional; secure by default
router.use(protect);

// List available items for any authenticated user
router.get('/items', listMenuItems);

// Staff management
router.use(staffOnly);
router.post('/items', receptionistAccess, createMenuItem);
router.put('/items/:id', receptionistAccess, updateMenuItem);
router.delete('/items/:id', adminOnly, deleteMenuItem);
router.patch('/items/:id/toggle', receptionistAccess, toggleAvailability);

export default router;
