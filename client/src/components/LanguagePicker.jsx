import React, { useState } from 'react';

const LanguagePicker = ({ currentLang, onLangChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const langs = [
    { code: 'en', label: '🇺🇸 EN' },
    { code: 'zh', label: '🇨🇳 ZH' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.headerBtn}
      >
        {langs.find(l => l.code === currentLang)?.label}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          {langs.map(l => (
            <div
              key={l.code}
              onClick={() => { onLangChange(l.code); setIsOpen(false); }}
              style={{
                ...styles.dropdownItem,
                color: currentLang === l.code ? '#fff' : '#aaa',
                background: currentLang === l.code ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  headerBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  dropdown: {
    position: 'absolute',
    top: '45px',
    right: 0,
    background: 'rgba(15, 15, 15, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 1000,
    minWidth: '100px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  dropdownItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background 0.2s',
  }
};

export default LanguagePicker;