import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [message, setMessage] = useState('');
    // We use a ref to track if we are currently showing a toast to avoid race conditions possibly,
    // but simpler state is usually enough. The Toast component handles its own timer based on 'message' prop.
    // However, to strictly control it globally and avoid the re-render issue in children affecting the timer,
    // we can let the Context handle the active message.

    const showToast = useCallback((msg) => {
        setMessage(msg);
    }, []);

    const handleClose = useCallback(() => {
        setMessage('');
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* 
        We pass the message to the Toast component.
        The Toast component detects changes in 'message' and sets its internal visible state.
        When it captures 'onClose', it triggers the callback.
        
        CRITICAL: The handleClose function is now stable because it comes from Context 
        and doesn't depend on render-specific data from Feed.
      */}
            <Toast message={message} onClose={handleClose} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
