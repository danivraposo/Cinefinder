import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaUser, FaFilm, FaTags, FaTag, FaSearch } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './FeaturedLists.css';

const FeaturedLists = () => {
  const { getFeaturedLists, currentUser } = useAuth();
  const [featuredLists, setFeaturedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeaturedLists = () => {
      setLoading(true);
      const lists = getFeaturedLists();
      setFeaturedLists(lists);
      setLoading(false);
    };

    loadFeaturedLists();
  }, [getFeaturedLists]);

  // Extrair todas as tags únicas das listas
  const allTags = [...new Set(
    featuredLists.flatMap(list => list.tags || []).filter(Boolean)
  )];

  // Filtrar listas com base na pesquisa e tag selecionada
  const filteredLists = featuredLists.filter(list => {
    const matchesSearch = searchQuery === '' || 
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = selectedTag === null || 
      (list.tags && list.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  // Separar listas oficiais e listas em destaque
  const officialLists = filteredLists.filter(list => list.isOfficial);
  const regularFeaturedLists = filteredLists.filter(list => !list.isOfficial);

  // Função para obter a imagem de capa da lista
  const getListCoverImage = (list) => {
    if (list.coverImage) {
      return list.coverImage;
    }
    
    if (list.items && list.items.length > 0) {
      const firstItem = list.items[0];
      if (firstItem.backdrop_path) {
        return `https://image.tmdb.org/t/p/w500${firstItem.backdrop_path}`;
      }
      if (firstItem.poster_path) {
        return `https://image.tmdb.org/t/p/w500${firstItem.poster_path}`;
      }
    }
    
    return 'https://via.placeholder.com/500x280?text=Sem+Imagem';
  };

  const handleListClick = (listId) => {
    navigate(`/list/${listId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando listas em destaque...</p>
      </div>
    );
  }

  return (
    <div className="featured-lists-page">
      <div className="featured-lists-header">
        <h1>Listas em Destaque</h1>
        <p className="featured-description">
          Descubra coleções cuidadosamente selecionadas de filmes e séries recomendados pela nossa equipe e comunidade.
        </p>
        
        <div className="featured-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar listas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="tags-filter">
              <button 
                className={`tag-button ${selectedTag === null ? 'active' : ''}`}
                onClick={() => setSelectedTag(null)}
              >
                Todas
              </button>
              {allTags.map((tag, index) => (
                <button
                  key={index}
                  className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  <FaTag /> {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {featuredLists.length === 0 ? (
        <div className="no-featured-lists">
          <p>Não há listas em destaque no momento.</p>
          {currentUser && (
            <button onClick={() => navigate('/profile')}>Criar uma lista</button>
          )}
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="no-results">
          <p>Nenhuma lista encontrada com os filtros atuais.</p>
          <button onClick={() => {
            setSearchQuery('');
            setSelectedTag(null);
          }}>Limpar filtros</button>
        </div>
      ) : (
        <>
          {/* Listas Oficiais */}
          {officialLists.length > 0 && (
            <div className="lists-section">
              <h2 className="section-title">
                <FaStar className="section-icon" /> Listas Oficiais
              </h2>
              <div className="lists-grid">
                {officialLists.map(list => (
                  <div 
                    key={list.id} 
                    className="list-card official"
                    onClick={() => handleListClick(list.id)}
                  >
                    <div className="list-cover">
                      <img src={getListCoverImage(list)} alt={list.name} />
                      <div className="list-badge official">
                        <FaStar /> Oficial
                      </div>
                    </div>
                    <div className="list-info">
                      <h3>{list.name}</h3>
                      <p className="list-description">{list.description}</p>
                      
                      {list.tags && list.tags.length > 0 && (
                        <div className="list-tags">
                          <FaTags className="tags-icon" />
                          {list.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="list-tag">{tag}</span>
                          ))}
                          {list.tags.length > 3 && <span className="more-tags">+{list.tags.length - 3}</span>}
                        </div>
                      )}
                      
                      <div className="list-meta">
                        <span className="item-count">
                          <FaFilm /> {list.items?.length || 0} itens
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Listas em Destaque */}
          {regularFeaturedLists.length > 0 && (
            <div className="lists-section">
              <h2 className="section-title">
                Listas em Destaque
              </h2>
              <div className="lists-grid">
                {regularFeaturedLists.map(list => (
                  <div 
                    key={list.id} 
                    className="list-card"
                    onClick={() => handleListClick(list.id)}
                  >
                    <div className="list-cover">
                      <img src={getListCoverImage(list)} alt={list.name} />
                    </div>
                    <div className="list-info">
                      <h3>{list.name}</h3>
                      <p className="list-description">{list.description}</p>
                      
                      {list.tags && list.tags.length > 0 && (
                        <div className="list-tags">
                          <FaTags className="tags-icon" />
                          {list.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="list-tag">{tag}</span>
                          ))}
                          {list.tags.length > 3 && <span className="more-tags">+{list.tags.length - 3}</span>}
                        </div>
                      )}
                      
                      <div className="list-meta">
                        <span className="creator">
                          <FaUser /> {list.username}
                        </span>
                        <span className="item-count">
                          <FaFilm /> {list.items?.length || 0} itens
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {currentUser && currentUser.role === 'admin' && (
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/featured-lists')}>
            Gerenciar Listas em Destaque
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedLists; 