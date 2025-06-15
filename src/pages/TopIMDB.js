import React, { useState, useEffect } from "react";
import RatedMovieCard from "../components/RatedMovieCard";
import "./Movies.css";

const TopIMDB = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [topTVShows, setTopTVShows] = useState([]);
  const [activeTab, setActiveTab] = useState("movies");
  const [page, setPage] = useState(1);
  
  const apiKey = process.env.REACT_APP_TMDB_API_KEY;

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${page}`),
          fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${page + 1}`)
        ]);
        
        const data1 = await res1.json();
        const data2 = await res2.json();
        
        setTopMovies([...(data1.results || []), ...(data2.results || [])]);
      } catch (err) {
        console.error("Error fetching top rated movies:", err);
      }
    };

    const fetchTopTVShows = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=${page}`),
          fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=${page + 1}`)
        ]);
        
        const data1 = await res1.json();
        const data2 = await res2.json();
        
        setTopTVShows([...(data1.results || []), ...(data2.results || [])]);
      } catch (err) {
        console.error("Error fetching top rated TV shows:", err);
      }
    };

    if (activeTab === "movies") {
      fetchTopMovies();
    } else {
      fetchTopTVShows();
    }
  }, [activeTab, page]);

  return (
    <div className="movies-page">
      <h1 className="section-title">| Top Rated on IMDB</h1>
      
      <div className="tab-navigation">
        <button 
          className={activeTab === "movies" ? "active-tab" : ""} 
          onClick={() => {setActiveTab("movies"); setPage(1);}}
        >
          Movies
        </button>
        <button 
          className={activeTab === "tvshows" ? "active-tab" : ""} 
          onClick={() => {setActiveTab("tvshows"); setPage(1);}}
        >
          TV Shows
        </button>
      </div>

      <div className="movie-grid">
        {activeTab === "movies" 
          ? topMovies.map((movie) => <RatedMovieCard key={movie.id} movie={movie} />)
          : topTVShows.map((show) => <RatedMovieCard key={show.id} movie={show} />)
        }
      </div>

      <div className="pagination">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={page === num ? "active" : ""}
          >
            {num}
          </button>
        ))}
        <button onClick={() => setPage((p) => p + 1)}>→</button>
        <button onClick={() => setPage(10)}>»</button>
      </div>
    </div>
  );
};

export default TopIMDB;
