import React from 'react';

const LoopButton = ({ isLooping, onToggle }) => {
  return (
    <div style={styles.actionItem} onClick={onToggle}>
      <div style={{
        ...styles.iconCircle,
        backgroundColor: isLooping ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
        border: isLooping ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
      }}>
        <span style={{
          fontSize: '20px',
          opacity: isLooping ? 1 : 0.5,
          filter: isLooping ? 'drop-shadow(0 0 5px #fff)' : 'none'
        }}>
          {isLooping ? '🔂' : '🔁'}
        </span>
      </div>
      <span style={{ ...styles.actionCount, opacity: isLooping ? 1 : 0.6 }}>
        {isLooping ? 'ON' : 'LOOP'}
      </span>
    </div>
  );
};

const styles = {
  actionItem: { textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' },
  iconCircle: {
    width: '50px', height: '50px',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '6px', backdropFilter: 'blur(15px)', transition: 'all 0.3s ease'
  },
  actionCount: { fontSize: '0.65rem', fontWeight: 'bold', color: '#fff' }
};

export default LoopButton;
