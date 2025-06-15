import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import "./MovieCard.css";
import "./RatedMovieCard.css";

const RatedMovieCard = ({ movie }) => {
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

  return (
    <div className={`movie-card rated-movie-card ${imageLoaded ? 'image-loaded' : 'image-loading'}`}>
      <div className="movie-poster">
        <div className="rating-badge">
          <FaStar className="star-icon" />
          <span>{rating}</span>
        </div>
        <img 
          src={imageUrl} 
          alt={movie.title || movie.name} 
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <h3 className="movie-title">{movie.title || movie.name}</h3>
      </div>
    </div>
  );
};

export default RatedMovieCard; 