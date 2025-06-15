import React, { useState } from 'react';
import './Navbar.css';
import { FaUser, FaSearch } from 'react-icons/fa'; // Profile icon and Search icon
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.png'; // Importar o logo diretamente

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      console.log("Pesquisando por:", searchQuery);
      const searchURL = `/search?q=${encodeURIComponent(searchQuery)}`;
      console.log("Redirecionando para:", searchURL);
      navigate(searchURL);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="CineFinder" />
        <span>CineFinder</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/movies">Movies</Link></li>
        <li><Link to="/tv-shows">TV Shows</Link></li>
        <li><Link to="/top-imdb">Top IMDB</Link></li>
      </ul>
      <div className="navbar-actions">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <FaSearch />
          </button>
        </form>
        <FaUser className="user-icon" />
      </div>
    </nav>
  );
}

export default Navbar;
