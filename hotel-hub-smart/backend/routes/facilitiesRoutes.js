import express from 'express';
import { protect, staffOnly, adminOnly } from '../middleware/auth.js';
import { listPools, getPool, createPool, updatePool } from '../controllers/poolController.js';
import { listEquipment, createEquipment, updateEquipment, deleteEquipment } from '../controllers/equipmentController.js';

const router = express.Router();

// Pools
router.use('/pools', protect);
router.get('/pools', listPools);
router.get('/pools/:id', getPool);
router.post('/pools', staffOnly, createPool);
router.put('/pools/:id', staffOnly, updatePool);

// Equipment
router.use('/equipment', protect);
router.get('/equipment', listEquipment);
router.post('/equipment', staffOnly, createEquipment);
router.put('/equipment/:id', staffOnly, updateEquipment);
router.delete('/equipment/:id', adminOnly, deleteEquipment);

export default router;
