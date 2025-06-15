// src/pages/SearchResults.jsx
import React from "react";
import { useLocation } from "react-router-dom";

const SearchResults = () => {
  const query = new URLSearchParams(useLocation().search);
  const searchTerm = query.get("q");

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">
        Search Results for: <span className="italic">{searchTerm}</span>
      </h1>
      {/* Aqui vais mostrar os resultados reais, quando tiveres os dados */}
      <p>No results yet – implement logic to fetch/search movies or shows.</p>
    </div>
  );
};

export default SearchResults;
