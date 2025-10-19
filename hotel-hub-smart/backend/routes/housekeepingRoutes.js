import express from 'express';
import { protect, staffOnly, adminOnly, housekeepingAccess } from '../middleware/auth.js';
import { listTasks, myTasks, createTask, updateTask, updateTaskStatus, deleteTask } from '../controllers/housekeepingController.js';

const router = express.Router();

router.use('/tasks', protect, staffOnly);
router.get('/tasks', listTasks);
router.get('/tasks/my', housekeepingAccess, myTasks);
router.post('/tasks', adminOnly, createTask);
router.put('/tasks/:id', adminOnly, updateTask);
router.patch('/tasks/:id/status', housekeepingAccess, updateTaskStatus);
router.delete('/tasks/:id', adminOnly, deleteTask);

export default router;
