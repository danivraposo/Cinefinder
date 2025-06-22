import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaShare, FaTag, FaCopy, FaCheck } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import './ListDetails.css';

const ListDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getUserLists, getAllLists, updateList, deleteList, removeFromList, shareList } = useAuth();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tags: []
  });
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  // Lista de sugestões de tags predefinidas
  const suggestedTags = [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Ficção Científica', 
    'Terror', 'Romance', 'Animação', 'Documentário', 'Fantasia',
    'Favoritos', 'Para Assistir', 'Fim de Semana', 'Maratona', 'Clássicos'
  ];

  useEffect(() => {
    const fetchListDetails = () => {
      setLoading(true);
      try {
        // Primeiro, verificar nas listas do usuário atual
        if (currentUser) {
          const userLists = getUserLists();
          const userList = userLists.find(l => l.id.toString() === id);
          
          if (userList) {
            setList(userList);
            setEditFormData({
              name: userList.name,
              description: userList.description || '',
              isPublic: userList.isPublic || false,
              tags: userList.tags || []
            });
            setIsOwner(true);
            setLoading(false);
            return;
          }
        }
        
        // Se não encontrar nas listas do usuário, procurar nas listas públicas
        const publicLists = getAllLists();
        const publicList = publicLists.find(l => l.id.toString() === id);
        
        if (publicList) {
          setList(publicList);
          setIsOwner(currentUser && publicList.userId === currentUser.id);
          setLoading(false);
          return;
        }
        
        // Se não encontrar em nenhum lugar
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar detalhes da lista:', error);
        setLoading(false);
      }
    };

    fetchListDetails();
  }, [id, currentUser, getUserLists, getAllLists]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!editFormData.name.trim()) {
      alert('O nome da lista é obrigatório');
      return;
    }
    
    const result = updateList(parseInt(id), {
      name: editFormData.name,
      description: editFormData.description,
      isPublic: editFormData.isPublic,
      tags: editFormData.tags
    });
    
    if (result.success) {
      setList({
        ...list,
        name: editFormData.name,
        description: editFormData.description,
        isPublic: editFormData.isPublic,
        tags: editFormData.tags
      });
      setIsEditing(false);
    } else {
      alert(result.message);
    }
  };

  const handleDeleteList = () => {
    if (window.confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      const result = deleteList(parseInt(id));
      
      if (result.success) {
        alert('Lista excluída com sucesso!');
        navigate('/lists');
      } else {
        alert(result.message);
      }
    }
  };

  const handleRemoveItem = (mediaId, mediaType) => {
    if (window.confirm('Remover este item da lista?')) {
      const result = removeFromList(parseInt(id), mediaId);
      
      if (result.success) {
        // Encontramos o item específico a ser removido
        const itemToRemove = list.items.find(item => item.id === mediaId && (item.media_type === mediaType || (!item.media_type && mediaType === 'movie')));
        
        if (itemToRemove) {
          // Removemos apenas o item específico com o mesmo ID e tipo de mídia
          setList({
            ...list,
            items: list.items.filter(item => 
              !(item.id === mediaId && (item.media_type === itemToRemove.media_type || 
                (!item.media_type && itemToRemove.media_type === 'movie')))
            )
          });
        } else {
          // Fallback para o comportamento anterior
          setList({
            ...list,
            items: list.items.filter(item => item.id !== mediaId)
          });
        }
      } else {
        alert(result.message);
      }
    }
  };

  const handleShareList = (e) => {
    e.preventDefault();
    
    if (!shareUsername.trim()) {
      alert('Digite o nome de usuário para compartilhar');
      return;
    }
    
    const result = shareList(parseInt(id), shareUsername);
    
    if (result.success) {
      alert(result.message);
      setShareUsername('');
      setShowShareForm(false);
    } else {
      alert(result.message);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editFormData.tags.includes(newTag.trim())) {
      setEditFormData({
        ...editFormData,
        tags: [...editFormData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setEditFormData({
      ...editFormData,
      tags: editFormData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const selectSuggestedTag = (tag) => {
    if (!editFormData.tags.includes(tag)) {
      setEditFormData({
        ...editFormData,
        tags: [...editFormData.tags, tag]
      });
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/list/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const filterByTag = (tag) => {
    setActiveFilter(activeFilter === tag ? null : tag);
  };

  // Filtrar itens por tag se houver um filtro ativo
  const filteredItems = activeFilter 
    ? list?.items?.filter(item => 
        item.genre_ids?.some(genreId => {
          // Mapear gêneros para tags (simplificado)
          const genreMap = {
            28: 'Ação',
            12: 'Aventura',
            35: 'Comédia',
            18: 'Drama',
            878: 'Ficção Científica',
            27: 'Terror',
            10749: 'Romance',
            16: 'Animação',
            99: 'Documentário',
            14: 'Fantasia'
          };
          return genreMap[genreId] === activeFilter;
        })
      )
    : list?.items;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando detalhes da lista...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="list-not-found">
        <h2>Lista não encontrada</h2>
        <p>A lista que você está procurando não existe ou não está disponível.</p>
        <button onClick={() => navigate('/lists')}>Ver minhas listas</button>
      </div>
    );
  }

  return (
    <div className="list-details-page">
      <div className="list-details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>
        
        {isEditing ? (
          <form className="edit-list-form" onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>Nome da Lista</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                placeholder="Nome da lista"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Descrição da lista"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Tags (categorias)</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicione tags para categorizar sua lista"
                />
                <button type="button" onClick={addTag}>+</button>
              </div>
              
              <div className="tags-container">
                {editFormData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
              
              <div className="suggested-tags">
                <p>Sugestões:</p>
                <div className="suggested-tags-list">
                  {suggestedTags.filter(tag => !editFormData.tags.includes(tag)).slice(0, 10).map((tag, index) => (
                    <span 
                      key={index} 
                      className="suggested-tag"
                      onClick={() => selectSuggestedTag(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isPublic"
                checked={editFormData.isPublic}
                onChange={(e) => setEditFormData({...editFormData, isPublic: e.target.checked})}
              />
              <label htmlFor="isPublic">Lista Pública</label>
              <span className="visibility-info">
                {editFormData.isPublic 
                  ? "Qualquer pessoa poderá ver esta lista" 
                  : "Apenas você poderá ver esta lista"}
              </span>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-button">Salvar</button>
              <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="list-info">
            <div className="list-title-area">
              <h1>{list.name}</h1>
              <span className="visibility-badge">
                {list.isPublic ? 'Pública' : 'Privada'}
              </span>
            </div>
            
            {list.description && (
              <p className="list-description">{list.description}</p>
            )}
            
            {list.tags && list.tags.length > 0 && (
              <div className="list-tags">
                {list.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`list-tag ${activeFilter === tag ? 'active' : ''}`}
                    onClick={() => filterByTag(tag)}
                  >
                    <FaTag className="tag-icon" /> {tag}
                  </span>
                ))}
                {activeFilter && (
                  <button 
                    className="clear-filter-button"
                    onClick={() => setActiveFilter(null)}
                  >
                    Limpar filtro
                  </button>
                )}
              </div>
            )}
            
            <div className="list-meta">
              {list.username && list.username !== currentUser?.username && (
                <p className="list-creator">Criada por: {list.username}</p>
              )}
              
              <p className="list-stats">
                {list.items?.length || 0} item(s) • 
                Atualizada em {new Date(list.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            {list.sharedFrom && (
              <div className="shared-info">
                <p>Compartilhada por: {list.sharedFrom.username}</p>
              </div>
            )}
            
            <div className="list-actions">
              {isOwner && (
                <>
                  <button className="edit-button" onClick={() => setIsEditing(true)}>
                    <FaEdit /> Editar
                  </button>
                  <button className="delete-button" onClick={handleDeleteList}>
                    <FaTrash /> Excluir
                  </button>
                </>
              )}
              
              <button className="share-button" onClick={() => setShowShareForm(!showShareForm)}>
                <FaShare /> Compartilhar
              </button>
              
              <button 
                className={`copy-link-button ${linkCopied ? 'copied' : ''}`} 
                onClick={copyShareLink}
              >
                {linkCopied ? <><FaCheck /> Copiado</> : <><FaCopy /> Copiar Link</>}
              </button>
            </div>
            
            {showShareForm && (
              <div className="share-options-panel">
                <h3>Opções de Compartilhamento</h3>
                
                <div className="share-option">
                  <h4>Compartilhar com usuário</h4>
                  <form className="share-form" onSubmit={handleShareList}>
                    <input
                      type="text"
                      value={shareUsername}
                      onChange={(e) => setShareUsername(e.target.value)}
                      placeholder="Nome de usuário"
                      required
                    />
                    <button type="submit">Compartilhar</button>
                    <button type="button" onClick={() => setShowShareForm(false)}>Cancelar</button>
                  </form>
                  <p className="share-info">
                    O usuário receberá uma cópia desta lista em seu perfil.
                  </p>
                </div>
                
                <div className="share-option">
                  <h4>Link para compartilhar</h4>
                  <div className="share-link-container">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/list/${id}`} 
                    />
                    <button onClick={copyShareLink}>
                      {linkCopied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                  <p className="share-info">
                    {list.isPublic 
                      ? "Qualquer pessoa com o link pode ver esta lista" 
                      : "Apenas você pode ver esta lista. Torne-a pública para compartilhar o link."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
                <div className="list-items">
            <h2>Itens da Lista {activeFilter ? `- Filtrados por: ${activeFilter}` : ''}</h2>
            
            {filteredItems?.length > 0 ? (
              <div className="items-grid">
                {/* Usar um Map para garantir itens únicos baseados no ID e tipo de mídia */}
                {Array.from(
                  new Map(
                    filteredItems.map(item => [
                      `${item.id}-${item.media_type || 'movie'}`, 
                      item
                    ])
                  ).values()
                ).map(item => (
                  <div className="list-item-card" key={`${item.id}-${item.media_type || 'movie'}`}>
                    <MovieCard movie={item} />
                    {isOwner && (
                      <button 
                        className="remove-item-button" 
                        onClick={() => handleRemoveItem(item.id, item.media_type || 'movie')}
                        title="Remover da lista"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-list">
                {activeFilter 
                  ? `Não há itens com a tag "${activeFilter}" nesta lista.` 
                  : 'Esta lista ainda não possui itens.'}
              </p>
            )}
          </div>
    </div>
  );
};

export default ListDetails; 