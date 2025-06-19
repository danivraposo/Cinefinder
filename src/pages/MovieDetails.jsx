import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaPlay, FaShare } from 'react-icons/fa';
import WatchlistButton from '../components/WatchlistButton';
import CommentSection from '../components/CommentSection';
import RecommendationSection from '../components/RecommendationSection';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const apiKey = process.env.REACT_APP_TMDB_API_KEY || "3d820eab8fd533d2fd7e1514e86292d7";
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos`
        );

        if (!response.ok) {
          throw new Error('Não foi possível carregar os detalhes do filme');
        }

        const data = await response.json();
        setMovie(data);
        console.log("Dados do filme:", data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do filme:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando detalhes do filme...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="error-container">
        <p>Erro ao carregar detalhes do filme: {error}</p>
      </div>
    );
  }

  // Formatar o tempo de duração
  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} h ${mins} min`;
  };

  // Formatar a data de lançamento
  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Extrair o trailer do filme
  const trailer = movie.videos?.results?.find(video => 
    video.type === "Trailer" && video.site === "YouTube"
  );

  return (
    <div className="movie-details-page">
      {/* Background com efeito de gradiente */}
      <div 
        className="movie-backdrop" 
        style={{ 
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` 
        }}
      ></div>

      <div className="movie-title-overlay">
        <h1>{movie.title}</h1>
      </div>

      <div className="movie-details-content">
        <div className="movie-poster-container">
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
            className="movie-poster"
          />
          <div className="action-buttons">
            <button className="action-button share-button">
              <FaShare />
            </button>
            <WatchlistButton mediaItem={{...movie, media_type: 'movie'}} />
          </div>
        </div>

        <div className="movie-info">
          <div className="movie-meta">
            {trailer && (
              <a 
                href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="trailer-button"
              >
                <FaPlay /> Trailer
              </a>
            )}
            <span className="runtime">{formatRuntime(movie.runtime)}</span>
            <div className="rating">
              <span className="imdb">IMDB:</span> <FaStar className="star-icon" /> {movie.vote_average.toFixed(1)}
            </div>
          </div>

          <div className="movie-overview">
            <h3>Overview:</h3>
            <p>{movie.overview}</p>
          </div>

          <div className="movie-details-grid">
            <div className="details-column">
              <div className="detail-item">
                <span className="detail-label">Released:</span>
                <span className="detail-value">{formatReleaseDate(movie.release_date)}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Genre:</span>
                <span className="detail-value">{movie.genres.map(genre => genre.name).join(', ')}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Cast:</span>
                <span className="detail-value">
                  {movie.credits?.cast?.slice(0, 3).map(actor => actor.name).join(', ')}
                </span>
              </div>
            </div>
            
            <div className="details-column">
              <div className="detail-item">
                <span className="detail-label">Country:</span>
                <span className="detail-value">
                  {movie.production_countries?.map(country => country.name).join(', ')}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Production:</span>
                <span className="detail-value">
                  {movie.production_companies?.slice(0, 2).map(company => company.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="movie-comments-container">
        <CommentSection mediaId={id} mediaType="movie" />
      </div>
      
      <div className="movie-recommendations-container">
        <RecommendationSection mediaId={id} mediaType="movie" />
      </div>
    </div>
  );
};

export default MovieDetails; 