import React from 'react';

const OrderButton = ({ playMode, onToggle }) => {
    // playMode: 'order' | 'loop'
    const isLoop = playMode === 'loop';

    return (
        <div style={styles.actionItem} onClick={onToggle}>
            <div style={{
                ...styles.iconCircle,
                backgroundColor: isLoop ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: isLoop ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
            }}>
                <span style={{
                    fontSize: '20px',
                    opacity: 1, // Always visible
                    filter: isLoop ? 'drop-shadow(0 0 5px #fff)' : 'none'
                }}>
                    {isLoop ? '🔂' : '🔁'}
                </span>
            </div>
            <span style={{ ...styles.actionCount, opacity: 0.8 }}>
                {isLoop ? 'LOOP' : 'ORDER'}
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

export default OrderButton;
