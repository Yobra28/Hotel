import express from 'express';
import { protect, staffOnly, receptionistAccess, adminOnly } from '../middleware/auth.js';
import {
  listRooms,
  listAvailableRooms,
  listRoomsSummary,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';

const router = express.Router();

// Public endpoints for availability/summary
router.get('/available', listAvailableRooms);
router.get('/summary', listRoomsSummary);

// Protected routes
router.use(protect, staffOnly);

router.get('/', listRooms);
router.get('/:id', getRoom);

// Creation and mutations - receptionist and admin can create/update; only admin can delete
router.post('/', receptionistAccess, createRoom);
router.put('/:id', receptionistAccess, updateRoom);
router.delete('/:id', adminOnly, deleteRoom);

export default router;
