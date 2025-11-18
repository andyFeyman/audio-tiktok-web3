import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { getFeed, createAudio, addToHistory, getHistory, favorite, share } from '../controllers/audioController.js';

const router = Router();

// 公开随机 feed
router.get('/feed', getFeed);

// 管理员上传
router.post('/', authMiddleware, adminMiddleware, createAudio);

// 认证功能
router.post('/history', authMiddleware, addToHistory);
router.get('/history', authMiddleware, getHistory);
router.post('/favorite', authMiddleware, favorite);
router.post('/share', authMiddleware, share);

export default router;