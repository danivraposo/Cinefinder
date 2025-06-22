import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaPlus, FaMinus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaTag } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './AdminFeaturedLists.css';

const AdminFeaturedLists = () => {
  const { 
    currentUser, 
    getListsForFeaturing, 
    addToFeatured, 
    removeFromFeatured, 
    createOfficialList, 
    updateOfficialList, 
    deleteOfficialList 
  } = useAuth();
  
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'featured', 'notFeatured', 'official'
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOfficialList, setNewOfficialList] = useState({
    name: '',
    description: '',
    coverImage: '',
    tags: [],
    items: []
  });
  const [newTag, setNewTag] = useState('');
  const [editingList, setEditingList] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    
    loadLists();
  }, [currentUser, navigate]);
  
  const loadLists = () => {
    setLoading(true);
    const result = getListsForFeaturing();
    
    if (result.success) {
      // Obter também as listas oficiais do localStorage
      const officialListsData = localStorage.getItem('officialLists');
      const officialLists = officialListsData ? JSON.parse(officialListsData) : [];
      
      // Combinar listas normais e oficiais
      setLists([...result.lists, ...officialLists]);
    } else {
      setMessage({ text: result.message || 'Erro ao carregar listas', type: 'error' });
    }
    
    setLoading(false);
  };
  
  const handleAddToFeatured = (listId) => {
    const result = addToFeatured(listId);
    
    if (result.success) {
      setLists(prevLists => 
        prevLists.map(list => 
          list.id === listId ? { ...list, isFeatured: true } : list
        )
      );
      setMessage({ text: 'Lista adicionada aos destaques com sucesso!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Erro ao adicionar lista aos destaques', type: 'error' });
    }
    
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  
  const handleRemoveFromFeatured = (listId) => {
    const result = removeFromFeatured(listId);
    
    if (result.success) {
      setLists(prevLists => 
        prevLists.map(list => 
          list.id === listId ? { ...list, isFeatured: false } : list
        )
      );
      setMessage({ text: 'Lista removida dos destaques com sucesso!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Erro ao remover lista dos destaques', type: 'error' });
    }
    
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  
  const handleCreateOfficialList = (e) => {
    e.preventDefault();
    
    if (!newOfficialList.name.trim()) {
      setMessage({ text: 'O nome da lista é obrigatório', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }
    
    const result = createOfficialList(newOfficialList);
    
    if (result.success) {
      setLists(prevLists => [...prevLists, result.list]);
      setNewOfficialList({
        name: '',
        description: '',
        coverImage: '',
        tags: [],
        items: []
      });
      setShowCreateForm(false);
      setMessage({ text: 'Lista oficial criada com sucesso!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Erro ao criar lista oficial', type: 'error' });
    }
    
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  
  const handleUpdateOfficialList = (e) => {
    e.preventDefault();
    
    if (!editingList || !editingList.name.trim()) {
      setMessage({ text: 'O nome da lista é obrigatório', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }
    
    const result = updateOfficialList(editingList.id, editingList);
    
    if (result.success) {
      setLists(prevLists => 
        prevLists.map(list => 
          list.id === editingList.id ? result.list : list
        )
      );
      setEditingList(null);
      setMessage({ text: 'Lista oficial atualizada com sucesso!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Erro ao atualizar lista oficial', type: 'error' });
    }
    
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  
  const handleDeleteOfficialList = (listId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta lista oficial? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    const result = deleteOfficialList(listId);
    
    if (result.success) {
      setLists(prevLists => prevLists.filter(list => list.id !== listId));
      setMessage({ text: 'Lista oficial excluída com sucesso!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Erro ao excluir lista oficial', type: 'error' });
    }
    
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };
  
  const addTag = () => {
    if (!newTag.trim()) return;
    
    if (editingList) {
      if (!editingList.tags.includes(newTag.trim())) {
        setEditingList({
          ...editingList,
          tags: [...editingList.tags, newTag.trim()]
        });
      }
    } else {
      if (!newOfficialList.tags.includes(newTag.trim())) {
        setNewOfficialList({
          ...newOfficialList,
          tags: [...newOfficialList.tags, newTag.trim()]
        });
      }
    }
    
    setNewTag('');
  };
  
  const removeTag = (tag) => {
    if (editingList) {
      setEditingList({
        ...editingList,
        tags: editingList.tags.filter(t => t !== tag)
      });
    } else {
      setNewOfficialList({
        ...newOfficialList,
        tags: newOfficialList.tags.filter(t => t !== tag)
      });
    }
  };
  
  const handleViewList = (listId) => {
    navigate(`/list/${listId}`);
  };
  
  // Filtrar listas com base na pesquisa e modo de filtro
  const filteredLists = lists.filter(list => {
    const matchesSearch = searchQuery === '' || 
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (filterMode) {
      case 'featured':
        return matchesSearch && list.isFeatured && !list.isOfficial;
      case 'notFeatured':
        return matchesSearch && !list.isFeatured && !list.isOfficial;
      case 'official':
        return matchesSearch && list.isOfficial;
      default:
        return matchesSearch;
    }
  });
  
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
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando listas...</p>
      </div>
    );
  }

  return (
    <div className="admin-featured-lists">
      <div className="admin-header">
        <h1>Gerenciar Listas em Destaque</h1>
        <div className="admin-actions">
          <button 
            className="create-official-button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancelar' : 'Criar Lista Oficial'}
          </button>
          <button 
            className="view-featured-button"
            onClick={() => navigate('/featured-lists')}
          >
            Ver Página de Destaques
          </button>
        </div>
        
        {message.text && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
      
      {showCreateForm && (
        <div className="create-form-container">
          <h2>Criar Nova Lista Oficial</h2>
          <form onSubmit={handleCreateOfficialList}>
            <div className="form-group">
              <label>Nome da Lista</label>
              <input
                type="text"
                value={newOfficialList.name}
                onChange={(e) => setNewOfficialList({...newOfficialList, name: e.target.value})}
                placeholder="Ex: Melhores Filmes do Mês"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={newOfficialList.description}
                onChange={(e) => setNewOfficialList({...newOfficialList, description: e.target.value})}
                placeholder="Descrição da lista"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>URL da Imagem de Capa (opcional)</label>
              <input
                type="text"
                value={newOfficialList.coverImage}
                onChange={(e) => setNewOfficialList({...newOfficialList, coverImage: e.target.value})}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            
            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag}>Adicionar</button>
              </div>
              
              <div className="tags-container">
                {newOfficialList.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <FaTag /> {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button">Criar Lista Oficial</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-button">Cancelar</button>
            </div>
          </form>
        </div>
      )}
      
      {editingList && (
        <div className="edit-form-container">
          <h2>Editar Lista Oficial</h2>
          <form onSubmit={handleUpdateOfficialList}>
            <div className="form-group">
              <label>Nome da Lista</label>
              <input
                type="text"
                value={editingList.name}
                onChange={(e) => setEditingList({...editingList, name: e.target.value})}
                placeholder="Nome da lista"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={editingList.description}
                onChange={(e) => setEditingList({...editingList, description: e.target.value})}
                placeholder="Descrição da lista"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>URL da Imagem de Capa (opcional)</label>
              <input
                type="text"
                value={editingList.coverImage}
                onChange={(e) => setEditingList({...editingList, coverImage: e.target.value})}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            
            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag}>Adicionar</button>
              </div>
              
              <div className="tags-container">
                {editingList.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <FaTag /> {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button">Salvar Alterações</button>
              <button type="button" onClick={() => setEditingList(null)} className="cancel-button">Cancelar</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="lists-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar listas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdown">
          <FaFilter className="filter-icon" />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="all">Todas as listas</option>
            <option value="featured">Em destaque</option>
            <option value="notFeatured">Não destacadas</option>
            <option value="official">Listas oficiais</option>
          </select>
        </div>
      </div>
      
      {filteredLists.length === 0 ? (
        <div className="no-lists-message">
          <p>Nenhuma lista encontrada com os filtros atuais.</p>
          <button onClick={() => {
            setSearchQuery('');
            setFilterMode('all');
          }}>Limpar filtros</button>
        </div>
      ) : (
        <div className="lists-table">
          <table>
            <thead>
              <tr>
                <th>Lista</th>
                <th>Tipo</th>
                <th>Criador</th>
                <th>Itens</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLists.map(list => (
                <tr key={list.id} className={list.isOfficial ? 'official-row' : (list.isFeatured ? 'featured-row' : '')}>
                  <td className="list-name-cell">
                    <div className="list-name-with-image">
                      <div className="list-thumbnail">
                        <img src={getListCoverImage(list)} alt={list.name} />
                      </div>
                      <div>
                        <div className="list-name">{list.name}</div>
                        {list.tags && list.tags.length > 0 && (
                          <div className="list-tags-small">
                            {list.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="tag-small">{tag}</span>
                            ))}
                            {list.tags.length > 3 && <span>+{list.tags.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{list.isOfficial ? 'Oficial' : 'Usuário'}</td>
                  <td>{list.username || 'Sistema'}</td>
                  <td>{list.items?.length || 0}</td>
                  <td>
                    {list.isOfficial ? (
                      <span className="status official">Oficial</span>
                    ) : list.isFeatured ? (
                      <span className="status featured">Em destaque</span>
                    ) : (
                      <span className="status normal">Normal</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="view-button" 
                      title="Ver lista"
                      onClick={() => handleViewList(list.id)}
                    >
                      <FaEye />
                    </button>
                    
                    {list.isOfficial ? (
                      <>
                        <button 
                          className="edit-button" 
                          title="Editar lista oficial"
                          onClick={() => setEditingList(list)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="delete-button" 
                          title="Excluir lista oficial"
                          onClick={() => handleDeleteOfficialList(list.id)}
                        >
                          <FaTrash />
                        </button>
                      </>
                    ) : list.isFeatured ? (
                      <button 
                        className="remove-featured-button" 
                        title="Remover dos destaques"
                        onClick={() => handleRemoveFromFeatured(list.id)}
                      >
                        <FaMinus />
                      </button>
                    ) : (
                      <button 
                        className="add-featured-button" 
                        title="Adicionar aos destaques"
                        onClick={() => handleAddToFeatured(list.id)}
                      >
                        <FaPlus />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedLists; 