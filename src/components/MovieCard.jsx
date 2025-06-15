// src/components/MovieCard.jsx
import React from "react";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  return (
    <div className="movie-card">
      <img src={imageUrl} alt={movie.title || movie.name} />
      <h3>{movie.title || movie.name}</h3>
    </div>
  );
};

export default MovieCard;
