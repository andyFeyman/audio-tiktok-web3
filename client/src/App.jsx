import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useWeb3Auth } from './hooks/useWeb3Auth';
import Feed from './pages/Feed';
import Creator from './pages/Creator';
import AdminUpload from './pages/AdminUpload';
import LanguagePicker from './components/LanguagePicker';
import Docs from './pages/Docs';
import ArticleDetail from './pages/ArticleDetail';

import { ToastProvider } from './context/ToastContext';

import { HelmetProvider } from 'react-helmet-async';

import { FavoritesProvider } from './context/FavoritesContext';

function AppContent() {
  const { user, signIn, signOut, isLoading, isInitializing } = useWeb3Auth();
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  // loading / initializing 阶段保持不变
  if (isLoading || isInitializing) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  }

  return (
    <Router>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #000;
          overscroll-behavior: none;
        }
        #root {
          background-color: #000;
        }
        
        /* Simple Responsive Header */
        .app-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .user-info-text {
          display: block;
          margin: 0 12px 0 0;
          color: #FFF;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 0 16px;
            height: 70px;
          }
          .logo-text {
            font-size: 1rem !important;
          }
          .user-info-text {
            display: none; /* Hide long address on mobile */
          }
          .header-right {
            gap: 8px !important;
          }
          .wallet-btn {
            padding: 6px 14px !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>

      {/* ----------------- Header ----------------- */}
      <header className="app-header">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="logo-text" style={headerStyles.logo}>CompletedState</h1>
        </Link>
        <div className="header-right" style={headerStyles.rightSection}>
          {user ? (
            <>
              <span className="user-info-text">
                Hi, ({user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)})
                {user.isAdmin && <span style={{ color: '#4caf50' }}> (Admin)</span>}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {user.isAdmin && (
                  <Link
                    to="/upload"
                    className="wallet-btn"
                    style={{ ...headerStyles.walletBtn, textDecoration: 'none' }}
                  >
                    📤 上传
                  </Link>
                )}
                <button onClick={signOut} className="wallet-btn" style={headerStyles.walletBtn}>
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <button onClick={signIn} className="wallet-btn" style={headerStyles.walletBtn}>
              Connect Wallet
            </button>
          )}
          <LanguagePicker currentLang={lang} onLangChange={handleLangChange} />
        </div>
      </header>

      <FavoritesProvider initialFavorites={user?.favorites}>
        <main style={{
          height: '100dvh',
          paddingTop: window.innerWidth < 768 ? '70px' : '80px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <Routes>
            {/* 首页 – Feed */}
            <Route path="/" element={<Feed key={lang} language={lang} />} />
            {/* 分享页 – 同样使用 Feed 但会定位到特定 ID */}
            <Route path="/audio/:id" element={<Feed key={`share-${lang}`} language={lang} />} />
            {/* 生成音频的页面 – Creator */}
            <Route path="/creator" element={<Creator />} />
            {/* 管理员上传页面 – 只有管理员能访问 */}
            <Route
              path="/upload"
              element={<AdminUpload user={user} />}
            />
            {/* SEO 文章页面 */}
            <Route path="/docs" element={<Docs language={lang} />} />
            <Route path="/docs/:slug" element={<ArticleDetail language={lang} />} />
            {/* 任意未知路由回到首页（或 404 页面） */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </FavoritesProvider>

    </Router>
  );
}


function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </HelmetProvider>
  );
}

const headerStyles = {
  logo: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '1px'
  },
  rightSection: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  walletBtn: {
    background: '#fff', // 钱包按钮稍微亮一点，作为主要操作
    color: '#000',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  }
};

export default App;