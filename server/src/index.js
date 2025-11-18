import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { prisma } from './prisma.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/audios', audioRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/health', async (req, res) => {
  await prisma.$connect();
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));