import { prisma } from '../prisma.js';

export const addComment = async (req, res) => {
  const { audioId, content } = req.body;
  const userId = req.user.id;

  if (!content.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });

  const comment = await prisma.comment.create({
    data: { audioId, userId, content },
    include: { user: { select: { username: true } } },
  });

  res.status(201).json(comment);
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