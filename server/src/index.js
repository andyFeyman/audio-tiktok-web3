import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { prisma } from './prisma.js';
import logger from './utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Request Logger Middleware
app.use((req, res, next) => {
  logger.info({
    type: 'REQUEST',
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/audios', audioRoutes);
app.use('/api/comments', commentRoutes);

// Client Log Endpoint
app.post('/api/logs', (req, res) => {
  const { level, message, details } = req.body;
  logger.log(level || 'info', {
    type: 'CLIENT',
    message,
    ...details,
    clientIp: req.ip,
  });
  res.sendStatus(200);
});

// Health check
app.get('/health', async (req, res) => {
  await prisma.$connect();
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

// 把 Vite 打包好的静态文件提供出来
app.use(express.static(path.resolve(__dirname, '../../client/dist')));

// 所有非 API、非静态资源的请求返回前端入口
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    // 已经在上方的 /api 路由里处理
    return;
  }
  res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error({
    type: 'ERROR',
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });
  res.status(500).json({ error: 'Internal Server Error' });
});