import { useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== "") {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Pesquisar filme..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", fontSize: "16px", width: "300px" }}
      />
      <button type="submit" style={{ padding: "10px 15px", marginLeft: "10px" }}>
        Pesquisar
      </button>
    </form>
  );
}

export default SearchBar;
