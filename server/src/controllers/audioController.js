import { prisma } from '../prisma.js';

export const getFeed = async (req, res) => {
  try {
    const { style, language = 'en' } = req.query;

    const where = { language };
    if (style) where.style = style;

    const audios = await prisma.audio.aggregateRaw({
      pipeline: [
        { $match: where },
        { $sample: { size: 10 } }, // 随机 10 条
      ],
    });

    const plainAudios = audios.map((a) => ({
      id: a._id.$oid,
      ...a,
      _id: undefined,
    }));

    res.json(plainAudios);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};

export const createAudio = async (req, res) => {
  try {
    const { url, style, language = 'en', transcript } = req.body;
    if (!url || !transcript) return res.status(400).json({ error: 'Missing url or transcript' });

    const audio = await prisma.audio.create({
      data: { url, style, language, transcript },
    });

    res.status(201).json(audio);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create audio' });
  }
};

export const addToHistory = async (req, res) => {
  const { audioId } = req.body;
  const userId = req.user.id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      history: { push: audioId },
    },
  });

  res.json({ success: true });
};

export const getHistory = async (req, res) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { history: true } });
  if (!user?.history?.length) return res.json([]);

  const historyAudios = await prisma.audio.findMany({
    where: { id: { in: user.history.slice(0, 50) } }, // 限 50 条防性能
    orderBy: { createdAt: 'desc' },
  });

  res.json(historyAudios);
};

export const favorite = async (req, res) => {
  const { audioId } = req.body;
  const userId = req.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { favorites: { push: audioId } },
    });
    await tx.audio.update({
      where: { id: audioId },
      data: { favoriteCount: { increment: 1 } },
    });
  });

  res.json({ success: true });
};

export const share = async (req, res) => {
  const { audioId } = req.body;

  await prisma.audio.update({
    where: { id: audioId },
    data: { shareCount: { increment: 1 } },
  });

  res.json({ shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/audio/${audioId}` });
};