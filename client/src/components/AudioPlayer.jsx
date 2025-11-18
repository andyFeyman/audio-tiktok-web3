import { useRef, useEffect } from 'react';

const AudioPlayer = ({ audio, onEnd }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.currentTime = 0;
      audioEl.play().catch(console.error);
      return () => audioEl.pause();
    }
  }, [audio]);

  return (
    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
      <h2>{audio.transcript?.slice(0, 50)}...</h2>
      <audio
        ref={audioRef}
        src={audio.url}
        onEnded={onEnd}
        controls
        style={{ width: '100%' }}
        preload="auto"
      />
      <p>Likes: {audio.favoriteCount} | Shares: {audio.shareCount}</p>
    </div>
  );
};

export default AudioPlayer;