import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MovieCard from "./MovieCard";
import "./MovieCarousel.css";

const MovieCarousel = ({ title = "Popular Movies", apiUrl }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      // Determinar o tipo de mídia com base na URL ou no título
      const mediaType = apiUrl.includes('/tv/') || title.includes('TV') ? 'tv' : 'movie';
      
      // Adicionar media_type aos resultados
      const items = data.results?.map(item => ({
        ...item,
        media_type: mediaType
      })) || [];
      
      setMovies(items);
    };

    fetchData();
  }, [apiUrl, title]);

  return (
    <div className="movie-carousel">
      <h2 className="carousel-title">{title}</h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={6}
        navigation
        breakpoints={{
          320: { slidesPerView: 2 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <MovieCard 
              movie={movie}
              showRating={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MovieCarousel;
