import React from 'react';
import './Navbar.css';
import { FaUser } from 'react-icons/fa'; // Profile icon
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo192.png" alt="CineFinder" />
        <span>CineFinder</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/movies">Movies</Link></li>
        <li><Link to="/tv-shows">TV Shows</Link></li>
        <li><Link to="/top-imdb">Top IMDB</Link></li>
      </ul>
      <div className="navbar-actions">
        <input type="text" placeholder="Search ..." />
        <FaUser className="user-icon" />
      </div>
    </nav>
  );
}

export default Navbar;
