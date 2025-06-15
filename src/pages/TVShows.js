import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import FilterMenu from "../components/FilterMenu";
import "./Movies.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const TVShows = () => {
  const [tvShows, setTvShows] = useState([]);
  const [popularTvShows, setPopularTvShows] = useState([]);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    type: "tv",
    year: "all",
    genres: [],
    country: "all",
  });

  const [tempFilters, setTempFilters] = useState(filters);
  const apiKey = process.env.REACT_APP_TMDB_API_KEY;

  const regionMap = {
    Portugal: "PT",
    Australia: "AU",
    China: "CN",
    Belgium: "BE",
    Brazil: "BR",
    Canada: "CA",
    Denmark: "DK",
    Taiwan: "TW",
    Spain: "ES",
    "United States of America": "US",
  };

  const genreMap = {
    Action: 28,
    Horror: 27,
    Comedy: 35,
    Drama: 18,
    Crime: 80,
    Animation: 16,
    News: 10763,
    Romance: 10749,
    Music: 10402,
    Family: 10751,
    Western: 37,
    War: 10752,
  };

  useEffect(() => {
    const fetchFilteredTVShows = async () => {
      let baseUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en-US&page=`;

      let urlFilters = `&sort_by=popularity.desc`;

      if (filters.year !== "all" && filters.year !== "older") {
        urlFilters += `&first_air_date_year=${filters.year}`;
      } else if (filters.year === "older") {
        urlFilters += `&first_air_date.lte=2021-12-31`;
      }

      if (filters.genres.length > 0) {
        const genreIds = filters.genres
          .map((g) => genreMap[g])
          .filter(Boolean)
          .join(",");
        if (genreIds) urlFilters += `&with_genres=${genreIds}`;
      }

      if (filters.country !== "all") {
        const countryCode = regionMap[filters.country];
        if (countryCode) urlFilters += `&origin_country=${countryCode}`;
      }

      try {
        const [res1, res2] = await Promise.all([
          fetch(`${baseUrl}${page}${urlFilters}`),
          fetch(`${baseUrl}${page + 1}${urlFilters}`),
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        setTvShows([...(data1.results || []), ...(data2.results || [])]);
      } catch (err) {
        console.error("Error fetching filtered TV shows:", err);
      }
    };

    fetchFilteredTVShows();
  }, [filters, page]);

  useEffect(() => {
    const fetchPopularTVShows = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/on_the_air?api_key=${apiKey}&language=en-US&page=1`
        );
        const data = await res.json();
        setPopularTvShows(data.results || []);
      } catch (err) {
        console.error("Error fetching popular TV shows:", err);
      }
    };

    fetchPopularTVShows();
  }, []);

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilter(false);
    setPage(1);
  };

  return (
    <div className="movies-page">
      <h2 className="section-title">| Currently Airing TV Shows</h2>
      <div className="carousel-container">
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={10}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
          }}
        >
          {popularTvShows.map((show) => (
            <SwiperSlide key={show.id}>
              <img
                src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                alt={show.name}
                style={{ borderRadius: "10px", width: "100%" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <h2 className="section-title">
        | Popular TV Shows{" "}
        <button
          onClick={() => setShowFilter(true)}
          style={{ fontSize: "1.1rem" }}
        >
          🔍
        </button>
      </h2>

      {showFilter && (
        <FilterMenu
          tempFilters={tempFilters}
          setTempFilters={setTempFilters}
          applyFilters={applyFilters}
          closeMenu={() => setShowFilter(false)}
        />
      )}

      <div className="movie-grid">
        {tvShows.map((show) => (
          <MovieCard key={show.id} movie={show} />
        ))}
      </div>

      <div className="pagination">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={page === num ? "active" : ""}
          >
            {num}
          </button>
        ))}
        <button onClick={() => setPage((p) => p + 1)}>→</button>
        <button onClick={() => setPage(100)}>»</button>
      </div>
    </div>
  );
};

export default TVShows;
