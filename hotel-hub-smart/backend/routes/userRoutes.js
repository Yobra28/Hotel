import express from 'express';

const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'User routes - Coming soon' });
});

export default router;