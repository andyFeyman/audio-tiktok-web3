/**
 * Client-side logger that sends critical logs to the server.
 */

const API_URL = import.meta.env.VITE_API_URL || '';

export const logToServer = async (level, message, details = {}) => {
    try {
        await fetch(`${API_URL}/api/logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level,
                message,
                details: {
                    ...details,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                },
            }),
        });
    } catch (err) {
        // Fallback to console if server logging fails
        console.error('Failed to send log to server:', err);
    }
};

export const initClientLogger = () => {
    // Capture global errors
    window.onerror = (message, source, lineno, colno, error) => {
        logToServer('error', message, {
            source,
            lineno,
            colno,
            stack: error?.stack,
        });
    };

    // Capture unhandled promise rejections
    window.onunhandledrejection = (event) => {
        logToServer('error', 'Unhandled Rejection', {
            reason: event.reason?.message || event.reason,
            stack: event.reason?.stack,
        });
    };

    console.log('Client-side logger initialized');
};

export default {
    error: (msg, details) => {
        console.error(msg, details);
        logToServer('error', msg, details);
    },
    warn: (msg, details) => {
        console.warn(msg, details);
        logToServer('warn', msg, details);
    },
    info: (msg, details) => {
        console.info(msg, details);
        logToServer('info', msg, details);
    },
};
