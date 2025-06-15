import React from "react";
import { FaStar } from "react-icons/fa";
import "./MovieCard.css";
import "./RatedMovieCard.css";

const RatedMovieCard = ({ movie }) => {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  // Round to one decimal place
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div className="movie-card rated-movie-card">
      <div className="rating-badge">
        <FaStar className="star-icon" />
        <span>{rating}</span>
      </div>
      <img src={imageUrl} alt={movie.title || movie.name} />
      <h3>{movie.title || movie.name}</h3>
    </div>
  );
};

export default RatedMovieCard; 