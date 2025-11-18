import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addComment, getComments } from '../controllers/commentController.js';

const router = Router();

router.post('/', authMiddleware, addComment);
router.get('/:audioId', getComments); // 公开查看

export default router;