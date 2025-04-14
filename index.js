import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import collectionRoutes from './routes/collection.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/users', userRoutes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Development test route
  app.get('/', (req, res) => {
    res.send('Pokedex API is running');
  });
}

// Connect to DB and start server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ MongoDB connection error:', err));
