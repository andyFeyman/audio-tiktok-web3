import React, { useEffect, useState } from 'react';

const Toast = ({ message, onClose }) => {

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                // 等待动画结束后通知父组件清理状态
                setTimeout(onClose, 300);
            }, 2500); // 2.5秒后消失

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message || !visible) return null;

    return (
        <div style={styles.toastContainer}>
            <div style={styles.toastBody}>
                {message}
            </div>
        </div>
    );
};

const styles = {
    toastContainer: {
        position: 'fixed',
        top: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        animation: 'toastIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
    },
    toastBody: {
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#edca09ff',
        padding: '12px 24px',
        borderRadius: '25px',
        fontSize: '0.9rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
    }
};


export default Toast;