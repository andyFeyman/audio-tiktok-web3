import xss from 'xss';
import { prisma } from '../prisma.js';


export const addComment = async (req, res) => {
  try {

    const { audioId, content } = req.body;
    // 过滤 HTML 标签，只保留纯文本
    const sanitizedContent = xss(content, {
      whiteList: {}, // 不允许任何 HTML 标签
      stripIgnoreTag: true, // 过滤掉不在白名单里的标签
    });

    if (sanitizedContent.length > 200) {
      return res.status(400).json({ error: 'Comment too long' });
    }

    const userId = req.user.id;

    if (!audioId || !content?.trim()) return res.status(400).json({ error: 'Missing audioId or content' });


    const comment = await prisma.comment.create({
      data: {
        audioId,
        userId,
        content: sanitizedContent
      },
      include: { user: { select: { username: true } } },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Comment Create Error:", error);
    res.status(500).json({ error: 'Database error' });
  }
};

export const getComments = async (req, res) => {
  const { audioId } = req.params;
  const comments = await prisma.comment.findMany({
    where: { audioId },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.json(comments);
};