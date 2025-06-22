import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MovieCard from "./MovieCard";
import "./MovieCarousel.css";

const MovieCarousel = ({ title = "Popular Movies", apiUrl }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        // Determinar o tipo de mídia com base na URL ou no título
        const mediaType = apiUrl.includes('/tv/') || title.includes('TV') || title.includes('Séries') ? 'tv' : 'movie';
        
        // Adicionar media_type aos resultados
        const items = data.results?.map(item => ({
          ...item,
          media_type: mediaType
        })) || [];
        
        setMovies(items);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, title]);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="movie-carousel">
      <h2 className="carousel-title">{title}</h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={6}
        navigation
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          480: { slidesPerView: 3, spaceBetween: 15 },
          768: { slidesPerView: 4, spaceBetween: 15 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 20 },
        }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <MovieCard 
              movie={movie}
              showRating={false}
              showAddToList={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MovieCarousel;
