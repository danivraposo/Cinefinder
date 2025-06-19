import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './WatchlistButton.css';

const WatchlistButton = ({ mediaItem }) => {
  const { currentUser, addToWatchlist, removeFromWatchlist } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o item já está na watchlist do usuário
  useEffect(() => {
    if (currentUser && currentUser.watchlist && mediaItem) {
      const found = currentUser.watchlist.some(item => item.id === mediaItem.id);
      setIsInWatchlist(found);
    } else {
      setIsInWatchlist(false);
    }
  }, [currentUser, mediaItem]);

  const handleWatchlistClick = () => {
    if (!currentUser) {
      alert('Você precisa estar logado para adicionar itens à sua watchlist.');
      return;
    }

    setIsLoading(true);
    
    if (isInWatchlist) {
      const result = removeFromWatchlist(mediaItem.id);
      if (result.success) {
        setIsInWatchlist(false);
      } else {
        alert(result.message);
      }
    } else {
      const result = addToWatchlist(mediaItem);
      if (result.success) {
        setIsInWatchlist(true);
      } else {
        alert(result.message);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <button 
      className={`watchlist-button ${isInWatchlist ? 'in-watchlist' : ''}`}
      onClick={handleWatchlistClick}
      disabled={isLoading}
    >
      {isInWatchlist ? (
        <>
          <FaBookmark /> Remover da Watchlist
        </>
      ) : (
        <>
          <FaRegBookmark /> Adicionar à Watchlist
        </>
      )}
    </button>
  );
};

export default WatchlistButton; 