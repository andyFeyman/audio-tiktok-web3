import React from 'react';
import { share } from '../api';

const ShareButton = ({ audioId, onShowToast }) => {
  const handleShare = async () => {
    try {
      const { data } = await share(audioId);
      await navigator.clipboard.writeText(data.shareUrl);
      onShowToast("Link copied to clipboard! 🔗");
    } catch (err) {
      onShowToast("Share failed");
    }
  };

  return (
    <div style={styles.actionItem} onClick={handleShare}>
      <div style={styles.iconCircle}>
        <span style={{ fontSize: '20px' }}>📤</span>
      </div>
      <span style={styles.actionCount}>SHARE</span>
    </div>
  );
};

const styles = {
  actionItem: { textAlign: 'center', cursor: 'pointer' },
  iconCircle: { 
    width: '50px', height: '50px', borderRadius: '50%', 
    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(15px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px'
  },
  actionCount: { fontSize: '0.65rem', fontWeight: 'bold', opacity: 0.6 }
};

export default ShareButton;