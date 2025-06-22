import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCarousel from "../components/MovieCarousel";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";

const Home = ({ logout = false }) => {
  const apiKey = process.env.REACT_APP_TMDB_API_KEY;
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (logout) {
      authLogout();
      navigate('/', { replace: true });
    }
  }, [logout, authLogout, navigate]);

  const popularMovies = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  const popularTV = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`;

  return (
    <div className="home-container">
      <section className="section">
        <MovieCarousel title="🎬 Filmes Populares" apiUrl={popularMovies} />
      </section>

      <section className="section">
        <MovieCarousel title="📺 Séries Populares" apiUrl={popularTV} />
      </section>

      <section className="info-section">
        <h1>CineFinder – Descubra Filmes e Séries Online</h1>
        <p>
          CineFinder é o melhor lugar para encontrar informações sobre filmes e séries
          de TV de forma rápida e fácil. Aqui, você pode explorar sinopses, detalhes
          do elenco, trailers e avaliações sem precisar se cadastrar ou pagar nada.
        </p>
      </section>

      <section className="info-section">
        <h2>O que é o CineFinder?</h2>
        <p>
          CineFinder é uma plataforma projetada para reunir informações sobre filmes
          e séries de TV, facilitando sua escolha sobre o que assistir.
        </p>
      </section>

      <section className="info-section">
        <h2>Por que usar o CineFinder?</h2>
        <ul>
          <li>
            Catálogo Extenso: Descubra milhares de títulos, desde clássicos até
            os lançamentos mais recentes.
          </li>
          <li>
            Informações Completas: Leia sinopses, confira o elenco, assista trailers
            e veja avaliações.
          </li>
          <li>
            Experiência Rápida e Simples: Interface otimizada tanto para desktop
            quanto para dispositivos móveis.
          </li>
          <li>
            Sem Cadastro ou Pagamentos: Acesse tudo gratuitamente, sem complicações.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
