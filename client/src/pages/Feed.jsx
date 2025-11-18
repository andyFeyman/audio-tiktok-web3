import { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import AudioPlayer from '../components/AudioPlayer';
import CommentSection from '../components/CommentSection';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import { getFeed, addToHistory, getHistory } from '../api';

const Feed = ({ isHistoryMode = false }) => {
  const [audios, setAudios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (isHistoryMode) {
        ({ data } = await getHistory());
      } else {
        ({ data } = await getFeed({ language: 'en' })); // 默认英文随机
      }
      setAudios(data || []);
    } catch (err) {
      console.error('Load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [isHistoryMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && currentIndex < audios.length - 1) {
        setCurrentIndex(currentIndex + 1);
        if (!isHistoryMode) addToHistory(audios[currentIndex + 1].id);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, audios, isHistoryMode]);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (currentIndex < audios.length - 1) {
        setCurrentIndex(currentIndex + 1);
        if (!isHistoryMode) addToHistory(audios[currentIndex + 1].id);
      }
    },
    onSwipedDown: () => {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    },
    trackMouse: true, // PC 支持鼠标拖拽
  });

  if (loading || !audios.length) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading audios... {isHistoryMode ? '(History empty?)' : ''}</div>;
  }

  const currentAudio = audios[currentIndex];

  return (
    <div {...handlers} style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0' }}>
        <AudioPlayer audio={currentAudio} onEnd={() => setCurrentIndex(currentIndex + 1)} />
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
          <CommentSection audioId={currentAudio.id} />
          <br />
          <FavoriteButton audioId={currentAudio.id} />
          <ShareButton audioId={currentAudio.id} />
        </div>
        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <p>Index: {currentIndex + 1}/{audios.length} | {isHistoryMode ? 'History Mode' : 'Random Feed'}</p>
          <p>Style: {currentAudio.style} | Lang: {currentAudio.language}</p>
        </div>
      </div>
    </div>
  );
};

export default Feed;