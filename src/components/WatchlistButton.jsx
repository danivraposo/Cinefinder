import React, { useState, useEffect, useCallback } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './WatchlistButton.css';

const WatchlistButton = ({ mediaItem }) => {
  const { currentUser, addToWatchlist, removeFromWatchlist } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Verificar se o item já está na watchlist do utilizador
  useEffect(() => {
    if (currentUser && currentUser.watchlist && mediaItem) {
      const found = currentUser.watchlist.some(item => item.id === mediaItem.id);
      setIsInWatchlist(found);
    } else {
      setIsInWatchlist(false);
    }
  }, [currentUser, mediaItem]);

  // Monitorar o tamanho da tela para responsividade
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função com debounce para evitar múltiplos cliques
  const handleWatchlistClick = useCallback(() => {
    const now = Date.now();
    const DEBOUNCE_TIME = 500; // 500ms de intervalo entre cliques
    
    if (!currentUser) {
      alert('Você precisa estar logado para adicionar itens à sua watchlist.');
      return;
    }

    if (isLoading || (now - lastClickTime < DEBOUNCE_TIME)) {
      return; // Evitar cliques múltiplos ou muito rápidos
    }
    
    setLastClickTime(now);
    setIsLoading(true);
    
    try {
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
    } finally {
      // Adicionar um pequeno atraso antes de permitir outro clique
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [currentUser, isInWatchlist, isLoading, lastClickTime, mediaItem, addToWatchlist, removeFromWatchlist]);

  // Texto responsivo para o botão
  const getButtonText = () => {
    if (windowWidth <= 480) {
      return isInWatchlist ? 'Remover' : 'Watchlist';
    }
    return isInWatchlist ? 'Remover da Watchlist' : 'Adicionar à Watchlist';
  };

  return (
    <button 
      className={`watchlist-button ${isInWatchlist ? 'in-watchlist' : ''}`}
      onClick={handleWatchlistClick}
      disabled={isLoading}
    >
      {isInWatchlist ? <FaBookmark /> : <FaRegBookmark />}
      <span>{getButtonText()}</span>
    </button>
  );
};

export default WatchlistButton; 