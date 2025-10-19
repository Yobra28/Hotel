import express from 'express';
import { protect, staffOnly, receptionistAccess, adminOnly } from '../middleware/auth.js';
import {
  listRooms,
  listAvailableRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';

const router = express.Router();

// Public available rooms endpoint (optionally make it protected if needed)
router.get('/available', listAvailableRooms);

// Protected routes
router.use(protect, staffOnly);

router.get('/', listRooms);
router.get('/:id', getRoom);

// Creation and mutations - receptionist and admin can create/update; only admin can delete
router.post('/', receptionistAccess, createRoom);
router.put('/:id', receptionistAccess, updateRoom);
router.delete('/:id', adminOnly, deleteRoom);

export default router;
