import express from 'express';
import { protect, staffOnly, adminOnly } from '../middleware/auth.js';
import { listSwimmingActivities, createSwimmingActivity, updateSwimmingActivity, deleteSwimmingActivity } from '../controllers/swimmingActivityController.js';

const router = express.Router();

router.use('/swimming', protect);
router.get('/swimming', listSwimmingActivities);

// Management routes
router.use('/swimming', staffOnly);
router.post('/swimming', adminOnly, createSwimmingActivity);
router.put('/swimming/:id', adminOnly, updateSwimmingActivity);
router.delete('/swimming/:id', adminOnly, deleteSwimmingActivity);

export default router;
