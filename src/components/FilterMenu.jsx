// src/components/FilterMenu.jsx
import React, { useState } from "react";
import "./FilterMenu.css";

const genres = [
  "Action", "Horror", "Comedy", "Drama", "Crime", "Animation",
  "News", "Romance", "Music", "Family", "Western", "War"
];

const countries = [
  "Portugal", "Australia", "China", "Belgium", "Brazil", "Canada",
  "Denmark", "Taiwan", "Spain", "United States of America"
];

const FilterMenu = ({ tempFilters = {}, setTempFilters = () => {}, applyFilters = () => {}, closeMenu = () => {} }) => {
  const handleChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGenre = (genre) => {
    setTempFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleClear = () => {
    setTempFilters({
      type: "all",
      year: "all",
      genres: [],
      country: "all"
    });
  };

  return (
    <div className="filter-overlay">
      <div className="filter-popup">
        <h2 className="filter-title">🎛️ Filter</h2>

        <div className="filter-section">
          <label>Type:</label>
          <div className="filter-options">
            {["all", "movie", "tv"].map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={tempFilters.type === type}
                  onChange={(e) => handleChange("type", e.target.value)}
                />
                {type === "all" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Released:</label>
          <div className="filter-options">
            {["all", "2025", "2024", "2023", "2022", "older"].map((year) => (
              <label key={year}>
                <input
                  type="radio"
                  name="year"
                  value={year}
                  checked={tempFilters.year === year}
                  onChange={(e) => handleChange("year", e.target.value)}
                />
                {year}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Genre:</label>
          <div className="filter-options">
            {genres.map((genre) => (
              <label key={genre}>
                <input
                  type="checkbox"
                  checked={tempFilters.genres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                />
                {genre}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Country:</label>
          <div className="filter-options">
            {["all", ...countries].map((country) => (
              <label key={country}>
                <input
                  type="radio"
                  name="country"
                  value={country}
                  checked={tempFilters.country === country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
                {country}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-buttons">
          <button className="apply-btn" onClick={applyFilters}>🔍 Filter</button>
          <button className="clear-btn" onClick={handleClear}>🧹 Clear</button>
          <button className="close-btn" onClick={closeMenu}>❌ Close</button>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
