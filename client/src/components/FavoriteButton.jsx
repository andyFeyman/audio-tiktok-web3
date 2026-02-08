import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';

const FavoriteButton = ({ audio, onShowToast }) => {
  if (!audio) return null; // Safety check

  const { toggleFavorite, getDisplayState } = useFavorites();

  // getDisplayState calculates the visual status by matching audio.id 
  // with the user's global favorite list in FavoritesContext.
  const { isFavorited: favorited, count } = getDisplayState(audio.id, audio.favoriteCount);

  const handleFavorite = async () => {
    try {
      // toggleFavorite updates sessionToggles instantly (Optimistic UI)
      await toggleFavorite(audio.id);
      onShowToast(favorited ? "Removed from Favorites" : "Added to Favorites ❤️");
    } catch (err) {
      if (err.response?.status === 401) {
        onShowToast("Please connect wallet first ");
      } else {
        onShowToast("Action failed");
      }
    }
  };

  return (
    <div style={styles.actionItem} onClick={handleFavorite}>
      <div style={styles.iconCircle}>
        <span style={{
          fontSize: '22px',
          filter: favorited ? 'drop-shadow(0 0 8px #ff2d55)' : 'none',
          transition: 'all 0.2s ease'
        }}>
          {favorited ? '❤️' : '🤍'}
        </span>
      </div>
      <span style={styles.actionCount}>{count}</span>
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

export default FavoriteButton;