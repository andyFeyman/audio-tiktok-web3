import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { getFeed, getAudio } from '../api';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import CommentSection from '../components/CommentSection';
import OrderButton from '../components/OrderButton';
import { useToast } from '../context/ToastContext';
import Footer from '../components/Footer';

/* ---------- parseSRT (utils) ---------- */
export const parseSRT = (srt) => {
  if (!srt) return [];

  // 如果不包含 SRT 的时间轴特征，则视为普通文本
  if (!srt.includes('-->')) {
    return [{
      start: 0,
      end: 99999, // 设为一个很大的值，确保一直显示
      text: srt.trim()
    }];
  }

  try {
    const blocks = srt.trim().split(/\r?\n\r?\n/);
    return blocks.map(block => {
      const lines = block.split(/\r?\n/);
      if (lines.length < 3) return null;
      const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      if (!timeMatch) return null;
      const toSec = (t) => {
        const [h, m, sms] = t.split(':');
        const [s, ms] = sms.split(',');
        return +h * 3600 + +m * 60 + +s + +ms / 1000;
      };
      return {
        start: toSec(timeMatch[1]),
        end: toSec(timeMatch[2]),
        text: lines.slice(2).join(' ')
      };
    }).filter(Boolean);
  } catch (err) {
    // 解析失败的回退逻辑
    return [{ start: 0, end: 99999, text: srt.trim() }];
  }
};

const LoadingScreen = () => (
  <div style={styles.loadingContainer}>
    <div className="pulse-loader" />
    <p style={{ marginTop: '20px', letterSpacing: '2px', fontSize: '0.8rem', opacity: 0.6 }}>LOADING AUDIOTIK</p>
  </div>
);

const Feed = ({ language }) => {
  const { showToast } = useToast();
  const [playMode, setPlayMode] = useState('order'); // 'order' | 'loop'
  const [audios, setAudios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /* ---------- Restored State & Handlers ---------- */
  const [showComments, setShowComments] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  // 字幕相关状态
  const [subtitles, setSubtitles] = useState([]);
  const [activeSubIndex, setActiveSubIndex] = useState(-1);
  const lyricContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  // Navigation button visual state
  const [activeBtn, setActiveBtn] = useState(null); // 'prev' | 'next' | null

  // Mobile Check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SEO Optimization
  useEffect(() => {
    document.title = "CompletedState - Psychotherapy, Self-Hypnosis & Manifestation Audio";
    const updateMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    updateMeta('description', 'Listen to AI-generated audios for Psychotherapy, Self-Hypnosis, and Manifestation. infinite stream of wellness content.');
    updateMeta('keywords', 'Psychotherapy, Self hypnosis, Manifestation, Audio, Wellness, Meditation, AI Voice');
  }, []);

  const shouldAutoPlayRef = useRef(false);

  const nextTrack = useCallback((autoPlay = false) => {
    // Infinite scroll logic: allow moving to next track if available
    if (currentIndex < audios.length - 1) {
      shouldAutoPlayRef.current = autoPlay;
      setCurrentIndex(prev => prev + 1);
      if (!autoPlay) {
        setIsPlaying(false);
      }
      setProgress(0);
      setActiveSubIndex(-1);
    }
  }, [currentIndex, audios.length]);

  const prevTrack = useCallback(() => {
    if (currentIndex > 0) {
      shouldAutoPlayRef.current = false;
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(false);
      setProgress(0);
      setActiveSubIndex(-1);
    }
  }, [currentIndex]);

  // Handle Playback on Track Change
  useEffect(() => {
    if (shouldAutoPlayRef.current && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Auto-play blocked", err));
      shouldAutoPlayRef.current = false;
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Play blocked"));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setProgress(dur ? (cur / dur) * 100 : 0);
    const idx = subtitles.findIndex(s => cur >= s.start && cur <= s.end);
    if (idx !== -1 && idx !== activeSubIndex) setActiveSubIndex(idx);
  };

  // 歌词滚动逻辑
  useEffect(() => {
    if (activeSubIndex !== -1 && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSubIndex]);

  const swipeHandlers = useSwipeable({
    onSwipedUp: nextTrack,
    onSwipedDown: prevTrack,
    trackMouse: true,
  });

  // Helper to trigger visual feedback
  const triggerNavFeedback = useCallback((direction) => {
    setActiveBtn(direction); // 'prev' or 'next'
    setTimeout(() => setActiveBtn(null), 200);
  }, []);

  // Combined handlers for navigation
  const handleNavPrev = useCallback(() => {
    triggerNavFeedback('prev');
    prevTrack();
  }, [triggerNavFeedback, prevTrack]);

  const handleNavNext = useCallback(() => {
    triggerNavFeedback('next');
    nextTrack();
  }, [triggerNavFeedback, nextTrack]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNavNext();
      if (e.key === 'ArrowLeft') handleNavPrev();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavNext, handleNavPrev, isPlaying]);

  const { id } = useParams();

  const loadData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let initialData = [];
      // 如果有分享 ID，且是第一次加载，则先获取该音频
      if (id && !isLoadMore) {
        try {
          const { data: sharedAudio } = await getAudio(id);
          if (sharedAudio) {
            initialData = [sharedAudio];
          }
        } catch (err) {
          console.error('Shared audio not found or error:', err);
        }
      }

      const { data: feedData } = await getFeed(language);
      const filteredFeed = feedData ? feedData.filter(a => a.id !== id) : [];
      const combinedData = [...initialData, ...filteredFeed];

      // If no data returned at all on init, show toast
      if (!combinedData.length && !isLoadMore) {
        showToast('No audio for this language');
      }

      if (combinedData.length) {
        setAudios(prev => isEmpty(prev) ? combinedData : (isLoadMore ? [...prev, ...combinedData] : combinedData));
      }

      if (!isLoadMore) {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [language, id]);

  // Helper for isEmpty check just in case, though standard checks are fine
  const isEmpty = (arr) => !arr || arr.length === 0;

  useEffect(() => { loadData(false); }, [loadData]);

  // Infinite scroll trigger: load more when near the end (3 items remaining)
  useEffect(() => {
    // Check if we are close to the end of the list
    if (!loading && !loadingMore && audios.length > 0) {
      const remaining = audios.length - 1 - currentIndex;
      // Pre-load when user is 3 items away from end
      if (remaining <= 3) {
        console.log(`Reaching end (remaining: ${remaining}), loading more...`);
        loadData(true);
      }
    }
  }, [currentIndex, audios.length, loading, loadingMore, loadData]);

  // 切歌时初始化数据
  useEffect(() => {
    const currentAudio = audios[currentIndex];
    if (currentAudio?.transcript) {
      const parsed = parseSRT(currentAudio.transcript);
      setSubtitles(parsed);
      setActiveSubIndex(-1);
      if (lyricContainerRef.current) lyricContainerRef.current.scrollLeft = 0;
    }
  }, [currentIndex, audios, parseSRT]);

  // if (loading) return <LoadingScreen />;

  const currentAudio = audios[currentIndex];
  // if (!currentAudio) return <div style={styles.loadingContainer}>No Audio Found</div>;

  // 兼容不同的 Style 大小写写法
  const getGenreColor = (style) => {
    if (!style) return '#111'; // Default loading color
    const s = style.toLowerCase();
    const map = { wealth: '#1a3a5a', health: '#26a269', peace: '#a51d2d' };
    return map[s] || '#222';
  };

  return (
    <div {...swipeHandlers} style={styles.container}>
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes vinylRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
        .pulse-loader { width: 40px; height: 40px; background: #fff; border-radius: 50%; animation: pulse 1.5s infinite; }
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
        .lyric-viewport {
          width: 100%; height: 100px; display: flex; align-items: center;
          overflow-x: auto; scroll-behavior: smooth; scrollbar-width: none;
          mask-image: linear-gradient(to right, transparent, black 25%, black 75%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 25%, black 75%, transparent);
        }
        .lyric-viewport::-webkit-scrollbar { display: none; }
        .lyric-wrapper { display: flex; align-items: center; padding: 0 50vw; white-space: nowrap; }
        .lyric-line { padding: 0 30px; font-size: ${isMobile ? '1.1rem' : '1.3rem'}; color: rgba(255,255,255,0.2); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
        .lyric-line.active { color: #fff; transform: scale(1.2); text-shadow: 0 0 20px rgba(255,255,255,0.6); }
        .nav-btn {
          width: 50px; height: 50px; border-radius: 50%;
          background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff; font-size: 1.2rem;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }
        .nav-btn:active, .nav-btn.active { 
          background: rgba(255,255,255,0.3); transform: scale(0.95); 
          box-shadow: 0 0 15px rgba(255,255,255,0.3);
          border-color: rgba(255,255,255,0.3);
        }
      `}</style>

      <div style={{
        ...styles.backgroundGlow,
        background: `radial-gradient(circle at center, ${isPlaying ? getGenreColor(currentAudio?.style) : (currentAudio ? '#111' : '#0a0a0a')} 0%, #000 100%)`
      }} />

      <div style={styles.mainContent}>
        <audio
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => console.log("Buffering...")}
          src={currentAudio?.url}
          loop={playMode === 'loop'}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            if (playMode === 'order') {
              nextTrack(true);
            }
            // If loop mode, native loop handles it
          }}
        />

        <div style={{ ...styles.diskWrapper, marginBottom: isMobile ? '20px' : '40px' }} onClick={togglePlay}>
          <div className={`vinyl-simple ${loading ? 'loading' : ''}`}>
            <div style={{ width: '10px', height: '10px', background: '#000', borderRadius: '50%' }} />
          </div>
          {!isPlaying && (
            <div style={styles.playOverlay}>
              <div className="play-btn-simple">▶</div>
            </div>
          )}
        </div>

        <div style={{ ...styles.textContainer, padding: isMobile ? '0 10px' : '0 20px' }}>
          <span style={styles.genreTag}>{currentAudio?.style?.toUpperCase() || (loading ? 'LOADING...' : '...')}</span>
          <div className="lyric-viewport" ref={lyricContainerRef}>
            <div className="lyric-wrapper">
              {loading ? (
                <div className="lyric-line active" style={{ opacity: 0.5 }}>Connecting to AI Feed...</div>
              ) : subtitles.length > 0 ? (
                subtitles.map((sub, i) => (
                  <div
                    key={i}
                    ref={i === activeSubIndex ? activeLyricRef : null}
                    className={`lyric-line ${i === activeSubIndex ? 'active' : ''}`}
                  >
                    {sub.text}
                  </div>
                ))
              ) : (
                <div className="lyric-line active">No lyrics available</div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ ...styles.navControls, marginTop: isMobile ? '20px' : '30px', gap: isMobile ? '30px' : '40px' }}>
          <div
            className={`nav-btn ${activeBtn === 'prev' ? 'active' : ''}`}
            onClick={handleNavPrev}
            style={{ opacity: currentIndex === 0 ? 0.3 : 1, pointerEvents: currentIndex === 0 ? 'none' : 'auto' }}
          >
            <span style={{ fontSize: '1rem' }}>⏮</span>
          </div>
          <div
            className={`nav-btn ${activeBtn === 'next' ? 'active' : ''}`}
            onClick={handleNavNext}
          >
            <span style={{ fontSize: '1rem' }}>⏭</span>
          </div>
        </div>

        <div style={{
          ...styles.sideBar,
          right: isMobile ? '10px' : '20px',
          bottom: isMobile ? '120px' : '150px',
          gap: isMobile ? '20px' : '25px',
          transform: isMobile ? 'scale(0.9)' : 'scale(1)'
        }}>
          {currentAudio && <FavoriteButton audio={currentAudio} onShowToast={showToast} />}
          <div style={styles.actionItem} onClick={() => currentAudio && setShowComments(true)}>
            <div style={styles.iconCircle}>💬</div>
            <span style={styles.actionCount}>CHAT</span>
          </div>
          <OrderButton playMode={playMode} onToggle={() => setPlayMode(p => p === 'order' ? 'loop' : 'order')} />
          {currentAudio && <ShareButton audioId={currentAudio.id} onShowToast={showToast} />}
        </div>

        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        <Footer />


      </div>

      {showComments && currentAudio && (
        <div style={styles.drawerOverlay} onClick={() => setShowComments(false)}>
          <div style={styles.drawerContent} onClick={e => e.stopPropagation()}>
            <div style={styles.drawerHandle} />
            <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1rem' }}>Comments</h3>
            <CommentSection audioId={currentAudio.id} onShowToast={showToast} />
          </div>
        </div>
      )}
    </div>
  );
};

// 样式定义
const styles = {
  container: { height: '100%', backgroundColor: '#000', color: '#fff', overflow: 'hidden', position: 'relative' },
  loadingContainer: { height: '100%', backgroundColor: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  backgroundGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, filter: 'blur(100px)', transition: 'background 1.5s ease' },
  mainContent: { height: '100%', zIndex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  diskWrapper: { position: 'relative', cursor: 'pointer', marginBottom: '40px' },
  playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none' },
  textContainer: { textAlign: 'center', width: '100%', maxWidth: '1000px', padding: '0 20px', overflow: 'hidden' },
  genreTag: { fontSize: '0.65rem', letterSpacing: '4px', opacity: 0.4, marginBottom: '10px', display: 'block' },
  sideBar: { position: 'absolute', right: '20px', bottom: '150px', display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center' },
  actionItem: { textAlign: 'center', cursor: 'pointer' },
  iconCircle: { width: '50px', height: '50px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(15px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '6px' },
  actionCount: { fontSize: '0.65rem', fontWeight: 'bold', opacity: 0.6 },
  bottomInfo: { position: 'absolute', left: '25px', bottom: '50px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' },
  username: { fontSize: '1rem', fontWeight: '500' },
  langTag: { fontSize: '0.7rem', opacity: 0.5 },
  progressContainer: { position: 'absolute', bottom: '0', left: '0', width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #3498db, #fff)', transition: 'width 0.1s linear' },
  drawerOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' },
  drawerContent: { width: '100%', maxHeight: '70vh', background: '#0a0a0a', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', overflowY: 'auto' },
  drawerHandle: { width: '40px', height: '4px', background: '#333', borderRadius: '2px', margin: '0 auto 20px' },
  navControls: { display: 'flex', gap: '40px', marginTop: '30px', alignItems: 'center', justifyContent: 'center' },
};

export default Feed;