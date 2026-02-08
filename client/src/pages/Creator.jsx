import React, { useState, useRef, useEffect } from 'react';
import { generateTTS } from '../api';
import LoopButton from '../components/LoopButton';
import { useToast } from '../context/ToastContext';
import Footer from '../components/Footer';

const Creator = () => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const audioRef = useRef(null);

  // ----- 清理 Blob URL -----
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Mobile Check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SEO Optimization
  useEffect(() => {
    document.title = "Create Self Hypnosis Audio - AudioTik";
    const updateMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    updateMeta('description', 'Create your own AI-generated audio for Self-Hypnosis, Manifestation, and Affirmations. Text to Speech for wellness.');
    updateMeta('keywords', 'Create Audio, TTS, Self hypnosis, Manifestation, Generator, AI Voice');
  }, []);

  const togglePlay = () => {
    if (!audioUrl || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Play blocked"));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioUrl, isPlaying]);

  // 1. 生成并处理音频流
  const handleGenerate = async () => {
    if (!text.trim()) return showToast("Please enter some text");
    if (text.length > 400) return showToast('Text cannot exceed 400 characters');
    setLoading(true);

    try {
      const response = await generateTTS({ text, language: lang });

      // 关键步骤：旧 URL 必须销毁防止内存溢出
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      // response.data 是一个 Blob 对象
      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
      showToast("AI Audio Ready! 🎙️");

      // 自动播放并同步 isPlaying
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => showToast('Playback blocked – click to start'));
        }
      }, 100);
    } catch (err) {
      const msg = err.response?.status === 401
        ? 'Connect wallet first!'
        : err.response?.data?.error || 'Generation failed';
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes vinylRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
        .vinyl-simple {
          width: ${isMobile ? '160px' : '200px'}; 
          height: ${isMobile ? '160px' : '200px'}; 
          border-radius: 50%; border: 4px solid #222; position: relative;
          background: conic-gradient(#050505, #333, #050505, #333, #050505);
          animation: vinylRotate 8s linear infinite;
          animation-play-state: ${isPlaying ? 'running' : 'paused'};
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          transition: all 0.5s ease;
        }
        .vinyl-simple.loading {
          animation: pulse 2s infinite ease-in-out;
          opacity: 0.5;
        }
        .vinyl-simple::after {
          content: ""; position: absolute; top: 20px; width: 6px; height: 6px;
          background: rgba(255,255,255,0.4); border-radius: 50%;
        }
        .play-btn-simple {
          width: 80px; height: 80px; background: rgba(255,255,255,0.2);
          color: #fff; border-radius: 50%; display: flex; align-items: center; 
          justify-content: center; font-size: 30px; backdrop-filter: blur(8px);
        }
      `}</style>


      {/* 动态渐变背景：随播放状态变亮 */}
      <div style={{
        ...styles.backgroundGlow,
        background: `radial-gradient(circle at center, ${isPlaying ? '#1a3a5a' : '#111'} 0%, #000 100%)`
      }} />

      <div style={styles.mainContent}>
        {/* 黑胶视觉反馈：和 Feed 保持一致 */}
        <div style={{ ...styles.diskWrapper, marginBottom: isMobile ? '20px' : '30px' }} onClick={togglePlay}>
          <div className={`vinyl-simple ${loading ? 'loading' : ''}`}>
            <div style={{ width: '10px', height: '10px', background: '#000', borderRadius: '50%' }} />
          </div>
          {!isPlaying && (
            <div style={styles.playOverlay}>
              <div className="play-btn-simple">▶</div>
            </div>
          )}
        </div>

        {/* 交互输入区 */}
        <div style={{ ...styles.inputCard, width: isMobile ? '95%' : '90%', padding: isMobile ? '15px' : '30px' }}>
          <textarea
            style={{ ...styles.textarea, height: isMobile ? '100px' : '140px' }}
            placeholder="Type content to synthesize AI Voice..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 400))}
          />
          <div style={{ ...styles.actionRow, flexDirection: isMobile ? 'column' : 'row' }}>
            <select style={styles.select} value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English (US)</option>
              <option value="zh">Chinese (CN)</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{ ...styles.genBtn, padding: isMobile ? '12px' : '0' }}
            >
              {loading ? "Synthesizing..." : "GENERATE VOICE"}
            </button>
          </div>
          <div style={styles.charCount}>{text.length} / 400 characters</div>
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            loop={isLooping}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => !isLooping && setIsPlaying(false)}
          />
        )}

        <div style={{ ...styles.sideControl, right: isMobile ? '10px' : '30px' }}>
          <LoopButton isLooping={isLooping} onToggle={() => setIsLooping(!isLooping)} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: { height: '100%', backgroundColor: '#000', color: '#fff', position: 'relative', overflow: 'hidden' },
  backgroundGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, filter: 'blur(100px)', transition: 'background 1s ease' },
  mainContent: { zIndex: 1, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' },

  diskWrapper: { position: 'relative', marginBottom: '30px', cursor: 'pointer' },
  playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none' },

  inputCard: { width: '90%', maxWidth: '500px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' },
  textarea: { width: '100%', height: '140px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', padding: '15px', fontSize: '1rem', outline: 'none', resize: 'none' },
  actionRow: { marginTop: '15px', display: 'flex', gap: '10px' },
  select: { flex: 1, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '10px', padding: '10px', outline: 'none', cursor: 'pointer', height: '50px' },
  genBtn: { flex: 2, background: '#fff', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s', height: '50px' },
  charCount: { textAlign: 'right', fontSize: '0.7rem', opacity: 0.4, marginTop: '8px' },

  sideControl: { position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)' }
};

export default Creator;