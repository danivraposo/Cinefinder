import React from "react";
import MovieCarousel from "../components/MovieCarousel";
import "./Home.css";

const Home = () => {
  const apiKey = process.env.REACT_APP_TMDB_API_KEY;

  const popularMovies = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  const popularTV = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`;

  return (
    <div className="home-container">
      <section className="section">
        <MovieCarousel title="🎬 Popular Movies" apiUrl={popularMovies} />
      </section>

      <section className="section">
        <MovieCarousel title="📺 Popular TV Shows" apiUrl={popularTV} />
      </section>

      <section className="info-section">
        <h1>CineFinder – Discover Movies and Series Online</h1>
        <p>
          CineFinder is the best place to find information about movies and TV
          shows quickly and easily. Here, you can explore synopses, cast
          details, trailers, and ratings without needing to sign up or pay
          anything.
        </p>
      </section>

      <section className="info-section">
        <h2>What is CineFinder?</h2>
        <p>
          CineFinder is a platform designed to gather information about movies
          and TV shows, making it easier for you to choose what to watch.
        </p>
      </section>

      <section className="info-section">
        <h2>Why use CineFinder?</h2>
        <ul>
          <li>
            Extensive Catalog: Discover thousands of titles, from classics to
            the latest releases.
          </li>
          <li>
            Complete Information: Read synopses, check the cast, watch trailers,
            and see ratings.
          </li>
          <li>
            Fast and Simple Experience: Optimized interface for both desktop and
            mobile.
          </li>
          <li>
            No Registration or Payments: Access everything for free, with no
            hassle.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
