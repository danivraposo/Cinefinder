import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./MovieCard.css";
import "./RatedMovieCard.css";

const RatedMovieCard = ({ movie }) => {
  const navigate = useNavigate();
  
  // Estado para controlar se a imagem foi carregada
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Imagem padrão se não houver poster
  const noImageUrl = "https://via.placeholder.com/300x450?text=No+Image";
  
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : noImageUrl;

  // Round to one decimal place
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

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
    if (movie.id) {
      // Usar a propriedade media_type ou detectar pelo título
      const mediaType = movie.media_type || (movie.name ? "tv" : "movie");
      const detailsPath = mediaType === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;
      navigate(detailsPath);
    }
  };

  // Truncar o título se for muito longo
  const truncateTitle = (text, maxLength = 25) => {
    if (!text) return 'Sem título';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const title = movie.title || movie.name || "Sem título";

  return (
    <div 
      className={`movie-card rated-movie-card ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
      onClick={handleCardClick}
      style={{ cursor: movie.id ? 'pointer' : 'default' }}
    >
      <div className="movie-poster">
        <div className="rating-badge">
          <FaStar className="star-icon" />
          <span>{rating}</span>
        </div>
        <img 
          src={imageUrl} 
          alt={title} 
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <h3 className="movie-title">{truncateTitle(title)}</h3>
      </div>
    </div>
  );
};

export default RatedMovieCard; 