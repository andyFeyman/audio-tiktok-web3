import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <h2 style={styles.title}>Oops! Something went wrong.</h2>
                        <p style={styles.message}>
                            The application encountered an unexpected error. Please try refreshing the page.
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                            <pre style={styles.errorText}>
                                {this.state.error && this.state.error.toString()}
                            </pre>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            style={styles.button}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'sans-serif',
        padding: '20px',
    },
    card: {
        backgroundColor: '#111',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    },
    title: {
        margin: '0 0 15px 0',
        fontSize: '24px',
        color: '#ff2d55',
    },
    message: {
        margin: '0 0 20px 0',
        fontSize: '16px',
        lineHeight: '1.5',
        opacity: 0.8,
    },
    errorText: {
        textAlign: 'left',
        backgroundColor: '#222',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        overflowX: 'auto',
        marginBottom: '20px',
        border: '1px solid #444',
    },
    button: {
        backgroundColor: '#ff2d55',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
    }
};

export default ErrorBoundary;
