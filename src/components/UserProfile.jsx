import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('watchlist');

  if (!isOpen || !currentUser) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="profile-overlay">
      <div className="profile-content">
        <div className="profile-header">
          <h2>Perfil do Usuário</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{currentUser.name}</h3>
            <p className="user-role">
              {currentUser.role === 'admin' ? 'Administrador' : 'Cinéfilo'}
            </p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            Minha Watchlist
          </button>
          <button
            className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Meus Comentários
          </button>
          {currentUser.role === 'admin' && (
            <button
              className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Administração
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'watchlist' && (
            <WatchlistTab watchlist={currentUser.watchlist} onClose={onClose} />
          )}
          
          {activeTab === 'comments' && (
            <CommentsTab comments={currentUser.comments} />
          )}
          
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminTab />
          )}
        </div>

        <div className="profile-footer">
          <button className="logout-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

const WatchlistTab = ({ watchlist, onClose }) => {
  const navigate = useNavigate();

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="empty-state">
        <p>Sua watchlist está vazia.</p>
        <p>Adicione filmes e séries para assistir mais tarde!</p>
      </div>
    );
  }

  const handleItemClick = (item) => {
    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const path = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
    onClose();
    navigate(path);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data desconhecida';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric'
    });
  };

  const getMediaType = (item) => {
    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    return mediaType === 'tv' ? 'Série' : 'Filme';
  };

  return (
    <div className="watchlist-container">
      <h3>Minha Watchlist</h3>
      <div className="watchlist-items">
        {watchlist.map((item) => (
          <div 
            key={item.id} 
            className="watchlist-item"
            onClick={() => handleItemClick(item)}
          >
            <div className="watchlist-item-content">
              <div className="watchlist-item-poster">
                <span className="media-type-badge">{getMediaType(item)}</span>
                {item.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                    alt={item.title || item.name} 
                  />
                ) : (
                  <div className="no-poster">Sem imagem</div>
                )}
              </div>
              <div className="watchlist-item-info">
                <h4>{item.title || item.name}</h4>
                <p>{formatDate(item.release_date || item.first_air_date)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CommentsTab = ({ comments }) => {
  const { editComment, removeComment } = useAuth();
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  // Garantir que não há comentários duplicados
  const uniqueComments = comments ? 
    comments.filter((comment, index, self) => 
      index === self.findIndex(c => c.id === comment.id)
    ) : [];

  if (!uniqueComments || uniqueComments.length === 0) {
    return (
      <div className="empty-state">
        <p>Você ainda não fez nenhum comentário.</p>
      </div>
    );
  }

  const handleEdit = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = (commentId) => {
    editComment(commentId, editText);
    setEditingComment(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleDelete = (commentId, userId) => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      removeComment(commentId, userId);
    }
  };

  return (
    <div className="comments-container">
      <h3>Meus Comentários</h3>
      <div className="comments-list">
        {uniqueComments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-media">
                {comment.mediaType === 'movie' ? 'Filme' : 'Série'} ID: {comment.mediaId}
              </span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {editingComment === comment.id ? (
              <div className="comment-edit">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows="3"
                />
                <div className="edit-actions">
                  <button onClick={() => handleSaveEdit(comment.id)}>Salvar</button>
                  <button onClick={handleCancelEdit}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                  <button onClick={() => handleEdit(comment)}>Editar</button>
                  <button onClick={() => handleDelete(comment.id, comment.userId)}>Excluir</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminTab = () => {
  const { getAllUsers, updateUser, deactivateUser, activateUser, deleteUser, createUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'cinefilo',
    active: true
  });

  React.useEffect(() => {
    const result = getAllUsers();
    if (result.success) {
      setUsers(result.users);
    }
  }, [getAllUsers]);

  const handleCreateUser = (e) => {
    e.preventDefault();
    const result = createUser(newUser);
    if (result.success) {
      setShowUserForm(false);
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'cinefilo',
        active: true
      });
      
      // Atualizar lista de usuários
      const updatedUserList = getAllUsers();
      if (updatedUserList.success) {
        setUsers(updatedUserList.users);
      }
    } else {
      alert(result.message);
    }
  };

  const handleDeactivateUser = (userId) => {
    if (window.confirm('Tem certeza que deseja desativar este usuário?')) {
      const result = deactivateUser(userId);
      if (result.success) {
        // Atualizar lista de usuários
        const updatedUserList = getAllUsers();
        if (updatedUserList.success) {
          setUsers(updatedUserList.users);
        }
      }
    }
  };

  const handleActivateUser = (userId) => {
    const result = activateUser(userId);
    if (result.success) {
      alert(result.message);
      // Atualizar lista de usuários
      const updatedUserList = getAllUsers();
      if (updatedUserList.success) {
        setUsers(updatedUserList.users);
      }
    } else {
      alert(result.message);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('ATENÇÃO: Esta ação é irreversível! Tem certeza que deseja excluir este usuário permanentemente?')) {
      const result = deleteUser(userId);
      if (result.success) {
        alert(result.message);
        // Atualizar lista de usuários
        const updatedUserList = getAllUsers();
        if (updatedUserList.success) {
          setUsers(updatedUserList.users);
        }
      } else {
        alert(result.message);
      }
    }
  };

  // Função para verificar se é um usuário pré-definido
  const isPredefinedUser = (userId) => {
    return userId === 1 || userId === 2;
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h3>Gerenciamento de Usuários</h3>
        <button 
          className="create-user-button"
          onClick={() => setShowUserForm(!showUserForm)}
        >
          {showUserForm ? 'Cancelar' : 'Criar Usuário'}
        </button>
      </div>

      {showUserForm && (
        <form className="user-form" onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>Nome de Usuário</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nome Completo</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Função</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="cinefilo">Cinéfilo</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <button type="submit" className="submit-button">Criar Usuário</button>
        </form>
      )}

      <div className="users-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Usuário</th>
              <th>Função</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.active === false ? 'inactive-user' : ''}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.role === 'admin' ? 'Admin' : 'Cinéfilo'}</td>
                <td>{user.active === false ? 'Inativo' : 'Ativo'}</td>
                <td className="user-actions">
                  {user.active === true && !isPredefinedUser(user.id) && (
                    <>
                      <button 
                        className="deactivate-button"
                        onClick={() => handleDeactivateUser(user.id)}
                      >
                        Desativar
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                  {user.active === true && isPredefinedUser(user.id) && (
                    <button 
                      className="deactivate-button"
                      onClick={() => handleDeactivateUser(user.id)}
                    >
                      Desativar
                    </button>
                  )}
                  {user.active === false && (
                    <button 
                      className="activate-button"
                      onClick={() => handleActivateUser(user.id)}
                    >
                      Reativar
                    </button>
                  )}
                  {/* Espaço reservado para manter consistência visual quando não há botões */}
                  {false && <span className="action-placeholder"></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserProfile; 