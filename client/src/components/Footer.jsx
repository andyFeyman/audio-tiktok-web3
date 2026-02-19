import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={styles.footerContainer}>
            <nav style={styles.footerNav}>
                <Link to="/creator" style={styles.navLink}>Creator</Link>
                <Link to="/" style={styles.navLink}>Flow</Link>
                <Link to="/docs" style={styles.navLink}>Docs</Link>
                <h1 style={{ display: 'none' }}>
                    AutoSuggestion - Audio Platform
                </h1>
            </nav>
        </footer>
    );
};

const styles = {
    footerContainer: {
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '800px',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    footerNav: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '30px',
        flexWrap: 'wrap',
        pointerEvents: 'auto',
    },
    navLink: {
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.4)',
        textDecoration: 'none',
        letterSpacing: '1px',
        fontWeight: '300',
        transition: 'all 0.3s ease',
        borderBottom: '1px solid transparent',
        paddingBottom: '2px',
    },
};

export default Footer;
