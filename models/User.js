import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  collection: {
    type: [Number], // stores National Dex numbers of collected Pokémon
    default: [],
  },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
