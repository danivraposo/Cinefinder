import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { FaUser, FaFilm, FaTv, FaList, FaPlus, FaEdit, FaTrash, FaEye, FaGlobe, FaLock, FaStar, FaTag } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import CustomList from './CustomList';
import MovieCard from './MovieCard';
import './UserProfile.css';

const UserProfile = ({ initialTab }) => {
  const { currentUser, logout, getUserLists, deleteList } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Determinar a aba ativa com base nos parâmetros
  const getInitialTab = () => {
    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery) {
      return tabFromQuery;
    }
    return initialTab || 'watchlist';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [movieItems, setMovieItems] = useState([]);
  const [tvItems, setTvItems] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    // Atualizar a aba ativa quando a URL mudar
    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
    
    // Verificar se deve mostrar o formulário de nova lista
    const newListParam = searchParams.get('new');
    if (newListParam === 'true' && tabFromQuery === 'lists') {
      setShowCreateListForm(true);
    }
    
    // Process watchlist items into categories
    if (currentUser.watchlist) {
      setWatchlistItems(currentUser.watchlist);
      setMovieItems(currentUser.watchlist.filter(item => item.media_type === 'movie'));
      setTvItems(currentUser.watchlist.filter(item => item.media_type === 'tv'));
    }
    
    // Get user's custom lists
    const lists = getUserLists();
    setUserLists(lists);

    setLoading(false);
  }, [currentUser, navigate, getUserLists, searchParams, initialTab]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Atualizar a URL com a nova aba
    navigate(`/profile?tab=${tab}`, { replace: true });
  };

  const handleCreateList = () => {
    setShowCreateListForm(true);
    setEditingList(null);
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setShowCreateListForm(false);
  };

  const handleDeleteList = (listId) => {
    if (window.confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      const result = deleteList(listId);
      
      if (result.success) {
        setUserLists(userLists.filter(list => list.id !== listId));
      } else {
        alert(result.message);
      }
    }
  };

  const handleListUpdate = (updatedList) => {
    if (editingList) {
      setUserLists(userLists.map(list => 
        list.id === updatedList.id ? updatedList : list
      ));
      setEditingList(null);
    } else {
      setUserLists([...userLists, updatedList]);
      setShowCreateListForm(false);
    }
  };

  const getFilteredItems = () => {
    if (activeFilter === 'movie') return movieItems;
    if (activeFilter === 'tv') return tvItems;
    return watchlistItems;
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser?.name?.charAt(0).toUpperCase() || <FaUser />}
        </div>
        <div className="profile-info">
          <h2>{currentUser?.name || currentUser?.username}</h2>
          <p className="user-role">{currentUser?.role === 'admin' ? 'Administrador' : 'Utilizador'}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => handleTabChange('watchlist')}
        >
          <FaFilm className="tab-icon" /> Watchlist
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'lists' ? 'active' : ''}`}
          onClick={() => handleTabChange('lists')}
        >
          <FaList className="tab-icon" /> Minhas Listas
        </button>
      </div>
      
      {activeTab === 'watchlist' && (
        <div className="watchlist-content">
          <div className="watchlist-filters">
            <button 
              className={`filter-button ${!activeFilter ? 'active' : ''}`}
              onClick={() => setActiveFilter(null)}
            >
              Todos ({watchlistItems.length})
            </button>
            <button 
              className={`filter-button ${activeFilter === 'movie' ? 'active' : ''}`}
              onClick={() => setActiveFilter('movie')}
            >
              Filmes ({movieItems.length})
            </button>
            <button 
              className={`filter-button ${activeFilter === 'tv' ? 'active' : ''}`}
              onClick={() => setActiveFilter('tv')}
            >
              Séries ({tvItems.length})
            </button>
          </div>
          
          <div className="watchlist-items">
            {getFilteredItems().length === 0 ? (
              <div className="empty-state">
                <p>Sua watchlist está vazia.</p>
                <button onClick={() => navigate('/movies')}>Explorar Filmes</button>
              </div>
            ) : (
              <div className="watchlist-grid">
                {getFilteredItems().map(item => (
                  <MovieCard 
                    key={`${item.id}-${item.media_type}`} 
                    movie={item} 
                    showRating={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'lists' && (
        <ListsTab 
          userLists={userLists} 
          showCreateListForm={showCreateListForm} 
          handleCreateList={handleCreateList} 
          handleEditList={handleEditList}
          handleDeleteList={handleDeleteList}
          handleListUpdate={handleListUpdate}
        />
      )}
    </div>
  );
};

const ListsTab = ({ 
  userLists, 
  showCreateListForm, 
  handleCreateList, 
  handleEditList,
  handleDeleteList,
  handleListUpdate
}) => {
  if (userLists.length === 0 && !showCreateListForm) {
    return (
      <div className="empty-state">
        <p>Você ainda não criou nenhuma lista personalizada.</p>
        <button onClick={handleCreateList}>Criar minha primeira lista</button>
      </div>
    );
  }

  return (
    <div className="user-lists-content">
      <div className="user-lists-header">
        <h3>Suas Listas Personalizadas</h3>
        <button className="new-list-button" onClick={handleCreateList}>
          <FaPlus /> Nova Lista
        </button>
      </div>
      
      {showCreateListForm ? (
        <div className="new-list-form-container">
          <CustomList 
            mode="edit" 
            onUpdate={handleListUpdate}
          />
        </div>
      ) : (
        <div className="user-lists-grid">
          {userLists.map(list => (
            <div key={list.id} className="user-list-card">
              <div className="list-card-header">
                <h4>{list.name}</h4>
                <div className="list-privacy-indicator">
                  {list.isPublic ? (
                    <FaGlobe title="Lista pública" />
                  ) : (
                    <FaLock title="Lista privada" />
                  )}
                </div>
              </div>
              
              <p className="list-description">
                {list.description || "Sem descrição"}
              </p>
              
              <div className="list-stats">
                <span>{list.items?.length || 0} itens</span>
                {list.tags?.length > 0 && (
                  <div className="list-tags">
                    {list.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="list-tag">{tag}</span>
                    ))}
                    {list.tags.length > 3 && <span className="more-tags">+{list.tags.length - 3}</span>}
                  </div>
                )}
              </div>
              
              <div className="list-actions">
                <Link to={`/list/${list.id}`} className="view-list-button">
                  <FaEye /> Ver
                </Link>
                <button 
                  className="edit-list-button"
                  onClick={() => handleEditList(list)}
                >
                  <FaEdit /> Editar
                </button>
                <button 
                  className="delete-list-button"
                  onClick={() => handleDeleteList(list.id)}
                >
                  <FaTrash /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 