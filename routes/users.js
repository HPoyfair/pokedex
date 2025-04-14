import express from 'express';
import User from '../models/User.js';
const router = express.Router();

// Get all users (excluding password)
router.get('/', async (req, res) => {
  const users = await User.find().select('_id username');
  res.json(users);
});

// Get another user's collection
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username collection');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
