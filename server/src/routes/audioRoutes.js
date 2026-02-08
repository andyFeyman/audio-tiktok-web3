import { Router } from 'express';
import { authMiddleware, adminMiddleware, optionalAuth } from '../middleware/authMiddleware.js';
import { getFeed, createAudio, favorite, share, getAudio } from '../controllers/audioController.js';
import { getR2SignedUrl } from '../controllers/r2Controller.js';
import { generateTTS } from '../controllers/audioController.js';

const router = Router();

// 新增：管理员获取 R2 预签名 URL
router.post('/signed-url', authMiddleware, adminMiddleware, getR2SignedUrl);

// 公开随机 feed
router.get('/feed', getFeed);

// 获取单条音频（分享页使用）
router.get('/:id', getAudio);

// 管理员上传
router.post('/', authMiddleware, adminMiddleware, createAudio);


router.post('/favorite', authMiddleware, favorite);
router.post('/share', share);

router.post('/tts', authMiddleware, generateTTS); // 必须登录，防匿名滥用

export default router;