import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaUser, FaSearch, FaList, FaPlus, FaStar, FaTimes, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import logo from '../logo.png';

const Navbar = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if (showUserMenu) setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showMenu) setShowMenu(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowMenu(false);
  };

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
      setShowUserMenu(!showUserMenu);
    } else {
      setShowLoginModal(true);
    }
  };

  // Fechar o menu quando clicar fora dele
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo" onClick={goToHome} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="CineFinder" />
          <span>CineFinder</span>
        </div>

        <div className="navbar-search">
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
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          {showMenu ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`navbar-menu ${showMenu ? 'active' : ''}`}>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/movies" className={({ isActive }) => isActive ? 'active' : ''}>
              Filmes
            </NavLink>
          </li>
          <li>
            <NavLink to="/tv-shows" className={({ isActive }) => isActive ? 'active' : ''}>
              Séries
            </NavLink>
          </li>
          <li>
            <NavLink to="/top-imdb" className={({ isActive }) => isActive ? 'active' : ''}>
              Top IMDB
            </NavLink>
          </li>
          <li>
            <NavLink to="/featured-lists" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaStar /> Listas em Destaque
            </NavLink>
          </li>
        </ul>

        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <div className="user-avatar" onClick={handleUserIconClick}>
                {currentUser.name.charAt(0)}
              </div>
              <div className={`user-menu ${showUserMenu ? 'active' : ''}`}>
                <div className="user-menu-header">
                  <div className="user-avatar-large">{currentUser.name.charAt(0)}</div>
                  <div className="user-info">
                    <span className="user-name">{currentUser.name}</span>
                    <span className="user-role">{currentUser.role === 'admin' ? 'Administrador' : 'Cinéfilo'}</span>
                  </div>
                </div>
                <ul>
                  <li>
                    <Link to="/profile">
                      <FaUser /> Perfil
                    </Link>
                  </li>
                  <li>
                    <Link to="/watchlist">
                      <FaSearch /> Watchlist
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-lists">
                      <FaList /> Minhas Listas
                    </Link>
                  </li>
                  {currentUser.role === 'admin' && (
                    <li>
                      <Link to="/admin/featured-lists">
                        <FaStar /> Gerenciar Listas
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/logout">
                      <FaSignOutAlt /> Sair
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              Entrar
            </button>
          )}
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </nav>
  );
};

export default Navbar;
