import express from 'express';

const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Receptionist routes - Coming soon' });
});

export default router;