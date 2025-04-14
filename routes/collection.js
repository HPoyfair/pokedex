import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get current user's collection
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('collection');
  res.json(user.collection);
});

// Add a Pokémon to collection
router.post('/add', auth, async (req, res) => {
  const { dexNumber } = req.body;
  const user = await User.findById(req.user.id);

  if (!user.collection.includes(dexNumber)) {
    user.collection.push(dexNumber);
    await user.save();
  }

  res.json(user.collection);
});

// Remove a Pokémon from collection
router.post('/remove', auth, async (req, res) => {
  const { dexNumber } = req.body;
  const user = await User.findById(req.user.id);

  user.collection = user.collection.filter(num => num !== dexNumber);
  await user.save();

  res.json(user.collection);
});

export default router;
