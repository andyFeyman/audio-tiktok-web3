import pkg from '@andresaya/edge-tts';

const { EdgeTTS } = pkg;
const tts = new EdgeTTS();

//Edge TTS Doc: https://www.npmjs.com/package/@andresaya/edge-tts

export const generateTTS = async (req, res) => {
  try {
    const { text, language } = req.body;

    // 1. 防御：校验长度
    if (!text || text.length > 400) {
      return res.status(400).json({ error: "Text exceeds 400 characters" });
    }

    const voice = (language === 'zh' || language === 'cn') ? 'zh-TW-YunJheNeural' : 'en-US-GuyNeural';

    // 2. 执行请求
    await tts.synthesize(text, voice, {
      rate: '80%',
      volume: '90%',
    });
    const buffer = tts.toBuffer();

    // 3. 最优方案：不存磁盘，直接返回二进制流
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);

  } catch (err) {
    console.error('TTS Error:', err);
    res.status(500).json({ error: "Voice synthesis failed" });
  }
};

