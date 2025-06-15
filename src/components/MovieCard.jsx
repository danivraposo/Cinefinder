// src/components/MovieCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

const MovieCard = ({ title, posterPath, rating, movie, showRating = false }) => {
  const navigate = useNavigate();
  
  // Suporte para o formato antigo (objeto movie)
  const movieTitle = title || (movie && (movie.title || movie.name)) || "Sem título";
  const moviePosterPath = posterPath || (movie && movie.poster_path);
  const movieRating = rating || (movie && movie.vote_average);
  const movieId = movie?.id;
  const mediaType = movie?.media_type || "movie"; // Padrão para "movie" se não especificado
  
  // Estado para controlar se a imagem foi carregada
  const [imageLoaded, setImageLoaded] = useState(false);

  // Imagem padrão se não houver poster
  const noImageUrl = "https://via.placeholder.com/300x450?text=No+Image";
  
  // Verificar se o caminho da imagem existe antes de construir a URL
  const imageUrl = moviePosterPath
    ? `https://image.tmdb.org/t/p/w500${moviePosterPath}`
    : noImageUrl;

  // Função para lidar com erro de carregamento de imagem
  const handleImageError = (e) => {
    console.log("Erro ao carregar imagem:", e.target.src);
    e.target.src = noImageUrl;
    setImageLoaded(true);
  };
  
  // Função para lidar com o carregamento da imagem
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // Função para navegar para a página de detalhes do filme
  const handleCardClick = () => {
    if (movieId) {
      // Usar a rota correta com base no tipo de mídia
      const detailsPath = mediaType === "tv" ? `/tv/${movieId}` : `/movie/${movieId}`;
      navigate(detailsPath);
    }
  };

  // Truncar o título se for muito longo
  const truncateTitle = (text, maxLength = 25) => {
    if (!text) return 'Sem título';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className={`movie-card ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
      onClick={handleCardClick}
      style={{ cursor: movieId ? 'pointer' : 'default' }}
    >
      <div className="movie-poster">
        <img 
          src={imageUrl} 
          alt={movieTitle} 
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {showRating && movieRating && (
          <div className="movie-rating">
            <span>{movieRating.toFixed(1)}</span>
          </div>
        )}
        <h3 className="movie-title">{truncateTitle(movieTitle)}</h3>
      </div>
    </div>
  );
};

// Para compatibilidade com código existente
MovieCard.defaultProps = {
  title: null,
  posterPath: null,
  rating: null,
  movie: null,
  showRating: false
};

export default MovieCard;
