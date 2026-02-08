import { prisma } from '../prisma.js';
import pkg from '@andresaya/edge-tts';
const { EdgeTTS } = pkg;
const tts = new EdgeTTS();

export const getFeed = async (req, res) => {
  try {
    const { style, language } = req.query;

    // 1. Security: Strict input validation to prevent NoSQL Injection
    // Define allowed values based on Schema
    const ALLOWED_STYLES = ['wealth', 'health', 'peace'];
    const ALLOWED_LANGUAGES = ['en', 'zh', 'es'];

    const where = {};

    // Only add to filter if it EXACTLY matches allowed values
    if (language && ALLOWED_LANGUAGES.includes(language)) {
      where.language = language;
    } else {
      where.language = 'en';
    }

    if (style && ALLOWED_STYLES.includes(style)) {
      where.style = style;
    }


    // OPTIMIZED: Random Index Method (O(log N))
    // 1. Generate a random float
    const r = Math.random();

    // 2. Try to find 10 items with randomId >= r
    // This uses the compound index [language, style, randomId] effectively
    let audios = await prisma.audio.findMany({
      where: {
        ...where,
        randomId: { gte: r }
      },
      orderBy: { randomId: 'asc' },
      take: 10
    });

    // 3. If we didn't get enough (e.g. r was 0.99), wrap around and fetch from start
    if (audios.length < 10) {
      const remaining = 10 - audios.length;
      const wrapAudios = await prisma.audio.findMany({
        where: {
          ...where,
          randomId: { lt: r }
        },
        orderBy: { randomId: 'asc' },
        take: remaining
      });
      audios = [...audios, ...wrapAudios];
    }

    // Fallback: If still nothing, it means empty DB or very restrictive filter. 
    // Logic above covers all cases unless count=0.

    // Remap typical ID format for client
    // Note: findMany returns slightly different structure than aggregateRaw (id is usually object or string depending on schema)
    // In schema.prisma, id is String @db.ObjectId. So 'id' is available directly. 
    // But our previous 'plainAudios' map expected aggregateRaw format (_id: {$oid:...})
    // We need to adjust mapping.
    const plainAudios = audios.map((a) => ({
      ...a,
      id: a.id, // Prisma returns string for @db.ObjectId
    }));

    // Old manual mapping removed since findMany returns clean objects
    // But we still need to support the client's expected structure if it relies on 'plainAudios' var
    // We already defined 'plainAudios' above. So just remove the old mapping block.
    // ... Actually, the previous step defined 'plainAudios'. So we just delete this block.

    // 4. Return clean data
    res.json(plainAudios);
  } catch (err) {
    console.error('[getFeed] Error:', err);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};

export const getAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const audio = await prisma.audio.findUnique({
      where: { id }
    });

    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    res.json(audio);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
};

export const createAudio = async (req, res) => {
  try {
    const { url, style, language = 'en', transcript, setName } = req.body;

    // 1. 基本字段验证
    if (!url || !transcript) {
      return res.status(400).json({ error: 'Missing url or transcript' });
    }

    // 2.Transcript 长度与安全校验
    const cleanTranscript = transcript.trim();
    if (cleanTranscript.length > 50000) { // 设置 50k 字符限制，满足超长音频需求同时也防止滥用
      return res.status(400).json({ error: 'Transcript too long (max 50,000 characters)' });
    }

    // 3. Generate Random ID for high-performance sampling
    const randomId = Math.random();

    const audio = await prisma.audio.create({
      data: {
        url,
        style,
        language,
        transcript: cleanTranscript,
        randomId,
        setName: setName || null
      },
    });

    res.status(201).json(audio);
  } catch (err) {
    console.error('Create Audio Error:', err);
    res.status(500).json({ error: 'Failed to create audio' });
  }
};



export const favorite = async (req, res) => {
  const { audioId } = req.body;
  const userId = req.user.id;

  try {
    // 1. 获取用户当前的收藏列表
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favorites: true }
    });

    const isAlreadyFavorited = user.favorites.includes(audioId);

    // 2. 使用事务处理 Toggle 逻辑
    await prisma.$transaction(async (tx) => {
      if (isAlreadyFavorited) {
        // 取消点赞：从数组移除，计数器减 1
        await tx.user.update({
          where: { id: userId },
          data: { favorites: { set: user.favorites.filter(id => id !== audioId) } }
        });
        await tx.audio.update({
          where: { id: audioId },
          data: { favoriteCount: { decrement: 1 } }
        });
      } else {
        // 执行点赞：推入数组，计数器加 1
        await tx.user.update({
          where: { id: userId },
          data: { favorites: { push: audioId } }
        });
        await tx.audio.update({
          where: { id: audioId },
          data: { favoriteCount: { increment: 1 } }
        });
      }
    });

    res.json({ success: true, isFavorited: !isAlreadyFavorited });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Favorite toggle failed' });
  }
};

export const share = async (req, res) => {
  const { audioId } = req.body;

  await prisma.audio.update({
    where: { id: audioId },
    data: { shareCount: { increment: 1 } },
  });

  res.json({ shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/audio/${audioId}` });
};


//generateTTS
export const generateTTS = async (req, res) => {
  const { text, language } = req.body;

  // 1. 安全防护：文本长度硬性限制
  if (!text || text.length > 400) {
    return res.status(400).json({ error: 'Text too long (max 400 chars)' });
  }

  try {
    const voice = language === 'zh' ? 'zh-CN-XiaoxiaoNeural' : 'en-US-GuyNeural'; // 映射 Edge TTS 语音

    // 调用 Edge TTS
    await tts.synthesize(text, voice);
    const buffer = tts.toBuffer();

    // 2. 资源管理：不保存文件，直接发送 Buffer
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length
    });
    res.send(buffer);
  } catch (err) {
    console.error('Edge TTS Error:', err);
    res.status(500).json({ error: 'AI Voice synthesis failed' });
  }
};