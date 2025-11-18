import { useState } from 'react';
import { favorite } from '../api';

const FavoriteButton = ({ audioId }) => {
  const [favorited, setFavorited] = useState(false);

  const handleFavorite = async () => {
    try {
      await favorite(audioId);
      setFavorited(true);
    } catch (err) {
      console.error('Favorite failed:', err);
    }
  };

  return (
    <button onClick={handleFavorite} disabled={favorited}>
      {favorited ? '❤️ Favorited' : '🤍 Favorite'}
    </button>
  );
};

export default FavoriteButton;
