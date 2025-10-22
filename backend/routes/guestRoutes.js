import express from 'express';
import { protect, staffOnly, receptionistAccess } from '../middleware/auth.js';
import { listGuests, getGuest, createGuest, updateGuest, deleteGuest } from '../controllers/guestController.js';

const router = express.Router();

// All guest management routes require authenticated staff
router.use(protect, staffOnly);

// List and fetch guests
router.get('/', listGuests);
router.get('/:id', getGuest);

// Create/update/delete guests (receptionist or admin)
router.post('/', receptionistAccess, createGuest);
router.put('/:id', receptionistAccess, updateGuest);
router.delete('/:id', receptionistAccess, deleteGuest);

export default router;
