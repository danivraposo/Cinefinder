// src/pages/SearchResults.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import "../components/MovieCard.css";
import "./SearchResults.css";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get("q");
  
  // Usar a mesma abordagem que as outras páginas para a API key
  const apiKey = process.env.REACT_APP_TMDB_API_KEY || "3d820eab8fd533d2fd7e1514e86292d7";

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) return;
      
      setLoading(true);
      try {
        console.log("Buscando por:", searchTerm);
        console.log("API Key:", apiKey);
        
        // Buscar filmes
        const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}&include_adult=false`;
        console.log("URL da requisição de filmes:", movieUrl);
        
        // Buscar séries
        const tvUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}&include_adult=false`;
        console.log("URL da requisição de séries:", tvUrl);
        
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(movieUrl),
          fetch(tvUrl)
        ]);
        
        if (!movieResponse.ok || !tvResponse.ok) {
          throw new Error("Falha ao buscar resultados");
        }
        
        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();
        
        console.log("Resultados de filmes:", movieData);
        console.log("Resultados de séries:", tvData);
        
        // Adicionar tipo aos resultados para identificar se é filme ou série
        const movieResults = movieData.results.map(movie => ({
          ...movie,
          media_type: "movie"
        }));
        
        const tvResults = tvData.results.map(tv => ({
          ...tv,
          media_type: "tv"
        }));
        
        // Combinar resultados
        const combinedResults = [...movieResults, ...tvResults];
        
        // Ordenar por popularidade
        combinedResults.sort((a, b) => b.popularity - a.popularity);
        
        setResults(combinedResults);
      } catch (err) {
        console.error("Erro na busca:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm, apiKey]);

  return (
    <div className="search-results">
      <h2 className="search-title">Resultados para: "{searchTerm}"</h2>
      
      {loading && <p className="search-message">Carregando resultados...</p>}
      
      {error && <p className="search-message search-error">Erro: {error}</p>}
      
      {!loading && !error && results.length === 0 && (
        <p className="search-message">Nenhum resultado encontrado para "{searchTerm}"</p>
      )}
      
      <div className="movie-grid">
        {results.map((item) => (
          <MovieCard
            key={item.id}
            movie={item}
            showRating={false}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
