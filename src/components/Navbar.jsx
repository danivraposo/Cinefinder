import React, { useState } from 'react';
import './Navbar.css';
import { FaUser, FaSearch } from 'react-icons/fa'; // Profile icon and Search icon
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import UserProfile from './UserProfile';
import logo from '../logo.png'; // Importar o logo diretamente

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
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

  const goToHome = () => {
    navigate('/');
  };

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setShowUserProfile(true);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={goToHome} style={{ cursor: 'pointer' }}>
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
          <div className="user-profile" onClick={handleUserIconClick}>
            {isAuthenticated && currentUser ? (
              <div className="user-avatar">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <FaUser className="user-icon" />
            )}
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </>
  );
}

export default Navbar;
