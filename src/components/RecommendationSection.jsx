import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RecommendationSection.css';

const RecommendationSection = ({ mediaId, mediaType }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.REACT_APP_TMDB_API_KEY || "3d820eab8fd533d2fd7e1514e86292d7";
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${mediaId}/recommendations?api_key=${apiKey}&language=pt-BR`
        );

        if (!response.ok) {
          throw new Error('Não foi possível carregar as recomendações');
        }

        const data = await response.json();
        // Limitar a 6 recomendações
        setRecommendations(data.results.slice(0, 6));
      } catch (err) {
        console.error("Erro ao buscar recomendações:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (mediaId && mediaType) {
      fetchRecommendations();
    }
  }, [mediaId, mediaType]);

  if (loading) {
    return (
      <div className="recommendation-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !recommendations || recommendations.length === 0) {
    return null; // Não mostrar nada se não houver recomendações
  }

  return (
    <div className="recommendation-section">
      <h3>Você Também Pode Gostar</h3>
      <div className="recommendation-grid">
        {recommendations.map(item => (
          <Link 
            key={item.id} 
            to={`/${mediaType === 'movie' ? 'movie' : 'tv'}/${item.id}`}
            className="recommendation-item"
          >
            <div className="recommendation-poster">
              {item.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                  alt={item.title || item.name} 
                />
              ) : (
                <div className="no-poster">Sem imagem</div>
              )}
            </div>
            <div className="recommendation-info">
              <h4>{item.title || item.name}</h4>
              <p>{item.release_date || item.first_air_date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection; 