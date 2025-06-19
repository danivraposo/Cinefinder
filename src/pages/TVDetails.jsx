import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaPlay, FaShare, FaHeart, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import WatchlistButton from '../components/WatchlistButton';
import CommentSection from '../components/CommentSection';
import RecommendationSection from '../components/RecommendationSection';
import './MovieDetails.css';
import './TVDetails.css';

const TVDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedEpisodes, setExpandedEpisodes] = useState({});

  useEffect(() => {
    const fetchTVDetails = async () => {
      try {
        const apiKey = process.env.REACT_APP_TMDB_API_KEY || "3d820eab8fd533d2fd7e1514e86292d7";
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,videos`
        );

        if (!response.ok) {
          throw new Error('Não foi possível carregar os detalhes da série');
        }

        const data = await response.json();
        setShow(data);
        console.log("Dados da série:", data);
        
        // Carregar detalhes da primeira temporada por padrão
        if (data.seasons && data.seasons.length > 0) {
          fetchSeasonDetails(data.seasons[0].season_number);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes da série:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTVDetails();
  }, [id]);

  const fetchSeasonDetails = async (seasonNumber) => {
    setSeasonLoading(true);
    try {
      const apiKey = process.env.REACT_APP_TMDB_API_KEY || "3d820eab8fd533d2fd7e1514e86292d7";
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Não foi possível carregar os detalhes da temporada');
      }

      const data = await response.json();
      setSeasonDetails(data);
      setSelectedSeason(seasonNumber);
      console.log("Detalhes da temporada:", data);
    } catch (err) {
      console.error("Erro ao buscar detalhes da temporada:", err);
    } finally {
      setSeasonLoading(false);
    }
  };

  const toggleEpisode = (episodeId) => {
    setExpandedEpisodes(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando detalhes da série...</p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="error-container">
        <p>Erro ao carregar detalhes da série: {error}</p>
      </div>
    );
  }

  // Formatar o tempo de duração (episódios)
  const formatRuntime = (minutes) => {
    if (!minutes || minutes.length === 0) return 'N/A';
    const runtime = minutes[0];
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    return `${hours > 0 ? `${hours} h ` : ''}${mins} min`;
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

  // Extrair o trailer da série
  const trailer = show.videos?.results?.find(video => 
    video.type === "Trailer" && video.site === "YouTube"
  );

  return (
    <div className="tv-details-page">
      {/* Background com efeito de gradiente */}
      <div 
        className="movie-backdrop" 
        style={{ 
          backgroundImage: `url(https://image.tmdb.org/t/p/original${show.backdrop_path})` 
        }}
      ></div>

      <div className="movie-title-overlay">
        <h1>{show.name}</h1>
      </div>

      <div className="movie-details-content">
        <div className="movie-poster-container">
          <img 
            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
            alt={show.name} 
            className="movie-poster"
          />
          <div className="action-buttons">
            <button className="action-button share-button">
              <FaShare />
            </button>
            <WatchlistButton mediaItem={{...show, media_type: 'tv'}} />
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
            <span className="runtime">{formatRuntime(show.episode_run_time)} / episódio</span>
            <div className="rating">
              <span className="imdb">IMDB:</span> <FaStar className="star-icon" /> {show.vote_average.toFixed(1)}
            </div>
          </div>

          <div className="movie-overview">
            <h3>Overview:</h3>
            <p>{show.overview}</p>
          </div>

          <div className="movie-details-grid">
            <div className="details-column">
              <div className="detail-item">
                <span className="detail-label">First Air Date:</span>
                <span className="detail-value">{formatReleaseDate(show.first_air_date)}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Genre:</span>
                <span className="detail-value">{show.genres.map(genre => genre.name).join(', ')}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Cast:</span>
                <span className="detail-value">
                  {show.credits?.cast?.slice(0, 3).map(actor => actor.name).join(', ')}
                </span>
              </div>
            </div>
            
            <div className="details-column">
              <div className="detail-item">
                <span className="detail-label">Seasons:</span>
                <span className="detail-value">{show.number_of_seasons}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Episodes:</span>
                <span className="detail-value">{show.number_of_episodes}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Network:</span>
                <span className="detail-value">
                  {show.networks?.map(network => network.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de temporadas e episódios */}
      <div className="seasons-section">
        <h2>Temporadas</h2>
        
        <div className="seasons-buttons">
          {show.seasons
            .filter(season => season.season_number > 0) // Filtrar temporadas especiais (season_number = 0)
            .map(season => (
              <button 
                key={season.id} 
                className={`season-button ${selectedSeason === season.season_number ? 'active' : ''}`}
                onClick={() => fetchSeasonDetails(season.season_number)}
              >
                Temporada {season.season_number}
              </button>
            ))
          }
        </div>

        {seasonLoading ? (
          <div className="season-loading">
            <div className="loading-spinner"></div>
            <p>Carregando episódios...</p>
          </div>
        ) : seasonDetails ? (
          <div className="episodes-list">
            <h3>Episódios - Temporada {seasonDetails.season_number}</h3>
            {seasonDetails.episodes.map(episode => (
              <div className="episode-card" key={episode.id}>
                <div 
                  className="episode-header" 
                  onClick={() => toggleEpisode(episode.id)}
                >
                  <div className="episode-title">
                    <span className="episode-number">E{episode.episode_number}.</span> 
                    {episode.name}
                  </div>
                  <div className="episode-toggle">
                    {expandedEpisodes[episode.id] ? <FaAngleUp /> : <FaAngleDown />}
                  </div>
                </div>
                
                {expandedEpisodes[episode.id] && (
                  <div className="episode-details">
                    {episode.still_path && (
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`} 
                        alt={`${episode.name} still`} 
                        className="episode-image"
                      />
                    )}
                    <div className="episode-info">
                      <p className="episode-overview">{episode.overview || "Sem descrição disponível."}</p>
                      <div className="episode-meta">
                        <span>Duração: {episode.runtime ? `${episode.runtime} min` : 'N/A'}</span>
                        <span>Data: {formatReleaseDate(episode.air_date)}</span>
                        <span>Avaliação: <FaStar className="star-icon" /> {episode.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-season-data">Selecione uma temporada para ver os episódios.</p>
        )}
      </div>
      
      {/* Seção de comentários */}
      <div className="tv-comments-container">
        <CommentSection mediaId={id} mediaType="tv" />
      </div>
      
      {/* Seção de recomendações */}
      <div className="tv-recommendations-container">
        <RecommendationSection mediaId={id} mediaType="tv" />
      </div>
    </div>
  );
};

export default TVDetails; 